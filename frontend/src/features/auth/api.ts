import { http } from "@/api/http";
import type { ApiEnvelope } from "@/types/api";
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "@/types/auth";

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const { data } = await http.post<ApiEnvelope<RegisterResponse>>("/auth/register", payload);
    return data.data;
  },
  login: async (payload: LoginPayload) => {
    const { data } = await http.post<ApiEnvelope<LoginResponse>>("/auth/login", payload);
    return data.data;
  },
  me: async () => {
    const { data } = await http.get<ApiEnvelope<LoginResponse["user"]>>("/auth/me");
    return data.data;
  },
  logout: async () => {
    await http.post("/auth/logout");
  }
};
