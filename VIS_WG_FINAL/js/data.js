import { metricLabels } from "./utils.js";

export const FILES = {
  csv: "data/housing_population_long.csv",
  map: "data/georef-portugal-distrito-millesime.geojson"
};

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

// Filtra para manter apenas a geometria mais recente de cada distrito
export function pickLatestYearFeatures(fc) {
  if (!fc || !fc.features) return fc;

  // Tenta detetar qual é a propriedade que guarda o ano ou data
  const sample = fc.features.find(f => f.properties);
  let yearKey = "year";
  
  // Fallbacks comuns em ficheiros Opendatasoft/GeoJSON
  if (sample && sample.properties) {
    if ("year" in sample.properties) yearKey = "year";
    else if ("millesime" in sample.properties) yearKey = "millesime";
    else if ("op_millesime" in sample.properties) yearKey = "op_millesime";
    else if ("annee" in sample.properties) yearKey = "annee";
  }

  // Se não encontrar propriedade de ano, retorna tudo (pode causar sobreposição, mas é o fallback)
  const withYear = fc.features.filter(f => f.properties && f.properties[yearKey] != null);
  
  if (!withYear.length) {
    console.warn("Aviso: Não foi possível filtrar o mapa por ano. A usar todas as geometrias.");
    return fc;
  }

  // Converte para número e encontra o máximo (ano mais recente)
  const maxYear = d3.max(withYear, f => parseInt(f.properties[yearKey], 10));
  console.log(`Mapa: A filtrar pelo ano mais recente detetado: ${maxYear} (propriedade: ${yearKey})`);

  return { 
    type: "FeatureCollection", 
    features: withYear.filter(f => parseInt(f.properties[yearKey], 10) === maxYear) 
  };
}