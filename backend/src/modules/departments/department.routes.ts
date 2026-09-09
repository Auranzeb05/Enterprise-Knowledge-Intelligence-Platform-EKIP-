import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import {
    createDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment,
  } from "./department.controller.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize("employee", "manager", "admin"),
    getAllDepartments
  );

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createDepartment
);

router.patch(
    "/:id",
    authenticate,
    authorize("admin"),
    updateDepartment
  );

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteDepartment
);
export default router;
