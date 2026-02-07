import { initTheme, resetTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { loadAllData } from "./data.js";
import { initMap, updateMap } from "./map.js";
import { initLine, updateLine, clearBrush } from "./line.js";
import { initScatter, updateScatter } from "./scatter.js";
import { metricLabels } from "./utils.js";
import { initAccentColor, resetAccentColor } from "./color.js";

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
let brushRange = null;

// Slider por índice (anos com dados)
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

function applyState() {
  updateMap({
    year: currentYear,
    metric: currentMetric,
    selectedDistrict,
  });

  updateLine({
    dataByYear,
    years,
    metric: currentMetric,
    district: selectedDistrict,
    brushRange,
  });

  updateScatter({
    dataByYear,
    years,
    districts,
    metric: currentMetric,
    brushRange,
    currentYear,
    selectedDistrict,
    onSelectDistrict,
  });
}

function onSelectDistrict(d) {
  selectedDistrict = d;
  applyState();
}

function onBrushChange(range) {
  brushRange = range;
  applyState();
}

function resetAll() {
  selectedDistrict = null;
  brushRange = null;

  currentMetric = metrics[0];
  metricSelect.value = currentMetric;

  currentYear = years[years.length - 1];
  syncSliderToYear(currentYear);

  clearBrush();
  resetAccentColor();
  resetTheme();

  applyState();
}

async function main() {
  initTheme();
  initNav();

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

  // Métricas (PT-PT)
  metricSelect.innerHTML = "";
  metrics.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = metricLabels[m] || m;
    metricSelect.appendChild(opt);
  });

  currentMetric = metrics[0];
  metricSelect.value = currentMetric;

  // Slider por índice (anos com dados)
  yearIndexMap = new Map(years.map((y, i) => [y, i]));
  yearSlider.min = "0";
  yearSlider.max = String(years.length - 1);
  yearSlider.step = "1";

  currentYear = years[years.length - 1];
  syncSliderToYear(currentYear);

  // Init viz
  initMap({
    featureCollection,
    csvDistricts: districts,
    csvDataByYear: dataByYear,
    onSelectDistrict,
  });

  initLine({ onBrushChange });
  initScatter({ onSelectDistrict });

  initAccentColor(() => applyState());

  metricSelect.addEventListener("change", () => {
    currentMetric = metricSelect.value;
    applyState();
  });

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

  applyState();
}

main();
