import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token";
import { ApiError } from "../utils/apiError";
import { prisma } from "../config/prisma";

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing bearer token"));
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        tenantId: payload.tenantId,
        status: "active",
        deletedAt: null,
        tenant: { status: "active", deletedAt: null }
      },
      select: { id: true, systemRole: true }
    });

    if (!user) {
      return next(new ApiError(403, "User or tenant inactive"));
    }

    req.auth = { ...payload, systemRole: user.systemRole };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token"));
  }
};
