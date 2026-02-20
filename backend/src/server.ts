import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "SaaS CRM API running");
});

let shuttingDown = false;

const shutdown = (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Shutdown initiated");

  const forceExitTimer = setTimeout(() => {
    logger.error("Forced shutdown timeout reached");
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  server.close(async (closeErr) => {
    if (closeErr) {
      logger.error({ err: closeErr }, "Error while closing HTTP server");
    }

    try {
      await prisma.$disconnect();
      logger.info("Database disconnected");
      process.exit(closeErr ? 1 : 0);
    } catch (dbErr) {
      logger.error({ err: dbErr }, "Error while disconnecting database");
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
