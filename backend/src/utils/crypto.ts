import { randomBytes, createHash } from "crypto";

export const randomToken = (): string => randomBytes(64).toString("hex");
export const randomId = (): string => randomBytes(16).toString("hex");
export const hashToken = (value: string): string => createHash("sha256").update(value).digest("hex");
