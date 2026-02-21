import bcrypt from "bcryptjs";
import { env } from "../../config/env";
import { ApiError } from "../../utils/apiError";
import { parsePagination } from "../../utils/pagination";
import { EmployeeRepository } from "./employee.repository";
import { prisma } from "../../config/prisma";

const repo = new EmployeeRepository();

export class EmployeeService {
  async listRoles(tenantId: string) {
    const existingRoles = await repo.listRoles(tenantId);
    if (existingRoles.length > 0) {
      const employeeRole = existingRoles.find((role) => role.tenantRole === "EMPLOYEE");
      if (employeeRole) {
        const employeeCreateInvoiceGrant = await prisma.rolePermission.findFirst({
          where: {
            tenantId,
            roleId: employeeRole.id,
            permission: { key: "invoice.create" }
          },
          select: { id: true }
        });

        // Keep legacy tenants in sync when new employee capabilities are introduced.
        if (!employeeCreateInvoiceGrant) {
          await this.ensureAssignableRoles(tenantId);
          return repo.listRoles(tenantId);
        }
      }

      return existingRoles;
    }

    // Bootstrap tenant roles only when missing (legacy tenants).
    await this.ensureAssignableRoles(tenantId);
    return repo.listRoles(tenantId);
  }

  async list(tenantId: string, query: Record<string, unknown>) {
    const page = parsePagination(query);
    const search = typeof query.search === "string" ? query.search : undefined;

    const [items, total] = await Promise.all([
      repo.list(tenantId, search, page.skip, page.limit),
      repo.count(tenantId, search)
    ]);

    return {
      items,
      meta: { page: page.page, limit: page.limit, total }
    };
  }

  async getById(tenantId: string, id: string) {
    const user = await repo.findById(tenantId, id);
    if (!user) throw new ApiError(404, "Employee not found");
    return user;
  }

  async create(tenantId: string, data: { email: string; firstName: string; lastName: string; password: string; roleIds: string[] }) {
    await this.ensureAssignableRoles(tenantId);

    if (data.roleIds.length === 0) {
      throw new ApiError(400, "At least one role is required");
    }

    const assignableRoles = await repo.findAssignableRolesByIds(tenantId, data.roleIds);
    if (assignableRoles.length !== new Set(data.roleIds).size) {
      throw new ApiError(400, "Invalid role selection");
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    const user = await repo.create({
      tenantId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash
    });

    if (data.roleIds.length > 0) {
      await repo.replaceRoles(tenantId, user.id, data.roleIds);
    }

    return this.getById(tenantId, user.id);
  }

  async update(tenantId: string, id: string, payload: { firstName?: string; lastName?: string; roleIds?: string[] }) {
    await this.ensureAssignableRoles(tenantId);
    await this.getById(tenantId, id);

    if (payload.roleIds) {
      if (payload.roleIds.length === 0) {
        throw new ApiError(400, "At least one role is required");
      }

      const assignableRoles = await repo.findAssignableRolesByIds(tenantId, payload.roleIds);
      if (assignableRoles.length !== new Set(payload.roleIds).size) {
        throw new ApiError(400, "Invalid role selection");
      }
    }

    await repo.update(tenantId, id, {
      firstName: payload.firstName,
      lastName: payload.lastName
    });

    if (payload.roleIds) {
      await repo.replaceRoles(tenantId, id, payload.roleIds);
    }

    return this.getById(tenantId, id);
  }

  async updateStatus(tenantId: string, id: string, status: "active" | "inactive") {
    await this.getById(tenantId, id);
    return repo.update(tenantId, id, { status });
  }

  async remove(tenantId: string, id: string) {
    const updated = await repo.softDelete(tenantId, id);
    if (updated.count === 0) throw new ApiError(404, "Employee not found");
  }

  private async ensureAssignableRoles(tenantId: string) {
    const permissionKeys = [
      "lead.create",
      "lead.view",
      "lead.assign",
      "lead.convert",
      "client.create",
      "client.view",
      "client.update",
      "subscription.create",
      "subscription.cancel",
      "subscription.renew",
      "invoice.create",
      "invoice.view",
      "payment.record",
      "employee.manage",
      "dashboard.view"
    ];

    for (const key of permissionKeys) {
      await prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, description: key }
      });
    }

    const [adminRole, employeeRole] = await Promise.all([
      prisma.role.upsert({
        where: { tenantId_tenantRole: { tenantId, tenantRole: "ADMIN" } },
        update: {},
        create: { tenantId, tenantRole: "ADMIN", description: "Operational manager" }
      }),
      prisma.role.upsert({
        where: { tenantId_tenantRole: { tenantId, tenantRole: "EMPLOYEE" } },
        update: {},
        create: { tenantId, tenantRole: "EMPLOYEE", description: "Sales employee" }
      })
    ]);

    const permissions = await prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
      select: { id: true, key: true }
    });

    const adminKeys = new Set([
      "lead.create",
      "lead.view",
      "lead.assign",
      "lead.convert",
      "client.create",
      "client.view",
      "client.update",
      "subscription.create",
      "subscription.cancel",
      "subscription.renew",
      "invoice.create",
      "invoice.view",
      "payment.record",
      "employee.manage",
      "dashboard.view"
    ]);

    const employeeKeys = new Set([
      "lead.create",
      "lead.view",
      "lead.convert",
      "client.create",
      "client.view",
      "subscription.create",
      "subscription.cancel",
      "subscription.renew",
      "invoice.create",
      "invoice.view",
      "payment.record",
      "dashboard.view"
    ]);

    const grants = [
      ...permissions.filter((p) => adminKeys.has(p.key)).map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
      ...permissions.filter((p) => employeeKeys.has(p.key)).map((p) => ({ roleId: employeeRole.id, permissionId: p.id }))
    ];

    for (const grant of grants) {
      await prisma.rolePermission.upsert({
        where: {
          tenantId_roleId_permissionId: {
            tenantId,
            roleId: grant.roleId,
            permissionId: grant.permissionId
          }
        },
        update: {},
        create: {
          tenantId,
          roleId: grant.roleId,
          permissionId: grant.permissionId
        }
      });
    }
  }
}

