import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

type Counter = { count: number; resetAt: number };

const keyFor = (req: Request): string => req.ip || req.socket.remoteAddress || "unknown";

export const rateLimit =
  (windowMs: number, max: number) =>
  (() => {
    const ipBucket = new Map<string, Counter>();

    // Remove stale entries to prevent unbounded growth in long-lived processes.
    const sweepTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, counter] of ipBucket.entries()) {
        if (counter.resetAt <= now) ipBucket.delete(key);
      }
    }, Math.max(windowMs, 10000));
    sweepTimer.unref();

    return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyFor(req);
    const now = Date.now();
    const entry = ipBucket.get(key);

    if (!entry || entry.resetAt <= now) {
      const nextEntry = { count: 1, resetAt: now + windowMs };
      ipBucket.set(key, nextEntry);
      res.setHeader("x-ratelimit-limit", String(max));
      res.setHeader("x-ratelimit-remaining", String(max - nextEntry.count));
      res.setHeader("x-ratelimit-reset", String(nextEntry.resetAt));
      return next();
    }

    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader("x-ratelimit-limit", String(max));
    res.setHeader("x-ratelimit-remaining", String(remaining));
    res.setHeader("x-ratelimit-reset", String(entry.resetAt));

    if (entry.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader("retry-after", String(retryAfterSeconds));
      return next(new ApiError(429, "Too many requests"));
    }

    next();
    };
  })();
