import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export class AuthRepository {
  createTenant(data: Prisma.TenantCreateInput) {
    return prisma.tenant.create({ data });
  }

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  findUserByEmail(tenantId: string, email: string) {
    return prisma.user.findFirst({
      where: { tenantId, email, deletedAt: null },
      select: {
        id: true,
        tenantId: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        status: true,
        systemRole: true,
        roles: {
          select: {
            roleId: true
          }
        }
      }
    });
  }

  findUserById(tenantId: string, userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: {
        id: true,
        tenantId: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        status: true,
        systemRole: true,
        roles: {
          select: {
            roleId: true
          }
        }
      }
    });
  }

  findTenantBySlug(slug: string) {
    return prisma.tenant.findUnique({ where: { slug } });
  }

  createRole(data: Prisma.RoleCreateInput) {
    return prisma.role.create({ data });
  }

  linkUserRole(data: Prisma.UserRoleCreateInput) {
    return prisma.userRole.create({ data });
  }

  async roleIdsForUser(tenantId: string, userId: string): Promise<string[]> {
    const rows = await prisma.userRole.findMany({
      where: { tenantId, userId },
      select: { roleId: true }
    });
    return rows.map((r) => r.roleId);
  }

  async permissionKeysForRoleIds(tenantId: string, roleIds: string[]): Promise<string[]> {
    if (roleIds.length === 0) return [];

    const rows = await prisma.rolePermission.findMany({
      where: {
        tenantId,
        roleId: { in: roleIds },
        role: { deletedAt: null }
      },
      select: {
        permission: {
          select: { key: true }
        }
      }
    });

    return [...new Set(rows.map((row) => row.permission.key))];
  }

  createRefreshToken(data: Prisma.RefreshTokenUncheckedCreateInput) {
    return prisma.refreshToken.create({ data });
  }

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  }

  revokeRefreshToken(tenantId: string, id: string, revokedByIp: string | null, replacedById: string | null) {
    return prisma.refreshToken.updateMany({
      where: { id, tenantId, revokedAt: null },
      data: { revokedAt: new Date(), revokedByIp, replacedById }
    });
  }

  revokeAllUserTokens(tenantId: string, userId: string, ip: string | null) {
    return prisma.refreshToken.updateMany({
      where: { tenantId, userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedByIp: ip }
    });
  }

  updateUserProfile(tenantId: string, userId: string, firstName?: string, lastName?: string) {
    return prisma.user.update({
      where: { id_tenantId: { id: userId, tenantId } },
      data: { firstName, lastName },
      select: { id: true, tenantId: true, email: true, firstName: true, lastName: true, status: true }
    });
  }

  updatePassword(tenantId: string, userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id_tenantId: { id: userId, tenantId } }, data: { passwordHash } });
  }

  markLastLogin(tenantId: string, userId: string) {
    return prisma.user.update({
      where: { id_tenantId: { id: userId, tenantId } },
      data: { lastLoginAt: new Date() }
    });
  }
}
