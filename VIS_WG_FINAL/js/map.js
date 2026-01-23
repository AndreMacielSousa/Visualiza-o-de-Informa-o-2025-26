import { state } from "./state.js";
import { fmtNumber1 } from "./utils.js";

function normName(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function isLonLat(geo) {
  const f = geo?.features?.[0];
  const coords = f?.geometry?.coordinates;
  if (!coords) return true;
  let c = coords;
  while (Array.isArray(c) && Array.isArray(c[0])) c = c[0];
  const pt = Array.isArray(c) ? c : null;
  if (!pt || pt.length < 2) return true;
  const x = +pt[0], y = +pt[1];
  return Math.abs(x) <= 180 && Math.abs(y) <= 90;
}

export function drawMap(container, data) {
  const el = d3.select(container);
  el.selectAll("*").remove();

  const w = el.node()?.clientWidth ?? 0;
  const width = w > 0 ? w : 900;
  const height = 520;

  const svg = el.append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img");

  // projeção
  const projection = isLonLat(data.geo)
    ? d3.geoMercator().fitSize([width, height], data.geo)
    : d3.geoIdentity().reflectY(true).fitSize([width, height], data.geo);

  const path = d3.geoPath(projection);

  const [min, max] = data.globalDomains.housing_per_1000;
  const color = d3.scaleSequential()
    .domain([min, max])
    .interpolator(d3.interpolateBlues);

  const year = state.year;

  // lookup dos valores no ano atual
  const valueByKey = new Map(
    data.rows
      .filter(d => d.year === year)
      .map(d => [d.district_key, d])
  );

  const g = svg.append("g");

  // ✅ Garantir que temos sempre district_name + district_key no GeoJSON
  const baseFeatures = (data.geo.features || [])
    .filter(f => String(f?.properties?.dis_type ?? "").toLowerCase() === "district")
    .map(f => {
      const p = f.properties || {};
      const name = p.district_name ?? p.dis_name ?? p.dis_name_upper ?? p.dis_name_lower ?? p.name ?? "";
      const key = p.district_key ?? normName(name);
      return {
        ...f,
        properties: {
          ...p,
          district_name: name,
          district_key: key
        }
      };
    });

  // Debug: se isto der 1, tinhas o problema do undefined
  const distinctKeys = new Set(baseFeatures.map(f => f.properties.district_key));
  console.log("Map debug keys:", {
    featuresIn: data.geo.features.length,      // antes de filtrar
    featuresUsed: baseFeatures.length,         // depois de filtrar p/ distritos
    distinctDistricts: distinctKeys.size       // esperado: 18 (continente)
  });

  // ✅ Em vez de dissolver, escolhemos 1 feature por distrito (mais robusto)
const byCode = d3.group(baseFeatures, f => f.properties.district_code ?? f.properties.dis_code ?? f.properties.district_key);

// cria uma lista com 1 feature por distrito
const districts = Array.from(byCode, ([k, feats]) => feats[0]);

console.log("Map debug districts (chosen):", districts.map(d => d.properties.district_name));
console.log("Map debug paths count (should be 18):", districts.length);

// desenhar (18 paths)
const paths = g.selectAll("path")
  .data(districts)
  .join("path")
  
  console.log("DOM paths:", g.selectAll("path").size())

  .attr("class", "district")
  .attr("d", path)
  .attr("stroke", "white")
  .attr("stroke-width", 1)
  .attr("fill-opacity", 0.9)
  .attr("fill", d => {
    const k = d.properties.district_key;
    const row = valueByKey.get(k);
    return row && Number.isFinite(row.housing_per_1000)
      ? color(row.housing_per_1000)
      : "#1a1f2e";
  });

paths.append("title")
  .text(d => {
    const k = d.properties.district_key;
    const row = valueByKey.get(k);
    return row
      ? `${d.properties.district_name}\nHabitações/1000 hab.: ${fmtNumber1(row.housing_per_1000)}`
      : d.properties.district_name;
  });

  }

  /*
  // ✅ Dissolver por distrito
  const featuresByDistrict = d3.group(baseFeatures, d => d.properties.district_key);

  const districts = Array.from(featuresByDistrict, ([key, feats]) => ({
    type: "Feature",
    properties: feats[0].properties,
    geometry: {
      type: "MultiPolygon",
      coordinates: feats.flatMap(f =>
        f.geometry.type === "Polygon"
          ? [f.geometry.coordinates]
          : f.geometry.coordinates
      )
    }
  }));

  console.log("Map debug districts:", districts.map(d => d.properties.district_name));

  const paths = g.selectAll("path")
    .data(districts)
    .join("path")
    .attr("class", "district")
    .attr("d", path)
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("fill-opacity", 0.9)
    .attr("fill", d => {
      const k = d.properties.district_key;
      const row = valueByKey.get(k);
      return row && Number.isFinite(row.housing_per_1000)
        ? color(row.housing_per_1000)
        : "#1a1f2e";
    });

  paths.append("title")
    .text(d => {
      const k = d.properties.district_key;
      const row = valueByKey.get(k);
      return row
        ? `${d.properties.district_name}\nHabitações/1000 hab.: ${fmtNumber1(row.housing_per_1000)}`
        : d.properties.district_name;
    });
}
*/
