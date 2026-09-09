import type {
  Server,
} from "node:http";

import {
  env,
} from "./config/env.js";

import app from "./app.js";

import {
  prisma,
} from "./config/prisma.js";

import {
  logError,
  logInfo,
} from "./config/logger.js";

let server:
  Server | null =
  null;

let shuttingDown =
  false;

async function startServer() {
  await prisma
    .$queryRaw`
      SELECT 1
    `;

  server =
    app.listen(
      env.PORT,
      () => {
        logInfo(
          "server_started",
          {
            service:
              "ekip-backend",

            environment:
              env.NODE_ENV,

            port:
              env.PORT,

            url:
              `http://localhost:${env.PORT}`,
          }
        );
      }
    );

  server.requestTimeout =
    env.OLLAMA_CHAT_TIMEOUT_MS +
    15000;

  server.headersTimeout =
    Math.min(
      65000,
      server.requestTimeout -
        1000
    );

  server.keepAliveTimeout =
    5000;
}

async function shutdown(
  signal: string,
  exitCode = 0
) {
  if (shuttingDown) {
    return;
  }

  shuttingDown =
    true;

  logInfo(
    "server_shutdown_started",
    {
      signal,
    }
  );

  const forceShutdownTimer =
    setTimeout(
      () => {
        logError(
          "server_shutdown_forced"
        );

        server
          ?.closeAllConnections();

        process.exit(
          1
        );
      },
      10000
    );

  forceShutdownTimer.unref();

  try {
    if (server) {
      await new Promise<void>(
        (
          resolve,
          reject
        ) => {
          server?.close(
            (error) => {
              if (error) {
                reject(
                  error
                );

                return;
              }

              resolve();
            }
          );
        }
      );
    }

    await prisma
      .$disconnect();

    clearTimeout(
      forceShutdownTimer
    );

    logInfo(
      "server_shutdown_complete",
      {
        signal,
      }
    );

    process.exit(
      exitCode
    );
  } catch (
    error
  ) {
    logError(
      "server_shutdown_failed",
      error,
      {
        signal,
      }
    );

    process.exit(
      1
    );
  }
}

process.on(
  "SIGTERM",
  () => {
    void shutdown(
      "SIGTERM"
    );
  }
);

process.on(
  "SIGINT",
  () => {
    void shutdown(
      "SIGINT"
    );
  }
);

process.on(
  "unhandledRejection",
  (reason) => {
    logError(
      "unhandled_promise_rejection",
      reason
    );

    void shutdown(
      "unhandledRejection",
      1
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    logError(
      "uncaught_exception",
      error
    );

    void shutdown(
      "uncaughtException",
      1
    );
  }
);

startServer().catch(
  async (
    error
  ) => {
    logError(
      "server_startup_failed",
      error
    );

    try {
      await prisma
        .$disconnect();
    } finally {
      process.exit(
        1
      );
    }
  }
);
