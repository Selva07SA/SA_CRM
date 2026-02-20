import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const suspendGuardMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  if (!req.tenantId) {
    return next(new ApiError(401, "Tenant missing"));
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: req.tenantId },
    select: { status: true, deletedAt: true }
  });

  if (!tenant || tenant.deletedAt || tenant.status === "suspended") {
    return next(new ApiError(403, "Tenant suspended or inactive"));
  }

  next();
};
