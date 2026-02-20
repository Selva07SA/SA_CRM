import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export const activityMiddleware = (action: string, resource: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (req.tenantId && req.auth?.userId) {
      try {
        await prisma.activity.create({
          data: {
            tenantId: req.tenantId,
            userId: req.auth.userId,
            action,
            resource,
            resourceId: typeof req.params.id === "string" ? req.params.id : null,
            metadata: {
              method: req.method,
              path: req.originalUrl
            }
          }
        });
      } catch (error) {
        logger.warn({ error, action, resource }, "Activity logging failed; continuing request");
      }
    }
    next();
  };
};
