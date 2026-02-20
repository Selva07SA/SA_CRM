import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { DashboardService } from "./dashboard.service";
import { sendSuccess } from "../../utils/apiResponse";
import { isManagerAccess } from "../../utils/accessScope";

const service = new DashboardService();

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.overview(req.tenantId!, scopedUserId));
});

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.sales(req.tenantId!, scopedUserId));
});

export const getRevenue = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.revenue(req.tenantId!, scopedUserId));
});
