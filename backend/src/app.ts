import express from "express";

import cors from "cors";
import helmet from "helmet";

import {
  env,
} from "./config/env.js";

import {
  prisma,
} from "./config/prisma.js";

import {
  OLLAMA_BASE_URL,
} from "./config/ollama.js";

import {
  logError,
} from "./config/logger.js";

import {
  requestContext,
} from "./middleware/requestContext.js";

import {
  chatLimiter,
  documentLimiter,
  generalApiLimiter,
  searchLimiter,
} from "./middleware/rateLimits.js";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";

import userRoutes from "./modules/users/user.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import managerRoutes from "./modules/manager/manager.routes.js";
import employeeRoutes from "./modules/employee/employee.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import documentRoutes from "./modules/documents/document.routes.js";
import searchRoutes from "./modules/search/search.routes.js";

const app =
  express();

app.disable(
  "x-powered-by"
);

if (
  env.TRUST_PROXY
) {
  app.set(
    "trust proxy",
    1
  );
}

app.use(
  requestContext
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy:
        "cross-origin",
    },
  })
);

const allowedOrigins =
  new Set(
    env.CORS_ORIGINS
  );

app.use(
  cors({
    origin(
      origin,
      callback
    ) {
      if (!origin) {
        callback(
          null,
          true
        );

        return;
      }

      if (
        allowedOrigins.has(
          origin
        )
      ) {
        callback(
          null,
          true
        );

        return;
      }

      callback(
        new Error(
          "Origin is not allowed by EKIP CORS policy"
        )
      );
    },

    credentials:
      false,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Request-Id",
    ],

    exposedHeaders: [
      "X-Request-Id",
    ],

    maxAge:
      86400,
  })
);

app.use(
  express.json({
    limit:
      "1mb",
  })
);

app.get(
  "/api/health",
  (
    _req,
    res
  ) => {
    return res
      .status(200)
      .json({
        success:
          true,

        service:
          "ekip-backend",

        status:
          "alive",

        timestamp:
          new Date()
            .toISOString(),
      });
  }
);

async function checkDatabase() {
  try {
    await prisma
      .$queryRaw`
        SELECT 1
      `;

    return true;
  } catch (
    error
  ) {
    logError(
      "readiness_database_failed",
      error
    );

    return false;
  }
}

async function checkOllama() {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      3000
    );

  try {
    const response =
      await fetch(
        `${OLLAMA_BASE_URL}/api/tags`,
        {
          signal:
            controller.signal,
        }
      );

    return response.ok;
  } catch (
    error
  ) {
    logError(
      "readiness_ollama_failed",
      error
    );

    return false;
  } finally {
    clearTimeout(
      timeout
    );
  }
}

app.get(
  "/api/ready",
  async (
    _req,
    res
  ) => {
    const [
      databaseReady,
      ollamaReady,
    ] =
      await Promise.all([
        checkDatabase(),
        checkOllama(),
      ]);

    const ready =
      databaseReady &&
      ollamaReady;

    return res
      .status(
        ready
          ? 200
          : 503
      )
      .json({
        success:
          ready,

        service:
          "ekip-backend",

        status:
          ready
            ? "ready"
            : "not_ready",

        checks: {
          database:
            databaseReady
              ? "ok"
              : "unavailable",

          ollama:
            ollamaReady
              ? "ok"
              : "unavailable",
        },

        timestamp:
          new Date()
            .toISOString(),
      });
  }
);

app.use(
  "/api",
  generalApiLimiter
);

app.use(
  "/api",
  userRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/departments",
  departmentRoutes
);

app.use(
  "/api/manager",
  managerRoutes
);

app.use(
  "/api/employee",
  employeeRoutes
);

app.use(
  "/api/chat",
  chatLimiter,
  chatRoutes
);

app.use(
  "/api/documents",
  documentLimiter,
  documentRoutes
);

app.use(
  "/api/search",
  searchLimiter,
  searchRoutes
);

app.use(
  notFoundHandler
);

app.use(
  errorHandler
);

export default app;
