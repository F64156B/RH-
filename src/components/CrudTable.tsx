import { useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { Modal } from './ui/Modal';
import { Field, Input } from './ui/Input';
import { add, bulkInsert, listen, remove, update } from '../lib/firestore';
import { mapRows, readSheet } from '../lib/xlsx-import';
import { useToast } from './ui/Toast';

export type ColumnDef = {
  key: string;
  label: string;
  type?: 'text' | 'email';
  required?: boolean;
};

export function CrudTable({
  collectionName,
  title,
  columns,
  excelMapping,
}: {
  collectionName: string;
  title: string;
  columns: ColumnDef[];
  excelMapping?: Record<string, string>;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => listen<any>(collectionName, setRows), [collectionName]);

  const startNew = () => {
    setEditing(null);
    setForm({});
    setOpen(true);
  };
  const startEdit = (r: any) => {
    setEditing(r);
    setForm({ ...r });
    setOpen(true);
  };
  const save = async () => {
    const payload: Record<string, any> = {};
    columns.forEach((c) => {
      payload[c.key] = form[c.key] ?? '';
    });
    try {
      if (editing) {
        await update(collectionName, editing.id, payload);
        toast.success('Registro atualizado.');
      } else {
        await add(collectionName, payload);
        toast.success('Registro criado.');
      }
      setOpen(false);
    } catch (e) {
      toast.error('Não foi possível salvar.', (e as Error).message);
    }
  };
  const del = async (id: string) => {
    if (confirm('Excluir registro?')) await remove(collectionName, id);
  };

  const handleImport = async (file: File) => {
    if (!excelMapping) return;
    setImporting(true);
    try {
      const data = await readSheet(file);
      const mapped = mapRows(data, excelMapping);
      await bulkInsert(collectionName, mapped);
      toast.success('Importação concluída.', `${mapped.length} registros adicionados.`);
    } catch (e) {
      toast.error('Falha ao importar.', (e as Error).message);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-graphite">{title}</h2>
          <p className="text-xs text-silver">{rows.length} registros</p>
        </div>
        <div className="flex items-center gap-2">
          {excelMapping && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                className="hidden"
              />
              <Button
                variant="secondary"
                icon={<Upload size={14} />}
                onClick={() => fileRef.current?.click()}
                loading={importing}
              >
                Importar Excel
              </Button>
            </>
          )}
          <Button icon={<Plus size={14} />} onClick={startNew}>
            Novo
          </Button>
        </div>
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={<FileSpreadsheet size={32} />}
            title="Nenhum registro"
            description="Adicione manualmente ou importe via planilha."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mist text-left text-xs uppercase tracking-wide text-silver">
                  {columns.map((c) => (
                    <th key={c.key} className="px-5 py-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-5 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-mist/60 hover:bg-pearl">
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-3 text-slateText">
                        {String(r[c.key] ?? '')}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => startEdit(r)}
                        aria-label="Editar registro"
                        className="text-silver hover:text-graphite mr-3 rounded p-1"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => del(r.id)}
                        aria-label="Excluir registro"
                        className="text-silver hover:text-danger rounded p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Editar ${title}` : `Novo ${title}`}>
        <div className="space-y-4">
          {columns.map((c) => (
            <Field key={c.key} label={c.label} required={c.required}>
              <Input
                type={c.type === 'email' ? 'email' : 'text'}
                value={form[c.key] ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
              />
            </Field>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
