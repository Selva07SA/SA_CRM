import { prisma } from "../../config/prisma";

export class DashboardService {
  async overview(tenantId: string, scopedUserId?: string) {
    const employeeScope = scopedUserId ? { assignedToId: scopedUserId } : {};

    const [leadCount, clientCount, subCount, invoiceAgg] = await Promise.all([
      prisma.lead.count({ where: { tenantId, deletedAt: null, ...employeeScope } }),
      prisma.client.count({ where: { tenantId, deletedAt: null, ...(scopedUserId ? { sourceLead: { assignedToId: scopedUserId } } : {}) } }),
      prisma.subscription.count({
        where: {
          tenantId,
          deletedAt: null,
          status: "active",
          ...(scopedUserId ? { client: { sourceLead: { assignedToId: scopedUserId } } } : {})
        }
      }),
      prisma.invoice.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          status: "paid",
          ...(scopedUserId ? { client: { sourceLead: { assignedToId: scopedUserId } } } : {})
        },
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

  async sales(tenantId: string, scopedUserId?: string) {
    return prisma.lead.groupBy({
      by: ["status"],
      where: { tenantId, deletedAt: null, ...(scopedUserId ? { assignedToId: scopedUserId } : {}) },
      _count: { status: true }
    });
  }

  async revenue(tenantId: string, scopedUserId?: string) {
    const rows = await prisma.invoice.groupBy({
      by: ["status"],
      where: {
        tenantId,
        deletedAt: null,
        ...(scopedUserId ? { client: { sourceLead: { assignedToId: scopedUserId } } } : {})
      },
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
