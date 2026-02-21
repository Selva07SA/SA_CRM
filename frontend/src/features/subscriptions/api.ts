import { http } from "@/api/http";
import type { ApiEnvelope, Paginated } from "@/types/api";
import type { Subscription } from "@/types/entities";

export const subscriptionsApi = {
  list: async () => {
    const { data } = await http.get<ApiEnvelope<Paginated<Subscription>>>("/subscriptions", { params: { page: 1, limit: 20 } });
    return data.data;
  },
  cancel: async (id: string) => http.post(`/subscriptions/${id}/cancel`),
  pause: async (id: string) => http.post(`/subscriptions/${id}/pause`),
  resume: async (id: string) => http.post(`/subscriptions/${id}/resume`)
};
