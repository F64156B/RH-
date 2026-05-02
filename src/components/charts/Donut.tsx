type Slice = { label: string; value: number; color: string };

export function Donut({ slices, size = 140 }: { slices: Slice[]; size?: number }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2 - 12;
  const c = size / 2;
  const stroke = 14;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={c} cy={c} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        {slices.map((s, i) => {
          const len = (s.value / total) * circ;
          const seg = (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              stroke={s.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return seg;
        })}
        <text
          x={c}
          y={c}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90 ${c} ${c})`}
          className="fill-graphite tabular"
          style={{ fontSize: 22, fontWeight: 600 }}
        >
          {total}
        </text>
      </svg>
      <ul className="space-y-1.5 text-xs">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-slateText">{s.label}</span>
            <span className="tabular text-silver">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
