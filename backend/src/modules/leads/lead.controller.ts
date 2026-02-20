import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { LeadService } from "./lead.service";
import { sendNoContent, sendSuccess } from "../../utils/apiResponse";

const service = new LeadService();

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.list(req.tenantId!, req.query as Record<string, unknown>);
  sendSuccess(res, data.items, 200, data.meta);
});

export const getLead = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.getById(req.tenantId!, String(req.params.id)));
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.create(req.tenantId!, req.body), 201);
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.update(req.tenantId!, String(req.params.id), req.body));
});

export const patchLeadStatus = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.updateStatus(req.tenantId!, String(req.params.id), req.body.status));
});

export const assignLead = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.assign(req.tenantId!, String(req.params.id), req.body.assignedToId));
});

export const convertLead = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.convert(req.tenantId!, String(req.params.id)), 201);
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await service.softDelete(req.tenantId!, String(req.params.id));
  sendNoContent(res);
});

export const listLeadNotes = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.notes(req.tenantId!, String(req.params.id)));
});

export const addLeadNote = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.createNote(req.tenantId!, String(req.params.id), req.body.body, req.auth!.userId), 201);
});

