import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export const PageHeader = ({ title, subtitle, actions }: Props) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">CRM Module</p>
      <h1 className="mt-1 text-3xl font-semibold text-slate-900">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
    {actions}
  </div>
);