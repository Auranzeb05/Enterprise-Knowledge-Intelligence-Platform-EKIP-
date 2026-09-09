import {
  rateLimit,
} from "express-rate-limit";

export const generalApiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit:
      600,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      message:
        "Too many API requests. Please try again later.",
    },
  });

export const chatLimiter =
  rateLimit({
    windowMs:
      60 * 1000,

    limit:
      20,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      message:
        "Too many AI chat requests. Please wait before trying again.",
    },
  });

export const searchLimiter =
  rateLimit({
    windowMs:
      60 * 1000,

    limit:
      60,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      message:
        "Too many search requests. Please wait before trying again.",
    },
  });

export const documentLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit:
      120,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      message:
        "Too many document requests. Please try again later.",
    },
  });
