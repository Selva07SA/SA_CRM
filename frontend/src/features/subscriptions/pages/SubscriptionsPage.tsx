import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { subscriptionsApi } from "@/features/subscriptions/api";
import { EmptyState } from "@/components/feedback/EmptyState";

export const SubscriptionsPage = () => {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["subscriptions"], queryFn: subscriptionsApi.list });

  const cancel = useMutation({ mutationFn: subscriptionsApi.cancel, onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }) });
  const pause = useMutation({ mutationFn: subscriptionsApi.pause, onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }) });
  const resume = useMutation({ mutationFn: subscriptionsApi.resume, onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }) });

  const rows = query.data?.items ?? [];
  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((subscription) => subscription.status === "active").length,
    paused: rows.filter((subscription) => subscription.status === "paused").length,
    canceled: rows.filter((subscription) => subscription.status === "canceled").length
  }), [rows]);

  return (
    <div>
      <PageHeader title="Subscription Lifecycle" subtitle="Track pauses, resumes, and cancellations across your recurring base." />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total</p><p className="mt-1 text-2xl font-semibold">{stats.total}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Active</p><p className="mt-1 text-2xl font-semibold">{stats.active}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Paused</p><p className="mt-1 text-2xl font-semibold">{stats.paused}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Canceled</p><p className="mt-1 text-2xl font-semibold">{stats.canceled}</p></div>
      </div>

      {rows.length === 0 ? <EmptyState title="No subscriptions" description="Create subscriptions from client accounts to manage lifecycle here." /> : null}
      {rows.length > 0 ? (
        <DataTable
          data={rows}
          columns={[
            { key: "id", header: "Subscription", render: (s) => s.id.slice(0, 8) },
            { key: "start", header: "Start", render: (s) => new Date(s.startsAt).toLocaleDateString() },
            { key: "status", header: "Status", render: (s) => <StatusBadge value={s.status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (s) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => pause.mutate(s.id)}>Pause</Button>
                  <Button variant="secondary" onClick={() => resume.mutate(s.id)}>Resume</Button>
                  <Button variant="danger" onClick={() => cancel.mutate(s.id)}>Cancel</Button>
                </div>
              )
            }
          ]}
        />
      ) : null}
    </div>
  );
};