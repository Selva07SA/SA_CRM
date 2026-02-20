import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { SubscriptionService } from "./subscription.service";
import { sendSuccess } from "../../utils/apiResponse";

const service = new SubscriptionService();

export const listSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.list(req.tenantId!, req.query as Record<string, unknown>);
  sendSuccess(res, data.items, 200, data.meta);
});

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.create(req.tenantId!, req.body), 201);
});

export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.cancel(req.tenantId!, String(req.params.id)));
});

export const renewSubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.renew(req.tenantId!, String(req.params.id)));
});

export const pauseSubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.pause(req.tenantId!, String(req.params.id)));
});

export const resumeSubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.resume(req.tenantId!, String(req.params.id)));
});

