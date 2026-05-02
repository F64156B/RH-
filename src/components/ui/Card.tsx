import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  topAccent?: 'success' | 'warning' | 'danger' | 'bordeaux' | null;
}

const accents: Record<string, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  bordeaux: 'bg-bordeaux',
};

export function Card({ children, topAccent, className = '', ...rest }: Props) {
  return (
    <div
      {...rest}
      className={`relative bg-white border border-mist rounded-xl shadow-card overflow-hidden ${className}`}
    >
      {topAccent && <div className={`h-[3px] w-full ${accents[topAccent]}`} />}
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 border-b border-mist ${className}`}>{children}</div>;
}
