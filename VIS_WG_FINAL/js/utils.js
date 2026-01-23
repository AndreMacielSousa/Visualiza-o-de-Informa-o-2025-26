export const metricLabels = {
  population: "População",
  housing: "N.º de habitações",
  housing_per_1000: "Habitações por 1000 hab.",
  housing_yoy_pct: "Variação habitações (%)",
  population_yoy_pct: "Variação população (%)",
  delta_growth: "Diferença de crescimento (%)"
};

export function formatValue(metric, v) {
  if (v == null || Number.isNaN(v)) return "—";
  if (metric === "housing_per_1000") return (+v).toFixed(1);
  if (metric.endsWith("_yoy_pct") || metric === "delta_growth") return `${(+v).toFixed(1)}%`;
  return Math.round(+v).toLocaleString("pt-PT");
}

export function norm(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

// Resolve diferenças entre nomes no CSV e no mapa (inclui Açores/Madeira)
export function buildNameResolver(csvNames) {
  const m = new Map(csvNames.map(n => [norm(n), n]));

  const aliases = new Map([
    ["acores", "Açores"],
    ["regiao autonoma dos acores", "Açores"],
    ["regiao autonoma da madeira", "Madeira"],
    ["madeira", "Madeira"]
  ]);

  return {
    resolve(nameFromGeo) {
      const k = norm(nameFromGeo);
      if (aliases.has(k) && m.has(norm(aliases.get(k)))) return aliases.get(k);
      if (m.has(k)) return m.get(k);

      // fallback suave (prefixos)
      for (const [kk, orig] of m.entries()) {
        if (kk.startsWith(k) || k.startsWith(kk)) return orig;
      }
      return nameFromGeo;
    }
  };
}
