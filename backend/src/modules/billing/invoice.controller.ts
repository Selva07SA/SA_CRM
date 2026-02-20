import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { InvoiceService } from "./invoice.service";
import { sendSuccess } from "../../utils/apiResponse";
import { isManagerAccess } from "../../utils/accessScope";

const service = new InvoiceService();

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  const data = await service.list(req.tenantId!, req.query as Record<string, unknown>, scopedUserId);
  sendSuccess(res, data.items, 200, data.meta);
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.create(req.tenantId!, req.body, scopedUserId), 201);
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.getById(req.tenantId!, String(req.params.id), scopedUserId));
});

