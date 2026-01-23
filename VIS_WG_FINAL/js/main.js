// js/main.js
import { processData, metricLabels } from "./utils.js";
import { initMap, updateMap } from "./map.js";

const DATA_CSV = "data/housing_population_long.csv";
const MAP_FILE = "data/districts.topo.json"; // pode ser GeoJSON FeatureCollection OU TopoJSON

let dataByYear;
let years;
let metrics;

let selectedYear;
let selectedMetric;

function populateDropdowns(){
  const yearSelect = d3.select("#yearDropdown");
  yearSelect.selectAll("option")
    .data(years)
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  const metricSelect = d3.select("#metricDropdown");
  metricSelect.selectAll("option")
    .data(metrics)
    .join("option")
    .attr("value", d => d)
    .text(d => metricLabels[d] || d);

  // defaults
  selectedYear = years[years.length - 1];
  selectedMetric = "housing_per_1000";

  yearSelect.property("value", selectedYear);
  metricSelect.property("value", selectedMetric);

  yearSelect.on("change", (event) => {
    selectedYear = +event.target.value;
    updateMap(selectedYear, selectedMetric, dataByYear);
  });

  metricSelect.on("change", (event) => {
    selectedMetric = event.target.value;
    updateMap(selectedYear, selectedMetric, dataByYear);
  });
}

function asFeatureCollection(maybeTopoOrGeo){
  // Se vier em TopoJSON
  if (maybeTopoOrGeo && maybeTopoOrGeo.type === "Topology" && maybeTopoOrGeo.objects) {
    const objectName = Object.keys(maybeTopoOrGeo.objects)[0];
    const geo = topojson.feature(maybeTopoOrGeo, maybeTopoOrGeo.objects[objectName]);
    return geo;
  }
  // Se vier em GeoJSON FeatureCollection
  if (maybeTopoOrGeo && maybeTopoOrGeo.type === "FeatureCollection" && Array.isArray(maybeTopoOrGeo.features)) {
    return maybeTopoOrGeo;
  }
  throw new Error("Formato do mapa não suportado (esperado TopoJSON Topology ou GeoJSON FeatureCollection).");
}

function pickLatestYearFeatures(fc){
  // alguns ficheiros têm várias versões por 'properties.year'
  const withYear = fc.features.filter(f => f?.properties && (f.properties.year !== undefined));
  if (!withYear.length) return fc;

  const maxYear = d3.max(withYear, f => +f.properties.year);
  return {
    type: "FeatureCollection",
    features: withYear.filter(f => +f.properties.year === maxYear)
  };
}

Promise.all([
  d3.csv(DATA_CSV),
  d3.json(MAP_FILE)
]).then(([csvRows, mapRaw]) => {

  const processed = processData(csvRows);
  dataByYear = processed.dataByYear;
  years = processed.years;
  metrics = processed.metrics;

  const fc = pickLatestYearFeatures(asFeatureCollection(mapRaw));

  populateDropdowns();
  initMap(fc, dataByYear, selectedYear, selectedMetric);

}).catch(err => {
  console.error("Erro ao carregar o projeto:", err);
});
