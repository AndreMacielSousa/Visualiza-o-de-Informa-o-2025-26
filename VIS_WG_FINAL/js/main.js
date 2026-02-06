import { loadAllData } from "./data.js";
import { initMap, updateMap } from "./map.js";
import { initLine, updateLine } from "./line.js";
import { initScatter, updateScatter } from "./scatter.js";
import { metrics } from "./metrics.js";

// --- ESTADO ---
let featureCollection, districts, dataByYear;
let currentMetric = null;
let currentYear = null;
let selectedDistrict = null;
let brushedRange = null; // [y0,y1] ou null

// --- DOM ---
const metricSelect = document.getElementById("metricSelect");
const yearSlider = document.getElementById("yearSlider");
const yearLabel = document.getElementById("yearLabel");
const resetBtn = document.getElementById("resetBtn");

// --- ANOS DISPONÍVEIS (com dados) ---
let availableYears = [];   // ex: [1940, 1950, 1960, 1981, ...]
let yearIndexMap = new Map(); // ano -> index
let sliderMin = 0;
let sliderMax = 0;

function setYearLabel(y) {
  yearLabel.textContent = y;
}

// Snap helper: recebe um "valor contínuo" e devolve o ano real mais próximo
function nearestAvailableYear(val) {
  // val é índice (0..N-1)
  const idx = Math.max(sliderMin, Math.min(sliderMax, Math.round(val)));
  return availableYears[idx];
}

function syncSliderToYear(year) {
  const idx = yearIndexMap.get(year);
  if (idx == null) return;
  yearSlider.value = String(idx);
  setYearLabel(year);
}

function applyState() {
  updateMap({ year: currentYear, metric: currentMetric, selectedDistrict });
  updateLine({ metric: currentMetric, selectedDistrict, brushedRange });
  updateScatter({ metric: currentMetric, selectedDistrict, brushedRange });
}

function clearAll() {
  selectedDistrict = null;
  brushedRange = null;
  // volta ao último ano disponível por defeito
  currentYear = availableYears[availableYears.length - 1];
  syncSliderToYear(currentYear);
  applyState();
}

function onSelectDistrict(d) {
  selectedDistrict = d; // pode ser null
  applyState();
}

function onBrush(range) {
  // range: null ou [anoInicial, anoFinal]
  brushedRange = range;
  applyState();
}

async function main() {
  // --- LOAD ---
  const loaded = await loadAllData();
  featureCollection = loaded.featureCollection;
  districts = loaded.districts;
  dataByYear = loaded.dataByYear;

  // --- AVAILABLE YEARS ---
  // dataByYear é tipicamente um objeto { "1940": {...}, "1950": {...}, ... }
  availableYears = Object.keys(dataByYear)
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  if (availableYears.length === 0) {
    console.error("Sem anos disponíveis em dataByYear.");
    return;
  }

  yearIndexMap = new Map(availableYears.map((y, i) => [y, i]));
  sliderMin = 0;
  sliderMax = availableYears.length - 1;

  // configurar slider para trabalhar por ÍNDICE, não por ano
  yearSlider.min = String(sliderMin);
  yearSlider.max = String(sliderMax);
  yearSlider.step = "1";

  // --- METRICS ---
  // mantém a vossa lista (metrics.js) ou fallback para keys
  const metricList = Array.isArray(metrics) && metrics.length
    ? metrics
    : Object.keys(availableYears.length ? (dataByYear[String(availableYears[0])] || {}) : {});

  metricSelect.innerHTML = "";
  metricList.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    metricSelect.appendChild(opt);
  });

  currentMetric = metricList[0];
  metricSelect.value = currentMetric;

  // ano default = último com dados
  currentYear = availableYears[availableYears.length - 1];
  syncSliderToYear(currentYear);

  // --- INIT VIZ ---
  initMap({
    featureCollection,
    csvDistricts: districts,
    csvDataByYear: dataByYear,
    onSelectDistrict
  });

  initLine({
    containerId: "#line-container",
    districts,
    dataByYear,
    metric: currentMetric,
    onBrush
  });

  initScatter({
    containerId: "#scatter-container",
    districts,
    dataByYear,
    metric: currentMetric,
    onSelectDistrict
  });

  // --- HANDLERS ---
  metricSelect.addEventListener("change", () => {
    currentMetric = metricSelect.value;
    applyState();
  });

  // SNAP: sempre que mexe, traduz índice->ano disponível
  yearSlider.addEventListener("input", () => {
    currentYear = nearestAvailableYear(Number(yearSlider.value));
    setYearLabel(currentYear);
    applyState();
  });

  // (opcional) garante que ao largar o slider fica “certinho”
  yearSlider.addEventListener("change", () => {
    currentYear = nearestAvailableYear(Number(yearSlider.value));
    syncSliderToYear(currentYear);
    applyState();
  });

  resetBtn.addEventListener("click", clearAll);

  // primeira render
  applyState();
}

main();
