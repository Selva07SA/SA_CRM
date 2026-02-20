import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";

export class LeadRepository {
  list(tenantId: string, where: Prisma.LeadWhereInput, skip: number, take: number, orderBy: Prisma.LeadOrderByWithRelationInput) {
    return prisma.lead.findMany({
      where: { tenantId, deletedAt: null, ...where },
      skip,
      take,
      orderBy,
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    });
  }

  count(tenantId: string, where: Prisma.LeadWhereInput) {
    return prisma.lead.count({ where: { tenantId, deletedAt: null, ...where } });
  }

  byId(tenantId: string, id: string) {
    return prisma.lead.findFirst({ where: { tenantId, id, deletedAt: null } });
  }

  create(data: Prisma.LeadUncheckedCreateInput) {
    return prisma.lead.create({ data });
  }

  updateMany(tenantId: string, id: string, data: Prisma.LeadUncheckedUpdateInput) {
    return prisma.lead.updateMany({ where: { tenantId, id, deletedAt: null }, data });
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
