export function Sparkline({
  data,
  width = 320,
  height = 60,
}: {
  data: { day: string; count: number }[];
  width?: number;
  height?: number;
}) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = width / (data.length - 1 || 1);
  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - (d.count / max) * (height - 4) - 2;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} className="block">
      <path d={area} fill="rgba(123,30,30,0.08)" />
      <path d={path} fill="none" stroke="#7B1E1E" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.5} fill="#7B1E1E" opacity={i === points.length - 1 ? 1 : 0} />
      ))}
    </svg>
  );
}
