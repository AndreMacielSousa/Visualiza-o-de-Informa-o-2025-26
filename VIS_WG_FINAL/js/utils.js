// js/utils.js

export const metricLabels = {
  population: "População",
  housing: "N.º de habitações",
  housing_per_1000: "Habitações por 1000 hab.",
  housing_yoy_pct: "Variação habitações (%)",
  population_yoy_pct: "Variação população (%)",
  delta_growth: "Diferença de crescimento (%)"
};

// CSV esperado (colunas):
// district_name, year, population, housing, housing_per_1000, housing_yoy_pct, population_yoy_pct, delta_growth
export function processData(rows){
  const dataByYear = {};
  const yearsSet = new Set();

  for (const r of rows){
    const year = +r.year;
    const district = (r.district_name || "").trim();

    yearsSet.add(year);
    if (!dataByYear[year]) dataByYear[year] = {};

    dataByYear[year][district] = {
      population: +r.population,
      housing: +r.housing,
      housing_per_1000: +r.housing_per_1000,
      housing_yoy_pct: (r.housing_yoy_pct === "" || r.housing_yoy_pct == null) ? NaN : +r.housing_yoy_pct,
      population_yoy_pct: (r.population_yoy_pct === "" || r.population_yoy_pct == null) ? NaN : +r.population_yoy_pct,
      delta_growth: (r.delta_growth === "" || r.delta_growth == null) ? NaN : +r.delta_growth
    };
  }

  const years = Array.from(yearsSet).sort((a,b) => a - b);
  const metrics = Object.keys(metricLabels);

  return { dataByYear, years, metrics };
}

export function formatValue(metric, v){
  if (v == null || Number.isNaN(v)) return "—";
  if (metric === "housing_per_1000") return (+v).toFixed(1);
  if (metric.endsWith("_yoy_pct") || metric === "delta_growth") return `${(+v).toFixed(1)}%`;
  return Math.round(+v).toLocaleString("pt-PT");
}

export function norm(s){
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}
