import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma.js";

export type AuditStatus =
  | "success"
  | "failure"
  | "blocked";

interface AuditInput {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  resourceLabel?: string | null;
  status?: AuditStatus;
  metadata?: Record<string, unknown>;
}

function requestIp(
  req: Request
): string | null {
  const forwarded =
    req.headers["x-forwarded-for"];

  if (
    typeof forwarded === "string" &&
    forwarded.trim()
  ) {
    return (
      forwarded
        .split(",")[0]
        ?.trim() ||
      req.ip ||
      null
    );
  }

  if (
    Array.isArray(forwarded) &&
    forwarded[0]
  ) {
    return forwarded[0];
  }

  return req.ip || null;
}

export async function recordAudit(
  req: Request,
  res: Response,
  input: AuditInput
): Promise<void> {
  try {
    const actor =
      res.locals.user;

    const data:
      Prisma.AuditLogUncheckedCreateInput =
      {
        userId:
          actor?.id ?? null,

        actorEmail:
          actor?.email ??
          "unknown",

        actorName:
          actor?.fullName ??
          "Unknown user",

        actorRole:
          actor?.role ??
          "unknown",

        action:
          input.action,

        resourceType:
          input.resourceType,

        resourceId:
          input.resourceId ??
          null,

        resourceLabel:
          input.resourceLabel ??
          null,

        status:
          input.status ??
          "success",

        ipAddress:
          requestIp(req),

        userAgent:
          typeof req.headers[
            "user-agent"
          ] === "string"
            ? req.headers[
                "user-agent"
              ].slice(
                0,
                500
              )
            : null,

        requestId:
          typeof res.locals
            .requestId ===
          "string"
            ? res.locals
                .requestId
            : null,
      };

    if (
      input.metadata !==
      undefined
    ) {
      data.metadata =
        input.metadata as Prisma.InputJsonValue;
    }

    await prisma.auditLog.create(
      {
        data,
      }
    );
  } catch (error) {
    /*
     * Audit logging must never
     * break the user's primary
     * operation.
     */
    console.error(
      "Audit logging error:",
      error
    );
  }
}
