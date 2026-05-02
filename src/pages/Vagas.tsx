import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { listen } from '../lib/firestore';
import type { Vaga, VagaStatus } from '../lib/types';
import { useAuth } from '../lib/auth';

const statusMeta: Record<VagaStatus, { label: string; tone: any }> = {
  pendente: { label: 'Pendente', tone: 'warning' },
  aprovada: { label: 'Aprovada', tone: 'info' },
  em_recrutamento: { label: 'Em recrutamento', tone: 'bordeaux' },
  em_proposta: { label: 'Em proposta', tone: 'bordeaux' },
  concluida: { label: 'Concluída', tone: 'success' },
  cancelada: { label: 'Cancelada', tone: 'danger' },
};

function slaProgress(createdAt: number, sla = 30) {
  const elapsed = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
  return Math.min(100, Math.max(4, (elapsed / sla) * 100));
}

export function VagasPage() {
  const { user, isAdmin } = useAuth();
  const [vagas, setVagas] = useState<(Vaga & { id: string })[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => listen<Vaga>('vagas', (rows) => setVagas(rows.sort((a, b) => b.createdAt - a.createdAt))), []);

  const filtered = useMemo(() => {
    const base = isAdmin ? vagas : vagas.filter((v) => v.requesterEmail?.toLowerCase() === user?.email?.toLowerCase());
    if (!search.trim()) return base;
    const s = search.toLowerCase();
    return base.filter((v) =>
      [v.cargo, v.area, v.marca, v.unidade].some((f) => String(f).toLowerCase().includes(s)),
    );
  }, [vagas, search, isAdmin, user]);

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'Vagas' : 'Minhas Vagas'}
        subtitle={isAdmin ? 'Todas as requisições do grupo.' : 'Suas requisições de vaga.'}
        actions={
          <Link to="/vagas/nova">
            <Button icon={<Plus size={14} />}>Novo pedido</Button>
          </Link>
        }
      />

      <div className="mb-5 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver" />
        <Input
          placeholder="Buscar por cargo, área, marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Briefcase size={32} />}
            title="Nenhuma vaga encontrada"
            description="Comece abrindo um novo pedido de vaga."
            action={
              <Link to="/vagas/nova">
                <Button icon={<Plus size={14} />}>Abrir vaga</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <Link key={v.id} to={`/vagas/${v.id}`}>
              <Card topAccent={null} className="hover:shadow-cardHover transition-shadow">
                <div className="h-1 w-full bg-mist relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-success/70" style={{ width: `${slaProgress(v.createdAt, v.slaDias)}%` }} />
                </div>
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-graphite text-white flex items-center justify-center text-xs font-semibold tracking-wider">
                        {(v.marcaSigla || v.marca || '—').slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-graphite leading-tight">{v.cargo}</h3>
                        <div className="text-xs text-silver">{v.area} · {v.unidade}</div>
                      </div>
                    </div>
                    <Badge tone={statusMeta[v.status]?.tone}>{statusMeta[v.status]?.label}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-silver">
                    <span>{v.marca}</span>
                    <span className="tabular">
                      {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
