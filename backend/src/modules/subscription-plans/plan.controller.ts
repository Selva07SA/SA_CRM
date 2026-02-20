import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { PlanService } from "./plan.service";
import { sendNoContent, sendSuccess } from "../../utils/apiResponse";

const service = new PlanService();

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await service.list());
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.getById(String(req.params.id)));
});

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.create(req.body), 201);
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.update(String(req.params.id), req.body));
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(String(req.params.id));
  sendNoContent(res);
});

