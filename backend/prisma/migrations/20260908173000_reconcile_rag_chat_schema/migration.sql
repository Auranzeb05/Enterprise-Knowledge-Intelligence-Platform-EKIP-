-- =========================================================
-- PHASE 6 SCHEMA RECONCILIATION
-- =========================================================
--
-- This migration reconciles historical Prisma migration
-- state with the schema already present in Neon.
--
-- It represents:
--   1. vector(1536) -> vector(768)
--   2. ChatMessageRole enum
--   3. ChatConversation table
--   4. ChatMessage table
--   5. indexes and foreign keys
--   6. removal of the manual updatedAt database default
--
-- The live database already contains the vector(768) column
-- and chat objects, so this migration will be recorded as
-- applied after the remaining updatedAt difference is fixed.
-- =========================================================


-- =========================================================
-- DOCUMENT EMBEDDING DIMENSION
-- =========================================================

ALTER TABLE "DocumentChunk"
ALTER COLUMN "embedding"
TYPE vector(768);


-- =========================================================
-- CHAT MESSAGE ROLE
-- =========================================================

CREATE TYPE "ChatMessageRole"
AS ENUM (
  'user',
  'assistant'
);


-- =========================================================
-- CHAT CONVERSATION
-- =========================================================

CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey"
    PRIMARY KEY ("id")
);


-- =========================================================
-- CHAT MESSAGE
-- =========================================================

CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey"
    PRIMARY KEY ("id")
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX "ChatConversation_userId_idx"
ON "ChatConversation"("userId");

CREATE INDEX "ChatMessage_conversationId_idx"
ON "ChatMessage"("conversationId");


-- =========================================================
-- FOREIGN KEYS
-- =========================================================

ALTER TABLE "ChatConversation"
ADD CONSTRAINT "ChatConversation_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_conversationId_fkey"
FOREIGN KEY ("conversationId")
REFERENCES "ChatConversation"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
