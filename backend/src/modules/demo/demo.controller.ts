import type {
  Request,
  Response,
} from "express";

import {
  createClient,
} from "@supabase/supabase-js";

import {
  env,
} from "../../config/env.js";

import {
  prisma,
} from "../../config/prisma.js";

import {
  supabaseAdmin,
} from "../../config/supabaseAdmin.js";

type DemoRole =
  | "admin"
  | "manager"
  | "employee";

function getDemoCredentials(
  role: DemoRole
) {
  if (role === "admin") {
    return {
      email:
        env.DEMO_ADMIN_EMAIL,
      password:
        env.DEMO_ADMIN_PASSWORD,
    };
  }

  if (role === "manager") {
    return {
      email:
        env.DEMO_MANAGER_EMAIL,
      password:
        env.DEMO_MANAGER_PASSWORD,
    };
  }

  return {
    email:
      env.DEMO_EMPLOYEE_EMAIL,
    password:
      env.DEMO_EMPLOYEE_PASSWORD,
  };
}

function isDemoRole(
  value: unknown
): value is DemoRole {
  return (
    value === "admin" ||
    value === "manager" ||
    value === "employee"
  );
}

export async function createDemoSession(
  req: Request,
  res: Response
) {
  if (
    !env.DEMO_MODE_ENABLED
  ) {
    return res
      .status(404)
      .json({
        success: false,
        message:
          "Demo access is not enabled.",
      });
  }

  const role =
    req.body?.role;

  if (
    !isDemoRole(role)
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "A valid demo role is required.",
      });
  }

  const credentials =
    getDemoCredentials(role);

  if (
    !credentials.email ||
    !credentials.password
  ) {
    return res
      .status(503)
      .json({
        success: false,
        message:
          "Demo access is not configured correctly.",
      });
  }

  try {
    const normalizedEmail =
      credentials.email
        .trim()
        .toLowerCase();

    const ekipUser =
      await prisma.user.findUnique({
        where: {
          email:
            normalizedEmail,
        },
        select: {
          id: true,
          supabaseUserId: true,
          email: true,
          role: true,
          status: true,
        },
      });

    if (
      !ekipUser ||
      ekipUser.role !== role ||
      ekipUser.status !== "active"
    ) {
      return res
        .status(503)
        .json({
          success: false,
          message:
            "Demo account is not configured correctly.",
        });
    }

    const {
      error:
        restoreError,
    } =
      await supabaseAdmin
        .auth
        .admin
        .updateUserById(
          ekipUser.supabaseUserId,
          {
            email:
              normalizedEmail,
            password:
              credentials.password,
            email_confirm:
              true,
          }
        );

    if (
      restoreError
    ) {
      console.error(
        "Demo account restore failed:",
        restoreError
      );

      return res
        .status(503)
        .json({
          success: false,
          message:
            "Demo access is temporarily unavailable.",
        });
    }

    const demoClient =
      createClient(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession:
              false,
            autoRefreshToken:
              false,
            detectSessionInUrl:
              false,
          },
        }
      );

    const {
      data,
      error,
    } =
      await demoClient
        .auth
        .signInWithPassword({
          email:
            normalizedEmail,
          password:
            credentials.password,
        });

    if (
      error ||
      !data.session ||
      !data.user
    ) {
      console.error(
        "Demo authentication failed:",
        error
      );

      return res
        .status(503)
        .json({
          success: false,
          message:
            "Demo access is temporarily unavailable.",
        });
    }

    if (
      data.user.id !==
      ekipUser.supabaseUserId
    ) {
      await demoClient
        .auth
        .signOut()
        .catch(
          () => {}
        );

      return res
        .status(503)
        .json({
          success: false,
          message:
            "Demo account identity validation failed.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,
        role,
        session: {
          accessToken:
            data.session
              .access_token,
          refreshToken:
            data.session
              .refresh_token,
          expiresAt:
            data.session
              .expires_at ??
            null,
        },
      });
  } catch (
    error
  ) {
    console.error(
      "Create demo session error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Demo access is temporarily unavailable.",
      });
  }
}
