import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { add, listAll } from '../lib/firestore';
import { generateJobScope } from '../lib/gemini';
import type { Area, Cargo, Colaborador, Marca, MatrizRegra, Unidade, Vaga } from '../lib/types';
import { resolveApprover } from '../lib/approvals';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/ui/Toast';

const STEPS = [
  { key: 'contexto', label: 'Contexto' },
  { key: 'motivo', label: 'Motivo' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'revisao', label: 'Revisão' },
] as const;

export function NovaVagaPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [marcas, setMarcas] = useState<(Marca & { id: string })[]>([]);
  const [unidades, setUnidades] = useState<(Unidade & { id: string })[]>([]);
  const [areas, setAreas] = useState<(Area & { id: string })[]>([]);
  const [cargos, setCargos] = useState<(Cargo & { id: string })[]>([]);
  const [colaboradores, setColaboradores] = useState<(Colaborador & { id: string })[]>([]);
  const [regras, setRegras] = useState<(MatrizRegra & { id: string })[]>([]);

  const [form, setForm] = useState({
    marcaId: '',
    marca: '',
    marcaSigla: '',
    unidadeId: '',
    unidade: '',
    areaId: '',
    area: '',
    cargoId: '',
    cargo: '',
    cargoNivel: '',
    motivo: 'substituicao' as Vaga['motivo'],
    substituidoColaboradorId: '',
    metricaJustificativa: '',
    descricao: '',
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, u, a, c, k, r] = await Promise.all([
        listAll<Marca>('marcas'),
        listAll<Unidade>('unidades'),
        listAll<Area>('areas'),
        listAll<Cargo>('cargos'),
        listAll<Colaborador>('colaboradores'),
        listAll<MatrizRegra>('matriz_aprovacao'),
      ]);
      setMarcas(m);
      setUnidades(u);
      setAreas(a);
      setCargos(c);
      setColaboradores(k);
      setRegras(r);
    })();
  }, []);

  const desligados = useMemo(() => colaboradores.filter((c) => c.status === 'desligado'), [colaboradores]);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSelectMarca = (id: string) => {
    const m = marcas.find((x) => x.id === id);
    setForm((f) => ({ ...f, marcaId: id, marca: m?.nome ?? '', marcaSigla: m?.sigla ?? '' }));
  };
  const onSelectUnidade = (id: string) => {
    const u = unidades.find((x) => x.id === id);
    setForm((f) => ({ ...f, unidadeId: id, unidade: u?.nome ?? '' }));
  };
  const onSelectArea = (id: string) => {
    const a = areas.find((x) => x.id === id);
    setForm((f) => ({ ...f, areaId: id, area: a?.nome ?? '' }));
  };
  const onSelectCargo = (id: string) => {
    const c = cargos.find((x) => x.id === id);
    setForm((f) => ({ ...f, cargoId: id, cargo: c?.nome ?? '', cargoNivel: c?.nivel ?? '' }));
  };

  const handleAutocomplete = async () => {
    if (!form.cargo || !form.area) {
      toast.warning('Informe Cargo e Área antes de gerar.');
      return;
    }
    setGenerating(true);
    try {
      const text = await generateJobScope({
        cargo: form.cargo,
        area: form.area,
        marca: form.marca,
        unidade: form.unidade,
        motivo: form.motivo,
      });
      update('descricao', text);
      toast.success('Descrição gerada com IA.');
    } catch (e) {
      toast.error('Falha ao gerar descrição.', (e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const approver = resolveApprover(
        { marcaId: form.marcaId, areaId: form.areaId, cargoId: form.cargoId, cargoNivel: form.cargoNivel },
        regras,
      );
      const payload: Vaga = {
        marcaId: form.marcaId,
        unidadeId: form.unidadeId,
        areaId: form.areaId,
        cargoId: form.cargoId,
        cargo: form.cargo,
        area: form.area,
        marca: form.marca,
        marcaSigla: form.marcaSigla,
        unidade: form.unidade,
        motivo: form.motivo,
        substituidoColaboradorId: form.motivo === 'substituicao' ? form.substituidoColaboradorId : undefined,
        metricaJustificativa: form.motivo === 'aumento_quadro' ? form.metricaJustificativa : undefined,
        descricao: form.descricao,
        status: 'pendente',
        approverEmail: approver?.approverEmail,
        requesterEmail: user.email ?? '',
        requesterName: user.displayName ?? '',
        createdAt: Date.now(),
        slaDias: 30,
      };
      const ref = await add('vagas', payload);
      toast.success('Vaga criada.', approver?.approverEmail ? `Aprovador: ${approver.approverEmail}` : 'Aguardando direcionamento.');
      navigate(`/vagas/${ref.id}`);
    } catch (e) {
      toast.error('Não foi possível criar a vaga.', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.marcaId && form.unidadeId && form.areaId && form.cargoId;
    if (step === 1) {
      if (form.motivo === 'substituicao') return !!form.substituidoColaboradorId;
      if (form.motivo === 'aumento_quadro') return form.metricaJustificativa.trim().length > 5;
      return true;
    }
    if (step === 2) return form.descricao.trim().length > 30;
    return true;
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Vagas', to: '/vagas' }, { label: 'Novo pedido' }]} />
      <PageHeader title="Novo pedido de vaga" subtitle="Preencha as etapas para abrir a requisição." />

      <Card>
        <div className="px-6 pt-6">
          <ol className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s.key} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center gap-2 ${
                    i <= step ? 'text-graphite' : 'text-silver'
                  }`}
                >
                  <span
                    className={`h-6 w-6 rounded-full border flex items-center justify-center text-[11px] tabular ${
                      i < step
                        ? 'bg-graphite border-graphite text-white'
                        : i === step
                        ? 'border-graphite text-graphite'
                        : 'border-mist text-silver'
                    }`}
                  >
                    {i < step ? <Check size={12} /> : i + 1}
                  </span>
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-graphite' : 'bg-mist'}`} />}
              </li>
            ))}
          </ol>
        </div>

        <CardBody>
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Marca" required>
                <Select value={form.marcaId} onChange={(e) => onSelectMarca(e.target.value)}>
                  <option value="">Selecione…</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Unidade" required>
                <Select value={form.unidadeId} onChange={(e) => onSelectUnidade(e.target.value)}>
                  <option value="">Selecione…</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome} {u.cidade ? `· ${u.cidade}` : ''}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Área" required>
                <Select value={form.areaId} onChange={(e) => onSelectArea(e.target.value)}>
                  <option value="">Selecione…</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Cargo" required>
                <Select value={form.cargoId} onChange={(e) => onSelectCargo(e.target.value)}>
                  <option value="">Selecione…</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Motivo da abertura" required>
                <Select value={form.motivo} onChange={(e) => update('motivo', e.target.value)}>
                  <option value="substituicao">Substituição</option>
                  <option value="aumento_quadro">Aumento de Quadro</option>
                  <option value="projeto">Projeto</option>
                </Select>
              </Field>

              <div className={`transition-all duration-300 ${form.motivo === 'substituicao' ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <Field label="Colaborador desligado" required>
                  <Select value={form.substituidoColaboradorId} onChange={(e) => update('substituidoColaboradorId', e.target.value)}>
                    <option value="">Selecione…</option>
                    {desligados.length === 0 && <option disabled>Nenhum colaborador com status "desligado"</option>}
                    {desligados.map((c) => (
                      <option key={c.id} value={c.id}>{c.nome} · {c.cargo}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className={`transition-all duration-300 ${form.motivo === 'aumento_quadro' ? 'opacity-100 max-h-60' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <Field label="Justificativa de negócio (métrica)" hint="Ex.: aumento de 30% em ordens de serviço no semestre.">
                  <Textarea
                    value={form.metricaJustificativa}
                    onChange={(e) => update('metricaJustificativa', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-graphite">Descrição da vaga</h3>
                  <p className="text-xs text-silver">Use o autocompletar com IA ou escreva manualmente.</p>
                </div>
                <Button variant="secondary" icon={<Sparkles size={14} />} loading={generating} onClick={handleAutocomplete}>
                  Autocompletar com IA
                </Button>
              </div>
              <Textarea
                rows={14}
                value={form.descricao}
                onChange={(e) => update('descricao', e.target.value)}
                placeholder="Resumo, responsabilidades, requisitos, diferenciais..."
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium text-graphite">Revisão</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ['Marca', form.marca],
                  ['Unidade', form.unidade],
                  ['Área', form.area],
                  ['Cargo', form.cargo],
                  ['Motivo', form.motivo],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] uppercase tracking-wider text-silver">{k}</dt>
                    <dd className="text-slateText">{v || '—'}</dd>
                  </div>
                ))}
              </dl>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-silver mb-1">Descrição</div>
                <div className="rounded-xl border border-mist p-4 whitespace-pre-wrap text-sm text-slateText max-h-72 overflow-y-auto">
                  {form.descricao || '—'}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" icon={<ArrowLeft size={14} />} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Voltar
            </Button>
            {step < STEPS.length - 1 ? (
              <Button icon={<ArrowRight size={14} />} disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
                Avançar
              </Button>
            ) : (
              <Button onClick={submit} loading={saving}>Criar vaga</Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
