import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { InvoiceService } from "./invoice.service";
import { sendSuccess } from "../../utils/apiResponse";

const service = new InvoiceService();

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.list(req.tenantId!, req.query as Record<string, unknown>);
  sendSuccess(res, data.items, 200, data.meta);
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.create(req.tenantId!, req.body), 201);
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.getById(req.tenantId!, String(req.params.id)));
});

