import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field, Input, Select } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { add, listAll, listen, remove, update } from '../lib/firestore';
import type { Area, Marca, MatrizRegra } from '../lib/types';

export function MatrizPage() {
  const [rules, setRules] = useState<(MatrizRegra & { id: string })[]>([]);
  const [marcas, setMarcas] = useState<(Marca & { id: string })[]>([]);
  const [areas, setAreas] = useState<(Area & { id: string })[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<(MatrizRegra & { id: string }) | null>(null);
  const [form, setForm] = useState<MatrizRegra>({ approverEmail: '' });

  useEffect(() => listen<MatrizRegra>('matriz_aprovacao', setRules), []);
  useEffect(() => {
    listAll<Marca>('marcas').then(setMarcas);
    listAll<Area>('areas').then(setAreas);
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm({ approverEmail: '' });
    setOpen(true);
  };
  const startEdit = (r: MatrizRegra & { id: string }) => {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  };
  const save = async () => {
    if (!form.approverEmail) return;
    const marca = marcas.find((m) => m.id === form.marcaId);
    const area = areas.find((a) => a.id === form.areaId);
    const payload: MatrizRegra = {
      marcaId: form.marcaId || undefined,
      marcaNome: marca?.nome,
      areaId: form.areaId || undefined,
      areaNome: area?.nome,
      cargoNivel: form.cargoNivel || undefined,
      approverEmail: form.approverEmail.trim().toLowerCase(),
      approverNome: form.approverNome || undefined,
    };
    if (editing) await update('matriz_aprovacao', editing.id, payload);
    else await add('matriz_aprovacao', payload);
    setOpen(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-graphite">Matriz de Aprovação</h2>
          <p className="text-xs text-silver">
            Defina aprovadores por marca, área e nível. Regras mais específicas têm prioridade.
          </p>
        </div>
        <Button icon={<Plus size={14} />} onClick={startNew}>
          Nova regra
        </Button>
      </div>

      <Card>
        {rules.length === 0 ? (
          <EmptyState title="Nenhuma regra cadastrada" description="Crie a primeira regra de aprovação." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist text-left text-xs uppercase tracking-wide text-silver">
                <th className="px-5 py-3 font-medium">Marca</th>
                <th className="px-5 py-3 font-medium">Área</th>
                <th className="px-5 py-3 font-medium">Nível</th>
                <th className="px-5 py-3 font-medium">Aprovador</th>
                <th className="px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-mist/60 hover:bg-pearl">
                  <td className="px-5 py-3">{r.marcaNome ?? <span className="text-silver">qualquer</span>}</td>
                  <td className="px-5 py-3">{r.areaNome ?? <span className="text-silver">qualquer</span>}</td>
                  <td className="px-5 py-3">{r.cargoNivel ?? <span className="text-silver">qualquer</span>}</td>
                  <td className="px-5 py-3">
                    <div className="text-slateText">{r.approverNome ?? r.approverEmail}</div>
                    {r.approverNome && <div className="text-[11px] text-silver">{r.approverEmail}</div>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => startEdit(r)} className="text-silver hover:text-graphite mr-3">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => confirm('Excluir regra?') && remove('matriz_aprovacao', r.id)}
                      className="text-silver hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar regra' : 'Nova regra'} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Marca" hint="Vazio = qualquer">
              <Select value={form.marcaId ?? ''} onChange={(e) => setForm((f) => ({ ...f, marcaId: e.target.value }))}>
                <option value="">Qualquer</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </Select>
            </Field>
            <Field label="Área" hint="Vazio = qualquer">
              <Select value={form.areaId ?? ''} onChange={(e) => setForm((f) => ({ ...f, areaId: e.target.value }))}>
                <option value="">Qualquer</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Nível do cargo" hint="Ex.: Gerente, Coordenador. Vazio = qualquer.">
            <Input value={form.cargoNivel ?? ''} onChange={(e) => setForm((f) => ({ ...f, cargoNivel: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome do aprovador">
              <Input value={form.approverNome ?? ''} onChange={(e) => setForm((f) => ({ ...f, approverNome: e.target.value }))} />
            </Field>
            <Field label="E-mail do aprovador" required>
              <Input
                type="email"
                value={form.approverEmail}
                onChange={(e) => setForm((f) => ({ ...f, approverEmail: e.target.value }))}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
