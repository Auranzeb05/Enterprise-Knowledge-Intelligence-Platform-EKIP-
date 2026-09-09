import type {
    Request,
    Response,
  } from "express";
  
  import { prisma } from "../../config/prisma.js";
  
  export async function getManagerDashboard(
    req: Request,
    res: Response
  ) {
    try {
      const currentUser =
        res.locals.user;
  
      if (!currentUser) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
  
      const manager =
        await prisma.user.findUnique({
          where: {
            id: currentUser.id,
          },
  
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
  
            departmentId: true,
  
            department: {
              select: {
                id: true,
                name: true,
  
                _count: {
                  select: {
                    users: true,
                  },
                },
              },
            },
  
            employees: {
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
            },
          },
        });
  
      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }
  
      const team =
        manager.employees;
  
      const activeTeamMembers =
        team.filter(
          (user) =>
            user.status === "active"
        ).length;
  
      const pendingTeamMembers =
        team.filter(
          (user) =>
            user.status === "pending"
        ).length;
  
      const suspendedTeamMembers =
        team.filter(
          (user) =>
            user.status === "suspended"
        ).length;
  
      return res.status(200).json({
        success: true,
  
        manager: {
          id: manager.id,
          fullName: manager.fullName,
          email: manager.email,
          role: manager.role,
          status: manager.status,
  
          department:
            manager.department,
        },
  
        stats: {
          teamSize:
            team.length,
  
          activeTeamMembers,
  
          pendingTeamMembers,
  
          suspendedTeamMembers,
  
          departmentUsers:
            manager.department
              ?._count.users ?? 0,
        },
  
        team,
      });
    } catch (error) {
      console.error(
        "Manager dashboard error:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message:
          "Failed to load manager dashboard",
      });
    }
  }