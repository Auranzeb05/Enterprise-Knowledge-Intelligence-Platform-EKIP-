import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";

export async function getMe(req: Request, res: Response) {
  const authenticatedUser = res.locals.user;

  if (!authenticatedUser?.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: authenticatedUser.id,
      },
      include: {
        department: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "EKIP account not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load current user",
    });
  }
}

export async function updateMe(req: Request, res: Response) {
  const authenticatedUser = res.locals.user;

  if (!authenticatedUser?.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const fullName =
    typeof req.body?.fullName === "string"
      ? req.body.fullName.trim()
      : "";

  if (fullName.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Full name must contain at least 2 characters",
    });
  }

  if (fullName.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Full name cannot exceed 100 characters",
    });
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: authenticatedUser.id,
      },
      data: {
        fullName,
      },
      include: {
        department: true,
      },
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Update current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}
