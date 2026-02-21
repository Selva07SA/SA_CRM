import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { clientsApi } from "@/features/clients/api";
import { EmptyState } from "@/components/feedback/EmptyState";

type ClientSubscription = {
  id: string;
  status: string;
  startsAt: string;
  plan?: {
    name?: string;
  };
};

export const ClientDetailPage = () => {
  const { id = "" } = useParams();
  const [tab, setTab] = useState<"overview" | "notes" | "subscriptions">("overview");
  const [note, setNote] = useState("");
  const qc = useQueryClient();

  const client = useQuery({ queryKey: ["client", id], queryFn: () => clientsApi.get(id), enabled: Boolean(id) });
  const notes = useQuery({ queryKey: ["client-notes", id], queryFn: () => clientsApi.notes(id), enabled: Boolean(id) });
  const subs = useQuery({ queryKey: ["client-subs", id], queryFn: () => clientsApi.subscriptions(id), enabled: Boolean(id) });
  const addNote = useMutation({ mutationFn: (body: string) => clientsApi.addNote(id, body), onSuccess: () => qc.invalidateQueries({ queryKey: ["client-notes", id] }) });

  const kpis = useMemo(() => ({
    notes: notes.data?.length ?? 0,
    subscriptions: subs.data?.length ?? 0,
    activeSubscriptions: (subs.data ?? []).filter((subscription) => subscription.status === "active").length
  }), [notes.data, subs.data]);

  return (
    <div>
      <PageHeader title={client.data?.name ?? "Client"} subtitle="Profile, relationship notes, and subscription footprint." />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Client Notes</p><p className="mt-1 text-2xl font-semibold">{kpis.notes}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Subscriptions</p><p className="mt-1 text-2xl font-semibold">{kpis.subscriptions}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Active Plans</p><p className="mt-1 text-2xl font-semibold">{kpis.activeSubscriptions}</p></div>
      </div>

      <div className="mb-4 flex gap-2">
        {(["overview", "notes", "subscriptions"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "primary" : "secondary"} onClick={() => setTab(t)}>{t}</Button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="surface-card space-y-2 p-5 text-sm">
          <p><strong>Email:</strong> {client.data?.email ?? "-"}</p>
          <p><strong>Phone:</strong> {client.data?.phone ?? "-"}</p>
          <p><strong>Company:</strong> {client.data?.company ?? "-"}</p>
        </div>
      ) : null}

      {tab === "notes" ? (
        <div className="surface-card space-y-3 p-5">
          <div className="space-y-2">
            {notes.data?.length ? notes.data.map((n: { id: string; action: string; metadata?: { body?: string }; createdAt: string }) => (
              <div key={n.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="text-slate-800">{n.metadata?.body ?? n.action}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            )) : <EmptyState title="No notes yet" description="Capture account context, objections, and next steps." />}
          </div>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add client note" />
          <Button onClick={() => note && addNote.mutate(note)}>Save Note</Button>
        </div>
      ) : null}

      {tab === "subscriptions" ? (
        <div className="surface-card space-y-2 p-5">
          {subs.data?.length ? (subs.data as ClientSubscription[]).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{s.plan?.name ?? "Plan"}</p>
                <p className="text-xs text-slate-500">Start {new Date(s.startsAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge value={s.status} />
            </div>
          )) : <EmptyState title="No subscriptions" description="This client has not started a subscription yet." />}
        </div>
      ) : null}
    </div>
  );
};
