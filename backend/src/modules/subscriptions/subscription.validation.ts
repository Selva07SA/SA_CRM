import { z } from "zod";

const idParam = z.object({ id: z.string().uuid() });

export const listSubscriptionsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({ page: z.string().optional(), limit: z.string().optional(), status: z.string().optional() }).passthrough(),
  params: z.object({}).passthrough()
});

export const createSubscriptionSchema = z.object({
  body: z.object({
    clientId: z.string().uuid(),
    planId: z.string().uuid(),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime().optional()
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const idSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParam
});
