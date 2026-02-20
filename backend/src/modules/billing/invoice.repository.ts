import { prisma } from "../../config/prisma";

const invoiceSelect = {
  id: true,
  tenantId: true,
  clientId: true,
  subscriptionId: true,
  invoiceNumber: true,
  status: true,
  amountCents: true,
  currency: true,
  issuedAt: true,
  dueAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: {
      id: true,
      name: true,
      email: true,
      company: true
    }
  },
  subscription: {
    select: {
      id: true,
      status: true,
      startsAt: true,
      endsAt: true
    }
  }
} as const;

export class InvoiceRepository {
  list(tenantId: string, status: string | undefined, skip: number, take: number) {
    return prisma.invoice.findMany({
      where: { tenantId, deletedAt: null, status: status as any },
      skip,
      take,
      select: invoiceSelect,
      orderBy: { createdAt: "desc" }
    });
  }

  count(tenantId: string, status?: string) {
    return prisma.invoice.count({ where: { tenantId, deletedAt: null, status: status as any } });
  }

  byId(tenantId: string, id: string) {
    return prisma.invoice.findFirst({ where: { tenantId, id, deletedAt: null }, select: invoiceSelect });
  }

  create(data: Parameters<typeof prisma.invoice.create>[0]["data"]) {
    return prisma.invoice.create({ data, select: invoiceSelect });
  }

  update(tenantId: string, id: string, data: Parameters<typeof prisma.invoice.update>[0]["data"]) {
    return prisma.invoice.update({ where: { id_tenantId: { id, tenantId } }, data });
  }
}
