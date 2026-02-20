import { prisma } from "../../config/prisma";

export class PlanRepository {
  list() {
    return prisma.subscriptionPlan.findMany({ orderBy: { createdAt: "desc" } });
  }

  byId(id: string) {
    return prisma.subscriptionPlan.findUnique({ where: { id } });
  }

  create(data: Parameters<typeof prisma.subscriptionPlan.create>[0]["data"]) {
    return prisma.subscriptionPlan.create({ data });
  }

  update(id: string, data: Parameters<typeof prisma.subscriptionPlan.update>[0]["data"]) {
    return prisma.subscriptionPlan.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.subscriptionPlan.delete({ where: { id } });
  }
}
