import { Request } from "express";

export const isManagerAccess = (req: Request): boolean => {
  if (!req.auth) return false;
  return req.auth.systemRole === "SYSTEM_ADMIN" || Boolean(req.auth.permissionKeys?.includes("employee.manage"));
};
