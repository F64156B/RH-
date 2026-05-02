import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  Settings,
  LogOut,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../lib/auth';

export function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vagas', label: isAdmin ? 'Vagas' : 'Minhas Vagas', icon: Briefcase },
    { to: '/aprovacoes', label: 'Aprovações', icon: Inbox },
    ...(isAdmin ? [{ to: '/kanban', label: 'Kanban', icon: KanbanSquare }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Administrativo', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-pearl">
      <aside data-surface="dark" className="w-64 shrink-0 bg-graphite text-pearl flex flex-col">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-bordeaux flex items-center justify-center font-bold text-white">B</div>
            <div>
              <div className="text-sm font-semibold tracking-wide">BDG</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-silverSoft">Recrutamento</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/8 text-white'
                    : 'text-silverSoft hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/5 p-3">
          <div className="px-3 py-2 text-[11px] text-silverSoft">
            <div className="text-white text-xs font-medium truncate">{user?.displayName}</div>
            <div className="truncate">{user?.email}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider">
              {isAdmin ? 'Master · RH' : 'Solicitante'}
            </div>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/login'); }}
            className="mt-2 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-silverSoft hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header data-surface="dark" className="h-14 bg-graphite text-pearl border-b border-white/5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-silverSoft">
            <Sparkles size={14} />
            <span>Sistema de Gestão de Vagas · Brasil Dealer Group</span>
          </div>
          <div className="text-[11px] text-silverSoft tabular">
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
