import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
  getManagerDashboard,
} from "./manager.controller.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("manager"),
  getManagerDashboard
);

export default router;