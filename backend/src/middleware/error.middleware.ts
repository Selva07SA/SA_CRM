import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";
import { env } from "../config/env";

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation error",
        details: err.flatten()
      }
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(400).json({
      success: false,
      error: {
        code: err.code,
        message: env.NODE_ENV === "production" ? "Database request failed" : err.message
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
        ...(typeof err.details !== "undefined" ? { details: err.details } : {})
      }
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "Internal server error" : "Internal server error"
    }
  });
};
