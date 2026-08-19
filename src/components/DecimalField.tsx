"use client";

import { NumericFormat } from "react-number-format";

interface DecimalFieldProps {
  id: string;
  label: string;
  sublabel?: string;
  value: string;
  onChange: (value: string) => void;
  /** 2 for odds / Opta, 0 for Elo. Enforced by react-number-format. */
  decimalScale: number;
  max: number;
  placeholder?: string;
  hint?: string;
  error?: string | null;
}

/**
 * Numeric field backed by react-number-format: `decimalScale` makes it
 * physically impossible to type a third decimal place, and `isAllowed`
 * rejects keystrokes that would push the value past `max`.
 */
export function DecimalField({
  id,
  label,
  sublabel,
  value,
  onChange,
  decimalScale,
  max,
  placeholder,
  hint,
  error,
}: DecimalFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label}
        {sublabel ? <span className="ml-1.5 text-xs text-slate-500">{sublabel}</span> : null}
      </label>
      <NumericFormat
        id={id}
        value={value}
        onValueChange={({ value: next }) => onChange(next)}
        decimalScale={decimalScale}
        allowNegative={false}
        allowLeadingZeros={false}
        decimalSeparator="."
        placeholder={placeholder}
        inputMode={decimalScale > 0 ? "decimal" : "numeric"}
        isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= max}
        className={`w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-base text-slate-50 tabular-nums outline-none transition placeholder:text-slate-600 focus:ring-2 ${
          error
            ? "border-rose-500/70 focus:border-rose-400 focus:ring-rose-500/20"
            : "border-slate-700 focus:border-sky-500 focus:ring-sky-500/20"
        }`}
      />
      {error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
