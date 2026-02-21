import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({ label, error, className, ...props }: Props) => (
  <label className="block space-y-1.5">
    {label ? <span className="text-sm font-semibold text-slate-700">{label}</span> : null}
    <input
      className={clsx(
        "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2",
        error && "border-rose-400",
        className
      )}
      {...props}
    />
    {error ? <p className="text-xs text-rose-600">{error}</p> : null}
  </label>
);