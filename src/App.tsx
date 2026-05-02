import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuth } from './lib/auth';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { VagasPage } from './pages/Vagas';
import { NovaVagaPage } from './pages/NovaVaga';
import { VagaDetailPage } from './pages/VagaDetail';
import { KanbanPage } from './pages/Kanban';
import { AdminPage } from './pages/Admin';
import type { ReactNode } from 'react';

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
  );
}
