import clsx from "clsx";

type Props = {
  value: string;
};

const map: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-700",
  canceled: "bg-rose-100 text-rose-700",
  paused: "bg-amber-100 text-amber-700",
  succeeded: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  issued: "bg-cyan-100 text-cyan-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-orange-100 text-orange-700",
  draft: "bg-slate-200 text-slate-700",
  new: "bg-sky-100 text-sky-700",
  contacted: "bg-indigo-100 text-indigo-700",
  qualified: "bg-teal-100 text-teal-700",
  proposal: "bg-violet-100 text-violet-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-rose-100 text-rose-700"
};

export const StatusBadge = ({ value }: Props) => (
  <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", map[value] ?? "bg-slate-200 text-slate-700")}>{value}</span>
);