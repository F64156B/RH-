import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('App error boundary:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl p-6">
        <div className="max-w-lg w-full bg-white border border-mist rounded-xl shadow-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-md bg-danger/10 text-danger flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <h1 className="text-lg font-semibold text-graphite">Algo deu errado</h1>
          </div>
          <p className="text-sm text-slateText">
            A aplicação encontrou um erro inesperado. Recarregue a página. Se persistir, contate o time de TI.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-mist bg-pearlSoft p-3 text-[11px] text-slateText whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => location.reload()}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-bordeaux px-4 h-10 text-sm font-medium text-white hover:bg-bordeaux-dark"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
