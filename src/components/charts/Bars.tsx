export function Bars({
  rows,
  emptyLabel = 'Sem dados',
}: {
  rows: { label: string; value: number }[];
  emptyLabel?: string;
}) {
  if (rows.length === 0) return <div className="text-xs text-silver py-6 text-center">{emptyLabel}</div>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 text-xs">
          <div className="w-32 truncate text-slateText">{r.label}</div>
          <div className="flex-1 h-2 bg-pearl rounded-full overflow-hidden">
            <div className="h-full bg-graphite/80 rounded-full" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <div className="w-8 text-right tabular text-silver">{r.value}</div>
        </div>
      ))}
    </div>
  );
}
