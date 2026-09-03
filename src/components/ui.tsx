'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-medium tracking-tight text-ink-700">{label}</span>
        {hint ? <span className="text-[11px] text-ink-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

const CONTROL =
  'w-full rounded-xl border border-hairline bg-white/80 px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-all duration-200 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${CONTROL} resize-none leading-relaxed ${props.className ?? ''}`}
    />
  );
}

export function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${CONTROL} cursor-pointer appearance-none pr-9 ${props.className ?? ''}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-hairline bg-white/70 px-3.5 py-2.5 text-left transition-all duration-200 hover:border-brand-300 hover:bg-white"
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink-800">{label}</span>
        {description ? (
          <span className="block truncate text-[11px] text-ink-400">{description}</span>
        ) : null}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-brand-500' : 'bg-brand-100'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; sub?: string }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
              active
                ? 'border-brand-400 bg-brand-50 ring-4 ring-brand-100'
                : 'border-hairline bg-white/70 hover:border-brand-300 hover:bg-white'
            }`}
          >
            <span
              className={`block text-[13px] font-semibold ${active ? 'text-brand-700' : 'text-ink-800'}`}
            >
              {option.label}
            </span>
            {option.sub ? (
              <span className="block text-[11px] text-ink-400">{option.sub}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function Badge({
  children,
  tone = 'brand',
}: {
  children: ReactNode;
  tone?: 'brand' | 'neutral' | 'success' | 'danger';
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 ring-brand-100',
    neutral: 'bg-white text-ink-600 ring-hairline',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    danger: 'bg-rose-50 text-rose-700 ring-rose-100',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
