import { z } from "zod";

const paramsId = z.object({ id: z.string().uuid() });

export const listEmployeesSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional()
  }).passthrough(),
  params: z.object({}).passthrough()
});

export const listRolesSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const createEmployeeSchema = z.object({
  body: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z.string().min(8),
    roleIds: z.array(z.string().uuid()).min(1, "At least one role is required")
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    roleIds: z.array(z.string().uuid()).min(1, "At least one role is required").optional()
  }),
  query: z.object({}).passthrough(),
  params: paramsId
});

export const updateEmployeeStatusSchema = z.object({
  body: z.object({ status: z.enum(["active", "inactive"]) }),
  query: z.object({}).passthrough(),
  params: paramsId
});

export const idParamSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: paramsId
});
