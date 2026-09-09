process.env.NODE_ENV =
  "test";

process.env.PORT =
  "4000";

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://test:test@127.0.0.1:5432/ekip_test";

process.env.SUPABASE_URL =
  process.env.TEST_SUPABASE_URL ||
  "https://example.supabase.co";

process.env.SUPABASE_ANON_KEY =
  process.env.TEST_SUPABASE_ANON_KEY ||
  "test-anon-key";

process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ||
  "test-service-role-key";

process.env.SUPABASE_DOCUMENTS_BUCKET =
  "documents";

process.env.OLLAMA_BASE_URL =
  process.env.TEST_OLLAMA_BASE_URL ||
  "http://127.0.0.1:11434";

process.env.OLLAMA_EMBEDDING_MODEL =
  "nomic-embed-text";

process.env.OLLAMA_CHAT_MODEL =
  "qwen3:4b";

process.env.OLLAMA_EMBEDDING_DIMENSION =
  "768";

process.env.OLLAMA_EMBEDDING_TIMEOUT_MS =
  "60000";

process.env.OLLAMA_CHAT_TIMEOUT_MS =
  "120000";

process.env.CORS_ORIGINS =
  "http://localhost:5173";

process.env.TRUST_PROXY =
  "false";
