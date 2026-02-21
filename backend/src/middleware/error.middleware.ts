import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";
import { env } from "../config/env";

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const correlationIdRaw = res.getHeader("x-request-id") ?? _req.headers["x-request-id"];
  const correlationId = Array.isArray(correlationIdRaw) ? correlationIdRaw[0] : correlationIdRaw;

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error",
        details: err.flatten(),
        ...(correlationId ? { correlationId } : {})
      }
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      success: false,
      error: {
        code: err.code,
        message: env.NODE_ENV === "production" ? "Database request failed" : err.message,
        ...(correlationId ? { correlationId } : {})
      }
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(typeof err.details !== "undefined" ? { details: err.details } : {}),
        ...(correlationId ? { correlationId } : {})
      }
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Internal server error" : "Internal server error",
      ...(correlationId ? { correlationId } : {})
    }
  });
};
