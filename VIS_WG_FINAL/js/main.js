import { loadAllData } from "./data.js";
import { initMap, updateMap } from "./map.js";
import { initLine, updateLine } from "./line.js";
import { initScatter, updateScatter } from "./scatter.js";

// --- DOM ---
const metricSelect = document.getElementById("metricSelect");
const yearSlider = document.getElementById("yearSlider");
const yearLabel = document.getElementById("yearLabel");
const resetBtn = document.getElementById("resetBtn");

// --- ESTADO ---
let featureCollection, dataByYear, years, districts, metrics;
let currentMetric = null;
let currentYear = null;
let selectedDistrict = null;
let brushRange = null; // [y0,y1] ou null

// --- Slider por índice (anos com dados) ---
let yearIndexMap = new Map();

function setYearLabel(y) {
  yearLabel.textContent = String(y);
}

function syncSliderToYear(year) {
  const idx = yearIndexMap.get(year);
  if (idx == null) return;
  yearSlider.value = String(idx);
  setYearLabel(year);
}

function yearFromSliderValue(val) {
  const idx = Math.max(0, Math.min(years.length - 1, Math.round(val)));
  return years[idx];
}

// --- Atualizações coordenadas ---
function applyState() {
  updateMap({ year: currentYear, metric: currentMetric, selectedDistrict });

  updateLine({
    dataByYear,
    years,
    metric: currentMetric,
    district: selectedDistrict,
    brushRange
  });

  updateScatter({
    dataByYear,
    years,
    districts,
    metric: currentMetric,
    brushRange,
    selectedDistrict,
    onSelectDistrict
  });
}

function onSelectDistrict(d) {
  selectedDistrict = d; // pode ser null
  applyState();
}

function onBrushChange(range) {
  brushRange = range; // null ou [y0,y1]
  applyState();
}

function resetAll() {
  selectedDistrict = null;
  brushRange = null;

  // volta ao último ano com dados
  currentYear = years[years.length - 1];
  syncSliderToYear(currentYear);

  // mantém a métrica selecionada (ou volta à primeira, se quiseres)
  // currentMetric = metrics[0];
  // metricSelect.value = currentMetric;

  applyState();
}

async function main() {
  const loaded = await loadAllData();
  featureCollection = loaded.featureCollection;
  dataByYear = loaded.dataByYear;
  years = loaded.years;
  districts = loaded.districts;
  metrics = loaded.metrics;

  if (!years.length) {
    console.error("Sem anos disponíveis.");
    return;
  }

  // --- Métricas ---
  metricSelect.innerHTML = "";
  metrics.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    metricSelect.appendChild(opt);
  });

  currentMetric = metrics[0];
  metricSelect.value = currentMetric;

  // --- Slider: apenas anos com dados (snap por índice) ---
  yearIndexMap = new Map(years.map((y, i) => [y, i]));

  yearSlider.min = "0";
  yearSlider.max = String(years.length - 1);
  yearSlider.step = "1";

  currentYear = years[years.length - 1];
  syncSliderToYear(currentYear);

  // --- Init viz (compatível com os teus módulos) ---
  initMap({
    featureCollection,
    csvDistricts: districts,
    csvDataByYear: dataByYear,
    onSelectDistrict
  });

  initLine({ onBrushChange });

  initScatter({ onSelectDistrict });

  // --- Handlers ---
  metricSelect.addEventListener("change", () => {
    currentMetric = metricSelect.value;
    applyState();
  });

  // slider “encaixa” sempre num ano real
  yearSlider.addEventListener("input", () => {
    currentYear = yearFromSliderValue(Number(yearSlider.value));
    setYearLabel(currentYear);
    applyState();
  });

  yearSlider.addEventListener("change", () => {
    currentYear = yearFromSliderValue(Number(yearSlider.value));
    syncSliderToYear(currentYear);
    applyState();
  });

  resetBtn.addEventListener("click", resetAll);

  // primeira render
  applyState();
}

main();
