import bcrypt from "bcryptjs";
import { SystemRole } from "@prisma/client";
import { ApiError } from "../../utils/apiError";
import { AuthRepository } from "./auth.repository";
import { env } from "../../config/env";
import { hashToken, randomId } from "../../utils/crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/token";
import { prisma } from "../../config/prisma";

const repo = new AuthRepository();

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export class AuthService {
  async register(input: {
    tenantName: string;
    tenantSlug: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    ip: string | null;
    userAgent: string | null;
  }) {
    const existingTenant = await repo.findTenantBySlug(input.tenantSlug);
    if (existingTenant) throw new ApiError(409, "Tenant slug already exists");

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: input.tenantName, slug: input.tenantSlug }
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName
        }
      });

      const ownerRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          tenantRole: "OWNER",
          description: "Tenant owner"
        }
      });

      const permissions = await tx.permission.findMany({ select: { id: true } });
      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((permission) => ({
            tenantId: tenant.id,
            roleId: ownerRole.id,
            permissionId: permission.id
          })),
          skipDuplicates: true
        });
      }

      await tx.userRole.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          roleId: ownerRole.id
        }
      });

      return { tenant, user, roleIds: [ownerRole.id] };
    });

    const systemRole = result.user.systemRole;
    const tokens = await this.issueTokenPair(
      result.user.id,
      result.tenant.id,
      result.roleIds,
      systemRole,
      input.ip,
      input.userAgent
    );

    return {
      tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug },
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        systemRole: result.user.systemRole
      },
      ...tokens
    };
  }

  async login(input: {
    tenantSlug: string;
    email: string;
    password: string;
    ip: string | null;
    userAgent: string | null;
  }) {
    const tenant = await repo.findTenantBySlug(input.tenantSlug);
    if (!tenant || tenant.deletedAt) throw new ApiError(401, "Invalid credentials");
    if (tenant.status === "suspended") throw new ApiError(403, "Tenant suspended");

    const user = await repo.findUserByEmail(tenant.id, input.email);
    if (!user || user.status !== "active") throw new ApiError(401, "Invalid credentials");

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new ApiError(401, "Invalid credentials");

    await repo.markLastLogin(tenant.id, user.id);

    const roleIds = user.roles.map((r) => r.roleId);
    const tokens = await this.issueTokenPair(user.id, tenant.id, roleIds, user.systemRole, input.ip, input.userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleIds,
        systemRole: user.systemRole
      },
      ...tokens
    };
  }

  async refresh(refreshToken: string, ip: string | null, userAgent: string | null): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid refresh token");
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await repo.findRefreshTokenByHash(tokenHash);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new ApiError(401, "Refresh token invalid or expired");
    }

    if (stored.tenantId !== payload.tenantId || stored.userId !== payload.userId) {
      throw new ApiError(401, "Refresh token invalid or expired");
    }

    const roleIds = await repo.roleIdsForUser(payload.tenantId, payload.userId);
    const accessToken = signAccessToken({
      userId: payload.userId,
      tenantId: payload.tenantId,
      roleIds,
      permissionKeys: await repo.permissionKeysForRoleIds(payload.tenantId, roleIds),
      systemRole: payload.systemRole
    });
    const signedRefresh = signRefreshToken({
      userId: payload.userId,
      tenantId: payload.tenantId,
      roleIds,
      systemRole: payload.systemRole
    });

    const created = await repo.createRefreshToken({
      tenantId: payload.tenantId,
      userId: payload.userId,
      tokenHash: hashToken(signedRefresh),
      familyId: stored.familyId,
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
      createdByIp: ip,
      userAgent
    });

    await repo.revokeRefreshToken(payload.tenantId, stored.id, ip, created.id);

    return { accessToken, refreshToken: signedRefresh };
  }

  async logout(tenantId: string, userId: string, ip: string | null): Promise<void> {
    await repo.revokeAllUserTokens(tenantId, userId, ip);
  }

  async me(tenantId: string, userId: string) {
    const user = await repo.findUserById(tenantId, userId);
    if (!user) throw new ApiError(404, "User not found");

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roleIds: user.roles.map((r) => r.roleId),
      systemRole: user.systemRole
    };
  }

  async updateMe(tenantId: string, userId: string, firstName?: string, lastName?: string) {
    return repo.updateUserProfile(tenantId, userId, firstName, lastName);
  }

  async changePassword(tenantId: string, userId: string, currentPassword: string, newPassword: string) {
    const user = await repo.findUserById(tenantId, userId);
    if (!user) throw new ApiError(404, "User not found");

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new ApiError(400, "Current password is incorrect");

    const hash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await repo.updatePassword(tenantId, user.id, hash);
  }

  private async issueTokenPair(
    userId: string,
    tenantId: string,
    roleIds: string[],
    systemRole: SystemRole,
    ip: string | null,
    userAgent: string | null
  ): Promise<AuthTokens> {
    const permissionKeys = await repo.permissionKeysForRoleIds(tenantId, roleIds);
    const accessToken = signAccessToken({ userId, tenantId, roleIds, permissionKeys, systemRole });
    const refreshToken = signRefreshToken({ userId, tenantId, roleIds, systemRole });

    await repo.createRefreshToken({
      tenantId,
      userId,
      tokenHash: hashToken(refreshToken),
      familyId: randomId(),
      expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
      createdByIp: ip,
      userAgent
    });

    return { accessToken, refreshToken };
  }
}

