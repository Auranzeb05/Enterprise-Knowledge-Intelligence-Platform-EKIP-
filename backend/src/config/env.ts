import "dotenv/config";

export type NodeEnvironment =
  | "development"
  | "test"
  | "production";

function requireString(
  name: string
) {
  const value =
    process.env[name]
      ?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value;
}

function readOptionalString(
  name: string
) {
  const value =
    process.env[name]
      ?.trim();

  return value || undefined;
}

function requireDemoString(
  name: string,
  enabled: boolean
) {
  const value =
    readOptionalString(name);

  if (
    enabled &&
    !value
  ) {
    throw new Error(
      `Missing required demo environment variable: ${name}`
    );
  }

  return value;
}

function readPositiveInteger(
  name: string,
  fallback: number
) {
  const rawValue =
    readOptionalString(name);

  if (!rawValue) {
    return fallback;
  }

  const parsed =
    Number.parseInt(
      rawValue,
      10
    );

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    throw new Error(
      `${name} must be a positive integer`
    );
  }

  return parsed;
}

function readBoolean(
  name: string,
  fallback: boolean
) {
  const rawValue =
    readOptionalString(name);

  if (!rawValue) {
    return fallback;
  }

  const normalized =
    rawValue.toLowerCase();

  if (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes"
  ) {
    return true;
  }

  if (
    normalized === "false" ||
    normalized === "0" ||
    normalized === "no"
  ) {
    return false;
  }

  throw new Error(
    `${name} must be true or false`
  );
}

function requireUrl(
  name: string,
  allowedProtocols: string[]
) {
  const value =
    requireString(name);

  let parsed: URL;

  try {
    parsed =
      new URL(value);
  } catch {
    throw new Error(
      `${name} must be a valid URL`
    );
  }

  if (
    !allowedProtocols.includes(
      parsed.protocol
    )
  ) {
    throw new Error(
      `${name} must use one of these protocols: ${allowedProtocols.join(", ")}`
    );
  }

  return value.replace(
    /\/+$/,
    ""
  );
}

function readNodeEnvironment():
  NodeEnvironment {
  const value =
    (
      process.env.NODE_ENV ||
      "development"
    ).trim();

  if (
    value !== "development" &&
    value !== "test" &&
    value !== "production"
  ) {
    throw new Error(
      `Invalid NODE_ENV: ${value}`
    );
  }

  return value;
}

function readPort() {
  const port =
    readPositiveInteger(
      "PORT",
      4000
    );

  if (port > 65535) {
    throw new Error(
      "PORT must be between 1 and 65535"
    );
  }

  return port;
}

function readCorsOrigins(
  nodeEnvironment:
    NodeEnvironment
) {
  const configured =
    readOptionalString(
      "CORS_ORIGINS"
    );

  if (configured) {
    const origins =
      configured
        .split(",")
        .map(
          (origin) =>
            origin.trim()
        )
        .filter(Boolean);

    if (
      origins.length === 0
    ) {
      throw new Error(
        "CORS_ORIGINS must contain at least one origin"
      );
    }

    return origins;
  }

  if (
    nodeEnvironment ===
    "production"
  ) {
    throw new Error(
      "CORS_ORIGINS is required when NODE_ENV=production"
    );
  }

  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
}

const NODE_ENV =
  readNodeEnvironment();

const DEMO_MODE_ENABLED =
  readBoolean(
    "DEMO_MODE_ENABLED",
    false
  );

export const env = {
  NODE_ENV,

  PORT:
    readPort(),

  DATABASE_URL:
    requireUrl(
      "DATABASE_URL",
      [
        "postgresql:",
        "postgres:",
      ]
    ),

  SUPABASE_URL:
    requireUrl(
      "SUPABASE_URL",
      [
        "https:",
        "http:",
      ]
    ),

  SUPABASE_ANON_KEY:
    requireString(
      "SUPABASE_ANON_KEY"
    ),

  SUPABASE_SERVICE_ROLE_KEY:
    requireString(
      "SUPABASE_SERVICE_ROLE_KEY"
    ),

  SUPABASE_DOCUMENTS_BUCKET:
    readOptionalString(
      "SUPABASE_DOCUMENTS_BUCKET"
    ) ||
    "documents",

  OLLAMA_BASE_URL:
    (
      readOptionalString(
        "OLLAMA_BASE_URL"
      ) ||
      "http://127.0.0.1:11434"
    ).replace(
      /\/+$/,
      ""
    ),

  OLLAMA_EMBEDDING_MODEL:
    readOptionalString(
      "OLLAMA_EMBEDDING_MODEL"
    ) ||
    "nomic-embed-text",

  OLLAMA_CHAT_MODEL:
    readOptionalString(
      "OLLAMA_CHAT_MODEL"
    ) ||
    "qwen3:4b",

  OLLAMA_EMBEDDING_DIMENSION:
    readPositiveInteger(
      "OLLAMA_EMBEDDING_DIMENSION",
      768
    ),

  OLLAMA_EMBEDDING_TIMEOUT_MS:
    readPositiveInteger(
      "OLLAMA_EMBEDDING_TIMEOUT_MS",
      60000
    ),

  OLLAMA_CHAT_TIMEOUT_MS:
    readPositiveInteger(
      "OLLAMA_CHAT_TIMEOUT_MS",
      120000
    ),

  DEMO_MODE_ENABLED,

  DEMO_ADMIN_EMAIL:
    requireDemoString(
      "DEMO_ADMIN_EMAIL",
      DEMO_MODE_ENABLED
    ),

  DEMO_ADMIN_PASSWORD:
    requireDemoString(
      "DEMO_ADMIN_PASSWORD",
      DEMO_MODE_ENABLED
    ),

  DEMO_MANAGER_EMAIL:
    requireDemoString(
      "DEMO_MANAGER_EMAIL",
      DEMO_MODE_ENABLED
    ),

  DEMO_MANAGER_PASSWORD:
    requireDemoString(
      "DEMO_MANAGER_PASSWORD",
      DEMO_MODE_ENABLED
    ),

  DEMO_EMPLOYEE_EMAIL:
    requireDemoString(
      "DEMO_EMPLOYEE_EMAIL",
      DEMO_MODE_ENABLED
    ),

  DEMO_EMPLOYEE_PASSWORD:
    requireDemoString(
      "DEMO_EMPLOYEE_PASSWORD",
      DEMO_MODE_ENABLED
    ),

  CORS_ORIGINS:
    readCorsOrigins(
      NODE_ENV
    ),

  TRUST_PROXY:
    readBoolean(
      "TRUST_PROXY",
      false
    ),
} as const;
