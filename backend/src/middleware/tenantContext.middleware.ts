import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

export const tenantContext = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.auth?.tenantId) return next(new ApiError(401, "Tenant missing"));
  await prisma.$executeRaw`SELECT set_config('app.current_tenant', ${req.auth.tenantId}, false)`;
  return next();
};