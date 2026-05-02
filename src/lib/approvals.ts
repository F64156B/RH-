import type { MatrizRegra, Vaga } from './types';

export function resolveApprover(
  vaga: Pick<Vaga, 'marcaId' | 'areaId' | 'cargoId'> & { cargoNivel?: string },
  rules: MatrizRegra[],
): MatrizRegra | undefined {
  const score = (r: MatrizRegra) =>
    (r.marcaId === vaga.marcaId ? 4 : r.marcaId ? -10 : 0) +
    (r.areaId === vaga.areaId ? 2 : r.areaId ? -10 : 0) +
    (r.cargoNivel && r.cargoNivel === vaga.cargoNivel ? 1 : r.cargoNivel ? -10 : 0);
  return rules
    .map((r) => ({ r, s: score(r) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)[0]?.r;
}
