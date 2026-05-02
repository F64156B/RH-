import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-graphite text-pearl p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-bordeaux flex items-center justify-center font-bold">B</div>
          <div>
            <div className="font-semibold tracking-wide">Brasil Dealer Group</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-silver">Recrutamento</div>
          </div>
        </div>
        <div className="space-y-3 max-w-md">
          <h2 className="text-3xl font-semibold tracking-tight">Excelência em gestão de vagas para marcas premium.</h2>
          <p className="text-sm text-silver">
            Plataforma corporativa de abertura, aprovação e triagem de vagas para mais de mil colaboradores em
            quarenta concessionárias de quinze marcas automotivas de luxo.
          </p>
        </div>
        <div className="text-[11px] text-silver/60 tracking-wide">© {new Date().getFullYear()} BDG · Todos os direitos reservados.</div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center bg-pearl p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-graphite">Acessar plataforma</h1>
          <p className="mt-1 text-sm text-silver">Entre com sua conta corporativa Google.</p>
          <div className="mt-8">
            <Button onClick={login} loading={loading} size="lg" className="w-full">
              Entrar com Google
            </Button>
          </div>
          <p className="mt-6 text-[11px] text-silver">
            Acesso restrito. O administrador define os perfis e permissões de cada colaborador.
          </p>
        </div>
      </div>
    </div>
  );
}
