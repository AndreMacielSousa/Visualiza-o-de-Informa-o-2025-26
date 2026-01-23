// js/map.js
// Nota: mapa como base (o coroplético será afinado mais tarde)
import { formatValue, metricLabels, norm } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";

let svg, gMap;
let projection, geoPath;

let currentGeo;
let currentDataByYear;
let currentYear;
let currentMetric;

function getName(f){
  return f?.properties?.dis_name
      || f?.properties?.NAME_1
      || f?.properties?.Distrito
      || f?.properties?.name
      || f?.properties?.NOME
      || "";
}

function buildKeyMap(dataByYear, year){
  const map = new Map();
  const row = dataByYear[year] || {};
  for (const k of Object.keys(row)) map.set(norm(k), k);
  return map;
}

function renderBase(){
  const yearData = currentDataByYear[currentYear] || {};
  const keyMap = buildKeyMap(currentDataByYear, currentYear);

  const feats = [...currentGeo.features].sort((a,b) => d3.geoArea(b) - d3.geoArea(a));

  const paths = gMap.selectAll("path")
    .data(feats, d => getName(d));

  const enter = paths.enter().append("path")
    .attr("class", "district")
    .attr("d", geoPath)
    .attr("fill", "rgba(70,120,255,.22)")
    .attr("stroke", "rgba(255,255,255,.75)")
    .attr("stroke-width", 1.2)
    .on("mouseover", function(event, d){
      d3.select(this).attr("stroke-width", 2.0);

      const nameGeo = getName(d);
      const nameCsv = keyMap.get(norm(nameGeo)) || nameGeo;
      const v = yearData?.[nameCsv]?.[currentMetric];

      const label = metricLabels[currentMetric] || currentMetric;
      showTooltip(`<strong>${nameGeo}</strong><br>${label}: <strong>${formatValue(currentMetric, v)}</strong><br><span style="color:rgba(255,255,255,.7)">Ano: ${currentYear}</span>`);
      moveTooltip(event.pageX, event.pageY);
    })
    .on("mousemove", (event) => moveTooltip(event.pageX, event.pageY))
    .on("mouseout", function(){
      d3.select(this).attr("stroke-width", 1.2);
      hideTooltip();
    });

  paths.merge(enter).attr("d", geoPath);
  paths.exit().remove();
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

  projection = d3.geoMercator().fitSize([w, h], currentGeo);
  geoPath = d3.geoPath(projection);

  gMap = svg.append("g").attr("class", "map-layer");

  renderBase();

  window.addEventListener("resize", () => {
    const w2 = container.node()?.clientWidth ?? w;
    const h2 = container.node()?.clientHeight ?? h;
    svg.attr("viewBox", `0 0 ${w2} ${h2}`);
    projection.fitSize([w2, h2], currentGeo);
    geoPath = d3.geoPath(projection);
    renderBase();
  }, { passive: true });
}

export function updateMap(year, metric, dataByYear){
  currentYear = year;
  currentMetric = metric;
  currentDataByYear = dataByYear;
  renderBase();
}
