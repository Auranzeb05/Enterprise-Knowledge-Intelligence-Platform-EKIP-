import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
  getEmployeeDashboard,
} from "./employee.controller.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("employee"),
  getEmployeeDashboard
);

export default router;