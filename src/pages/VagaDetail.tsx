import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, KanbanSquare } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { update } from '../lib/firestore';
import type { Vaga, VagaStatus } from '../lib/types';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import { useAuth } from '../lib/auth';

export function VagaDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [vaga, setVaga] = useState<(Vaga & { id: string }) | null>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'vagas', id)).then((s) => {
      if (s.exists()) setVaga({ id: s.id, ...(s.data() as Vaga) });
    });
  }, [id]);

  if (!vaga) return <div className="text-silver text-sm">Carregando…</div>;

  const changeStatus = async (status: VagaStatus) => {
    await update<Vaga>('vagas', vaga.id, { status });
    setVaga({ ...vaga, status });
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1 text-xs text-silver hover:text-graphite">
        <ArrowLeft size={12} /> Voltar
      </button>
      <PageHeader
        title={vaga.cargo}
        subtitle={`${vaga.area} · ${vaga.unidade} · ${vaga.marca}`}
        actions={
          isAdmin && (
            <Link to={`/kanban?vagaId=${vaga.id}`}>
              <Button icon={<KanbanSquare size={14} />}>Ver Kanban</Button>
            </Link>
          )
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-graphite">Descrição</h3>
                <Badge tone="bordeaux">{vaga.motivo}</Badge>
              </div>
              <div className="whitespace-pre-wrap text-sm text-slateText">{vaga.descricao || '—'}</div>
            </CardBody>
          </Card>
        </div>
        <div className="col-span-12 md:col-span-4 space-y-4">
          <Card>
            <CardBody className="space-y-3 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-silver">Status</div>
                {isAdmin ? (
                  <Select className="mt-1" value={vaga.status} onChange={(e) => changeStatus(e.target.value as VagaStatus)}>
                    <option value="pendente">Pendente</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="em_recrutamento">Em recrutamento</option>
                    <option value="em_proposta">Em proposta</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </Select>
                ) : (
                  <div className="mt-1"><Badge>{vaga.status}</Badge></div>
                )}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-silver">Solicitante</div>
                <div className="text-slateText">{vaga.requesterName}</div>
                <div className="text-xs text-silver">{vaga.requesterEmail}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-silver">Aberta em</div>
                <div className="text-slateText tabular">{new Date(vaga.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>
              {vaga.approverEmail && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-silver">Aprovador</div>
                  <div className="text-slateText">{vaga.approverEmail}</div>
                  {vaga.approvalDecidedAt && (
                    <div className="text-[11px] text-silver tabular">
                      Decidido em {new Date(vaga.approvalDecidedAt).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              )}
              {vaga.approvalNote && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-silver">Nota da decisão</div>
                  <div className="text-slateText">{vaga.approvalNote}</div>
                </div>
              )}
              {vaga.metricaJustificativa && (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-silver">Justificativa</div>
                  <div className="text-slateText">{vaga.metricaJustificativa}</div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
