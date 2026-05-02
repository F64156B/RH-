import { CANDIDATO_STAGES, type Candidato, type CandidatoStage, type Vaga } from './types';

const DAY = 1000 * 60 * 60 * 24;

export const daysBetween = (a: number, b: number) => Math.max(0, Math.round((b - a) / DAY));

export function isLate(v: Vaga): boolean {
  if (v.status === 'concluida' || v.status === 'cancelada') return false;
  const sla = v.slaDias ?? 30;
  return daysBetween(v.createdAt, Date.now()) > sla;
}

export function slaPercent(v: Vaga): number {
  const sla = v.slaDias ?? 30;
  return Math.min(100, (daysBetween(v.createdAt, Date.now()) / sla) * 100);
}

export function timeToHire(vagas: Vaga[]): number | null {
  const closed = vagas.filter((v) => v.status === 'concluida');
  if (!closed.length) return null;
  const avg =
    closed.reduce((acc, v) => acc + ((v.approvalDecidedAt ?? Date.now()) - v.createdAt), 0) /
    closed.length;
  return Math.round(avg / DAY);
}

export type FunnelRow = { key: CandidatoStage; label: string; total: number; conversion: number };

export function funnel(candidatos: Candidato[]): FunnelRow[] {
  const order = CANDIDATO_STAGES.map((s) => s.key);
  const reachedByStage: Record<CandidatoStage, number> = {} as any;
  for (const stage of order) reachedByStage[stage] = 0;

  for (const c of candidatos) {
    const idx = order.indexOf(c.stage);
    if (idx < 0) continue;
    for (let i = 0; i <= idx; i++) reachedByStage[order[i]]++;
  }

  const top = reachedByStage[order[0]] || 1;
  return CANDIDATO_STAGES.map((s) => ({
    key: s.key,
    label: s.label,
    total: reachedByStage[s.key],
    conversion: reachedByStage[s.key] / top,
  }));
}

export function distribute<T extends Record<string, any>>(rows: T[], key: keyof T): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = String(r[key] ?? '—');
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function lastNDaysCounts(vagas: Vaga[], days = 30): { day: string; count: number }[] {
  const buckets: Record<string, number> = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const v of vagas) {
    const k = new Date(v.createdAt).toISOString().slice(0, 10);
    if (k in buckets) buckets[k]++;
  }
  return Object.entries(buckets).map(([day, count]) => ({ day, count }));
}
