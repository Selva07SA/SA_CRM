import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { clientsApi } from "@/features/clients/api";
import { EmptyState } from "@/components/feedback/EmptyState";

export const ClientsPage = () => {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["clients", search], queryFn: () => clientsApi.list({ page: 1, limit: 20, search: search || undefined }) });
  const rows = query.data?.items ?? [];

  const stats = useMemo(() => ({
    total: rows.length,
    withEmail: rows.filter((client) => Boolean(client.email)).length,
    withCompany: rows.filter((client) => Boolean(client.company)).length
  }), [rows]);

  return (
    <div>
      <PageHeader title="Client Accounts" subtitle="Customer directory with account-level context and relationship history." actions={<Input placeholder="Search clients" value={search} onChange={(e) => setSearch(e.target.value)} className="w-72" />} />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Listed Clients</p><p className="mt-1 text-2xl font-semibold">{stats.total}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">With Contact Email</p><p className="mt-1 text-2xl font-semibold">{stats.withEmail}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">With Company</p><p className="mt-1 text-2xl font-semibold">{stats.withCompany}</p></div>
      </div>

      {!query.isLoading && rows.length === 0 ? <EmptyState title="No clients found" description="Convert leads or create clients from API to populate your account base." /> : null}
      {rows.length > 0 ? (
        <DataTable
          data={rows}
          columns={[
            {
              key: "name",
              header: "Client",
              render: (c) => (
                <div>
                  <Link className="font-semibold text-brand-700 hover:underline" to={`/clients/${c.id}`}>{c.name}</Link>
                  <p className="text-xs text-slate-500">{c.email ?? "No email"}</p>
                </div>
              )
            },
            { key: "company", header: "Company", render: (c) => c.company ?? "-" },
            { key: "phone", header: "Phone", render: (c) => c.phone ?? "-" }
          ]}
        />
      ) : null}
    </div>
  );
};