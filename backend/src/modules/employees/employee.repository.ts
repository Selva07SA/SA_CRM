import { prisma } from "../../config/prisma";

const employeeSelect = {
  id: true,
  tenantId: true,
  email: true,
  firstName: true,
  lastName: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  roles: {
    select: {
      roleId: true,
      role: {
        select: {
          id: true,
          tenantRole: true,
          description: true
        }
      }
    }
  }
} as const;

export class EmployeeRepository {
  list(tenantId: string, search: string | undefined, skip: number, take: number) {
    return prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
        OR: search
          ? [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          : undefined
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: employeeSelect
    });
  }

  count(tenantId: string, search?: string) {
    return prisma.user.count({
      where: {
        tenantId,
        deletedAt: null,
        OR: search
          ? [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          : undefined
      }
    });
  }

  findById(tenantId: string, id: string) {
    return prisma.user.findFirst({
      where: { tenantId, id, deletedAt: null },
      select: employeeSelect
    });
  }

  create(data: Parameters<typeof prisma.user.create>[0]["data"]) {
    return prisma.user.create({ data, select: { id: true } });
  }

  update(tenantId: string, id: string, data: Parameters<typeof prisma.user.update>[0]["data"]) {
    return prisma.user.update({ where: { id_tenantId: { id, tenantId } }, data });
  }

  softDelete(tenantId: string, id: string) {
    return prisma.user.updateMany({ where: { tenantId, id, deletedAt: null }, data: { deletedAt: new Date() } });
  }

  replaceRoles(tenantId: string, userId: string, roleIds: string[]) {
    return prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { tenantId, userId } });
      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({ tenantId, userId, roleId }))
        });
      }
    });
  }
}
