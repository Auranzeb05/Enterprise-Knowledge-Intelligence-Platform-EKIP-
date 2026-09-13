import type { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const ekipUser = await prisma.user.findUnique({
      where: {
        supabaseUserId: supabaseUser.id,
      },
      include: {
        department: true,
      },
    });

    if (!ekipUser) {
      return res.status(403).json({
        success: false,
        message: "EKIP user account not found",
      });
    }

    if (ekipUser.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended",
      });
    }

    const demoEmails = [
      env.DEMO_ADMIN_EMAIL,
      env.DEMO_MANAGER_EMAIL,
      env.DEMO_EMPLOYEE_EMAIL,
    ]
      .filter((email): email is string => Boolean(email))
      .map((email) => email.toLowerCase());

    const isDemoUser =
      env.DEMO_MODE_ENABLED &&
      demoEmails.includes(ekipUser.email.toLowerCase());

    const method =
      req.method.toUpperCase();

    const isReadOnlyRequest =
      method === "GET" ||
      method === "HEAD" ||
      method === "OPTIONS";

    if (
      isDemoUser &&
      !isReadOnlyRequest
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Demo access is read-only. Sign in with a regular EKIP account to make changes.",
      });
    }

    res.locals.user = ekipUser;
    res.locals.isDemoUser = isDemoUser;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}