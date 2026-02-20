import { ApiError } from "../../utils/apiError";
import { PlanRepository } from "./plan.repository";

const repo = new PlanRepository();

export class PlanService {
  list() {
    return repo.list();
  }

  async getById(id: string) {
    const plan = await repo.byId(id);
    if (!plan) throw new ApiError(404, "Plan not found");
    return plan;
  }

  create(data: { code: string; name: string; description?: string; priceCents: number; currency: string; interval: string; isActive: boolean }) {
    return repo.create(data);
  }

  async update(id: string, data: { name?: string; description?: string; priceCents?: number; currency?: string; interval?: string; isActive?: boolean }) {
    await this.getById(id);
    return repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await repo.delete(id);
  }
}
