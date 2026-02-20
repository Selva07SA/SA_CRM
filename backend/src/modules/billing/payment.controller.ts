import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { PaymentService } from "./payment.service";
import { sendSuccess } from "../../utils/apiResponse";

const service = new PaymentService();

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.record(req.tenantId!, req.body), 201);
});
