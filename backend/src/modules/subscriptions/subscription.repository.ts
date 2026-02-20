import { prisma } from "../../config/prisma";

const subscriptionSelect = {
  id: true,
  tenantId: true,
  clientId: true,
  planId: true,
  status: true,
  startsAt: true,
  endsAt: true,
  canceledAt: true,
  pausedAt: true,
  resumedAt: true,
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
  plan: {
    select: {
      id: true,
      code: true,
      name: true,
      priceCents: true,
      currency: true,
      interval: true
    }
  }
} as const;

export class SubscriptionRepository {
  list(tenantId: string, status: string | undefined, skip: number, take: number) {
    return prisma.subscription.findMany({
      where: { tenantId, deletedAt: null, status: status as any },
      skip,
      take,
      select: subscriptionSelect,
      orderBy: { createdAt: "desc" }
    });
  }

  count(tenantId: string, status?: string) {
    return prisma.subscription.count({ where: { tenantId, deletedAt: null, status: status as any } });
  }

  byId(tenantId: string, id: string) {
    return prisma.subscription.findFirst({ where: { tenantId, id, deletedAt: null }, select: subscriptionSelect });
  }

  create(data: Parameters<typeof prisma.subscription.create>[0]["data"]) {
    return prisma.subscription.create({ data, select: subscriptionSelect });
  }

  updateMany(tenantId: string, id: string, data: Parameters<typeof prisma.subscription.updateMany>[0]["data"]) {
    return prisma.subscription.updateMany({ where: { tenantId, id, deletedAt: null }, data });
  }
}
