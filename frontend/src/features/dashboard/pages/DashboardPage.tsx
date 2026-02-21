import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/features/dashboard/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";

const money = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const DashboardPage = () => {
  const overview = useQuery({ queryKey: ["dashboard", "overview"], queryFn: dashboardApi.overview });
  const sales = useQuery({ queryKey: ["dashboard", "sales"], queryFn: dashboardApi.sales });
  const revenue = useQuery({ queryKey: ["dashboard", "revenue"], queryFn: dashboardApi.revenue });

  const stat = overview.data;

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time operating view across lead flow, subscriptions, and collections."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card metric-card p-5"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Leads</p><p className="mt-2 text-3xl font-semibold">{stat?.leads ?? 0}</p><p className="mt-1 text-xs text-slate-500">Top of funnel health</p></div>
        <div className="surface-card metric-card p-5"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Clients</p><p className="mt-2 text-3xl font-semibold">{stat?.clients ?? 0}</p><p className="mt-1 text-xs text-slate-500">Active account base</p></div>
        <div className="surface-card metric-card p-5"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Active Subscriptions</p><p className="mt-2 text-3xl font-semibold">{stat?.activeSubscriptions ?? 0}</p><p className="mt-1 text-xs text-slate-500">Recurring revenue engine</p></div>
        <div className="surface-card metric-card p-5"><p className="text-xs uppercase tracking-[0.1em] text-slate-500">Paid Revenue</p><p className="mt-2 text-3xl font-semibold">{money(stat?.paidRevenueCents ?? 0)}</p><p className="mt-1 text-xs text-slate-500">Collected cash this period</p></div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="text-lg font-semibold text-slate-900">Sales Velocity by Stage</h3>
          <p className="mt-1 text-sm text-slate-500">Identify where momentum is accelerating or stalling.</p>
          <div className="mt-4 space-y-3">
            {sales.data?.length ? sales.data.map((row) => {
              const count = row._count?.status ?? row.count ?? 0;
              return (
                <div key={row.status}>
                  <div className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-[0.08em] text-slate-500"><span>{row.status}</span><span>{count}</span></div>
                  <div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-[#ff8b36]" style={{ width: `${Math.min(100, count * 10)}%` }} /></div>
                </div>
              );
            }) : <EmptyState title="No sales stage data" description="Create and update leads to populate this view." />}
          </div>
        </div>

        <div className="surface-card p-5">
          <h3 className="text-lg font-semibold text-slate-900">Revenue by Invoice Status</h3>
          <p className="mt-1 text-sm text-slate-500">Monitor collection performance and aging pressure.</p>
          <div className="mt-4 space-y-2.5 text-sm">
            {revenue.data?.length ? revenue.data.map((row) => (
              <div key={row.status} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <span className="font-medium capitalize text-slate-700">{row.status}</span>
                <span className="font-semibold text-slate-900">{money(row.amountCents)}</span>
              </div>
            )) : <EmptyState title="No revenue buckets" description="Issue invoices and record payments to see distribution." />}
          </div>
        </div>
      </div>
    </div>
  );
};