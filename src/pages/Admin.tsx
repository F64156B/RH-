import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Bell, Building2, Layers, MapPin, ShieldCheck, UserCog, Users, Workflow } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CrudTable } from '../components/CrudTable';
import { Card, CardBody } from '../components/ui/Card';
import { MatrizPage } from './Matriz';

const tabs = [
  { to: 'marcas', label: 'Marcas', icon: Building2 },
  { to: 'unidades', label: 'Unidades', icon: MapPin },
  { to: 'areas', label: 'Áreas', icon: Layers },
  { to: 'cargos', label: 'Cargos', icon: Workflow },
  { to: 'colaboradores', label: 'Colaboradores', icon: Users },
  { to: 'matriz', label: 'Matriz de Aprovação', icon: ShieldCheck },
  { to: 'notificacoes', label: 'Notificações', icon: Bell, soon: true },
  { to: 'permissoes', label: 'Permissões', icon: UserCog, soon: true },
];

function Placeholder({ title }: { title: string }) {
  return (
    <Card>
      <CardBody>
        <h3 className="font-semibold text-graphite">{title}</h3>
        <p className="mt-1 text-sm text-silver">Módulo em construção. Em breve esta área será habilitada.</p>
      </CardBody>
    </Card>
  );
}

export function AdminPage() {
  const location = useLocation();
  const current = tabs.find((t) => location.pathname.endsWith(`/admin/${t.to}`));
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Configurações', to: '/admin' },
          ...(current ? [{ label: current.label }] : []),
        ]}
      />
      <PageHeader title="Configurações" subtitle="Cadastros estruturais do grupo." />
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <Card>
            <nav className="p-2">
              {tabs.map(({ to, label, icon: Icon, soon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive ? 'bg-graphite text-white' : 'text-slateText hover:bg-pearl'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    <Icon size={14} />
                    {label}
                  </span>
                  {soon && <span className="text-[10px] uppercase tracking-wider text-silver">em breve</span>}
                </NavLink>
              ))}
            </nav>
          </Card>
        </aside>
        <div className="col-span-12 md:col-span-9">
          <Routes>
            <Route index element={<Navigate to="marcas" replace />} />
            <Route
              path="marcas"
              element={
                <CrudTable
                  collectionName="marcas"
                  title="Marcas"
                  columns={[
                    { key: 'nome', label: 'Nome', required: true },
                    { key: 'sigla', label: 'Sigla', required: true },
                  ]}
                  excelMapping={{ Nome: 'nome', Sigla: 'sigla' }}
                />
              }
            />
            <Route
              path="unidades"
              element={
                <CrudTable
                  collectionName="unidades"
                  title="Unidades"
                  columns={[
                    { key: 'nome', label: 'Nome', required: true },
                    { key: 'cidade', label: 'Cidade' },
                    { key: 'uf', label: 'UF' },
                    { key: 'marca', label: 'Marca' },
                  ]}
                  excelMapping={{ Nome: 'nome', Cidade: 'cidade', UF: 'uf', Marca: 'marca' }}
                />
              }
            />
            <Route
              path="areas"
              element={
                <CrudTable
                  collectionName="areas"
                  title="Áreas"
                  columns={[{ key: 'nome', label: 'Nome', required: true }]}
                  excelMapping={{ Nome: 'nome' }}
                />
              }
            />
            <Route
              path="cargos"
              element={
                <CrudTable
                  collectionName="cargos"
                  title="Cargos"
                  columns={[
                    { key: 'nome', label: 'Nome', required: true },
                    { key: 'area', label: 'Área' },
                    { key: 'nivel', label: 'Nível' },
                  ]}
                  excelMapping={{ Nome: 'nome', Area: 'area', Nivel: 'nivel' }}
                />
              }
            />
            <Route
              path="colaboradores"
              element={
                <CrudTable
                  collectionName="colaboradores"
                  title="Colaboradores"
                  columns={[
                    { key: 'nome', label: 'Nome', required: true },
                    { key: 'email', label: 'E-mail', type: 'email', required: true },
                    { key: 'cargo', label: 'Cargo' },
                    { key: 'unidade', label: 'Unidade' },
                    { key: 'marca', label: 'Marca' },
                    { key: 'status', label: 'Status' },
                  ]}
                  excelMapping={{
                    Nome: 'nome',
                    Email: 'email',
                    Cargo: 'cargo',
                    Unidade: 'unidade',
                    Marca: 'marca',
                    Status: 'status',
                  }}
                />
              }
            />
            <Route path="matriz" element={<MatrizPage />} />
            <Route path="notificacoes" element={<Placeholder title="Notificações" />} />
            <Route path="permissoes" element={<Placeholder title="Permissões" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
