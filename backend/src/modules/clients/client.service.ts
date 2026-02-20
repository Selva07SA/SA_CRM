import { ApiError } from "../../utils/apiError";
import { parsePagination } from "../../utils/pagination";
import { ClientRepository } from "./client.repository";

const repo = new ClientRepository();

export class ClientService {
  async list(tenantId: string, query: Record<string, unknown>, scopedUserId?: string) {
    const page = parsePagination(query);
    const search = typeof query.search === "string" ? query.search : undefined;

    const [items, total] = await Promise.all([
      repo.list(tenantId, search, page.skip, page.limit, scopedUserId),
      repo.count(tenantId, search, scopedUserId)
    ]);

    return { items, meta: { page: page.page, limit: page.limit, total } };
  }

  async getById(tenantId: string, id: string, scopedUserId?: string) {
    const item = await repo.byId(tenantId, id, scopedUserId);
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

  async update(tenantId: string, id: string, body: { name?: string; email?: string; phone?: string; company?: string }, scopedUserId?: string) {
    const result = await repo.updateMany(tenantId, id, body, scopedUserId);
    if (result.count === 0) throw new ApiError(404, "Client not found");
    return this.getById(tenantId, id, scopedUserId);
  }

  async remove(tenantId: string, id: string, scopedUserId?: string) {
    const result = await repo.updateMany(tenantId, id, { deletedAt: new Date() }, scopedUserId);
    if (result.count === 0) throw new ApiError(404, "Client not found");
  }

  async notes(tenantId: string, clientId: string, scopedUserId?: string) {
    await this.getById(tenantId, clientId, scopedUserId);
    return repo.clientNotes(tenantId, clientId);
  }

  async addNote(tenantId: string, userId: string, clientId: string, body: string, scopedUserId?: string) {
    await this.getById(tenantId, clientId, scopedUserId);
    return repo.createClientNote(tenantId, userId, clientId, body);
  }

  async subscriptions(tenantId: string, clientId: string, scopedUserId?: string) {
    await this.getById(tenantId, clientId, scopedUserId);
    return repo.subscriptions(tenantId, clientId, scopedUserId);
  }
}
