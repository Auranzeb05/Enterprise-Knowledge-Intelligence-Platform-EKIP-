import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAdminDashboard,
  getAnalytics,
  getAuditLogs,
} from "./admin.controller.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("admin"),
  getAdminDashboard
);

router.get(
  "/analytics",
  authenticate,
  authorize("manager", "admin"),
  getAnalytics
);

router.get(
  "/audit-logs",
  authenticate,
  authorize("admin"),
  getAuditLogs
);

router.get(
  "/users",
  authenticate,
  authorize("admin"),
  getAllUsers
);

router.get(
  "/users/:id",
  authenticate,
  authorize("admin"),
  getUserById
);

router.post(
  "/users",
  authenticate,
  authorize("admin"),
  createUser
);

router.patch(
  "/users/:id",
  authenticate,
  authorize("admin"),
  updateUser
);

router.delete(
  "/users/:id",
  authenticate,
  authorize("admin"),
  deleteUser
);

export default router;
