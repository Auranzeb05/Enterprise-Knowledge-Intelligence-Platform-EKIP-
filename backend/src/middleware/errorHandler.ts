import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  logError,
  logWarn,
} from "../config/logger.js";

const CORS_ERROR_MESSAGE =
  "Origin is not allowed by EKIP CORS policy";

export function notFoundHandler(
  req: Request,
  res: Response
) {
  return res
    .status(404)
    .json({
      message:
        "API route not found",

      path:
        req.originalUrl,

      requestId:
        res.locals
          .requestId,
    });
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId =
    res.locals
      .requestId;

  if (
    error instanceof SyntaxError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (
      error as {
        status?: unknown;
      }
    ).status === 400
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid JSON request body",

        requestId,
      });
  }

  if (
    error instanceof Error &&
    error.message ===
      CORS_ERROR_MESSAGE
  ) {
    logWarn(
      "cors_rejection",
      {
        requestId,
        method:
          req.method,
        path:
          req.originalUrl,
      }
    );

    return res
      .status(403)
      .json({
        message:
          "Origin is not allowed",

        requestId,
      });
  }

  logError(
    "unhandled_request_error",
    error,
    {
      requestId,
      method:
        req.method,
      path:
        req.originalUrl,
    }
  );

  return res
    .status(500)
    .json({
      message:
        "Internal server error",

      requestId,
    });
}
