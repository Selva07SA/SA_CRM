export const SkeletonRows = ({ rows = 6 }: { rows?: number }) => (
  <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="h-10 animate-pulse rounded-lg bg-slate-200" />
    ))}
  </div>
);
