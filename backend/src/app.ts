import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import routes from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { rateLimit } from "./middleware/rateLimit.middleware";

export const app = express();

if (env.TRUST_PROXY) {
  const value = env.TRUST_PROXY;
  app.set("trust proxy", /^\d+$/.test(value) ? Number(value) : value === "true");
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = env.CORS_ORIGIN.split(",").map((entry) => entry.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin denied"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  pinoHttp({
    logger,
    genReqId(req, res) {
      const incoming = req.headers["x-request-id"];
      const reqId = Array.isArray(incoming) ? incoming[0] : incoming;
      const id = reqId || randomUUID();
      res.setHeader("x-request-id", id);
      return id;
    }
  })
);
app.use(rateLimit(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX));
app.use(`${env.API_PREFIX}/auth/login`, rateLimit(env.RATE_LIMIT_WINDOW_MS, env.AUTH_RATE_LIMIT_MAX));
app.use(`${env.API_PREFIX}/auth/refresh`, rateLimit(env.RATE_LIMIT_WINDOW_MS, env.AUTH_RATE_LIMIT_MAX));

app.get("/healthz", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

app.get("/readyz", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, data: { status: "ready" } });
  } catch {
    res.status(503).json({ success: false, error: { code: "NOT_READY", message: "Database unavailable" } });
  }
});

app.use(env.API_PREFIX, routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
