import { supabaseAdmin } from "../../config/supabaseAdmin.js";
import type { Request, Response } from "express";
import { prisma } from "../../config/prisma.js";
import { recordAudit } from "../audit/audit.service.js";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
}

export async function getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id;
  
      if (typeof id !== "string" || !id) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }
  
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          department: true,
          manager: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          employees: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              status: true,
            },
          },
        },
      });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Get user by id error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user",
      });
    }
  }
  export async function createUser(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        fullName,
        role,
        departmentId,
        managerId,
      } = req.body;
  
      if (!email || !password || !fullName || !role) {
        return res.status(400).json({
          success: false,
          message: "email, password, fullName and role are required",
        });
      }
  
      if (!["employee", "manager", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }
  
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });
  
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists",
        });
      }
  
      const {
        data: authData,
        error: authError,
      } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
  
      if (authError || !authData.user) {
        return res.status(400).json({
          success: false,
          message: authError?.message || "Failed to create Supabase user",
        });
      }
  
      try {
        const user = await prisma.user.create({
          data: {
            supabaseUserId: authData.user.id,
            email,
            fullName,
            role,
            status: "active",
            departmentId: departmentId || null,
            managerId: managerId || null,
          },
          include: {
            department: true,
            manager: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });
  
        await recordAudit(req, res, {
          action: "USER_CREATE",
          resourceType: "user",
          resourceId: user.id,
          resourceLabel: user.email,
          metadata: { role: user.role, departmentId: user.departmentId },
        });

        return res.status(201).json({
          success: true,
          user,
        });
      } catch (databaseError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
  
        console.error("Database user creation failed:", databaseError);
  
        return res.status(500).json({
          success: false,
          message: "Failed to create EKIP user",
        });
      }
    } catch (error) {
      console.error("Create user error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to create user",
      });
    }
  }

  export async function updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id;
  
      if (typeof id !== "string" || !id) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }
  
      const {
        fullName,
        role,
        status,
        departmentId,
        managerId,
      } = req.body;
      if (
        role &&
        !["employee", "manager", "admin"].includes(role)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }
  
      if (
        status &&
        !["active", "pending", "suspended"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
  
      const existingUser = await prisma.user.findUnique({
        where: {
          id,
        },
      });
  
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      const user = await prisma.user.update({
        where: {
          id,
        },
        data: {
          ...(typeof fullName === "string" && fullName.trim()
            ? { fullName: fullName.trim() }
            : {}),
        
          ...(role
            ? { role }
            : {}),
        
          ...(status
            ? { status }
            : {}),
        
          ...(departmentId !== undefined
            ? { departmentId: departmentId || null }
            : {}),
            ...(managerId !== undefined
              ? { managerId: managerId || null }
              : {}),
        },
        include: {
          department: true,
          manager: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
  
      await recordAudit(req, res, {
        action: "USER_UPDATE",
        resourceType: "user",
        resourceId: user.id,
        resourceLabel: user.email,
        metadata: { role: user.role, status: user.status, departmentId: user.departmentId },
      });

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Update user error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to update user",
      });
    }
  }

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const currentUser = res.locals.user;

    if (typeof id !== "string" || !id) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (currentUser.id === id) {
      await recordAudit(req, res, {
        action: "USER_DELETE",
        resourceType: "user",
        resourceId: id,
        resourceLabel: currentUser.email,
        status: "blocked",
        metadata: { reason: "self-delete-protection" },
      });

      return res.status(400).json({
        success: false,
        message: "You cannot delete your own administrator account",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        supabaseUserId: true,
        fullName: true,
        email: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await prisma.$transaction([
      prisma.user.updateMany({
        where: { managerId: id },
        data: { managerId: null },
      }),
      prisma.document.updateMany({
        where: { uploadedById: id },
        data: { uploadedById: currentUser.id },
      }),
      prisma.user.delete({ where: { id } }),
    ]);

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(existingUser.supabaseUserId);

    if (authDeleteError) {
      console.error("Supabase user cleanup failed:", authDeleteError);

      await recordAudit(req, res, {
        action: "USER_DELETE",
        resourceType: "user",
        resourceId: existingUser.id,
        resourceLabel: existingUser.email,
        status: "success",
        metadata: { authCleanupWarning: true },
      });

      return res.status(200).json({
        success: true,
        warning: "EKIP user was deleted, but Supabase Auth cleanup should be checked.",
      });
    }

    await recordAudit(req, res, {
      action: "USER_DELETE",
      resourceType: "user",
      resourceId: existingUser.id,
      resourceLabel: existingUser.email,
    });

    return res.status(200).json({
      success: true,
      message: `Deleted ${existingUser.fullName}`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
}

  export async function getAdminDashboard(
    req: Request,
    res: Response
  ) {
    try {
      const [
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers,
        employees,
        managers,
        admins,
        totalDepartments,
        recentUsers,
        departments,
      ] = await Promise.all([
        prisma.user.count(),
  
        prisma.user.count({
          where: {
            status: "active",
          },
        }),
  
        prisma.user.count({
          where: {
            status: "pending",
          },
        }),
  
        prisma.user.count({
          where: {
            status: "suspended",
          },
        }),
  
        prisma.user.count({
          where: {
            role: "employee",
          },
        }),
  
        prisma.user.count({
          where: {
            role: "manager",
          },
        }),
  
        prisma.user.count({
          where: {
            role: "admin",
          },
        }),
  
        prisma.department.count(),
  
        prisma.user.findMany({
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
  
        prisma.department.findMany({
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                users: true,
              },
            },
          },
        }),
      ]);
  
      return res.status(200).json({
        success: true,
  
        stats: {
          totalUsers,
          activeUsers,
          pendingUsers,
          suspendedUsers,
          totalDepartments,
  
          roles: {
            employee: employees,
            manager: managers,
            admin: admins,
          },
        },
  
        recentUsers,
        departments,
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message:
          "Failed to load admin dashboard",
      });
    }
  }

function periodDays(value: unknown) {
  if (value === "30d") return 30;
  if (value === "90d") return 90;
  return 7;
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateSeries(days: number) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (days - 1 - index));
    return {
      date: isoDay(date),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      aiQuestions: 0,
      documents: 0,
      newUsers: 0,
    };
  });
}

export async function getAnalytics(req: Request, res: Response) {
  try {
    const currentUser = res.locals.user;

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const days = periodDays(req.query.period);
    const requestedDepartmentId =
      typeof req.query.departmentId === "string" && req.query.departmentId.trim()
        ? req.query.departmentId.trim()
        : null;

    const managerDepartmentId =
      currentUser.role === "manager" ? currentUser.departmentId : null;

    const departmentId =
      currentUser.role === "admin" ? requestedDepartmentId : managerDepartmentId;

    const userWhere =
      currentUser.role === "admin"
        ? departmentId
          ? { departmentId }
          : {}
        : managerDepartmentId
          ? { departmentId: managerDepartmentId }
          : { id: currentUser.id };

    const documentWhere =
      currentUser.role === "admin"
        ? departmentId
          ? { departmentId }
          : {}
        : managerDepartmentId
          ? {
              OR: [
                { departmentId: null },
                { departmentId: managerDepartmentId },
              ],
            }
          : { departmentId: null };

    const conversationWhere = {
      user: userWhere,
    };

    const series = dateSeries(days);
    const startDate = new Date(`${series[0]?.date || isoDay(new Date())}T00:00:00.000Z`);

    const [
      totalUsers,
      activeUsers,
      totalDocuments,
      readyDocuments,
      failedDocuments,
      knowledgeChunks,
      conversations,
      aiQuestions,
      roleGroups,
      departments,
      scopedDocuments,
      recentQuestionDates,
      recentDocumentDates,
      recentUserDates,
    ] = await Promise.all([
      prisma.user.count({ where: userWhere }),
      prisma.user.count({ where: { ...userWhere, status: "active" } }),
      prisma.document.count({ where: documentWhere }),
      prisma.document.count({ where: { ...documentWhere, status: "ready" } }),
      prisma.document.count({ where: { ...documentWhere, status: "failed" } }),
      prisma.documentChunk.count({ where: { document: documentWhere } }),
      prisma.chatConversation.count({ where: conversationWhere }),
      prisma.chatMessage.count({
        where: {
          role: "user",
          conversation: conversationWhere,
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        where: userWhere,
        _count: { _all: true },
      }),
      prisma.department.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.document.findMany({
        where: documentWhere,
        select: {
          id: true,
          title: true,
          fileName: true,
          status: true,
          createdAt: true,
          departmentId: true,
          department: { select: { id: true, name: true } },
          _count: { select: { chunks: true } },
        },
      }),
      prisma.chatMessage.findMany({
        where: {
          role: "user",
          createdAt: { gte: startDate },
          conversation: conversationWhere,
        },
        select: { createdAt: true },
      }),
      prisma.document.findMany({
        where: { ...documentWhere, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { ...userWhere, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    const seriesMap = new Map(series.map((item) => [item.date, item]));

    for (const item of recentQuestionDates) {
      const bucket = seriesMap.get(isoDay(item.createdAt));
      if (bucket) bucket.aiQuestions += 1;
    }

    for (const item of recentDocumentDates) {
      const bucket = seriesMap.get(isoDay(item.createdAt));
      if (bucket) bucket.documents += 1;
    }

    for (const item of recentUserDates) {
      const bucket = seriesMap.get(isoDay(item.createdAt));
      if (bucket) bucket.newUsers += 1;
    }

    const roleDistribution = {
      admin: 0,
      manager: 0,
      employee: 0,
    };

    for (const group of roleGroups) {
      roleDistribution[group.role] = group._count._all;
    }

    const departmentMap = new Map<
      string,
      { id: string; name: string; users: number; documents: number; readyDocuments: number; chunks: number }
    >();

    const departmentUserGroups = await prisma.user.groupBy({
      by: ["departmentId"],
      where: currentUser.role === "admin" ? {} : userWhere,
      _count: { _all: true },
    });

    for (const department of departments) {
      departmentMap.set(department.id, {
        id: department.id,
        name: department.name,
        users: 0,
        documents: 0,
        readyDocuments: 0,
        chunks: 0,
      });
    }

    for (const group of departmentUserGroups) {
      if (group.departmentId && departmentMap.has(group.departmentId)) {
        departmentMap.get(group.departmentId)!.users = group._count._all;
      }
    }

    let generalDocuments = 0;
    let generalReadyDocuments = 0;
    let generalChunks = 0;

    for (const document of scopedDocuments) {
      if (document.departmentId && departmentMap.has(document.departmentId)) {
        const bucket = departmentMap.get(document.departmentId)!;
        bucket.documents += 1;
        bucket.chunks += document._count.chunks;
        if (document.status === "ready") bucket.readyDocuments += 1;
      } else if (!document.departmentId) {
        generalDocuments += 1;
        generalChunks += document._count.chunks;
        if (document.status === "ready") generalReadyDocuments += 1;
      }
    }

    const departmentCoverage = Array.from(departmentMap.values())
      .filter((item) =>
        currentUser.role === "admin"
          ? !departmentId || item.id === departmentId
          : item.id === managerDepartmentId
      )
      .filter((item) => item.users > 0 || item.documents > 0 || item.chunks > 0);

    if (!departmentId && currentUser.role === "admin" && generalDocuments > 0) {
      departmentCoverage.unshift({
        id: "general",
        name: "General",
        users: 0,
        documents: generalDocuments,
        readyDocuments: generalReadyDocuments,
        chunks: generalChunks,
      });
    }

    if (currentUser.role === "manager" && generalDocuments > 0) {
      departmentCoverage.unshift({
        id: "general",
        name: "General",
        users: 0,
        documents: generalDocuments,
        readyDocuments: generalReadyDocuments,
        chunks: generalChunks,
      });
    }

    const topDocuments = scopedDocuments
      .filter((document) => document.status === "ready")
      .sort((a, b) => b._count.chunks - a._count.chunks || b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 8)
      .map((document) => ({
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        department: document.department?.name || "General",
        chunks: document._count.chunks,
        createdAt: document.createdAt,
      }));

    return res.status(200).json({
      success: true,
      period: `${days}d`,
      scope: {
        role: currentUser.role,
        departmentId,
        departmentName:
          departmentId
            ? departments.find((department) => department.id === departmentId)?.name || null
            : null,
      },
      summary: {
        totalUsers,
        activeUsers,
        totalDocuments,
        readyDocuments,
        failedDocuments,
        knowledgeChunks,
        conversations,
        aiQuestions,
      },
      roleDistribution,
      activity: series,
      departmentCoverage,
      topDocuments,
      departments:
        currentUser.role === "admin"
          ? departments
          : departments.filter((department) => department.id === managerDepartmentId),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load analytics",
    });
  }
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(10, Number.parseInt(String(req.query.pageSize || "25"), 10) || 25)
    );
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 200) : "";
    const action = typeof req.query.action === "string" ? req.query.action.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
    const resourceType =
      typeof req.query.resourceType === "string" ? req.query.resourceType.trim() : "";

    const where = {
      ...(action ? { action } : {}),
      ...(status ? { status } : {}),
      ...(resourceType ? { resourceType } : {}),
      ...(q
        ? {
            OR: [
              { actorName: { contains: q, mode: "insensitive" as const } },
              { actorEmail: { contains: q, mode: "insensitive" as const } },
              { action: { contains: q, mode: "insensitive" as const } },
              { resourceLabel: { contains: q, mode: "insensitive" as const } },
              { resourceType: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, logs, actionGroups, statusGroups, resourceGroups] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.groupBy({ by: ["action"], _count: { _all: true } }),
      prisma.auditLog.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.auditLog.groupBy({ by: ["resourceType"], _count: { _all: true } }),
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      filters: {
        actions: actionGroups.map((item) => ({ value: item.action, count: item._count._all })),
        statuses: statusGroups.map((item) => ({ value: item.status, count: item._count._all })),
        resources: resourceGroups.map((item) => ({ value: item.resourceType, count: item._count._all })),
      },
    });
  } catch (error) {
    console.error("Audit logs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load audit logs",
    });
  }
}
