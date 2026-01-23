// js/map.js
import { formatValue, metricLabels, norm } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";

let svg;
let gMap;
let gOutline;
let projection;
let geoPath;

let currentYear;
let currentMetric;
let currentGeo;
let currentDataByYear;

function getName(f){
  // No teu ficheiro vem tipicamente como dis_name (para distritos + regiões autónomas)
  return f?.properties?.dis_name
      || f?.properties?.NAME_1
      || f?.properties?.Distrito
      || f?.properties?.name
      || f?.properties?.NOME
      || "";
}

function buildKeyMap(dataByYear, year){
  // mapeia nomes normalizados -> nome original do CSV (para robustez: acentos, espaços)
  const map = new Map();
  const row = dataByYear[year] || {};
  for (const k of Object.keys(row)){
    map.set(norm(k), k);
  }
  return map;
}

function makeColorScale(values, metric){
  // se percentuais (pode ter negativos), usa divergente
  const hasNeg = values.some(v => v < 0);
  if (metric.endsWith("_yoy_pct") || metric === "delta_growth"){
    const maxAbs = d3.max(values.map(v => Math.abs(v))) || 1;
    return d3.scaleDiverging()
      .domain([-maxAbs, 0, maxAbs])
      .interpolator(d3.interpolateRdBu);
  }
  // restantes: sequencial por classes (bom contraste)
  return d3.scaleQuantile()
    .domain(values)
    .range(d3.schemeBlues[7]);
}

function drawLegend(scale, metric){
  const host = d3.select("#legend-container");
  host.selectAll("*").remove();

  const w = host.node()?.clientWidth ?? 800;
  const h = 56;

  const s = host.append("svg")
    .attr("width", "100%")
    .attr("height", h)
    .attr("viewBox", `0 0 ${w} ${h}`);

  s.append("text")
    .attr("x", 8)
    .attr("y", 14)
    .attr("fill", "rgba(255,255,255,.85)")
    .attr("font-size", 12)
    .text(metricLabels[metric] || metric);

  const isDiv = typeof scale.interpolator === "function" && scale.domain().length === 3;

  if (isDiv){
    // divergente: gradiente
    const defs = s.append("defs");
    const grad = defs.append("linearGradient")
      .attr("id", "grad")
      .attr("x1", "0%").attr("x2", "100%")
      .attr("y1", "0%").attr("y2", "0%");
    const stops = d3.range(0, 1.0001, 0.1);
    stops.forEach(t => {
      grad.append("stop").attr("offset", (t*100)+"%").attr("stop-color", scale(scale.domain()[0]*(1-t)+scale.domain()[2]*t));
    });

    s.append("rect")
      .attr("x", 8).attr("y", 22)
      .attr("width", Math.max(240, w-16))
      .attr("height", 14)
      .attr("fill", "url(#grad)")
      .attr("rx", 7);

    const [a, , c] = scale.domain();
    s.append("text").attr("x", 8).attr("y", 52).attr("fill","rgba(255,255,255,.7)").attr("font-size", 11).text(formatValue(metric, a));
    s.append("text").attr("x", w/2).attr("y", 52).attr("text-anchor","middle").attr("fill","rgba(255,255,255,.7)").attr("font-size", 11).text("0");
    s.append("text").attr("x", w-8).attr("y", 52).attr("text-anchor","end").attr("fill","rgba(255,255,255,.7)").attr("font-size", 11).text(formatValue(metric, c));
    return;
  }

  // quantile: caixas
  const colors = scale.range();
  const boxW = 26, boxH = 14, gap = 6;
  const startX = 8, y = 24;

  colors.forEach((c, i) => {
    s.append("rect")
      .attr("x", startX + i*(boxW+gap))
      .attr("y", y)
      .attr("width", boxW)
      .attr("height", boxH)
      .attr("rx", 4)
      .attr("fill", c)
      .attr("stroke", "rgba(255,255,255,.18)");
  });

  // rótulos min/max
  const ext = d3.extent(scale.domain());
  s.append("text").attr("x", startX).attr("y", 52).attr("fill","rgba(255,255,255,.7)").attr("font-size", 11).text(formatValue(metric, ext[0]));
  s.append("text").attr("x", startX + (colors.length-1)*(boxW+gap) + boxW).attr("y", 52).attr("text-anchor","end").attr("fill","rgba(255,255,255,.7)").attr("font-size", 11).text(formatValue(metric, ext[1]));
}

function render(){
  const yearData = currentDataByYear[currentYear] || {};
  const keyMap = buildKeyMap(currentDataByYear, currentYear);

  // obter valores para escala (só distritos com valor)
  const vals = [];
  for (const k of Object.keys(yearData)){
    const v = yearData[k]?.[currentMetric];
    if (Number.isFinite(v)) vals.push(v);
  }

  const color = makeColorScale(vals.length ? vals : [0,1], currentMetric);
  drawLegend(color, currentMetric);

  // ordenar por área (evita tapar pequenos)
  const feats = [...currentGeo.features].sort((a,b) => d3.geoArea(b) - d3.geoArea(a));

  const paths = gMap.selectAll("path")
    .data(feats, d => getName(d));

  const pathsEnter = paths.enter().append("path")
    .attr("class", "district")
    .attr("d", geoPath)
    .attr("fill-opacity", 0.85)
    .attr("stroke", "rgba(255,255,255,.65)")
    .attr("stroke-width", 1.2)
    .on("mouseover", function(event, d){
      d3.select(this).attr("stroke", "rgba(255,255,255,.95)").attr("stroke-width", 2.0);

      const nameGeo = getName(d);
      const nameCsv = keyMap.get(norm(nameGeo)) || nameGeo;
      const v = yearData?.[nameCsv]?.[currentMetric];

      const label = metricLabels[currentMetric] || currentMetric;
      const html = `<div style="font-weight:700;margin-bottom:2px;">${nameGeo}</div>
                    <div style="color:rgba(255,255,255,.85)">${label}: <span style="font-weight:700">${formatValue(currentMetric, v)}</span></div>
                    <div style="margin-top:4px;color:rgba(255,255,255,.65)">Ano: ${currentYear}</div>`;
      showTooltip(html);
      moveTooltip(event.pageX, event.pageY);
    })
    .on("mousemove", function(event){
      moveTooltip(event.pageX, event.pageY);
    })
    .on("mouseout", function(){
      d3.select(this).attr("stroke", "rgba(255,255,255,.65)").attr("stroke-width", 1.2);
      hideTooltip();
    });

  paths.merge(pathsEnter)
    .transition().duration(350)
    .attr("d", geoPath)
    .attr("fill", d => {
      const nameGeo = getName(d);
      const nameCsv = keyMap.get(norm(nameGeo)) || nameGeo;
      const v = yearData?.[nameCsv]?.[currentMetric];
      return Number.isFinite(v) ? color(v) : "rgba(255,255,255,.08)";
    });

  paths.exit().remove();

  // contornos por cima (camada separada para legibilidade)
  const outlines = gOutline.selectAll("path")
    .data(feats, d => getName(d));

  outlines.enter().append("path")
    .attr("d", geoPath)
    .attr("fill", "none")
    .attr("stroke", "rgba(0,0,0,.45)")
    .attr("stroke-width", 1.0)
    .style("pointer-events", "none")
    .merge(outlines)
    .attr("d", geoPath);

  outlines.exit().remove();
}

export function initMap(geoFeatureCollection, dataByYear, initialYear, initialMetric){
  currentGeo = geoFeatureCollection;
  currentDataByYear = dataByYear;
  currentYear = initialYear;
  currentMetric = initialMetric;

  const container = d3.select("#map-container");
  container.selectAll("*").remove();

  const w = container.node()?.clientWidth ?? 900;
  const h = container.node()?.clientHeight ?? 560;

  svg = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${w} ${h}`);

  // Fit projection ao mapa (inclui ilhas)
  projection = d3.geoMercator().fitSize([w, h], currentGeo);
  geoPath = d3.geoPath(projection);

  gMap = svg.append("g").attr("class", "map-layer");
  gOutline = svg.append("g").attr("class", "outline-layer");

  render();

  // responsivo (redraw no resize)
  window.addEventListener("resize", () => {
    const w2 = container.node()?.clientWidth ?? w;
    const h2 = container.node()?.clientHeight ?? h;
    svg.attr("viewBox", `0 0 ${w2} ${h2}`);
    projection.fitSize([w2, h2], currentGeo);
    geoPath = d3.geoPath(projection);
    render();
  }, { passive: true });
}

export function updateMap(year, metric, dataByYear){
  currentYear = year;
  currentMetric = metric;
  currentDataByYear = dataByYear;
  render();
}
