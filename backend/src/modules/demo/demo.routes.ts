import {
  Router,
} from "express";

import {
  rateLimit,
} from "express-rate-limit";

import {
  createDemoSession,
} from "./demo.controller.js";

const router =
  Router();

const demoAccessLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit:
      60,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      success:
        false,
      message:
        "Too many demo sign-in requests. Please try again later.",
    },
  });

router.post(
  "/session",
  demoAccessLimiter,
  createDemoSession
);

export default router;
