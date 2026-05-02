import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-graphite/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative w-full ${widths[size]} bg-white rounded-xl shadow-cardHover border border-mist max-h-[90vh] flex flex-col`}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-mist">
            <h3 id={titleId} className="font-semibold text-graphite">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Fechar diálogo"
              className="text-silver hover:text-slateText rounded p-1"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
