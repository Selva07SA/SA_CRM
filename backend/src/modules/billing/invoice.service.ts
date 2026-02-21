import { ApiError } from "../../utils/apiError";
import { parsePagination } from "../../utils/pagination";
import { InvoiceRepository } from "./invoice.repository";

const repo = new InvoiceRepository();

export class InvoiceService {
  async list(tenantId: string, query: Record<string, unknown>, scopedUserId?: string) {
    const page = parsePagination(query);
    const status = typeof query.status === "string" ? query.status : undefined;

    const [items, total] = await Promise.all([
      repo.list(tenantId, status, page.skip, page.limit, scopedUserId),
      repo.count(tenantId, status, scopedUserId)
    ]);

    return { items, meta: { page: page.page, limit: page.limit, total } };
  }

  async getById(tenantId: string, id: string, scopedUserId?: string) {
    const invoice = await repo.byId(tenantId, id, scopedUserId);
    if (!invoice) throw new ApiError(404, "Invoice not found");
    return invoice;
  }

  async create(
    tenantId: string,
    body: { clientId: string; subscriptionId?: string; amountCents: number; currency: string; dueAt?: string },
    scopedUserId?: string
  ) {
    if (!Number.isInteger(body.amountCents) || body.amountCents <= 0) {
      throw new ApiError(400, "Invoice amount must be a positive integer in cents");
    }

    const client = await repo.clientById(tenantId, body.clientId, scopedUserId);
    if (!client) throw new ApiError(404, "Client not found");

    const dueAt = body.dueAt ? new Date(body.dueAt) : undefined;
    if (dueAt && Number.isNaN(dueAt.getTime())) {
      throw new ApiError(400, "Invalid due date");
    }

    const issuedAt = new Date();
    if (dueAt && dueAt < issuedAt) {
      throw new ApiError(400, "Due date cannot be earlier than issue date");
    }

    if (body.subscriptionId) {
      const sub = await repo.subscriptionById(tenantId, body.subscriptionId, body.clientId, scopedUserId);
      if (!sub) throw new ApiError(404, "Subscription not found");
      if (sub.status === "canceled" || sub.status === "expired") {
        throw new ApiError(409, "Cannot issue invoice for inactive subscription");
      }
    }

    const number = `INV-${Date.now()}`;

    return repo.create({
      tenantId,
      clientId: body.clientId,
      subscriptionId: body.subscriptionId,
      amountCents: body.amountCents,
      currency: body.currency,
      invoiceNumber: number,
      status: "issued",
      issuedAt,
      dueAt
    });
  }
}
