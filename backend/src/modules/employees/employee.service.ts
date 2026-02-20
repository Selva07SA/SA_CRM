import bcrypt from "bcryptjs";
import { env } from "../../config/env";
import { ApiError } from "../../utils/apiError";
import { parsePagination } from "../../utils/pagination";
import { EmployeeRepository } from "./employee.repository";

const repo = new EmployeeRepository();

export class EmployeeService {
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
    await this.getById(tenantId, id);

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
}

