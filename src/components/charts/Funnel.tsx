import type { FunnelRow } from '../../lib/analytics';

export function Funnel({ rows }: { rows: FunnelRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <div className="space-y-2">
      {rows.map((r, i) => {
        const widthPct = (r.total / max) * 100;
        const conv = i === 0 ? 1 : r.total / (rows[i - 1].total || 1);
        return (
          <div key={r.key}>
            <div className="flex items-center justify-between text-[11px] text-silver">
              <span>{r.label}</span>
              <span className="tabular">
                {r.total} {i > 0 && <span className="ml-2 text-silver/70">{Math.round(conv * 100)}%</span>}
              </span>
            </div>
            <div className="mt-1 h-7 bg-pearl rounded-md border border-mist overflow-hidden">
              <div
                className="h-full bg-bordeaux/85 transition-all"
                style={{ width: `${Math.max(2, widthPct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
