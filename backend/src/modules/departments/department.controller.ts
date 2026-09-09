import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { recordAudit } from "../audit/audit.service.js";

export async function getAllDepartments(
  req: Request,
  res: Response
) {
  try {
    const departments =
      await prisma.department.findMany({
        orderBy: {
          name: "asc",
        },
      });

    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error(
      "Get departments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch departments",
    });
  }
}

export async function createDepartment(
  req: Request,
  res: Response
) {
  try {
    const { name } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Department name is required",
      });
    }

    const normalizedName =
      name.trim();

    const existingDepartment =
      await prisma.department.findUnique({
        where: {
          name: normalizedName,
        },
      });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message:
          "Department already exists",
      });
    }

    const department =
      await prisma.department.create({
        data: {
          name: normalizedName,
        },
      });

    await recordAudit(req, res, {
      action: "DEPARTMENT_CREATE",
      resourceType: "department",
      resourceId: department.id,
      resourceLabel: department.name,
    });

    return res.status(201).json({
      success: true,
      department,
    });
  } catch (error) {
    console.error(
      "Create department error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create department",
    });
  }
}

export async function updateDepartment(
    req: Request,
    res: Response
  ) {
    try {
      const id = req.params.id;
      const { name } = req.body;
  
      if (
        typeof id !== "string" ||
        !id
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid department id",
        });
      }
  
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Department name is required",
        });
      }
  
      const normalizedName =
        name.trim();
  
      const existingDepartment =
        await prisma.department.findUnique({
          where: { id },
        });
  
      if (!existingDepartment) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }
  
      const duplicateDepartment =
        await prisma.department.findFirst({
          where: {
            name: normalizedName,
            NOT: {
              id,
            },
          },
        });
  
      if (duplicateDepartment) {
        return res.status(409).json({
          success: false,
          message: "Department already exists",
        });
      }
  
      const department =
        await prisma.department.update({
          where: { id },
          data: {
            name: normalizedName,
          },
        });
  
      await recordAudit(req, res, {
        action: "DEPARTMENT_UPDATE",
        resourceType: "department",
        resourceId: department.id,
        resourceLabel: department.name,
        metadata: { previousName: existingDepartment.name },
      });

      return res.status(200).json({
        success: true,
        department,
      });
    } catch (error) {
      console.error(
        "Update department error:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message: "Failed to update department",
      });
    }
  }

export async function deleteDepartment(
  req: Request,
  res: Response
) {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({ success: false, message: "Invalid department id" });
    }

    const department = await prisma.department.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: { select: { users: true, documents: true } },
      },
    });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    if (department._count.users > 0 || department._count.documents > 0) {
      await recordAudit(req, res, {
        action: "DEPARTMENT_DELETE",
        resourceType: "department",
        resourceId: department.id,
        resourceLabel: department.name,
        status: "blocked",
        metadata: {
          users: department._count.users,
          documents: department._count.documents,
        },
      });

      return res.status(409).json({
        success: false,
        message: `Cannot delete ${department.name}. Reassign its ${department._count.users} user(s) and ${department._count.documents} document(s) first.`,
      });
    }

    await prisma.department.delete({ where: { id } });

    await recordAudit(req, res, {
      action: "DEPARTMENT_DELETE",
      resourceType: "department",
      resourceId: department.id,
      resourceLabel: department.name,
    });

    return res.status(200).json({ success: true, message: `Deleted ${department.name}` });
  } catch (error) {
    console.error("Delete department error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete department" });
  }
}
