import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { leadsApi } from "@/features/leads/api";
import { EmptyState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AssignLeadModal } from "@/features/leads/components/AssignLeadModal";
import { toast } from "react-hot-toast";

export const LeadsPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeLead, setActiveLead] = useState<string | null>(null);
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const list = useQuery({
    queryKey: ["leads", search],
    queryFn: () => leadsApi.list({ page: 1, limit: 20, search: search || undefined })
  });

  const notes = useQuery({
    queryKey: ["lead-notes", activeLead],
    queryFn: () => leadsApi.notes(activeLead!),
    enabled: Boolean(activeLead)
  });

  const addNote = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => leadsApi.addNote(id, body),
    onSuccess: () => {
      toast.success("Note added");
      setNote("");
      qc.invalidateQueries({ queryKey: ["lead-notes", activeLead] });
    }
  });

  const assign = useMutation({
    mutationFn: ({ id, assignedToId }: { id: string; assignedToId: string }) => leadsApi.assign(id, assignedToId),
    onSuccess: () => {
      toast.success("Lead assigned successfully");
      setAssigningLeadId(null);
      qc.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  const convert = useMutation({
    mutationFn: (id: string) => leadsApi.convert(id),
    onSuccess: () => {
      toast.success("Lead converted to client!");
      qc.invalidateQueries({ queryKey: ["leads"] });
    }
  });

  const rows = list.data?.items ?? [];
  const meta = list.data?.meta;

  const metrics = useMemo(() => ({
    total: meta?.total ?? rows.length,
    qualified: rows.filter((lead) => ["qualified", "proposal"].includes(lead.status)).length,
    won: rows.filter((lead) => lead.status === "won").length
  }), [rows, meta]);

  return (
    <div>
      <PageHeader
        title="Lead Pipeline"
        subtitle="Prioritize assignments, accelerate conversions, and keep context in-line."
        actions={
          <Input
            placeholder="Search by name, email, company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="surface-card p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total Leads</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.total}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Qualified (Current Page)</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.qualified}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Converted (Won / Current Page)</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.won}</p>
        </div>
      </div>

      {list.isLoading ? (
        <div className="py-12 text-center text-slate-500">Loading pipeline...</div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Create leads from campaigns, forms, or imports to start pipeline execution."
        />
      ) : (
        <DataTable
          data={rows}
          columns={[
            {
              key: "lead",
              header: "Lead",
              render: (l) => (
                <div>
                  <p className="font-semibold text-slate-900">{l.firstName} {l.lastName}</p>
                  <p className="text-xs text-slate-500">{l.email ?? "No email"}</p>
                </div>
              )
            },
            { key: "company", header: "Company", render: (l) => l.company ?? "-" },
            { key: "status", header: "Stage", render: (l) => <StatusBadge value={l.status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (l) => (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setActiveLead(l.id)}>Notes</Button>
                  <Button variant="secondary" onClick={() => setAssigningLeadId(l.id)}>Assign</Button>
                  <Button
                    variant="primary"
                    disabled={convert.isPending || l.status === "won"}
                    onClick={() => convert.mutate(l.id)}
                  >
                    Convert
                  </Button>
                </div>
              )
            }
          ]}
        />
      )}

      <Modal open={Boolean(activeLead)} onClose={() => setActiveLead(null)} title="Lead Notes">
        <div className="space-y-4">
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
            {notes.isLoading ? (
              <p className="text-sm text-slate-500 italic">Syncing notes...</p>
            ) : notes.data?.length ? (
              notes.data.map((n) => (
                <div key={n.id} className="rounded-lg border border-slate-100 bg-white p-2.5 text-sm shadow-sm">
                  {n.body}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No notes yet for this lead.</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Capture context, objections, or next steps"
            />
            <div className="flex justify-end">
              <Button
                disabled={!note || addNote.isPending}
                onClick={() => activeLead && addNote.mutate({ id: activeLead, body: note })}
              >
                {addNote.isPending ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <AssignLeadModal
        open={Boolean(assigningLeadId)}
        onClose={() => setAssigningLeadId(null)}
        isPending={assign.isPending}
        onAssign={(employeeId) => assigningLeadId && assign.mutate({ id: assigningLeadId, assignedToId: employeeId })}
      />
    </div>
  );
};