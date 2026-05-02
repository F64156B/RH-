import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, Sparkles, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../lib/auth';
import { listen } from '../lib/firestore';
import type { Candidato, Vaga } from '../lib/types';

function Metric({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-silver">{label}</div>
            <div className="mt-2 text-3xl font-semibold text-graphite tabular">{value}</div>
            {hint && <div className="mt-1 text-xs text-silver">{hint}</div>}
          </div>
          <div className="text-silver">{icon}</div>
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

  const myVagas = useMemo(
    () => vagas.filter((v) => v.requesterEmail?.toLowerCase() === user?.email?.toLowerCase()),
    [vagas, user],
  );

  const data = isAdmin ? vagas : myVagas;
  const abertas = data.filter((v) => v.status !== 'concluida' && v.status !== 'cancelada');
  const emAndamento = data.filter((v) => ['em_recrutamento', 'em_proposta'].includes(v.status));
  const concluidasMes = data.filter((v) => {
    if (v.status !== 'concluida') return false;
    const d = new Date(v.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const ttHire = useMemo(() => {
    const closed = data.filter((v) => v.status === 'concluida');
    if (closed.length === 0) return '—';
    const avg = closed.reduce((acc, v) => acc + (Date.now() - v.createdAt), 0) / closed.length;
    return Math.round(avg / (1000 * 60 * 60 * 24)) + 'd';
  }, [data]);

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'Dashboard Estratégico' : `Olá, ${user?.displayName?.split(' ')[0] ?? ''}`}
        subtitle={isAdmin ? 'Visão consolidada do grupo automotivo.' : 'Painel das suas requisições.'}
      />

      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Metric label="Vagas Abertas" value={abertas.length} icon={<Briefcase size={18} />} />
          <Metric label="Candidatos" value={candidatos.length} icon={<Users size={18} />} />
          <Metric label="Contratações no mês" value={concluidasMes.length} icon={<CheckCircle2 size={18} />} />
          <Metric label="Time-to-Hire" value={ttHire} icon={<TrendingUp size={18} />} hint="Média geral" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Metric label="Minhas Vagas" value={data.length} icon={<Briefcase size={18} />} />
          <Metric label="Em Andamento" value={emAndamento.length} icon={<Clock size={18} />} />
          <Metric label="Concluídas" value={data.filter((v) => v.status === 'concluida').length} icon={<CheckCircle2 size={18} />} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-8">
          <div className="px-5 py-4 border-b border-mist flex items-center justify-between">
            <h3 className="font-semibold text-graphite">{isAdmin ? 'Últimas vagas do grupo' : 'Minhas requisições recentes'}</h3>
            <Link to="/vagas" className="text-xs text-bordeaux hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-mist">
            {data.slice(0, 6).map((v) => (
              <Link key={v.id} to={`/vagas/${v.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-pearl">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-graphite text-white text-[10px] font-semibold flex items-center justify-center tracking-wider">
                    {(v.marcaSigla || v.marca || '—').slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-graphite">{v.cargo}</div>
                    <div className="text-[11px] text-silver">{v.area} · {v.unidade}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{v.status}</Badge>
                  <span className="text-[11px] text-silver tabular">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </Link>
            ))}
            {data.length === 0 && <div className="px-5 py-10 text-center text-sm text-silver">Sem registros ainda.</div>}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4">
          <CardBody>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-bordeaux" />
              <h3 className="font-semibold text-graphite">IA & Insights</h3>
            </div>
            <p className="text-sm text-slateText leading-relaxed">
              A arquitetura generativa do BDG combina o <strong>Gemini</strong> com seu fluxo de RH em duas frentes:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slateText">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-bordeaux shrink-0" />
                <span><strong>Autocomplete de Vaga:</strong> escopo de cargo gerado a partir de Marca, Unidade, Área e motivo.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-bordeaux shrink-0" />
                <span><strong>Triagem Inteligente:</strong> Score de Aderência (0-100), tags e resumo executivo do candidato.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-bordeaux shrink-0" />
                <span><strong>Roadmap:</strong> recomendações de próximas etapas e detecção de gargalos no funil.</span>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
