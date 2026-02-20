import { ApiError } from "../../utils/apiError";
import { parsePagination } from "../../utils/pagination";
import { InvoiceRepository } from "./invoice.repository";

const repo = new InvoiceRepository();

export class InvoiceService {
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
    const invoice = await repo.byId(tenantId, id);
    if (!invoice) throw new ApiError(404, "Invoice not found");
    return invoice;
  }

  async create(tenantId: string, body: { clientId: string; subscriptionId?: string; amountCents: number; currency: string; dueAt?: string }) {
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
