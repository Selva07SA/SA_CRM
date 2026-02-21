import { http } from "@/api/http";
import type { ApiEnvelope, Paginated } from "@/types/api";
import type { Lead } from "@/types/entities";

export const leadsApi = {
  list: async (params: Record<string, string | number | undefined>) => {
    const { data } = await http.get<ApiEnvelope<Paginated<Lead>>>("/leads", { params });
    return data.data;
  },
  notes: async (id: string) => {
    const { data } = await http.get<ApiEnvelope<Array<{ id: string; body: string; createdAt: string }>>>(`/leads/${id}/notes`);
    return data.data;
  },
  addNote: async (id: string, body: string) => {
    const { data } = await http.post<ApiEnvelope<{ id: string }>>(`/leads/${id}/notes`, { body });
    return data.data;
  },
  assign: async (id: string, assignedToId: string) => http.post(`/leads/${id}/assign`, { assignedToId }),
  convert: async (id: string) => http.post(`/leads/${id}/convert`)
};
