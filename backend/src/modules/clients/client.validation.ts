import { z } from "zod";

const idParam = z.object({ id: z.string().uuid() });

export const listClientsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({ page: z.string().optional(), limit: z.string().optional(), search: z.string().optional() }).passthrough(),
  params: z.object({}).passthrough()
});

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional()
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updateClientSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional()
  }),
  query: z.object({}).passthrough(),
  params: idParam
});

export const addClientNoteSchema = z.object({
  body: z.object({ body: z.string().min(1) }),
  query: z.object({}).passthrough(),
  params: idParam
});

export const idSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParam
});
