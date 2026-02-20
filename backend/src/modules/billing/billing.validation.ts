import { z } from "zod";

const idParam = z.object({ id: z.string().uuid() });

export const listInvoicesSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({ page: z.string().optional(), limit: z.string().optional(), status: z.string().optional() }).passthrough(),
  params: z.object({}).passthrough()
});

export const createInvoiceSchema = z.object({
  body: z.object({
    clientId: z.string().uuid(),
    subscriptionId: z.string().uuid().optional(),
    amountCents: z.number().int().positive(),
    currency: z.string().default("USD"),
    dueAt: z.string().datetime().optional()
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const invoiceIdSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParam
});

export const recordPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().uuid(),
    amountCents: z.number().int().positive(),
    currency: z.string().default("USD"),
    providerRef: z.string().optional()
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});
