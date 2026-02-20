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
    const client = await repo.clientById(tenantId, body.clientId, scopedUserId);
    if (!client) throw new ApiError(404, "Client not found");

    if (body.subscriptionId) {
      const sub = await repo.subscriptionById(tenantId, body.subscriptionId, body.clientId, scopedUserId);
      if (!sub) throw new ApiError(404, "Subscription not found");
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
      issuedAt: new Date(),
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined
    });
  }
}
