// js/line.js
// Série temporal simples (Portugal ou distrito fixo)

let svg, g;
let xScale, yScale;
let xAxisG, yAxisG, lineG;

const margin = { top: 20, right: 20, bottom: 40, left: 60 };

export function initLine(containerId) {
  const container = d3.select(containerId);
  container.selectAll("*").remove();

  const width = container.node().clientWidth || 800;
  const height = 300;

  svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "100%");

  g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  xScale = d3.scaleLinear().range([0, innerW]);
  yScale = d3.scaleLinear().range([innerH, 0]);

  xAxisG = g.append("g")
    .attr("transform", `translate(0,${innerH})`);

  yAxisG = g.append("g");

  lineG = g.append("path")
    .attr("fill", "none")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2);
}

export function updateLine(dataByYear, years, metric, district) {
  if (!svg) return;

  const series = years.map(y => {
    const v = dataByYear[y]?.[district]?.[metric];
    return { year: y, value: v };
  }).filter(d => d.value != null && !isNaN(d.value));

  if (series.length === 0) return;

  xScale.domain(d3.extent(series, d => d.year));
  yScale.domain(d3.extent(series, d => d.value));

  xAxisG.call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
  yAxisG.call(d3.axisLeft(yScale));

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value));

  lineG.datum(series)
    .attr("d", line);
}
