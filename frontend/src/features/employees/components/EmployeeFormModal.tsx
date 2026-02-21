import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { employeesApi } from "@/features/employees/api/employeesApi";
import type { Employee } from "@/types/entities";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { firstName: string; lastName: string; email: string; password: string; roleIds: string[] }) => Promise<void>;
  initial?: Employee | null;
};

export const EmployeeFormModal = ({ open, onClose, onSubmit, initial }: Props) => {
  const rolesQuery = useQuery({
    queryKey: ["employee-roles"],
    queryFn: employeesApi.roles,
    enabled: open
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const rolesForbidden = isAxiosError(rolesQuery.error) && rolesQuery.error.response?.status === 403;
  const passwordTooShort = !initial && password.length > 0 && password.length < 8;

  useEffect(() => {
    if (!open) return;
    setFirstName(initial?.firstName ?? "");
    setLastName(initial?.lastName ?? "");
    setEmail(initial?.email ?? "");
    setPassword("");
    setSelectedRoleId(initial?.roles[0]?.roleId ?? "");
    void rolesQuery.refetch();
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initial && password.length < 8) return;
    if (!selectedRoleId) return;
    await onSubmit({
      firstName,
      lastName,
      email,
      password,
      roleIds: selectedRoleId ? [selectedRoleId] : []
    });
    onClose();
  };

  const roleOptions = [...(rolesQuery.data ?? [])].sort((a, b) => {
    const order = (role: string) => {
      const value = role.toUpperCase();
      if (value === "ADMIN") return 0;
      if (value === "EMPLOYEE") return 1;
      return 2;
    };

    return order(a.tenantRole) - order(b.tenantRole);
  });

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Employee" : "Add Employee"}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required={!initial} disabled={Boolean(initial)} />
        {!initial ? (
          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              error={passwordTooShort ? "Password must be at least 8 characters." : undefined}
            />
          </div>
        ) : null}
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Role</span>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.currentTarget.value)}
            required
            disabled={rolesQuery.isLoading || rolesForbidden}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 transition focus:border-brand-500 focus:ring-2 disabled:bg-slate-100"
          >
            <option value="" disabled>
              {rolesQuery.isLoading ? "Loading roles..." : rolesForbidden ? "Admin access required" : "Select role"}
            </option>
            {roleOptions.map((role) => (
              <option key={role.id} value={role.id}>
                {role.tenantRole}{role.description ? ` - ${role.description}` : ""}
              </option>
            ))}
          </select>
          {rolesForbidden ? <p className="text-xs text-rose-600">Only OWNER/ADMIN can create employees.</p> : null}
          {rolesQuery.isError && !rolesForbidden ? <p className="text-xs text-rose-600">Unable to load roles.</p> : null}
          {!rolesQuery.isLoading && !rolesQuery.isError && roleOptions.length === 0 ? (
            <p className="text-xs text-rose-600">No roles available from backend. Seed roles and reload.</p>
          ) : null}
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={rolesQuery.isLoading || rolesForbidden || !selectedRoleId || passwordTooShort}>
            {initial ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
