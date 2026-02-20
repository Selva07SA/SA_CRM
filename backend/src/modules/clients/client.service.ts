import { ApiError } from "../../utils/apiError";
import { parsePagination } from "../../utils/pagination";
import { ClientRepository } from "./client.repository";

const repo = new ClientRepository();

export class ClientService {
  async list(tenantId: string, query: Record<string, unknown>) {
    const page = parsePagination(query);
    const search = typeof query.search === "string" ? query.search : undefined;

    const [items, total] = await Promise.all([
      repo.list(tenantId, search, page.skip, page.limit),
      repo.count(tenantId, search)
    ]);

    return { items, meta: { page: page.page, limit: page.limit, total } };
  }

  async getById(tenantId: string, id: string) {
    const item = await repo.byId(tenantId, id);
    if (!item) throw new ApiError(404, "Client not found");
    return item;
  }

  create(tenantId: string, body: { name: string; email?: string; phone?: string; company?: string }) {
    return repo.create({
      tenantId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company
    });
  }

  async update(tenantId: string, id: string, body: { name?: string; email?: string; phone?: string; company?: string }) {
    const result = await repo.updateMany(tenantId, id, body);
    if (result.count === 0) throw new ApiError(404, "Client not found");
    return this.getById(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    const result = await repo.updateMany(tenantId, id, { deletedAt: new Date() });
    if (result.count === 0) throw new ApiError(404, "Client not found");
  }

  async notes(tenantId: string, clientId: string) {
    await this.getById(tenantId, clientId);
    return repo.clientNotes(tenantId, clientId);
  }

  async addNote(tenantId: string, userId: string, clientId: string, body: string) {
    await this.getById(tenantId, clientId);
    return repo.createClientNote(tenantId, userId, clientId, body);
  }

  async subscriptions(tenantId: string, clientId: string) {
    await this.getById(tenantId, clientId);
    return repo.subscriptions(tenantId, clientId);
  }
}
