import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { PaymentService } from "./payment.service";
import { sendSuccess } from "../../utils/apiResponse";
import { isManagerAccess } from "../../utils/accessScope";

const service = new PaymentService();

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.record(req.tenantId!, req.body, scopedUserId), 201);
});
