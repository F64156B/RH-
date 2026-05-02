import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-bordeaux text-white hover:bg-bordeaux-dark border border-bordeaux disabled:opacity-50',
  secondary:
    'bg-white text-slateText border border-mist hover:border-silver hover:bg-pearl disabled:opacity-50',
  ghost: 'bg-transparent text-slateText hover:bg-pearl border border-transparent',
  danger: 'bg-danger text-white hover:opacity-90 border border-danger',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon}
      {children}
    </button>
  );
}
