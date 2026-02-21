import { http } from "@/api/http";
import type { ApiEnvelope } from "@/types/api";
import type { Plan } from "@/types/entities";

export const plansApi = {
  list: async () => {
    const { data } = await http.get<ApiEnvelope<Plan[]>>("/subscription-plans");
    return data.data;
  }
};
