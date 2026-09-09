import {
  prisma,
} from "../../config/prisma.js";

import {
  OLLAMA_BASE_URL,
  OLLAMA_EMBEDDING_MODEL,
  OLLAMA_EMBEDDING_DIMENSION,
  OLLAMA_EMBEDDING_TIMEOUT_MS,
} from "../../config/ollama.js";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

interface OllamaEmbedResponse {
  embeddings?: unknown;
}

/*
 * =========================================================
 * PHASE 6 EMBEDDING CONFIGURATION
 * =========================================================
 */

/*
 * Avoid sending an unlimited number
 * of document chunks to Ollama in a
 * single request.
 *
 * Large documents may contain many
 * chunks, so batching makes embedding
 * generation more predictable and
 * memory-safe.
 */
const EMBEDDING_BATCH_SIZE = 16;

/*
 * Protect Ollama from accidentally
 * receiving completely empty text.
 */
const EMPTY_TEXT_PLACEHOLDER =
  " ";

/*
 * =========================================================
 * VALIDATION HELPERS
 * =========================================================
 */

function validateEmbedding(
  embedding: unknown,
  index?: number
): number[] {
  const location =
    typeof index === "number"
      ? ` at index ${index}`
      : "";

  if (
    !Array.isArray(
      embedding
    )
  ) {
    throw new Error(
      `Invalid embedding${location}: expected an array`
    );
  }

  if (
    embedding.length !==
    OLLAMA_EMBEDDING_DIMENSION
  ) {
    throw new Error(
      `Invalid embedding dimension${location}. Expected ${OLLAMA_EMBEDDING_DIMENSION}, received ${embedding.length}.`
    );
  }

  const validated:
    number[] = [];

  for (
    let valueIndex = 0;
    valueIndex <
    embedding.length;
    valueIndex += 1
  ) {
    const value =
      embedding[
        valueIndex
      ];

    if (
      typeof value !==
        "number" ||
      !Number.isFinite(
        value
      )
    ) {
      throw new Error(
        `Embedding${location} contains an invalid numeric value at position ${valueIndex}`
      );
    }

    validated.push(
      value
    );
  }

  return validated;
}

/*
 * =========================================================
 * OLLAMA EMBEDDING REQUEST
 * =========================================================
 */

async function requestEmbeddingBatch(
  texts: string[]
): Promise<number[][]> {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      OLLAMA_EMBEDDING_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        `${OLLAMA_BASE_URL}/api/embed`,
        {
          method: "POST",

          signal:
            controller.signal,

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              model:
                OLLAMA_EMBEDDING_MODEL,

              input:
                texts,
            }),
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Ollama embedding HTTP error:",
        response.status,
        errorText
      );

      throw new Error(
        `Ollama embedding request failed with status ${response.status}`
      );
    }

    const data =
      (await response.json()) as
        OllamaEmbedResponse;

    if (
      !Array.isArray(
        data.embeddings
      )
    ) {
      throw new Error(
        "Ollama returned an invalid embedding response"
      );
    }

    if (
      data.embeddings.length !==
      texts.length
    ) {
      throw new Error(
        `Embedding count mismatch. Expected ${texts.length}, received ${data.embeddings.length}.`
      );
    }

    return data.embeddings.map(
      (
        embedding,
        index
      ) =>
        validateEmbedding(
          embedding,
          index
        )
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        `Ollama embedding request timed out after ${OLLAMA_EMBEDDING_TIMEOUT_MS}ms`
      );
    }

    throw error;
  } finally {
    clearTimeout(
      timeout
    );
  }
}

/*
 * =========================================================
 * PUBLIC EMBEDDING GENERATION
 * =========================================================
 */

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (
    !Array.isArray(texts)
  ) {
    throw new Error(
      "Embedding input must be an array of strings"
    );
  }

  if (
    texts.length === 0
  ) {
    return [];
  }

  /*
   * Preserve one output embedding for
   * every input item.
   *
   * Whitespace-only chunks are replaced
   * with a harmless placeholder instead
   * of changing the number/order of
   * returned embeddings.
   */
  const normalizedTexts =
    texts.map(
      (
        text,
        index
      ) => {
        if (
          typeof text !==
          "string"
        ) {
          throw new Error(
            `Embedding input at index ${index} must be a string`
          );
        }

        if (
          text.trim().length ===
          0
        ) {
          return EMPTY_TEXT_PLACEHOLDER;
        }

        return text;
      }
    );

  const allEmbeddings:
    number[][] = [];

  /*
   * Generate embeddings in controlled
   * batches.
   *
   * This works for:
   *
   * - semantic search (usually 1 input)
   * - AI chat retrieval (usually 1 input)
   * - document ingestion (many chunks)
   */
  for (
    let start = 0;
    start <
    normalizedTexts.length;
    start +=
      EMBEDDING_BATCH_SIZE
  ) {
    const batch =
      normalizedTexts.slice(
        start,
        start +
          EMBEDDING_BATCH_SIZE
      );

    const batchEmbeddings =
      await requestEmbeddingBatch(
        batch
      );

    allEmbeddings.push(
      ...batchEmbeddings
    );
  }

  /*
   * Final defensive check.
   */
  if (
    allEmbeddings.length !==
    texts.length
  ) {
    throw new Error(
      `Final embedding count mismatch. Expected ${texts.length}, received ${allEmbeddings.length}.`
    );
  }

  return allEmbeddings;
}

/*
 * =========================================================
 * SAVE EMBEDDING TO PGVECTOR
 * =========================================================
 */

export async function saveChunkEmbedding(
  chunkId: string,
  embedding: number[]
) {
  const normalizedChunkId =
    chunkId.trim();

  if (!normalizedChunkId) {
    throw new Error(
      "Chunk ID is required when saving an embedding"
    );
  }

  /*
   * Validate the vector again at the
   * database boundary.
   *
   * Even if an embedding came from a
   * different caller in the future,
   * an invalid vector cannot silently
   * enter DocumentChunk.embedding.
   */
  const validatedEmbedding =
    validateEmbedding(
      embedding
    );

  const vector =
    `[${validatedEmbedding.join(
      ","
    )}]`;

  const updatedRows =
    await prisma.$executeRaw`
      UPDATE "DocumentChunk"
      SET "embedding" =
        ${vector}::vector
      WHERE "id" =
        ${normalizedChunkId}
    `;

  if (
    updatedRows !== 1
  ) {
    throw new Error(
      `Could not save embedding because DocumentChunk ${normalizedChunkId} was not found`
    );
  }
}