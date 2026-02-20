import { prisma } from "../../config/prisma";

export class DashboardService {
  async overview(tenantId: string) {
    const [leadCount, clientCount, subCount, invoiceAgg] = await Promise.all([
      prisma.lead.count({ where: { tenantId, deletedAt: null } }),
      prisma.client.count({ where: { tenantId, deletedAt: null } }),
      prisma.subscription.count({ where: { tenantId, deletedAt: null, status: "active" } }),
      prisma.invoice.aggregate({
        where: { tenantId, deletedAt: null, status: "paid" },
        _sum: { amountCents: true }
      })
    ]);

    return {
      leads: leadCount,
      clients: clientCount,
      activeSubscriptions: subCount,
      paidRevenueCents: invoiceAgg._sum.amountCents ?? 0
    };
  }

  async sales(tenantId: string) {
    return prisma.lead.groupBy({
      by: ["status"],
      where: { tenantId, deletedAt: null },
      _count: { status: true }
    });
  }

  async revenue(tenantId: string) {
    const rows = await prisma.invoice.groupBy({
      by: ["status"],
      where: { tenantId, deletedAt: null },
      _sum: { amountCents: true },
      _count: { _all: true }
    });

    return rows.map((row) => ({
      status: row.status,
      count: row._count._all,
      amountCents: row._sum.amountCents ?? 0
    }));
  }
}
