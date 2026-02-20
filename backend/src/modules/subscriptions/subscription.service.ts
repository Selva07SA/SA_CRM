import { ApiError } from "../../utils/apiError";
import { parsePagination } from "../../utils/pagination";
import { SubscriptionRepository } from "./subscription.repository";

const repo = new SubscriptionRepository();

export class SubscriptionService {
  async list(tenantId: string, query: Record<string, unknown>) {
    const page = parsePagination(query);
    const status = typeof query.status === "string" ? query.status : undefined;

    const [items, total] = await Promise.all([
      repo.list(tenantId, status, page.skip, page.limit),
      repo.count(tenantId, status)
    ]);

    return { items, meta: { page: page.page, limit: page.limit, total } };
  }

  async getById(tenantId: string, id: string) {
    const sub = await repo.byId(tenantId, id);
    if (!sub) throw new ApiError(404, "Subscription not found");
    return sub;
  }

  create(tenantId: string, body: { clientId: string; planId: string; startsAt: string; endsAt?: string }) {
    return repo.create({
      tenantId,
      clientId: body.clientId,
      planId: body.planId,
      startsAt: new Date(body.startsAt),
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      status: "active"
    });
  }

  async cancel(tenantId: string, id: string) {
    const result = await repo.updateMany(tenantId, id, { status: "canceled", canceledAt: new Date() });
    if (result.count === 0) throw new ApiError(404, "Subscription not found");
    return this.getById(tenantId, id);
  }

  async renew(tenantId: string, id: string) {
    const result = await repo.updateMany(tenantId, id, { status: "active", canceledAt: null });
    if (result.count === 0) throw new ApiError(404, "Subscription not found");
    return this.getById(tenantId, id);
  }

  async pause(tenantId: string, id: string) {
    const result = await repo.updateMany(tenantId, id, { status: "paused", pausedAt: new Date() });
    if (result.count === 0) throw new ApiError(404, "Subscription not found");
    return this.getById(tenantId, id);
  }

  async resume(tenantId: string, id: string) {
    const result = await repo.updateMany(tenantId, id, { status: "active", resumedAt: new Date(), pausedAt: null });
    if (result.count === 0) throw new ApiError(404, "Subscription not found");
    return this.getById(tenantId, id);
  }
}
