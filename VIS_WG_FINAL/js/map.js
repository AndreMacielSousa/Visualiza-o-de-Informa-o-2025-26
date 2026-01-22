import { state } from "./state.js";
import { fmtNumber1 } from "./utils.js";

export function drawMap(container, data) {
  const el = d3.select(container);
  el.selectAll("*").remove();

  // ⚠️ Se o container ainda não tiver largura calculada, usar fallback
  const w = el.node()?.clientWidth ?? 0;
  const width = w > 0 ? w : 900;
  const height = 520;

  const svg = el.append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img");

  const projection = d3.geoMercator().fitSize([width, height], data.geo);
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

  g.selectAll("path")
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
    })
    .append("title")
    .text(d => {
      const k = d.properties.district_key;
      const row = valueByKey.get(k);
      return row
        ? `${d.properties.district_name}\nHabitações/1000 hab.: ${fmtNumber1(row.housing_per_1000)}`
        : d.properties.district_name;
    });
}
