import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const requireSystemAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.auth) {
    return next(new ApiError(401, "Unauthorized", undefined, "UNAUTHORIZED"));
  }
  if (req.auth.systemRole !== "SYSTEM_ADMIN") {
    return next(new ApiError(403, "Forbidden: system admin required", undefined, "FORBIDDEN"));
  }
  next();
};
