import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ClientService } from "./client.service";
import { sendNoContent, sendSuccess } from "../../utils/apiResponse";

const service = new ClientService();

export const listClients = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.list(req.tenantId!, req.query as Record<string, unknown>);
  sendSuccess(res, data.items, 200, data.meta);
});

export const getClient = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.getById(req.tenantId!, String(req.params.id)));
});

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.create(req.tenantId!, req.body), 201);
});

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.update(req.tenantId!, String(req.params.id), req.body));
});

export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.tenantId!, String(req.params.id));
  sendNoContent(res);
});

export const listClientNotes = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.notes(req.tenantId!, String(req.params.id)));
});

export const addClientNote = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.addNote(req.tenantId!, req.auth!.userId, String(req.params.id), req.body.body), 201);
});

export const listClientSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.subscriptions(req.tenantId!, String(req.params.id)));
});

