import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { DashboardService } from "./dashboard.service";
import { sendSuccess } from "../../utils/apiResponse";

const service = new DashboardService();

export const getOverview = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.overview(req.tenantId!));
});

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.sales(req.tenantId!));
});

export const getRevenue = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.revenue(req.tenantId!));
});
