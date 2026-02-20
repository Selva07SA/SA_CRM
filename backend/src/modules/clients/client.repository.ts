import { prisma } from "../../config/prisma";

export class ClientRepository {
  list(tenantId: string, search: string | undefined, skip: number, take: number, scopedUserId?: string) {
    return prisma.client.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(scopedUserId ? { sourceLead: { assignedToId: scopedUserId } } : {}),
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { company: { contains: search, mode: "insensitive" } }
            ]
          : undefined
      },
      skip,
      take,
      orderBy: { createdAt: "desc" }
    });
  }

  count(tenantId: string, search?: string, scopedUserId?: string) {
    return prisma.client.count({
      where: {
        tenantId,
        deletedAt: null,
        ...(scopedUserId ? { sourceLead: { assignedToId: scopedUserId } } : {}),
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { company: { contains: search, mode: "insensitive" } }
            ]
          : undefined
      }
    });
  }

  byId(tenantId: string, id: string, scopedUserId?: string) {
    return prisma.client.findFirst({
      where: { tenantId, id, deletedAt: null, ...(scopedUserId ? { sourceLead: { assignedToId: scopedUserId } } : {}) }
    });
  }

  create(data: Parameters<typeof prisma.client.create>[0]["data"]) {
    return prisma.client.create({ data });
  }

  updateMany(tenantId: string, id: string, data: Parameters<typeof prisma.client.updateMany>[0]["data"], scopedUserId?: string) {
    return prisma.client.updateMany({
      where: { tenantId, id, deletedAt: null, ...(scopedUserId ? { sourceLead: { assignedToId: scopedUserId } } : {}) },
      data
    });
  }

  subscriptions(tenantId: string, clientId: string, scopedUserId?: string) {
    return prisma.subscription.findMany({
      where: {
        tenantId,
        clientId,
        deletedAt: null,
        ...(scopedUserId ? { client: { sourceLead: { assignedToId: scopedUserId } } } : {})
      },
      select: {
        id: true,
        status: true,
        startsAt: true,
        endsAt: true,
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
      },
      orderBy: { createdAt: "desc" }
    });
  }

  clientNotes(tenantId: string, clientId: string) {
    return prisma.activity.findMany({
      where: {
        tenantId,
        resource: "client_note",
        resourceId: clientId
      },
      orderBy: { createdAt: "desc" }
    });
  }

  createClientNote(tenantId: string, userId: string, clientId: string, body: string) {
    return prisma.activity.create({
      data: {
        tenantId,
        userId,
        action: "create",
        resource: "client_note",
        resourceId: clientId,
        metadata: { body }
      }
    });
  }
}
