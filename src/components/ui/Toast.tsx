import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: number; tone: ToastTone; title: string; description?: string };

type Ctx = {
  toast: (t: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastCtx = createContext<Ctx>({} as Ctx);

const meta: Record<ToastTone, { icon: ReactNode; bar: string; iconColor: string }> = {
  success: { icon: <CheckCircle2 size={16} />, bar: 'bg-success', iconColor: 'text-success' },
  error: { icon: <XCircle size={16} />, bar: 'bg-danger', iconColor: 'text-danger' },
  warning: { icon: <AlertTriangle size={16} />, bar: 'bg-warning', iconColor: 'text-warning' },
  info: { icon: <Info size={16} />, bar: 'bg-graphite', iconColor: 'text-graphite' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<Ctx['toast']>((t) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts, { id, ...t }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const ctx: Ctx = {
    toast,
    success: (title, description) => toast({ tone: 'success', title, description }),
    error: (title, description) => toast({ tone: 'error', title, description }),
    warning: (title, description) => toast({ tone: 'warning', title, description }),
    info: (title, description) => toast({ tone: 'info', title, description }),
  };

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]" role="region" aria-label="Notificações">
        {toasts.map((t) => (
          <ToastCard key={t.id} t={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastCard({ t, onClose }: { t: Toast; onClose: () => void }) {
  const m = meta[t.tone];
  const [enter, setEnter] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setEnter(true));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex items-start gap-3 bg-white border border-mist rounded-xl shadow-cardHover overflow-hidden transition-all duration-200 ${
        enter ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${m.bar}`} />
      <div className="pl-4 pr-3 py-3 flex-1 flex items-start gap-3">
        <span className={`mt-0.5 ${m.iconColor}`}>{m.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-graphite">{t.title}</div>
          {t.description && <div className="mt-0.5 text-xs text-silver leading-relaxed">{t.description}</div>}
        </div>
        <button
          onClick={onClose}
          className="text-silver hover:text-graphite focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite/30 rounded p-0.5"
          aria-label="Fechar notificação"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export const useToast = () => useContext(ToastCtx);
