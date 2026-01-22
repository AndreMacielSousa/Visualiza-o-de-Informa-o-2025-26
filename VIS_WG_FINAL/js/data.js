import { extentFinite } from "./utils.js";

export async function loadData() {
  const [topo, rowsRaw] = await Promise.all([
    d3.json("data/districts.topo.json"),
    d3.csv("data/housing_population_long.csv", d3.autoType)
  ]);

  // TopoJSON -> GeoJSON (assume topo.objects.districts)
  const geo = topojson.feature(topo, topo.objects.districts);

  // Normalização básica + filtros
  const rows = rowsRaw
    .filter(d => d && d.district_id && Number.isFinite(d.year))
    .map(d => ({
      ...d,
      year: +d.year
    }));

  const years = Array.from(new Set(rows.map(d => d.year))).sort((a,b)=>a-b);

  // Índices (lookup rápido)
  const byDistrict = d3.group(rows, d => d.district_id);
  const byKey = new Map(rows.map(d => [`${d.district_id}|${d.year}`, d]));

  // Derivados se não existirem
  rows.forEach(d => {
    if (!Number.isFinite(d.housing_per_1000) &&
        Number.isFinite(d.housing) &&
        Number.isFinite(d.population) &&
        d.population !== 0) {
      d.housing_per_1000 = (d.housing / d.population) * 1000;
    }
  });

  // Variações e desvio (entre anos consecutivos disponíveis por distrito)
  for (const [id, series] of byDistrict.entries()) {
    const s = [...series].sort((a,b)=>a.year-b.year);
    for (let i=1; i<s.length; i++) {
      const prev = s[i-1], cur = s[i];

      if (!Number.isFinite(cur.housing_yoy_pct) &&
          Number.isFinite(prev.housing) &&
          Number.isFinite(cur.housing) &&
          prev.housing !== 0) {
        cur.housing_yoy_pct = ((cur.housing - prev.housing) / prev.housing) * 100;
      }

      if (!Number.isFinite(cur.population_yoy_pct) &&
          Number.isFinite(prev.population) &&
          Number.isFinite(cur.population) &&
          prev.population !== 0) {
        cur.population_yoy_pct = ((cur.population - prev.population) / prev.population) * 100;
      }

      if (!Number.isFinite(cur.delta_growth) &&
          Number.isFinite(cur.housing_yoy_pct) &&
          Number.isFinite(cur.population_yoy_pct)) {
        cur.delta_growth = cur.housing_yoy_pct - cur.population_yoy_pct;
      }
    }
  }

  const districtIds = Array.from(new Set(rows.map(d => d.district_id))).sort();

  // Domínios globais (fallback)
  const metrics = ["housing_per_1000", "housing_yoy_pct", "population_yoy_pct", "delta_growth"];
  const globalDomains = Object.fromEntries(metrics.map(m => {
    const vals = rows.map(r => r[m]).filter(Number.isFinite);
    return [m, extentFinite(vals)];
  }));

  return { geo, rows, byDistrict, byKey, years, districtIds, globalDomains };
}
