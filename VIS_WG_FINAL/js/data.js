import { extentFinite } from "./utils.js";

/**
 * Normaliza nomes para garantir match entre GeoJSON e CSV:
 * - minúsculas
 * - remove acentos
 * - remove espaços extra
 */
function normName(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // remove diacríticos
    .replace(/\s+/g, " ");           // espaços múltiplos -> 1
}

export async function loadData() {
  // NOTA: apesar do nome, este ficheiro é GeoJSON (FeatureCollection)
  const [geoRaw, rowsRaw] = await Promise.all([
    d3.json("data/districts.topo.json"),
    d3.csv("data/housing_population_long.csv", d3.autoType)
  ]);

  // 1) Validar GeoJSON
  if (!geoRaw || geoRaw.type !== "FeatureCollection") {
    throw new Error("O ficheiro do mapa não é GeoJSON FeatureCollection.");
  }

  // 2) Filtrar apenas distritos (se existir dis_type)
  const hasDisType = geoRaw.features?.[0]?.properties?.dis_type !== undefined;
  const geo = {
    type: "FeatureCollection",
    features: (geoRaw.features || []).filter(f => {
      if (!hasDisType) return true;
      return String(f.properties?.dis_type).toLowerCase() === "district";
    })
  };

  // 3) Preparar CSV: garantir nomes esperados e criar chave normalizada
  const rows = (rowsRaw || [])
    .filter(d => d && d.district_name && Number.isFinite(d.year))
    .map(d => ({
      ...d,
      year: +d.year,
      district_key: normName(d.district_name)
    }));

  // 4) Preparar GeoJSON: chave normalizada a partir de dis_name (ou fallback)
  geo.features.forEach(f => {
    const p = f.properties || {};
    const name = p.dis_name ?? p.dis_name_upper ?? p.dis_name_lower ?? p.name ?? p.Distrito ?? "";
    f.properties = {
      ...p,
      district_name: name,
      district_key: normName(name),
      // mantém dis_code se quiseres usar mais tarde
      district_code: p.dis_code ?? null
    };
  });

  // 5) Índices para lookup rápido
  const years = Array.from(new Set(rows.map(d => d.year))).sort((a, b) => a - b);
  const districtKeys = Array.from(new Set(rows.map(d => d.district_key))).sort();

  const byDistrictKey = d3.group(rows, d => d.district_key);
  const byKeyYear = new Map(rows.map(d => [`${d.district_key}|${d.year}`, d]));

  // 6) Se alguns derivados estiverem em falta, tenta calcular housing_per_1000
  rows.forEach(d => {
    if (!Number.isFinite(d.housing_per_1000) &&
        Number.isFinite(d.housing) &&
        Number.isFinite(d.population) &&
        d.population !== 0) {
      d.housing_per_1000 = (d.housing / d.population) * 1000;
    }
  });

  // 7) Domínios globais (fallback)
  const metrics = ["housing_per_1000", "housing_yoy_pct", "population_yoy_pct", "delta_growth"];
  const globalDomains = Object.fromEntries(metrics.map(m => {
    const vals = rows.map(r => r[m]).filter(Number.isFinite);
    return [m, extentFinite(vals)];
  }));

  // 8) Validação de match (muito útil agora)
  const geoKeys = new Set(geo.features.map(f => f.properties.district_key));
  const csvKeys = new Set(districtKeys);

  const inGeoNotCsv = Array.from(geoKeys).filter(k => !csvKeys.has(k));
  const inCsvNotGeo = Array.from(csvKeys).filter(k => !geoKeys.has(k));

  return {
    geo,
    rows,
    years,
    districtKeys,
    byDistrictKey,
    byKeyYear,
    globalDomains,
    // diagnóstico de correspondência
    matchCheck: {
      geoCount: geo.features.length,
      csvCount: districtKeys.length,
      inGeoNotCsv,
      inCsvNotGeo
    }
  };
}
