import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuth } from './lib/auth';

const LoginPage = lazy(() => import('./pages/Login').then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const VagasPage = lazy(() => import('./pages/Vagas').then((m) => ({ default: m.VagasPage })));
const NovaVagaPage = lazy(() => import('./pages/NovaVaga').then((m) => ({ default: m.NovaVagaPage })));
const VagaDetailPage = lazy(() => import('./pages/VagaDetail').then((m) => ({ default: m.VagaDetailPage })));
const KanbanPage = lazy(() => import('./pages/Kanban').then((m) => ({ default: m.KanbanPage })));
const AdminPage = lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminPage })));
const AprovacoesPage = lazy(() => import('./pages/Aprovacoes').then((m) => ({ default: m.AprovacoesPage })));

function Loader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-silver text-sm">
      <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-graphite/30 border-t-graphite" />
      Carregando…
    </div>
  );
}

function Protected({ children, adminOnly }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-silver text-sm">
        <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-graphite/30 border-t-graphite" />
        Carregando…
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="vagas" element={<VagasPage />} />
          <Route path="vagas/nova" element={<NovaVagaPage />} />
          <Route path="vagas/:id" element={<VagaDetailPage />} />
          <Route path="aprovacoes" element={<AprovacoesPage />} />
          <Route
            path="kanban"
            element={
              <Protected adminOnly>
                <KanbanPage />
              </Protected>
            }
          />
          <Route
            path="admin/*"
            element={
              <Protected adminOnly>
                <AdminPage />
              </Protected>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
