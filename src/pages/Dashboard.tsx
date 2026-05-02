import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Funnel } from '../components/charts/Funnel';
import { Bars } from '../components/charts/Bars';
import { Donut } from '../components/charts/Donut';
import { Sparkline } from '../components/charts/Sparkline';
import { useAuth } from '../lib/auth';
import { listen } from '../lib/firestore';
import type { Candidato, Vaga, VagaStatus } from '../lib/types';
import {
  daysBetween,
  distribute,
  funnel,
  isLate,
  lastNDaysCounts,
  slaPercent,
  timeToHire,
} from '../lib/analytics';

const STATUS_LABELS: Record<VagaStatus, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  em_recrutamento: 'Em recrutamento',
  em_proposta: 'Em proposta',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const STATUS_COLORS: Record<VagaStatus, string> = {
  pendente: '#B8860B',
  aprovada: '#3A3F47',
  em_recrutamento: '#7B1E1E',
  em_proposta: '#651616',
  concluida: '#1F6F4A',
  cancelada: '#9CA3AF',
};

function Metric({
  label,
  value,
  icon,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  hint?: string;
  tone?: 'neutral' | 'danger' | 'success' | 'bordeaux';
}) {
  const tones: Record<string, string> = {
    neutral: 'text-silver',
    danger: 'text-danger',
    success: 'text-success',
    bordeaux: 'text-bordeaux',
  };
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-silver">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-graphite tabular">{value}</div>
            {hint && <div className={`mt-1 text-xs ${tones[tone]}`}>{hint}</div>}
          </div>
          <div className={tones[tone]}>{icon}</div>
        </div>
      </CardBody>
    </Card>
  );
}

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [vagas, setVagas] = useState<(Vaga & { id: string })[]>([]);
  const [candidatos, setCandidatos] = useState<(Candidato & { id: string })[]>([]);

  useEffect(() => listen<Vaga>('vagas', setVagas), []);
  useEffect(() => listen<Candidato>('candidatos', setCandidatos), []);

  return isAdmin ? (
    <AdminDashboard vagas={vagas} candidatos={candidatos} />
  ) : (
    <RequesterDashboard
      vagas={vagas.filter((v) => v.requesterEmail?.toLowerCase() === user?.email?.toLowerCase())}
      name={user?.displayName?.split(' ')[0]}
    />
  );
}

function AdminDashboard({
  vagas,
  candidatos,
}: {
  vagas: (Vaga & { id: string })[];
  candidatos: (Candidato & { id: string })[];
}) {
  const abertas = vagas.filter((v) => v.status !== 'concluida' && v.status !== 'cancelada');
  const lateVagas = vagas.filter(isLate);
  const concluidasMes = vagas.filter((v) => {
    if (v.status !== 'concluida') return false;
    const d = new Date(v.approvalDecidedAt ?? v.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const tth = timeToHire(vagas);

  const funnelRows = useMemo(() => funnel(candidatos), [candidatos]);
  const porMarca = useMemo(() => distribute(vagas, 'marca').slice(0, 8), [vagas]);
  const porUnidade = useMemo(() => distribute(vagas, 'unidade').slice(0, 8), [vagas]);
  const series = useMemo(() => lastNDaysCounts(vagas, 30), [vagas]);

  const statusSlices = useMemo(() => {
    const dist = distribute(vagas, 'status');
    return dist
      .filter((s) => STATUS_LABELS[s.label as VagaStatus])
      .map((s) => ({
        label: STATUS_LABELS[s.label as VagaStatus],
        value: s.value,
        color: STATUS_COLORS[s.label as VagaStatus] ?? '#3A3F47',
      }));
  }, [vagas]);

  return (
    <div>
      <PageHeader title="Dashboard Estratégico" subtitle="Visão consolidada do grupo automotivo." />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Metric label="Vagas Abertas" value={abertas.length} icon={<Briefcase size={18} />} />
        <Metric label="Candidatos" value={candidatos.length} icon={<Users size={18} />} />
        <Metric
          label="Contratações no mês"
          value={concluidasMes.length}
          icon={<CheckCircle2 size={18} />}
          tone="success"
        />
        <Metric
          label="Time-to-Hire"
          value={tth != null ? `${tth}d` : '—'}
          icon={<TrendingUp size={18} />}
          hint={tth != null ? 'Média geral' : 'Sem dados ainda'}
        />
        <Metric
          label="SLA Estourado"
          value={lateVagas.length}
          icon={<AlertTriangle size={18} />}
          tone={lateVagas.length ? 'danger' : 'neutral'}
          hint={lateVagas.length ? 'Vagas atrasadas' : 'No prazo'}
        />
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-7">
          <div className="px-5 py-4 border-b border-mist flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-graphite">Funil de Recrutamento</h3>
              <p className="text-[11px] text-silver">Conversão por etapa entre candidatos.</p>
            </div>
            <Badge tone="bordeaux">{candidatos.length} candidatos</Badge>
          </div>
          <CardBody>
            <Funnel rows={funnelRows} />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <div className="px-5 py-4 border-b border-mist">
            <h3 className="font-semibold text-graphite">Distribuição por Status</h3>
            <p className="text-[11px] text-silver">Total de vagas no momento.</p>
          </div>
          <CardBody>
            {statusSlices.length === 0 ? (
              <div className="text-xs text-silver py-6 text-center">Sem vagas registradas.</div>
            ) : (
              <Donut slices={statusSlices} />
            )}
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <div className="px-5 py-4 border-b border-mist">
            <h3 className="font-semibold text-graphite">Vagas por Marca</h3>
          </div>
          <CardBody>
            <Bars rows={porMarca} />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <div className="px-5 py-4 border-b border-mist">
            <h3 className="font-semibold text-graphite">Vagas por Unidade</h3>
          </div>
          <CardBody>
            <Bars rows={porUnidade} />
          </CardBody>
        </Card>

        <Card className="col-span-12 lg:col-span-7">
          <div className="px-5 py-4 border-b border-mist flex items-center justify-between">
            <h3 className="font-semibold text-graphite">SLA — Vagas Atrasadas</h3>
            <Link to="/vagas" className="text-xs text-bordeaux hover:underline">
              Ver todas
            </Link>
          </div>
          {lateVagas.length === 0 ? (
            <CardBody>
              <div className="text-xs text-silver text-center py-8">
                Nenhuma vaga ultrapassou o SLA. Operação em dia.
              </div>
            </CardBody>
          ) : (
            <div className="divide-y divide-mist max-h-80 overflow-y-auto">
              {lateVagas
                .sort((a, b) => slaPercent(b) - slaPercent(a))
                .slice(0, 8)
                .map((v) => (
                  <Link key={v.id} to={`/vagas/${v.id}`} className="block px-5 py-3 hover:bg-pearl">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-graphite truncate">{v.cargo}</div>
                        <div className="text-[11px] text-silver truncate">
                          {v.marca} · {v.unidade}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-danger tabular">
                          +{daysBetween(v.createdAt, Date.now()) - (v.slaDias ?? 30)}d
                        </div>
                        <div className="text-[11px] text-silver">
                          aberta há {daysBetween(v.createdAt, Date.now())}d
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-1 bg-mist rounded-full overflow-hidden">
                      <div className="h-full bg-danger" style={{ width: `${slaPercent(v)}%` }} />
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <div className="px-5 py-4 border-b border-mist">
            <h3 className="font-semibold text-graphite">Aberturas — últimos 30 dias</h3>
            <p className="text-[11px] text-silver">Volume diário de novas requisições.</p>
          </div>
          <CardBody>
            <Sparkline data={series} width={360} height={80} />
            <div className="mt-3 flex items-center justify-between text-[11px] text-silver tabular">
              <span>{series[0]?.day}</span>
              <span>Total: {series.reduce((a, s) => a + s.count, 0)}</span>
              <span>{series[series.length - 1]?.day}</span>
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-12">
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-bordeaux" />
              <h3 className="font-semibold text-graphite">IA & Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-silver">Autocomplete de Vaga</div>
                <p className="mt-1 text-slateText">
                  Escopo de cargo gerado a partir de Marca, Unidade, Área e motivo.
                </p>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-silver">Triagem Inteligente</div>
                <p className="mt-1 text-slateText">
                  Score de Aderência (0-100), tags e resumo executivo do candidato.
                </p>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-silver">Próximas Recomendações</div>
                <p className="mt-1 text-slateText">
                  Detecção de gargalos no funil e priorização automática de candidatos com Score ≥ 80.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function RequesterDashboard({ vagas, name }: { vagas: (Vaga & { id: string })[]; name?: string }) {
  const emAndamento = vagas.filter((v) => ['em_recrutamento', 'em_proposta', 'aprovada'].includes(v.status));
  const concluidas = vagas.filter((v) => v.status === 'concluida');
  const lateMine = vagas.filter(isLate);

  return (
    <div>
      <PageHeader
        title={`Olá, ${name ?? ''}`}
        subtitle="Painel das suas requisições."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Minhas Vagas" value={vagas.length} icon={<Briefcase size={18} />} />
        <Metric label="Em Andamento" value={emAndamento.length} icon={<Clock size={18} />} />
        <Metric label="Concluídas" value={concluidas.length} icon={<CheckCircle2 size={18} />} tone="success" />
        <Metric
          label="Atrasadas"
          value={lateMine.length}
          icon={<AlertTriangle size={18} />}
          tone={lateMine.length ? 'danger' : 'neutral'}
        />
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-8">
          <div className="px-5 py-4 border-b border-mist flex items-center justify-between">
            <h3 className="font-semibold text-graphite">Minhas requisições recentes</h3>
            <Link to="/vagas" className="text-xs text-bordeaux hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-mist">
            {vagas.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-silver">Você ainda não abriu vagas.</div>
            ) : (
              vagas
                .slice()
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 6)
                .map((v) => (
                  <Link key={v.id} to={`/vagas/${v.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-pearl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-md bg-graphite text-white text-[10px] font-semibold flex items-center justify-center tracking-wider shrink-0">
                        {(v.marcaSigla || v.marca || '—').slice(0, 3).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-graphite truncate">{v.cargo}</div>
                        <div className="text-[11px] text-silver truncate">{v.area} · {v.unidade}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge tone={isLate(v) ? 'danger' : 'neutral'}>{STATUS_LABELS[v.status]}</Badge>
                      <span className="text-[11px] text-silver tabular">
                        {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <div className="px-5 py-4 border-b border-mist">
            <h3 className="font-semibold text-graphite">SLA das suas vagas</h3>
          </div>
          <CardBody>
            {vagas.filter((v) => v.status !== 'concluida' && v.status !== 'cancelada').length === 0 ? (
              <div className="text-xs text-silver text-center py-6">Sem vagas em andamento.</div>
            ) : (
              <div className="space-y-3">
                {vagas
                  .filter((v) => v.status !== 'concluida' && v.status !== 'cancelada')
                  .slice(0, 5)
                  .map((v) => {
                    const pct = slaPercent(v);
                    const late = isLate(v);
                    return (
                      <div key={v.id}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slateText truncate">{v.cargo}</span>
                          <span className={`tabular ${late ? 'text-danger' : 'text-silver'}`}>
                            {Math.min(100, Math.round(pct))}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 bg-mist rounded-full overflow-hidden">
                          <div
                            className={`h-full ${late ? 'bg-danger' : pct > 70 ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
