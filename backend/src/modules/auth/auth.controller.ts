import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthService } from "./auth.service";
import { sendNoContent, sendSuccess } from "../../utils/apiResponse";

const service = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.register({
    ...req.body,
    ip: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null
  });
  sendSuccess(res, data, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.login({
    ...req.body,
    tenantSlug: req.body.tenantSlug,
    ip: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null
  });
  sendSuccess(res, data);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.refresh(req.body.refreshToken, req.ip ?? null, req.get("user-agent") ?? null);
  sendSuccess(res, data);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await service.logout(req.tenantId!, req.auth!.userId, req.ip ?? null);
  sendNoContent(res);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.me(req.tenantId!, req.auth!.userId);
  sendSuccess(res, data);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.updateMe(req.tenantId!, req.auth!.userId, req.body.firstName, req.body.lastName);
  sendSuccess(res, data);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await service.changePassword(req.tenantId!, req.auth!.userId, req.body.currentPassword, req.body.newPassword);
  sendNoContent(res);
});
