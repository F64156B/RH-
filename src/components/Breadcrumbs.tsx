import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex items-center gap-1.5 text-xs text-silver">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {c.to && !last ? (
                <Link to={c.to} className="hover:text-graphite transition-colors rounded px-0.5">
                  {c.label}
                </Link>
              ) : (
                <span className={last ? 'text-slateText font-medium' : ''} aria-current={last ? 'page' : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight size={12} className="text-silverSoft" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
