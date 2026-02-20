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
  async list(tenantId: string, query: Record<string, unknown>, scopedUserId?: string) {
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
      repo.list(tenantId, where, page.skip, page.limit, { [sortBy]: page.sortDir }, scopedUserId),
      repo.count(tenantId, where, scopedUserId)
    ]);

    return { items, meta: { page: page.page, limit: page.limit, total } };
  }

  async getById(tenantId: string, id: string, scopedUserId?: string) {
    const lead = await repo.byId(tenantId, id, scopedUserId);
    if (!lead) throw new ApiError(404, "Lead not found");
    return lead;
  }

  create(tenantId: string, payload: Record<string, unknown>, scopedUserId?: string) {
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
      assignedToId: (scopedUserId ?? (payload.assignedToId as string | undefined))
    });
  }

  async update(tenantId: string, id: string, payload: Record<string, unknown>, scopedUserId?: string) {
    const result = await repo.updateMany(tenantId, id, {
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      email: payload.email as string | undefined,
      phone: payload.phone as string | undefined,
      company: payload.company as string | undefined,
      source: payload.source as string | undefined,
      notes: payload.notes as string | undefined,
      assignedToId: payload.assignedToId as string | undefined
    }, scopedUserId);

    if (result.count === 0) throw new ApiError(404, "Lead not found");
    return this.getById(tenantId, id, scopedUserId);
  }

  async updateStatus(tenantId: string, id: string, status: LeadStatus, scopedUserId?: string) {
    const result = await repo.updateMany(tenantId, id, { status }, scopedUserId);
    if (result.count === 0) throw new ApiError(404, "Lead not found");
    return this.getById(tenantId, id, scopedUserId);
  }

  async assign(tenantId: string, id: string, assignedToId: string, scopedUserId?: string) {
    const result = await repo.updateMany(tenantId, id, { assignedToId }, scopedUserId);
    if (result.count === 0) throw new ApiError(404, "Lead not found");
    return this.getById(tenantId, id, scopedUserId);
  }

  async convert(tenantId: string, id: string, scopedUserId?: string) {
    const lead = await this.getById(tenantId, id, scopedUserId);
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

  async softDelete(tenantId: string, id: string, scopedUserId?: string) {
    const result = await repo.updateMany(tenantId, id, { deletedAt: new Date() }, scopedUserId);
    if (result.count === 0) throw new ApiError(404, "Lead not found");
  }

  async notes(tenantId: string, leadId: string, scopedUserId?: string) {
    await this.getById(tenantId, leadId, scopedUserId);
    return repo.notes(tenantId, leadId);
  }

  async createNote(tenantId: string, leadId: string, body: string, userId: string, scopedUserId?: string) {
    await this.getById(tenantId, leadId, scopedUserId);
    return repo.createNote({
      tenantId,
      leadId,
      createdById: userId,
      body
    });
  }
}
