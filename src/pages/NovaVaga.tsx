import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field, Input, Select, Textarea } from '../components/ui/Input';
import { add, listAll } from '../lib/firestore';
import { generateJobScope } from '../lib/gemini';
import type { Area, Cargo, Colaborador, Marca, Unidade, Vaga } from '../lib/types';
import { useAuth } from '../lib/auth';

const STEPS = [
  { key: 'contexto', label: 'Contexto' },
  { key: 'motivo', label: 'Motivo' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'revisao', label: 'Revisão' },
] as const;

export function NovaVagaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [marcas, setMarcas] = useState<(Marca & { id: string })[]>([]);
  const [unidades, setUnidades] = useState<(Unidade & { id: string })[]>([]);
  const [areas, setAreas] = useState<(Area & { id: string })[]>([]);
  const [cargos, setCargos] = useState<(Cargo & { id: string })[]>([]);
  const [colaboradores, setColaboradores] = useState<(Colaborador & { id: string })[]>([]);

  const [form, setForm] = useState({
    marca: '',
    marcaSigla: '',
    unidade: '',
    area: '',
    cargo: '',
    motivo: 'substituicao' as Vaga['motivo'],
    substituidoColaboradorId: '',
    metricaJustificativa: '',
    descricao: '',
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, u, a, c, k] = await Promise.all([
        listAll<Marca>('marcas'),
        listAll<Unidade>('unidades'),
        listAll<Area>('areas'),
        listAll<Cargo>('cargos'),
        listAll<Colaborador>('colaboradores'),
      ]);
      setMarcas(m);
      setUnidades(u);
      setAreas(a);
      setCargos(c);
      setColaboradores(k);
    })();
  }, []);

  const desligados = useMemo(() => colaboradores.filter((c) => c.status === 'desligado'), [colaboradores]);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSelectMarca = (id: string) => {
    const m = marcas.find((x) => x.id === id);
    setForm((f) => ({ ...f, marca: m?.nome ?? '', marcaSigla: m?.sigla ?? '' }));
  };

  const handleAutocomplete = async () => {
    if (!form.cargo || !form.area) return alert('Informe Cargo e Área primeiro.');
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
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const submit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload: Vaga = {
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
        requesterEmail: user.email ?? '',
        requesterName: user.displayName ?? '',
        createdAt: Date.now(),
        slaDias: 30,
      };
      const ref = await add('vagas', payload);
      navigate(`/vagas/${ref.id}`);
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.marca && form.unidade && form.area && form.cargo;
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
                <Select onChange={(e) => onSelectMarca(e.target.value)}>
                  <option value="">Selecione…</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Unidade" required>
                <Select value={form.unidade} onChange={(e) => update('unidade', e.target.value)}>
                  <option value="">Selecione…</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.nome}>{u.nome} {u.cidade ? `· ${u.cidade}` : ''}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Área" required>
                <Select value={form.area} onChange={(e) => update('area', e.target.value)}>
                  <option value="">Selecione…</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.nome}>{a.nome}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Cargo" required>
                <Select value={form.cargo} onChange={(e) => update('cargo', e.target.value)}>
                  <option value="">Selecione ou digite…</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
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
