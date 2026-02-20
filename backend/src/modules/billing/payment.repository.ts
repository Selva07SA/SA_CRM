import { prisma } from "../../config/prisma";

export class PaymentRepository {
  create(data: Parameters<typeof prisma.payment.create>[0]["data"]) {
    return prisma.payment.create({ data });
  }

  invoiceById(tenantId: string, invoiceId: string, scopedUserId?: string) {
    return prisma.invoice.findFirst({
      where: {
        tenantId,
        id: invoiceId,
        deletedAt: null,
        ...(scopedUserId ? { client: { sourceLead: { assignedToId: scopedUserId } } } : {})
      }
    });
  }
}
