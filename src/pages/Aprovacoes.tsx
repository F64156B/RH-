import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Inbox, X } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { listen, update } from '../lib/firestore';
import type { Vaga } from '../lib/types';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/ui/Toast';

export function AprovacoesPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [vagas, setVagas] = useState<(Vaga & { id: string })[]>([]);

  useEffect(() => listen<Vaga>('vagas', setVagas), []);

  const fila = useMemo(() => {
    const email = user?.email?.toLowerCase();
    return vagas
      .filter((v) => v.status === 'pendente')
      .filter((v) => isAdmin || (v.approverEmail && v.approverEmail.toLowerCase() === email))
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [vagas, user, isAdmin]);

  const decide = async (v: Vaga & { id: string }, ok: boolean) => {
    const note = ok ? '' : prompt('Justificativa da reprovação:') ?? '';
    if (!ok && !note) return;
    try {
      await update<Vaga>('vagas', v.id, {
        status: ok ? 'aprovada' : 'cancelada',
        approvalDecidedAt: Date.now(),
        approvalNote: note || undefined,
      });
      ok ? toast.success(`Vaga aprovada: ${v.cargo}`) : toast.info(`Vaga reprovada: ${v.cargo}`);
    } catch (e) {
      toast.error('Não foi possível registrar a decisão.', (e as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Aprovações"
        subtitle={isAdmin ? 'Todas as requisições pendentes do grupo.' : 'Vagas aguardando sua aprovação.'}
      />
      {fila.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox size={32} />}
            title="Nenhuma vaga pendente"
            description="Quando uma requisição for direcionada a você, aparecerá aqui."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {fila.map((v) => (
            <Card key={v.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-graphite text-white flex items-center justify-center text-xs font-semibold tracking-wider">
                      {(v.marcaSigla || v.marca || '—').slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <Link to={`/vagas/${v.id}`} className="font-semibold text-graphite hover:underline">
                        {v.cargo}
                      </Link>
                      <div className="text-xs text-silver">{v.area} · {v.unidade} · {v.marca}</div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-silver">
                        <span>Solicitante: {v.requesterName} · {v.requesterEmail}</span>
                        <span>·</span>
                        <span className="tabular">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                        <Badge tone="warning">{v.motivo}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" icon={<X size={14} />} onClick={() => decide(v, false)}>
                      Reprovar
                    </Button>
                    <Button icon={<Check size={14} />} onClick={() => decide(v, true)}>
                      Aprovar
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
