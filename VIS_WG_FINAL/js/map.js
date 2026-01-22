import { state } from "./state.js";
import { fmtNumber1 } from "./utils.js";

function isLonLat(geo) {
  // tenta apanhar um ponto e perceber se está em graus ([-180..180], [-90..90])
  const f = geo?.features?.[0];
  const coords = f?.geometry?.coordinates;
  if (!coords) return true;

  // procura o primeiro par num nested array
  let c = coords;
  while (Array.isArray(c) && Array.isArray(c[0])) c = c[0];
  const pt = Array.isArray(c) ? c : null;
  if (!pt || pt.length < 2) return true;

  const x = +pt[0], y = +pt[1];
  // heurística: se está dentro de limites típicos de lon/lat
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

  // ✅ Projeção automática
  const projection = isLonLat(data.geo)
    ? d3.geoMercator().fitSize([width, height], data.geo)
    : d3.geoIdentity().reflectY(true).fitSize([width, height], data.geo);

  const path = d3.geoPath(projection);

  const [min, max] = data.globalDomains.housing_per_1000;
  const color = d3.scaleSequential()
    .domain([min, max])
    .interpolator(d3.interpolateBlues);

  const year = state.year;

  const valueByKey = new Map(
    data.rows
      .filter(d => d.year === year)
      .map(d => [d.district_key, d])
  );

  const g = svg.append("g");

  const paths = g.selectAll("path")
    .data(data.geo.features)
    .join("path")
    .attr("class", "district")
    .attr("d", path)
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

  // debug rápido (podes apagar depois)
  console.log("Map debug:", {
    features: data.geo.features.length,
    using: isLonLat(data.geo) ? "geoMercator" : "geoIdentity",
    sampleD: paths.size() ? (paths.nodes()[0].getAttribute("d") || "").slice(0, 60) : "no-paths"
  });
}
