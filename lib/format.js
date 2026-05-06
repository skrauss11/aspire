export function money(value, options = {}) {
  const digits = options.digits ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(Number(value) || 0);
}

export function shortMoney(value) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(abs >= 1e10 ? 1 : 2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(abs >= 1e7 ? 1 : 2)}M`;
  if (abs >= 1e3) return `$${Math.round(n / 1e3)}k`;
  return money(n);
}

export function pct(value, digits = 1) {
  return `${(Number(value) || 0).toFixed(digits)}%`;
}

export function signedPct(value, digits = 1) {
  const n = Number(value) || 0;
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}
