import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesApi, type CreateEmployeePayload, type EmployeeListQuery, type UpdateEmployeePayload } from "@/features/employees/api/employeesApi";

const KEY = "employees";

export const useEmployees = (query: EmployeeListQuery, enabled = true) =>
  useQuery({
    queryKey: [KEY, query],
    queryFn: () => employeesApi.list(query),
    enabled
  });

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) => employeesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  });
};

export const useUpdateEmployeeStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) => employeesApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] })
  });
};
