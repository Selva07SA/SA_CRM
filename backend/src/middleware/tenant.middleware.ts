import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const tenantIsolationMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.auth?.tenantId) {
    return next(new ApiError(401, "Tenant context missing"));
  }

  req.tenantId = req.auth.tenantId;

  const tenantOverride = req.headers["x-tenant-id"];
  if (tenantOverride && tenantOverride !== req.tenantId) {
    return next(new ApiError(403, "Cross-tenant access denied"));
  }

  next();
};
