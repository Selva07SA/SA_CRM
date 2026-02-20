import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  TRUST_PROXY: z
    .union([z.literal(""), z.literal("true"), z.literal("false"), z.string().regex(/^\d+$/)])
    .optional()
    .default(""),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1),
  JWT_AUDIENCE: z.string().min(1),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  CORS_ORIGIN: z
    .string()
    .min(1)
    .refine((value) => value.split(",").every((origin) => {
      const trimmed = origin.trim();
      if (!trimmed) return false;
      try {
        // Validate each configured origin in a comma-separated allowlist.
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }), "CORS_ORIGIN must be a valid URL or comma-separated list of URLs"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10)
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
