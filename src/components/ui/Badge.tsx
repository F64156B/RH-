import type { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'bordeaux' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-pearl text-slateText border-mist',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  bordeaux: 'bg-bordeaux/10 text-bordeaux border-bordeaux/20',
  info: 'bg-graphite/5 text-graphite border-graphite/10',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
