import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { PERMISSIONS } from "../constants/permissions";

export const can = (permissionKey: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.auth) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (req.auth.permissionKeys?.includes(permissionKey)) {
      return next();
    }

    const row = await prisma.userRole.findFirst({
      where: {
        tenantId: req.auth.tenantId,
        userId: req.auth.userId,
        roleId: { in: req.auth.roleIds },
        role: {
          deletedAt: null,
          rolePerms: {
            some: {
              tenantId: req.auth.tenantId,
              permission: { key: permissionKey }
            }
          }
        }
      },
      select: { id: true }
    });

    if (!row) {
      // Backward-compatible fallback for tenants created before role permission sync.
      if (permissionKey === PERMISSIONS.EMPLOYEE_MANAGE) {
        const adminLikeRole = await prisma.userRole.findFirst({
          where: {
            tenantId: req.auth.tenantId,
            userId: req.auth.userId,
            role: {
              deletedAt: null,
              tenantRole: { in: ["OWNER", "ADMIN"] }
            }
          },
          select: { id: true }
        });

        if (adminLikeRole) {
          return next();
        }
      }

      return next(new ApiError(403, `Forbidden: missing permission ${permissionKey}`));
    }

    next();
  };
};
