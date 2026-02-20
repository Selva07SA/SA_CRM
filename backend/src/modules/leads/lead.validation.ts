import { z } from "zod";

const idParam = z.object({ id: z.string().uuid() });

export const listLeadsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).optional(),
    assignedTo: z.string().uuid().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sort: z.enum(["asc", "desc"]).optional()
  }).passthrough(),
  params: z.object({}).passthrough()
});

export const createLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).optional(),
    assignedToId: z.string().uuid().optional(),
    source: z.string().optional(),
    notes: z.string().optional()
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updateLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
    assignedToId: z.string().uuid().optional()
  }),
  query: z.object({}).passthrough(),
  params: idParam
});

export const updateLeadStatusSchema = z.object({
  body: z.object({
    status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"])
  }),
  query: z.object({}).passthrough(),
  params: idParam
});

export const assignLeadSchema = z.object({
  body: z.object({ assignedToId: z.string().uuid() }),
  query: z.object({}).passthrough(),
  params: idParam
});

export const addLeadNoteSchema = z.object({
  body: z.object({ body: z.string().min(1) }),
  query: z.object({}).passthrough(),
  params: idParam
});

export const idOnlySchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParam
});
