export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function fmtNumber(x) {
  if (!Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("pt-PT").format(x);
}

export function fmtNumber1(x) {
  if (!Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 1 }).format(x);
}

export function fmtPct(x) {
  if (!Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 1 }).format(x) + "%";
}

export function extentFinite(values) {
  const v = values.filter(Number.isFinite);
  return v.length ? [Math.min(...v), Math.max(...v)] : [0, 1];
}
