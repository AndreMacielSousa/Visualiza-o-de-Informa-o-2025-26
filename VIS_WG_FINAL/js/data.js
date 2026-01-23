import { metricLabels } from "./utils.js";

export const FILES = {
  csv: "data/housing_population_long.csv",
  map: "data/districts.topo.json"
};

// CSV esperado:
// district_name, year, population, housing, housing_per_1000, housing_yoy_pct, population_yoy_pct, delta_growth
export function processData(rows) {
  const dataByYear = {};
  const ys = new Set();
  const ds = new Set();

  for (const r of rows) {
    const year = +r.year;
    const district = (r.district_name || "").trim();
    if (!district || !Number.isFinite(year)) continue;

    ys.add(year);
    ds.add(district);

    (dataByYear[year] ??= {})[district] = {
      population: +r.population,
      housing: +r.housing,
      housing_per_1000: +r.housing_per_1000,
      housing_yoy_pct: (r.housing_yoy_pct === "" || r.housing_yoy_pct == null) ? NaN : +r.housing_yoy_pct,
      population_yoy_pct: (r.population_yoy_pct === "" || r.population_yoy_pct == null) ? NaN : +r.population_yoy_pct,
      delta_growth: (r.delta_growth === "" || r.delta_growth == null) ? NaN : +r.delta_growth
    };
  }

  return {
    dataByYear,
    years: [...ys].sort((a, b) => a - b),
    districts: [...ds].sort((a, b) => a.localeCompare(b, "pt-PT")),
    metrics: Object.keys(metricLabels)
  };
}

export function asFeatureCollection(raw) {
  if (raw?.type === "Topology" && raw.objects) {
    const obj = Object.keys(raw.objects)[0];
    return topojson.feature(raw, raw.objects[obj]);
  }
  if (raw?.type === "FeatureCollection") return raw;
  throw new Error("Mapa: esperado Topology ou FeatureCollection");
}

// Se houver múltiplos anos em properties.year, escolhe o maior
export function pickLatestYearFeatures(fc) {
  const withYear = fc.features.filter(f => f?.properties && f.properties.year != null);
  if (!withYear.length) return fc;
  const maxYear = d3.max(withYear, f => +f.properties.year);
  return { type: "FeatureCollection", features: withYear.filter(f => +f.properties.year === maxYear) };
}
