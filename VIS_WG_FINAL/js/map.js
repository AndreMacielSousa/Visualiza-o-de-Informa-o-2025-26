import { state } from "./state.js";
import { fmtNumber1 } from "./utils.js";

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

  const projection = isLonLat(data.geo)
    ? d3.geoMercator().fitSize([width, height], data.geo)
    : d3.geoIdentity().reflectY(true).fitSize([width, height], data.geo);

  const path = d3.geoPath(projection);

  const [min, max] = data.globalDomains.housing_per_1000;
  const color = d3.scaleSequential()
    .domain([min, max])
    .interpolator(d3.interpolateBlues);

  const year = state.year;

  // valores no ano selecionado
  const valueByKey = new Map(
    data.rows
      .filter(d => d.year === year)
      .map(d => [d.district_key, d])
  );

  const g = svg.append("g");

  // ✅ Em vez de "dissolver", escolhe 1 feature por distrito (mais robusto)
  // (o teu GeoJSON tem várias features por distrito; esta abordagem evita colapsos visuais)
  const byKey = d3.group(data.geo.features, f => f.properties.district_key);
  const districts = Array.from(byKey, ([k, feats]) => feats[0]);

  // Ordenar por área (maiores primeiro), para evitar que grandes tapem pequenos
  districts.sort((a, b) => d3.geoArea(b) - d3.geoArea(a));

  // DEBUG útil (podes remover depois)
  console.log("Map debug:", {
    featuresIn: data.geo.features.length,
    districts: districts.length
  });

  // ================================
  // CAMADA 1 — preenchimento
  // ================================
  const fillLayer = g.append("g").attr("class", "fill-layer");

  const fills = fillLayer.selectAll("path")
    .data(districts)
    .join("path")
    .attr("d", path)
    .attr("stroke", "#ffffff")     // ✅ contorno
    .attr("stroke-width", 1.2)       // ✅ mais grosso
    .attr("stroke-opacity", 0.9)     // ✅ visível
    .attr("fill-opacity", 0.75)
    .attr("fill", d => {
      const k = d.properties.district_key;
      const row = valueByKey.get(k);
      return row && Number.isFinite(row.housing_per_1000)
        ? color(row.housing_per_1000)
        : "#2a2a2a";
    });

  fills.append("title")
    .text(d => {
      const k = d.properties.district_key;
      const row = valueByKey.get(k);
      return row
        ? `${d.properties.district_name}\nHabitações/1000 hab.: ${fmtNumber1(row.housing_per_1000)}`
        : d.properties.district_name;
    });

  // ================================
  // CAMADA 2 — contornos (por cima, sempre visíveis)
  // ================================
  const outlineLayer = g.append("g").attr("class", "outline-layer");

  outlineLayer.selectAll("path")
    .data(districts)
    .join("path")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1.4)
    .attr("stroke-opacity", 0.9)
    .style("pointer-events", "none");
}
