import { http } from "@/api/http";
import type { ApiEnvelope, Paginated } from "@/types/api";
import type { Invoice } from "@/types/entities";

export const invoicesApi = {
  list: async () => {
    const { data } = await http.get<ApiEnvelope<Paginated<Invoice>>>("/invoices", { params: { page: 1, limit: 20 } });
    return data.data;
  },
  create: async (payload: { clientId: string; subscriptionId?: string; amountCents: number; currency: string; dueAt?: string }) => {
    await http.post("/invoices", payload);
  }
};
