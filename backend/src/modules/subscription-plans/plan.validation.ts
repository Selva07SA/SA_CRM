import { z } from "zod";

const idParam = z.object({ id: z.string().uuid() });

export const listPlansSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const createPlanSchema = z.object({
  body: z.object({
    code: z.string().min(2),
    name: z.string().min(2),
    description: z.string().optional(),
    priceCents: z.number().int().nonnegative(),
    currency: z.string().default("USD"),
    interval: z.string().min(3),
    isActive: z.boolean().default(true)
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updatePlanSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    priceCents: z.number().int().nonnegative().optional(),
    currency: z.string().optional(),
    interval: z.string().min(3).optional(),
    isActive: z.boolean().optional()
  }),
  query: z.object({}).passthrough(),
  params: idParam
});

export const idSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParam
});
