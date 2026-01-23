// js/line.js
import { formatValue, metricLabels } from "./utils.js";

let svg, g;
let xScale, yScale;
let xAxisG, yAxisG, gridG, lineG, dotG, titleG;

const margin = { top: 18, right: 18, bottom: 34, left: 58 };

function getSize(container){
  const el = container.node();
  const w = el?.clientWidth ?? 900;
  const h = el?.clientHeight ?? 320;
  return { w, h };
}

function yLabel(metric){
  return metricLabels[metric] || metric;
}

export function initLine(containerSelector){
  const container = d3.select(containerSelector);
  container.selectAll("*").remove();

  const { w, h } = getSize(container);

  svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${w} ${h}`);

  g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;

  xScale = d3.scaleLinear().range([0, innerW]);
  yScale = d3.scaleLinear().range([innerH, 0]);

  gridG = g.append("g").attr("class", "grid");
  xAxisG = g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`);
  yAxisG = g.append("g").attr("class", "axis");

  lineG = g.append("path").attr("class", "line");
  dotG = g.append("g");

  titleG = svg.append("text")
    .attr("class", "hint")
    .attr("x", 14)
    .attr("y", 16);
}

export function updateLine({ dataByYear, years, metric, districtName }) {
  if (!svg) initLine("#line-container");

  const container = d3.select("#line-container");
  const { w, h } = getSize(container);

  svg.attr("viewBox", `0 0 ${w} ${h}`);

  const innerW = w - margin.left - margin.right;
  const innerH = h - margin.top - margin.bottom;

  xScale.range([0, innerW]);
  yScale.range([innerH, 0]);

  const series = years.map(y => {
    const row = dataByYear[y]?.[districtName];
    const v = row ? row[metric] : NaN;
    return { year: y, value: v };
  }).filter(d => Number.isFinite(d.value));

  titleG.text(`${districtName} — ${yLabel(metric)}`);

  if (!series.length) {
    g.selectAll(".nodata").data([1]).join("text")
      .attr("class", "nodata hint")
      .attr("x", 0)
      .attr("y", 24)
      .text("Sem dados para esta métrica/distrito.");
    lineG.attr("d", null);
    dotG.selectAll("*").remove();
    gridG.selectAll("*").remove();
    xAxisG.selectAll("*").remove();
    yAxisG.selectAll("*").remove();
    return;
  } else {
    g.selectAll(".nodata").remove();
  }

  xScale.domain(d3.extent(series, d => d.year));

  const yExt = d3.extent(series, d => d.value);
  const pad = (yExt[1] - yExt[0]) * 0.08 || 1;
  yScale.domain([yExt[0] - pad, yExt[1] + pad]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(Math.min(10, series.length));
  const yAxis = d3.axisLeft(yScale).ticks(6);

  xAxisG.attr("transform", `translate(0,${innerH})`).call(xAxis);
  yAxisG.call(yAxis);

  const yGrid = d3.axisLeft(yScale).ticks(6).tickSize(-innerW).tickFormat("");
  gridG.call(yGrid);

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value));

  lineG.datum(series)
    .transition().duration(350)
    .attr("d", line);

  const dots = dotG.selectAll("circle")
    .data(series, d => d.year);

  const enter = dots.enter().append("circle")
    .attr("class", "dot")
    .attr("r", 3.6)
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.value));

  dots.merge(enter)
    .transition().duration(350)
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.value));

  dots.exit().remove();

  // tooltips nativos via title
  dotG.selectAll("circle").selectAll("title").remove();
  dotG.selectAll("circle").append("title")
    .text(d => `${d.year}: ${formatValue(metric, d.value)}`);
}
