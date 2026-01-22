import { state } from "./state.js";
import { fmtNumber1 } from "./utils.js";

/**
 * Desenha o mapa coroplético dos distritos
 * @param {*} container CSS selector
 * @param {*} data objeto devolvido por loadData()
 */
export function drawMap(container, data) {
  const el = d3.select(container);
  el.selectAll("*").remove(); // limpa render anterior

  const width = el.node().clientWidth;
  const height = 520;

  const svg = el.append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("role", "img");

  // Projeção centrada em Portugal
  const projection = d3.geoMercator()
    .fitSize([width, height], data.geo);

  const path = d3.geoPath(projection);

  // Escala de cor (sequencial)
  const [min, max] = data.globalDomains.housing_per_1000;
  const color = d3.scaleSequential()
    .domain([min, max])
    .interpolator(d3.interpolateBlues);

  // Grupo principal
  const g = svg.append("g");

  // Ano atual (estado)
  const year = state.year;

  // Lookup rápido: district_key + year
  const valueByKey = new Map(
    data.rows
      .filter(d => d.year === year)
      .map(d => [d.district_key, d])
  );

  // Desenhar distritos
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
        ? `${d.properties.district_name}
Habitações/1000 hab.: ${fmtNumber1(row.housing_per_1000)}`
        : d.properties.district_name;
    });

  // Contorno exterior (opcional, ajuda leitura)
  svg.append("path")
    .datum(data.geo)
    .attr("fill", "none")
    .attr("stroke", "rgba(255,255,255,.25)")
    .attr("stroke-width", 0.6)
    .attr("d", path);
}
