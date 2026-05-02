import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

const baseField =
  'h-10 w-full rounded-xl border border-mist bg-white px-3 text-sm text-slateText placeholder:text-silver focus:border-graphite focus:outline-none focus:ring-2 focus:ring-graphite/10 transition-colors';

export function Field({ label, hint, children, required }: { label?: string; hint?: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-slateText">
          {label}
          {required && <span className="ml-1 text-bordeaux">*</span>}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-silver">{hint}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseField} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${baseField} appearance-none pr-9 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22 fill=%22none%22><path d=%22M1 1l4 4 4-4%22 stroke=%22%239CA3AF%22 stroke-width=%221.5%22 stroke-linecap=%22round%22/></svg>')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat ${props.className ?? ''}`} />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[120px] w-full rounded-xl border border-mist bg-white p-3 text-sm text-slateText placeholder:text-silver focus:border-graphite focus:outline-none focus:ring-2 focus:ring-graphite/10 transition-colors ${props.className ?? ''}`}
    />
  );
}
