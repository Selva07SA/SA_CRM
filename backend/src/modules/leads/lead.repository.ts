import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export class LeadRepository {
  list(
    tenantId: string,
    where: Prisma.LeadWhereInput,
    skip: number,
    take: number,
    orderBy: Prisma.LeadOrderByWithRelationInput,
    scopedUserId?: string
  ) {
    return prisma.lead.findMany({
      where: { tenantId, deletedAt: null, ...(scopedUserId ? { assignedToId: scopedUserId } : {}), ...where },
      skip,
      take,
      orderBy,
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    });
  }

  count(tenantId: string, where: Prisma.LeadWhereInput, scopedUserId?: string) {
    return prisma.lead.count({ where: { tenantId, deletedAt: null, ...(scopedUserId ? { assignedToId: scopedUserId } : {}), ...where } });
  }

  byId(tenantId: string, id: string, scopedUserId?: string) {
    return prisma.lead.findFirst({
      where: { tenantId, id, deletedAt: null, ...(scopedUserId ? { assignedToId: scopedUserId } : {}) }
    });
  }

  create(data: Prisma.LeadUncheckedCreateInput) {
    return prisma.lead.create({ data });
  }

  updateMany(tenantId: string, id: string, data: Prisma.LeadUncheckedUpdateInput, scopedUserId?: string) {
    return prisma.lead.updateMany({
      where: { tenantId, id, deletedAt: null, ...(scopedUserId ? { assignedToId: scopedUserId } : {}) },
      data
    });
  }

  notes(tenantId: string, leadId: string) {
    return prisma.leadNote.findMany({
      where: { tenantId, leadId, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });
  }

  createNote(data: Prisma.LeadNoteUncheckedCreateInput) {
    return prisma.leadNote.create({ data });
  }
}
