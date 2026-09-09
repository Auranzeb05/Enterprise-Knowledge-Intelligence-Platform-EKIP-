import {
  env,
} from "./env.js";

/*
 * =========================================================
 * OLLAMA SERVER
 * =========================================================
 */

export const OLLAMA_BASE_URL =
  env.OLLAMA_BASE_URL;

/*
 * =========================================================
 * EMBEDDING MODEL
 * =========================================================
 */

export const OLLAMA_EMBEDDING_MODEL =
  env.OLLAMA_EMBEDDING_MODEL;

/*
 * EKIP currently stores
 * nomic-embed-text embeddings as
 * pgvector vector(768).
 *
 * Changing the embedding model may
 * require regenerating document
 * embeddings and changing the
 * database vector dimension.
 */
export const OLLAMA_EMBEDDING_DIMENSION =
  env.OLLAMA_EMBEDDING_DIMENSION;

/*
 * =========================================================
 * CHAT MODEL
 * =========================================================
 */

export const OLLAMA_CHAT_MODEL =
  env.OLLAMA_CHAT_MODEL;

/*
 * =========================================================
 * REQUEST LIMITS
 * =========================================================
 */

export const OLLAMA_EMBEDDING_TIMEOUT_MS =
  env.OLLAMA_EMBEDDING_TIMEOUT_MS;

export const OLLAMA_CHAT_TIMEOUT_MS =
  env.OLLAMA_CHAT_TIMEOUT_MS;
