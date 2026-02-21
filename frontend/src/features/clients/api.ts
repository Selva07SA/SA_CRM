import { http } from "@/api/http";
import type { ApiEnvelope, Paginated } from "@/types/api";
import type { Client, Subscription } from "@/types/entities";

export const clientsApi = {
  list: async (params: Record<string, string | number | undefined>) => {
    const { data } = await http.get<ApiEnvelope<Paginated<Client>>>("/clients", { params });
    return data.data;
  },
  get: async (id: string) => {
    const { data } = await http.get<ApiEnvelope<Client>>(`/clients/${id}`);
    return data.data;
  },
  notes: async (id: string) => {
    const { data } = await http.get<ApiEnvelope<Array<{ id: string; action: string; metadata?: { body?: string }; createdAt: string }>>>(`/clients/${id}/notes`);
    return data.data;
  },
  addNote: async (id: string, body: string) => http.post(`/clients/${id}/notes`, { body }),
  subscriptions: async (id: string) => {
    const { data } = await http.get<ApiEnvelope<Subscription[]>>(`/clients/${id}/subscriptions`);
    return data.data;
  }
};
