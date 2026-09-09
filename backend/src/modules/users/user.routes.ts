import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import {
  getMe,
  updateMe,
} from "./user.controller.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  getMe
);

router.patch(
  "/me",
  authenticate,
  updateMe
);

export default router;
