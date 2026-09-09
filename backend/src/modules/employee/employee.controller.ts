import type {
    Request,
    Response,
  } from "express";
  
  import { prisma } from "../../config/prisma.js";
  
  export async function getEmployeeDashboard(
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
  
      const employee =
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
            createdAt: true,
  
            department: {
              select: {
                id: true,
                name: true,
              },
            },
  
            manager: {
              select: {
                id: true,
                fullName: true,
                email: true,
  
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
  
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        employee,
      });
    } catch (error) {
      console.error(
        "Employee dashboard error:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message:
          "Failed to load employee dashboard",
      });
    }
  }