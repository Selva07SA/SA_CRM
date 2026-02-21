import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { EmployeeService } from "./employee.service";
import { sendNoContent, sendSuccess } from "../../utils/apiResponse";

const service = new EmployeeService();

export const listEmployees = asyncHandler(async (req: Request, res: Response) => {
  const data = await service.list(req.tenantId!, req.query as Record<string, unknown>);
  sendSuccess(res, data.items, 200, data.meta);
});

export const listEmployeeRoles = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.listRoles(req.tenantId!));
});

export const getEmployee = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.getById(req.tenantId!, String(req.params.id)));
});

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.create(req.tenantId!, req.body), 201);
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.update(req.tenantId!, String(req.params.id), req.body));
});

export const updateEmployeeStatus = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await service.updateStatus(req.tenantId!, String(req.params.id), req.body.status));
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  await service.remove(req.tenantId!, String(req.params.id));
  sendNoContent(res);
});

