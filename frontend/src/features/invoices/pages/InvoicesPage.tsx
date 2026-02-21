import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { invoicesApi } from "@/features/invoices/api";
import { EmptyState } from "@/components/feedback/EmptyState";

const money = (amountCents: number, currency: string) => `${currency} ${(amountCents / 100).toFixed(2)}`;

export const InvoicesPage = () => {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["invoices"], queryFn: invoicesApi.list });
  const create = useMutation({ mutationFn: invoicesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }) });

  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [amountCents, setAmountCents] = useState("");

  const rows = query.data?.items ?? [];
  const stats = useMemo(() => ({
    total: rows.length,
    issued: rows.filter((invoice) => invoice.status === "issued").length,
    paid: rows.filter((invoice) => invoice.status === "paid").length,
    overdue: rows.filter((invoice) => invoice.status === "overdue").length
  }), [rows]);

  return (
    <div>
      <PageHeader title="Invoices & Collections" subtitle="Issue invoices, monitor status, and track collection throughput." actions={<Button onClick={() => setOpen(true)}>Create Invoice</Button>} />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total</p><p className="mt-1 text-2xl font-semibold">{stats.total}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Issued</p><p className="mt-1 text-2xl font-semibold">{stats.issued}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Paid</p><p className="mt-1 text-2xl font-semibold">{stats.paid}</p></div>
        <div className="surface-card p-4"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Overdue</p><p className="mt-1 text-2xl font-semibold">{stats.overdue}</p></div>
      </div>

      {rows.length === 0 ? <EmptyState title="No invoices" description="Create your first invoice to start billing and collection tracking." actionLabel="Create Invoice" onAction={() => setOpen(true)} /> : null}
      {rows.length > 0 ? (
        <DataTable
          data={rows}
          columns={[
            { key: "number", header: "Invoice", render: (i) => i.invoiceNumber },
            { key: "amount", header: "Amount", render: (i) => money(i.amountCents, i.currency) },
            { key: "status", header: "Status", render: (i) => <StatusBadge value={i.status} /> },
            { key: "date", header: "Created", render: (i) => new Date(i.createdAt).toLocaleDateString() }
          ]}
        />
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Invoice">
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await create.mutateAsync({
              clientId,
              subscriptionId: subscriptionId || undefined,
              amountCents: Number(amountCents),
              currency: "USD"
            });
            setOpen(false);
            setClientId("");
            setSubscriptionId("");
            setAmountCents("");
          }}
        >
          <Input label="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} required />
          <Input label="Subscription ID (optional)" value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)} />
          <Input label="Amount (cents)" type="number" value={amountCents} onChange={(e) => setAmountCents(e.target.value)} required />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};