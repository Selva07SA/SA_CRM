import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
      "req.body.currentPassword",
      "req.body.newPassword",
      "req.body.refreshToken",
      "req.body.accessToken",
      "refreshToken",
      "accessToken",
      "token",
      "password",
      "passwordHash"
    ],
    censor: "[REDACTED]"
  }
});
