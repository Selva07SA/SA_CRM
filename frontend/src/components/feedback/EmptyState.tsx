import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ title, description, actionLabel, onAction }: Props) => (
  <div className="surface-card p-10 text-center">
    <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-brand-100" />
    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
    {actionLabel && onAction ? (
      <Button className="mt-5" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);