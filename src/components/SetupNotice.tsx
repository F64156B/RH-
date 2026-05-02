import { AlertTriangle, ExternalLink } from 'lucide-react';

export function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pearl p-6">
      <div className="max-w-2xl w-full bg-white border border-mist rounded-xl shadow-card overflow-hidden">
        <div className="h-1 bg-warning" />
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-warning/10 text-warning flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-silver">Brasil Dealer Group</div>
              <h1 className="text-xl font-semibold text-graphite">Configuração necessária</h1>
            </div>
          </div>

          <p className="mt-6 text-sm text-slateText leading-relaxed">
            O preview foi servido sem as variáveis de ambiente do Firebase. O sistema renderiza,
            mas as funcionalidades dependem de um projeto Firebase ativo. Configure as chaves abaixo
            no painel da plataforma de hospedagem (Vercel · Netlify · GitHub Pages) ou em um arquivo
            <code className="mx-1 rounded bg-pearl px-1.5 py-0.5 text-xs">.env</code>
            local antes de rodar <code className="mx-1 rounded bg-pearl px-1.5 py-0.5 text-xs">npm run dev</code>.
          </p>

          <div className="mt-6 rounded-lg border border-mist bg-pearlSoft p-4 font-mono text-xs text-slateText space-y-1">
            <div>VITE_FIREBASE_API_KEY=…</div>
            <div>VITE_FIREBASE_AUTH_DOMAIN=…</div>
            <div>VITE_FIREBASE_PROJECT_ID=…</div>
            <div>VITE_FIREBASE_STORAGE_BUCKET=…</div>
            <div>VITE_FIREBASE_MESSAGING_SENDER_ID=…</div>
            <div>VITE_FIREBASE_APP_ID=…</div>
            <div>VITE_GEMINI_API_KEY=…</div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-mist px-4 py-3 hover:border-graphite transition-colors"
            >
              <span className="text-slateText">Firebase Console</span>
              <ExternalLink size={14} className="text-silver" />
            </a>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg border border-mist px-4 py-3 hover:border-graphite transition-colors"
            >
              <span className="text-slateText">Gemini API Key</span>
              <ExternalLink size={14} className="text-silver" />
            </a>
          </div>

          <p className="mt-6 text-[11px] text-silver">
            Após configurar, recarregue a página. O sistema redireciona automaticamente para o login.
          </p>
        </div>
      </div>
    </div>
  );
}
