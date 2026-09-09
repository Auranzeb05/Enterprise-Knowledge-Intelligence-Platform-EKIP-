import crypto from "node:crypto";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  logInfo,
} from "../config/logger.js";

export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId =
    crypto.randomUUID();

  const startedAt =
    Date.now();

  res.locals.requestId =
    requestId;

  res.setHeader(
    "X-Request-Id",
    requestId
  );

  res.on(
    "finish",
    () => {
      logInfo(
        "http_request",
        {
          requestId,

          method:
            req.method,

          path:
            req.originalUrl,

          statusCode:
            res.statusCode,

          durationMs:
            Date.now() -
            startedAt,
        }
      );
    }
  );

  next();
}
