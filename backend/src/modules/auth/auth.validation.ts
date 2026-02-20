import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    tenantName: z.string().min(2),
    tenantSlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8)
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const loginSchema = z.object({
  body: z.object({
    tenantSlug: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10) }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updateMeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional()
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});
