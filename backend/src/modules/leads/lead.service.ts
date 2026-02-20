import { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/apiError";
import { parsePagination } from "../../utils/pagination";
import { LeadRepository } from "./lead.repository";

const repo = new LeadRepository();

const SORT_FIELD_MAP: Record<string, keyof Prisma.LeadOrderByWithRelationInput> = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  firstName: "firstName",
  lastName: "lastName",
  status: "status"
};

export class LeadService {
  async list(tenantId: string, query: Record<string, unknown>) {
    const page = parsePagination(query);
    const status = typeof query.status === "string" ? query.status : undefined;
    const assignedTo = typeof query.assignedTo === "string" ? query.assignedTo : undefined;
    const search = typeof query.search === "string" ? query.search : undefined;

    const where: Prisma.LeadWhereInput = {
      status: status as LeadStatus | undefined,
      assignedToId: assignedTo,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    };

    const sortByRaw = typeof query.sortBy === "string" ? query.sortBy : "createdAt";
    const sortBy = SORT_FIELD_MAP[sortByRaw] ?? "createdAt";

    const [items, total] = await Promise.all([
      repo.list(tenantId, where, page.skip, page.limit, { [sortBy]: page.sortDir }),
      repo.count(tenantId, where)
    ]);

    return { items, meta: { page: page.page, limit: page.limit, total } };
  }

  async getById(tenantId: string, id: string) {
    const lead = await repo.byId(tenantId, id);
    if (!lead) throw new ApiError(404, "Lead not found");
    return lead;
  }

  create(tenantId: string, payload: Record<string, unknown>) {
    return repo.create({
      tenantId,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      email: payload.email as string | undefined,
      phone: payload.phone as string | undefined,
      company: payload.company as string | undefined,
      status: payload.status as LeadStatus | undefined,
      source: payload.source as string | undefined,
      notes: payload.notes as string | undefined,
      assignedToId: payload.assignedToId as string | undefined
    });
  }

  async update(tenantId: string, id: string, payload: Record<string, unknown>) {
    const result = await repo.updateMany(tenantId, id, {
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      email: payload.email as string | undefined,
      phone: payload.phone as string | undefined,
      company: payload.company as string | undefined,
      source: payload.source as string | undefined,
      notes: payload.notes as string | undefined,
      assignedToId: payload.assignedToId as string | undefined
    });

    if (result.count === 0) throw new ApiError(404, "Lead not found");
    return this.getById(tenantId, id);
  }

  async updateStatus(tenantId: string, id: string, status: LeadStatus) {
    const result = await repo.updateMany(tenantId, id, { status });
    if (result.count === 0) throw new ApiError(404, "Lead not found");
    return this.getById(tenantId, id);
  }

  async assign(tenantId: string, id: string, assignedToId: string) {
    const result = await repo.updateMany(tenantId, id, { assignedToId });
    if (result.count === 0) throw new ApiError(404, "Lead not found");
    return this.getById(tenantId, id);
  }

  async convert(tenantId: string, id: string) {
    const lead = await this.getById(tenantId, id);
    if (lead.status === "won") throw new ApiError(409, "Lead already converted");

    return prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          tenantId,
          name: `${lead.firstName} ${lead.lastName}`.trim(),
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          sourceLeadId: lead.id
        }
      });

      await tx.lead.update({
        where: { id_tenantId: { id: lead.id, tenantId } },
        data: { status: "won" }
      });
      return client;
    });
  }

  async softDelete(tenantId: string, id: string) {
    const result = await repo.updateMany(tenantId, id, { deletedAt: new Date() });
    if (result.count === 0) throw new ApiError(404, "Lead not found");
  }

  async notes(tenantId: string, leadId: string) {
    await this.getById(tenantId, leadId);
    return repo.notes(tenantId, leadId);
  }

  async createNote(tenantId: string, leadId: string, body: string, userId: string) {
    await this.getById(tenantId, leadId);
    return repo.createNote({
      tenantId,
      leadId,
      createdById: userId,
      body
    });
  }
}
