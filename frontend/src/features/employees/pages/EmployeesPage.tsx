import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { EmptyState } from "@/components/feedback/EmptyState";
import { SkeletonRows } from "@/components/feedback/SkeletonRows";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmployeeFormModal } from "@/features/employees/components/EmployeeFormModal";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useUpdateEmployee,
  useUpdateEmployeeStatus
} from "@/features/employees/hooks";
import { useAuthStore } from "@/store/authStore";
import type { Employee } from "@/types/entities";

export const EmployeesPage = () => {
  const permissionKeys = useAuthStore((s) => s.permissionKeys);
  const canManageEmployees = permissionKeys.includes("employee.manage");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const query = useEmployees({ page, limit: 10, search: search || undefined }, canManageEmployees);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const statusMutation = useUpdateEmployeeStatus();
  const deleteMutation = useDeleteEmployee();

  const rows = query.data?.items ?? [];
  const meta = query.data?.meta;

  const stats = useMemo(() => ({
    total: meta?.total ?? 0,
    active: rows.filter((row) => row.status === "active").length,
    inactive: rows.filter((row) => row.status === "inactive").length
  }), [meta?.total, rows]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Employee",
        render: (row: Employee) => (
          <div>
            <p className="font-semibold text-slate-900">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        )
      },
      {
        key: "roles",
        header: "Role",
        render: (row: Employee) => row.roles.map((r) => r.role.tenantRole).join(", ") || "-"
      },
      {
        key: "status",
        header: "Status",
        render: (row: Employee) => <StatusBadge value={row.status} />
      },
      {
        key: "actions",
        header: "Actions",
        render: (row: Employee) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => { setEditing(row); setModalOpen(true); }}>Edit</Button>
            <Button
              variant="secondary"
              onClick={() => statusMutation.mutate({ id: row.id, status: row.status === "active" ? "inactive" : "active" })}
            >
              {row.status === "active" ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm(`Delete ${row.firstName} ${row.lastName}?`)) {
                  deleteMutation.mutate(row.id);
                }
              }}
            >
              Delete
            </Button>
          </div>
        )
      }
    ],
    [deleteMutation, statusMutation]
  );

  return (
    <div>
      <PageHeader
        title="Team Management"
        subtitle="Control access, roles, and workforce status by tenant."
        actions={
          <div className="flex items-center gap-2">
            <Input placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
            {canManageEmployees ? <Button onClick={() => { setEditing(null); setModalOpen(true); }}>Add Employee</Button> : null}
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Team Size</p><p className="mt-1 text-2xl font-semibold">{stats.total}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Active Users</p><p className="mt-1 text-2xl font-semibold">{stats.active}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Inactive Users</p><p className="mt-1 text-2xl font-semibold">{stats.inactive}</p></div>
      </div>

      {query.isLoading ? <SkeletonRows /> : null}
      {!canManageEmployees ? (
        <EmptyState title="Access restricted" description="Only OWNER/ADMIN can manage employees in this tenant." />
      ) : null}
      {canManageEmployees && !query.isLoading && rows.length === 0 ? (
        <EmptyState title="No employees found" description="Create your first employee to assign leads and manage operations." actionLabel="Add Employee" onAction={() => setModalOpen(true)} />
      ) : null}
      {canManageEmployees && !query.isLoading && rows.length > 0 ? <DataTable data={rows} columns={columns} /> : null}

      {canManageEmployees ? <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Total records: {meta?.total ?? 0}</span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span>Page {page}</span>
          <Button variant="secondary" disabled={(rows.length ?? 0) < 10} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div> : null}

      {canManageEmployees ? <EmployeeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={async ({ firstName, lastName, email, password, roleIds }) => {
          try {
            if (editing) {
              await updateMutation.mutateAsync({ id: editing.id, payload: { firstName, lastName, roleIds } });
              toast.success("Employee updated");
            } else {
              await createMutation.mutateAsync({ firstName, lastName, email, password, roleIds });
              toast.success("Employee created");
            }
          } catch {
            // handled by interceptor
          }
        }}
      /> : null}
    </div>
  );
};
