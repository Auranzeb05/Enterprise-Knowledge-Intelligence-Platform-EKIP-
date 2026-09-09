import {
  Router,
} from "express";

import {
  authenticate,
} from "../../middleware/authenticate.js";

import {
  authorize,
} from "../../middleware/authorize.js";

import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  getDocumentDownloadUrl,
  deleteDocument,
} from "./document.controller.js";

import {
  documentUpload,
} from "./document.upload.js";

const router =
  Router();

router.use(
  authenticate
);

router.get(
  "/",
  authorize(
    "employee",
    "manager",
    "admin"
  ),
  getAllDocuments
);

router.get(
  "/:id/download",
  authorize(
    "employee",
    "manager",
    "admin"
  ),
  getDocumentDownloadUrl
);

router.get(
  "/:id",
  authorize(
    "employee",
    "manager",
    "admin"
  ),
  getDocumentById
);

router.delete(
  "/:id",
  authorize("admin"),
  deleteDocument
);

router.post(
  "/",
  authorize(
    "manager",
    "admin"
  ),
  documentUpload.single(
    "file"
  ),
  createDocument
);

export default router;
