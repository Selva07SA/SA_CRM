import { http } from "@/api/http";
import type { ApiEnvelope } from "@/types/api";

export type Overview = {
  leads: number;
  clients: number;
  activeSubscriptions: number;
  paidRevenueCents: number;
};

export type GroupCount = { status: string; _count?: { status?: number }; count?: number; amountCents?: number };

export const dashboardApi = {
  overview: async () => {
    const { data } = await http.get<ApiEnvelope<Overview>>("/dashboard/overview");
    return data.data;
  },
  sales: async () => {
    const { data } = await http.get<ApiEnvelope<GroupCount[]>>("/dashboard/sales");
    return data.data;
  },
  revenue: async () => {
    const { data } = await http.get<ApiEnvelope<Array<{ status: string; count: number; amountCents: number }>>>("/dashboard/revenue");
    return data.data;
  }
};
