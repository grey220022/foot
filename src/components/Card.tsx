import type { ReactNode } from "react";

interface CardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
}

export function Card({ title, subtitle, children, right }: CardProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

interface StatRowProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export function StatRow({ label, value, hint }: StatRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-800/70 py-2 last:border-b-0">
      <div className="min-w-0">
        <span className="text-sm text-slate-300">{label}</span>
        {hint ? <span className="ml-2 text-xs text-slate-600">{hint}</span> : null}
      </div>
      <span className="font-mono text-sm whitespace-nowrap text-slate-50 tabular-nums">
        {value}
      </span>
    </div>
  );
}
