import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const auditMiddleware = (action: string, resource: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (req.tenantId) {
      try {
        await prisma.auditLog.create({
          data: {
            tenantId: req.tenantId,
            actorUserId: req.auth?.userId,
            action,
            resource,
            resourceId: typeof req.params.id === "string" ? req.params.id : null,
            newValues: req.body,
            ipAddress: req.ip,
            userAgent: req.get("user-agent") ?? null
          }
        });
      } catch (error) {
        logger.warn({ error, action, resource }, "Audit logging failed; continuing request");
      }
    }
    next();
  };
};
