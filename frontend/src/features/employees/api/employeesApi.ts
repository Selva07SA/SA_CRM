import { http } from "@/api/http";
import type { ApiEnvelope, Paginated } from "@/types/api";
import type { Employee, TenantRoleOption } from "@/types/entities";

export type EmployeeListQuery = {
  page: number;
  limit: number;
  search?: string;
};

export type CreateEmployeePayload = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleIds: string[];
};

export type UpdateEmployeePayload = {
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
};

export const employeesApi = {
  roles: async () => {
    const { data } = await http.get<ApiEnvelope<TenantRoleOption[]>>("/employees/roles");
    return data.data;
  },
  list: async (query: EmployeeListQuery) => {
    const { data } = await http.get<ApiEnvelope<Paginated<Employee>>>("/employees", { params: query });
    return data.data;
  },
  get: async (id: string) => {
    const { data } = await http.get<ApiEnvelope<Employee>>(`/employees/${id}`);
    return data.data;
  },
  create: async (payload: CreateEmployeePayload) => {
    const { data } = await http.post<ApiEnvelope<Employee>>("/employees", payload);
    return data.data;
  },
  update: async (id: string, payload: UpdateEmployeePayload) => {
    const { data } = await http.put<ApiEnvelope<Employee>>(`/employees/${id}`, payload);
    return data.data;
  },
  updateStatus: async (id: string, status: "active" | "inactive") => {
    const { data } = await http.patch<ApiEnvelope<Employee>>(`/employees/${id}/status`, { status });
    return data.data;
  },
  remove: async (id: string) => {
    await http.delete(`/employees/${id}`);
  }
};
