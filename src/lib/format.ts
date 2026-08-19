export function pct(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

/** Percentage-point gap, always sign-prefixed. */
export function signedPp(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}pp`;
}

/** Relative gap, already in percent, always sign-prefixed. */
export function signedPct(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function signedNumber(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}
