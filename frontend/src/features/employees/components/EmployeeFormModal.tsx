import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  useEffect(() => {
    if (!open) return;
    setFirstName(initial?.firstName ?? "");
    setLastName(initial?.lastName ?? "");
    setEmail(initial?.email ?? "");
    setPassword("");
    setSelectedRoleId(initial?.roles[0]?.roleId ?? "");
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      firstName,
      lastName,
      email,
      password,
      roleIds: selectedRoleId ? [selectedRoleId] : []
    });
    onClose();
  };

  const roleOptions = (rolesQuery.data ?? []).filter((role) => role.tenantRole === "ADMIN" || role.tenantRole === "EMPLOYEE");

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Employee" : "Add Employee"}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required={!initial} disabled={Boolean(initial)} />
        {!initial ? <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> : null}
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.currentTarget.value)}
            required
            disabled={rolesQuery.isLoading}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-brand-500 transition focus:ring-2 disabled:bg-slate-100"
          >
            <option value="" disabled>
              {rolesQuery.isLoading ? "Loading roles..." : "Select role"}
            </option>
            {roleOptions.map((role) => (
              <option key={role.id} value={role.id}>
                {role.tenantRole}{role.description ? ` - ${role.description}` : ""}
              </option>
            ))}
          </select>
          {rolesQuery.isError ? <p className="text-xs text-rose-600">Unable to load roles.</p> : null}
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
};
