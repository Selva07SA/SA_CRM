import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { LeadService } from "./lead.service";
import { sendNoContent, sendSuccess } from "../../utils/apiResponse";
import { isManagerAccess } from "../../utils/accessScope";

const service = new LeadService();

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  const data = await service.list(req.tenantId!, req.query as Record<string, unknown>, scopedUserId);
  sendSuccess(res, data.items, 200, data.meta);
});

export const getLead = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.getById(req.tenantId!, String(req.params.id), scopedUserId));
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.create(req.tenantId!, req.body, scopedUserId), 201);
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.update(req.tenantId!, String(req.params.id), req.body, scopedUserId));
});

export const patchLeadStatus = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.updateStatus(req.tenantId!, String(req.params.id), req.body.status, scopedUserId));
});

export const assignLead = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.assign(req.tenantId!, String(req.params.id), req.body.assignedToId, scopedUserId));
});

export const convertLead = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.convert(req.tenantId!, String(req.params.id), scopedUserId), 201);
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  await service.softDelete(req.tenantId!, String(req.params.id), scopedUserId);
  sendNoContent(res);
});

export const listLeadNotes = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.notes(req.tenantId!, String(req.params.id), scopedUserId));
});

export const addLeadNote = asyncHandler(async (req: Request, res: Response) => {
  const scopedUserId = isManagerAccess(req) ? undefined : req.auth!.userId;
  sendSuccess(res, await service.createNote(req.tenantId!, String(req.params.id), req.body.body, req.auth!.userId, scopedUserId), 201);
});

