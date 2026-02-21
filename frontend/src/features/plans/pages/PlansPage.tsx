import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { plansApi } from "@/features/plans/api";

export const PlansPage = () => {
  const query = useQuery({ queryKey: ["plans"], queryFn: plansApi.list });

  return (
    <div>
      <PageHeader title="Subscription Plans" subtitle="System-admin only plan catalog." />
      <DataTable
        data={query.data ?? []}
        columns={[
          { key: "code", header: "Code", render: (p) => p.code },
          { key: "name", header: "Name", render: (p) => p.name },
          { key: "price", header: "Price", render: (p) => `${p.currency} ${(p.priceCents / 100).toFixed(2)} / ${p.interval}` },
          { key: "active", header: "Active", render: (p) => <StatusBadge value={p.isActive ? "active" : "inactive"} /> }
        ]}
      />
    </div>
  );
};
