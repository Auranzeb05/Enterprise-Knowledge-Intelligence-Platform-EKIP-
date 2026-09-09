import type {
  Request,
  Response,
} from "express";

import {
  prisma,
} from "../../config/prisma.js";

import {
  generateEmbeddings,
} from "../documents/document.embeddings.js";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

interface SearchRow {
  chunkId: string;
  content: string;
  chunkIndex: number;

  documentId: string;
  title: string;
  fileName: string;

  departmentId:
    | string
    | null;

  similarity: number;
}

/*
 * =========================================================
 * PHASE 6 SEARCH CONFIGURATION
 * =========================================================
 */

const MAX_QUERY_LENGTH = 1000;

const SEARCH_CANDIDATE_LIMIT = 20;

const SEARCH_RESULT_LIMIT = 8;

const INITIAL_CHUNKS_PER_DOCUMENT = 3;

/*
 * =========================================================
 * QUERY HELPERS
 * =========================================================
 */

function getSearchQuery(
  req: Request
) {
  const rawQuery =
    req.query.q ??
    req.query.query;

  if (
    typeof rawQuery !==
    "string"
  ) {
    return "";
  }

  return rawQuery
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeChunkContent(
  content: string
) {
  return content
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/*
 * =========================================================
 * RESULT CLEANUP
 * =========================================================
 */

function cleanSearchResults(
  results: SearchRow[]
) {
  const seenChunkIds =
    new Set<string>();

  const seenContent =
    new Set<string>();

  const cleaned =
    results
      .map(
        (
          result
        ): SearchRow => ({
          ...result,

          similarity:
            Number(
              result.similarity
            ),
        })
      )
      .filter((result) => {
        if (
          !Number.isFinite(
            result.similarity
          )
        ) {
          return false;
        }

        /*
         * Negative cosine similarity
         * is not useful for semantic
         * retrieval.
         */
        if (
          result.similarity < 0
        ) {
          return false;
        }

        if (
          seenChunkIds.has(
            result.chunkId
          )
        ) {
          return false;
        }

        const normalizedContent =
          normalizeChunkContent(
            result.content
          );

        if (
          !normalizedContent
        ) {
          return false;
        }

        if (
          seenContent.has(
            normalizedContent
          )
        ) {
          return false;
        }

        seenChunkIds.add(
          result.chunkId
        );

        seenContent.add(
          normalizedContent
        );

        return true;
      })
      .sort(
        (a, b) =>
          b.similarity -
          a.similarity
      );

  /*
   * First pass:
   *
   * keep search results useful across
   * several documents instead of
   * allowing one long document to
   * dominate every result.
   */
  const selected:
    SearchRow[] = [];

  const documentCounts =
    new Map<
      string,
      number
    >();

  for (
    const result of cleaned
  ) {
    if (
      selected.length >=
      SEARCH_RESULT_LIMIT
    ) {
      break;
    }

    const currentCount =
      documentCounts.get(
        result.documentId
      ) || 0;

    if (
      currentCount >=
      INITIAL_CHUNKS_PER_DOCUMENT
    ) {
      continue;
    }

    selected.push(
      result
    );

    documentCounts.set(
      result.documentId,
      currentCount + 1
    );
  }

  /*
   * Second pass:
   *
   * if we still have fewer than the
   * desired number of results, fill
   * remaining slots with the next-best
   * chunks regardless of document.
   */
  if (
    selected.length <
    SEARCH_RESULT_LIMIT
  ) {
    const selectedChunkIds =
      new Set(
        selected.map(
          (item) =>
            item.chunkId
        )
      );

    for (
      const result of cleaned
    ) {
      if (
        selected.length >=
        SEARCH_RESULT_LIMIT
      ) {
        break;
      }

      if (
        selectedChunkIds.has(
          result.chunkId
        )
      ) {
        continue;
      }

      selected.push(
        result
      );

      selectedChunkIds.add(
        result.chunkId
      );
    }
  }

  return selected;
}

/*
 * =========================================================
 * SEMANTIC SEARCH ENDPOINT
 * =========================================================
 */

export async function semanticSearch(
  req: Request,
  res: Response
) {
  try {
    const currentUser =
      res.locals.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized",
      });
    }

    const query =
      getSearchQuery(req);

    if (!query) {
      return res.status(400).json({
        success: false,

        message:
          "Search query is required",
      });
    }

    if (
      query.length >
      MAX_QUERY_LENGTH
    ) {
      return res.status(400).json({
        success: false,

        message:
          `Search query is too long. Maximum length is ${MAX_QUERY_LENGTH} characters.`,
      });
    }

    /*
     * =====================================================
     * CREATE QUERY EMBEDDING
     * =====================================================
     */

    let embeddings:
      number[][];

    try {
      embeddings =
        await generateEmbeddings([
          query,
        ]);
    } catch (error) {
      console.error(
        "Search embedding error:",
        error
      );

      return res.status(503).json({
        success: false,

        message:
          "Semantic search service is temporarily unavailable",
      });
    }

    const queryEmbedding =
      embeddings[0];

    if (!queryEmbedding) {
      return res.status(503).json({
        success: false,

        message:
          "Could not generate search embedding",
      });
    }

    if (
      queryEmbedding.some(
        (value) =>
          !Number.isFinite(
            value
          )
      )
    ) {
      return res.status(503).json({
        success: false,

        message:
          "Generated search embedding was invalid",
      });
    }

    const vector =
      `[${queryEmbedding.join(
        ","
      )}]`;

    let results:
      SearchRow[] = [];

    /*
     * =====================================================
     * ADMIN
     * =====================================================
     *
     * Admin can search every ready
     * embedded document.
     */

    if (
      currentUser.role ===
      "admin"
    ) {
      results =
        await prisma.$queryRaw<
          SearchRow[]
        >`
          SELECT
            dc."id"
              AS "chunkId",

            dc."content"
              AS "content",

            dc."chunkIndex"
              AS "chunkIndex",

            d."id"
              AS "documentId",

            d."title"
              AS "title",

            d."fileName"
              AS "fileName",

            d."departmentId"
              AS "departmentId",

            1 - (
              dc."embedding"
              <=>
              ${vector}::vector
            )
              AS "similarity"

          FROM
            "DocumentChunk" dc

          INNER JOIN
            "Document" d

          ON
            d."id" =
            dc."documentId"

          WHERE
            d."status" =
            'ready'

            AND
            dc."embedding"
            IS NOT NULL

          ORDER BY
            dc."embedding"
            <=>
            ${vector}::vector

          LIMIT
            ${SEARCH_CANDIDATE_LIMIT}
        `;
    }

    /*
     * =====================================================
     * EMPLOYEE / MANAGER WITH DEPARTMENT
     * =====================================================
     *
     * Access:
     *
     * - General documents
     * - their own department
     */

    else if (
      currentUser.departmentId
    ) {
      results =
        await prisma.$queryRaw<
          SearchRow[]
        >`
          SELECT
            dc."id"
              AS "chunkId",

            dc."content"
              AS "content",

            dc."chunkIndex"
              AS "chunkIndex",

            d."id"
              AS "documentId",

            d."title"
              AS "title",

            d."fileName"
              AS "fileName",

            d."departmentId"
              AS "departmentId",

            1 - (
              dc."embedding"
              <=>
              ${vector}::vector
            )
              AS "similarity"

          FROM
            "DocumentChunk" dc

          INNER JOIN
            "Document" d

          ON
            d."id" =
            dc."documentId"

          WHERE
            d."status" =
            'ready'

            AND
            dc."embedding"
            IS NOT NULL

            AND (
              d."departmentId"
              IS NULL

              OR

              d."departmentId" =
              ${currentUser.departmentId}
            )

          ORDER BY
            dc."embedding"
            <=>
            ${vector}::vector

          LIMIT
            ${SEARCH_CANDIDATE_LIMIT}
        `;
    }

    /*
     * =====================================================
     * EMPLOYEE / MANAGER WITHOUT DEPARTMENT
     * =====================================================
     *
     * General documents only.
     */

    else {
      results =
        await prisma.$queryRaw<
          SearchRow[]
        >`
          SELECT
            dc."id"
              AS "chunkId",

            dc."content"
              AS "content",

            dc."chunkIndex"
              AS "chunkIndex",

            d."id"
              AS "documentId",

            d."title"
              AS "title",

            d."fileName"
              AS "fileName",

            d."departmentId"
              AS "departmentId",

            1 - (
              dc."embedding"
              <=>
              ${vector}::vector
            )
              AS "similarity"

          FROM
            "DocumentChunk" dc

          INNER JOIN
            "Document" d

          ON
            d."id" =
            dc."documentId"

          WHERE
            d."status" =
            'ready'

            AND
            dc."embedding"
            IS NOT NULL

            AND
            d."departmentId"
            IS NULL

          ORDER BY
            dc."embedding"
            <=>
            ${vector}::vector

          LIMIT
            ${SEARCH_CANDIDATE_LIMIT}
        `;
    }

    /*
     * =====================================================
     * CLEAN + RANK
     * =====================================================
     */

    const cleanResults =
      cleanSearchResults(
        results
      );

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return res.status(200).json({
      success: true,

      query,

      count:
        cleanResults.length,

      results:
        cleanResults.map(
          (result) => ({
            chunkId:
              result.chunkId,

            content:
              result.content,

            chunkIndex:
              result.chunkIndex,

            documentId:
              result.documentId,

            title:
              result.title,

            fileName:
              result.fileName,

            departmentId:
              result.departmentId,

            similarity:
              Number(
                result.similarity
              ),
          })
        ),
    });
  } catch (error) {
    console.error(
      "Semantic search error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to search knowledge base",
    });
  }
}