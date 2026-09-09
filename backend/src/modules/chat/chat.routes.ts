import { Router } from "express";

import {
  chatWithKnowledge,
  getConversations,
  getConversation,
  deleteConversation,
} from "./chat.controller.js";

import {
  authenticate,
} from "../../middleware/authenticate.js";

import {
  authorize,
} from "../../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.use(
  authorize(
    "employee",
    "manager",
    "admin"
  )
);

router.get(
  "/conversations",
  getConversations
);

router.get(
  "/conversations/:id",
  getConversation
);

router.delete(
  "/conversations/:id",
  deleteConversation
);

router.post(
  "/",
  chatWithKnowledge
);

export default router;