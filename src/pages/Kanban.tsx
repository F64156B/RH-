import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Sparkles, UserPlus } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { listAll, listen, add, update } from '../lib/firestore';
import { CANDIDATO_STAGES, type Candidato, type CandidatoStage, type Vaga } from '../lib/types';
import { screenCandidate } from '../lib/gemini';

function scoreTone(score?: number): 'success' | 'warning' | 'neutral' {
  if (score == null) return 'neutral';
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'neutral';
}

export function KanbanPage() {
  const [params, setParams] = useSearchParams();
  const filterVagaId = params.get('vagaId') ?? '';
  const [vagas, setVagas] = useState<(Vaga & { id: string })[]>([]);
  const [candidatos, setCandidatos] = useState<(Candidato & { id: string })[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => listen<Candidato>('candidatos', setCandidatos), []);
  useEffect(() => {
    listAll<Vaga>('vagas').then(setVagas);
  }, []);

  const visible = useMemo(
    () => (filterVagaId ? candidatos.filter((c) => c.vagaId === filterVagaId) : candidatos),
    [candidatos, filterVagaId],
  );

  const advance = async (c: Candidato & { id: string }, dir: 1 | -1) => {
    const idx = CANDIDATO_STAGES.findIndex((s) => s.key === c.stage);
    const next = CANDIDATO_STAGES[idx + dir];
    if (!next) return;
    await update<Candidato>('candidatos', c.id, { stage: next.key });
  };

  const groupedByStage = (stage: CandidatoStage) => visible.filter((c) => c.stage === stage);

  return (
    <div>
      <PageHeader
        title="Kanban de Recrutamento"
        subtitle="Acompanhe candidatos por etapa do funil."
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={filterVagaId}
              onChange={(e) => {
                const v = e.target.value;
                if (v) setParams({ vagaId: v });
                else setParams({});
              }}
              className="w-72"
            >
              <option value="">Todas as vagas</option>
              {vagas.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.cargo} · {v.unidade}
                </option>
              ))}
            </Select>
            <Button icon={<UserPlus size={14} />} onClick={() => setOpen(true)}>
              Novo candidato
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-6 gap-3 min-w-[1100px]">
        {CANDIDATO_STAGES.map((stage) => {
          const list = groupedByStage(stage.key);
          return (
            <div key={stage.key} className="bg-pearlSoft rounded-xl border border-mist p-3 min-h-[400px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-graphite uppercase tracking-wider">{stage.label}</h3>
                <span className="text-[11px] text-silver tabular">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((c) => (
                  <Card key={c.id} className="hover:shadow-cardHover">
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-graphite leading-tight">{c.nome}</div>
                          <div className="text-[11px] text-silver truncate max-w-[180px]">{c.email}</div>
                        </div>
                        {c.score != null && (
                          <Badge tone={scoreTone(c.score)}>
                            <span className="tabular">{c.score}</span>
                          </Badge>
                        )}
                      </div>
                      {c.tags && c.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[10px] rounded bg-pearl border border-mist px-1.5 py-0.5 text-silver">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => advance(c, -1)}
                          disabled={c.stage === 'triagem'}
                          className="text-silver hover:text-graphite disabled:opacity-30"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => advance(c, 1)}
                          disabled={c.stage === 'contratado'}
                          className="text-silver hover:text-graphite disabled:opacity-30"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
                {list.length === 0 && <div className="text-[11px] text-silver text-center py-6">Sem candidatos</div>}
              </div>
            </div>
          );
        })}
      </div>

      <NewCandidateModal
        open={open}
        onClose={() => setOpen(false)}
        vagas={vagas}
        defaultVagaId={filterVagaId}
      />
    </div>
  );
}

function NewCandidateModal({
  open,
  onClose,
  vagas,
  defaultVagaId,
}: {
  open: boolean;
  onClose: () => void;
  vagas: (Vaga & { id: string })[];
  defaultVagaId?: string;
}) {
  const [form, setForm] = useState({ vagaId: defaultVagaId ?? '', nome: '', email: '', curriculo: '' });
  const [saving, setSaving] = useState(false);
  const [triaging, setTriaging] = useState(false);

  useEffect(() => {
    if (open) setForm({ vagaId: defaultVagaId ?? '', nome: '', email: '', curriculo: '' });
  }, [open, defaultVagaId]);

  const submit = async () => {
    if (!form.vagaId || !form.nome || !form.email || !form.curriculo) return;
    const vaga = vagas.find((v) => v.id === form.vagaId);
    setSaving(true);
    setTriaging(true);
    let score: number | undefined;
    let tags: string[] = [];
    let resumo = '';
    try {
      const r = await screenCandidate({
        resume: form.curriculo,
        jobTitle: vaga?.cargo ?? '',
        jobDescription: vaga?.descricao ?? '',
      });
      score = r.score;
      tags = r.tags;
      resumo = r.resumo;
    } catch (e) {
      console.warn('Triagem IA falhou:', e);
    } finally {
      setTriaging(false);
    }
    await add('candidatos', {
      vagaId: form.vagaId,
      nome: form.nome,
      email: form.email,
      curriculo: form.curriculo,
      stage: 'triagem',
      score,
      tags,
      resumo,
      createdAt: Date.now(),
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo candidato" size="lg">
      <div className="space-y-4">
        <Field label="Vaga" required>
          <Select value={form.vagaId} onChange={(e) => setForm((f) => ({ ...f, vagaId: e.target.value }))}>
            <option value="">Selecione…</option>
            {vagas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.cargo} · {v.unidade}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome" required>
            <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
          </Field>
          <Field label="E-mail" required>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
        </div>
        <Field label="Currículo (cole o texto)" required>
          <Textarea
            rows={10}
            value={form.curriculo}
            onChange={(e) => setForm((f) => ({ ...f, curriculo: e.target.value }))}
          />
        </Field>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-silver inline-flex items-center gap-1">
            <Sparkles size={12} /> Triagem com IA gera Score e Tags ao salvar.
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={submit} loading={saving} icon={<Plus size={14} />}>
              {triaging ? 'Triando…' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
