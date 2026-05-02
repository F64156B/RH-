import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-silver">{icon}</div>}
      <h4 className="font-semibold text-graphite">{title}</h4>
      {description && <p className="mt-1 max-w-md text-sm text-silver">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
