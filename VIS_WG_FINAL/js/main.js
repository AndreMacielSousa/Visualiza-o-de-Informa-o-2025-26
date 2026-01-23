// js/main.js
import { processData, metricLabels } from "./utils.js";
import { initMap, updateMap } from "./map.js";
import { initLine, updateLine } from "./line.js";

const DATA_CSV = "data/housing_population_long.csv";
const MAP_FILE = "data/districts.topo.json"; // GeoJSON FeatureCollection OU TopoJSON

let dataByYear;
let years;
let metrics;

let selectedYear;
let selectedMetric;



// para já, distrito default (vamos ligar ao clique no mapa depois)
let selectedDistrict = "Lisboa";

function asFeatureCollection(maybeTopoOrGeo){
  if (maybeTopoOrGeo && maybeTopoOrGeo.type === "Topology" && maybeTopoOrGeo.objects) {
    const objectName = Object.keys(maybeTopoOrGeo.objects)[0];
    return topojson.feature(maybeTopoOrGeo, maybeTopoOrGeo.objects[objectName]);
  }
  if (maybeTopoOrGeo && maybeTopoOrGeo.type === "FeatureCollection" && Array.isArray(maybeTopoOrGeo.features)) {
    return maybeTopoOrGeo;
  }
  throw new Error("Mapa: esperado TopoJSON (Topology) ou GeoJSON (FeatureCollection).");
}

function pickLatestYearFeatures(fc){
  const withYear = fc.features.filter(f => f?.properties && (f.properties.year !== undefined));
  if (!withYear.length) return fc;
  const maxYear = d3.max(withYear, f => +f.properties.year);
  return { type: "FeatureCollection", features: withYear.filter(f => +f.properties.year === maxYear) };
}

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

  selectedYear = years[years.length - 1];
  selectedMetric = "housing_per_1000";

  // distrito default: se existir "Portugal", usa; senão "Lisboa"
  const row = dataByYear[selectedYear] || {};
  selectedDistrict = Object.prototype.hasOwnProperty.call(row, "Portugal") ? "Portugal" : "Lisboa";

  yearSelect.property("value", selectedYear);
  metricSelect.property("value", selectedMetric);

  yearSelect.on("change", (event) => {
    selectedYear = +event.target.value;
    updateMap(selectedYear, selectedMetric, dataByYear);

    updateLine({
      dataByYear,
      years,
      metric: selectedMetric,
      districtName: selectedDistrict
    });
  });

  metricSelect.on("change", (event) => {
    selectedMetric = event.target.value;
    updateMap(selectedYear, selectedMetric, dataByYear);

    updateLine({
      dataByYear,
      years,
      metric: selectedMetric,
      districtName: selectedDistrict
    });
  });
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

  initLine("#line-container");
  updateLine({
    dataByYear,
    years,
    metric: selectedMetric, 
    districtName: selectedDistrict
  });

}).catch(err => {
  console.error("Erro ao carregar o projeto:", err);
});
