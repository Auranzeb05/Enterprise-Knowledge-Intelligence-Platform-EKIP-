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
  semanticSearch,
} from "./search.controller.js";

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
  semanticSearch
);

export default router;