import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { SystemRole } from "@prisma/client";
import { randomId } from "./crypto";

const JWT_ALGORITHMS: SignOptions["algorithm"][] = ["HS256"];

type TokenBasePayload = {
  userId: string;
  tenantId: string;
  roleIds: string[];
  permissionKeys?: string[];
  systemRole: SystemRole;
};

export type AccessPayload = TokenBasePayload & {
  type: "access";
};

export type RefreshPayload = TokenBasePayload & {
  type: "refresh";
};

type VerifiedPayload = AccessPayload | RefreshPayload;

const sharedOptions: Pick<SignOptions, "issuer" | "audience" | "algorithm"> = {
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
  algorithm: "HS256"
};

export const signAccessToken = (payload: Omit<AccessPayload, "type">): string => {
  const options: SignOptions = {
    ...sharedOptions,
    expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"]
  };
  return jwt.sign({ ...payload, type: "access" }, env.JWT_ACCESS_SECRET, options);
};

export const signRefreshToken = (payload: Omit<RefreshPayload, "type">): string => {
  const options: SignOptions = {
    ...sharedOptions,
    expiresIn: `${env.JWT_REFRESH_TTL_DAYS}d` as SignOptions["expiresIn"]
  };
  return jwt.sign({ ...payload, type: "refresh", nonce: randomId() }, env.JWT_REFRESH_SECRET, options);
};

const verifyToken = (token: string, secret: string): VerifiedPayload => {
  return jwt.verify(token, secret, {
    algorithms: JWT_ALGORITHMS as jwt.Algorithm[],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE
  }) as VerifiedPayload;
};

export const verifyAccessToken = (token: string): AccessPayload => {
  const payload = verifyToken(token, env.JWT_ACCESS_SECRET);
  if (payload.type !== "access") {
    throw new Error("Invalid token type");
  }
  return payload;
};

export const verifyRefreshToken = (token: string): RefreshPayload => {
  const payload = verifyToken(token, env.JWT_REFRESH_SECRET);
  if (payload.type !== "refresh") {
    throw new Error("Invalid token type");
  }
  return payload;
};
