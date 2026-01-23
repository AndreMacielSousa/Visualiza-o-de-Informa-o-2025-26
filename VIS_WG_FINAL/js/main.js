import { FILES, processData, asFeatureCollection, pickLatestYearFeatures } from "./data.js";
import { metricLabels } from "./utils.js";
import { initMap, updateMap } from "./map.js";
import { initLine, updateLine } from "./line.js";
import { initScatter, updateScatter } from "./scatter.js";

let years, metrics, districts, dataByYear, fc;

let state = {
  metric: "housing_per_1000",
  year: 2021,
  brush: null,
  selectedDistrict: null
};

function render() {
  updateMap({ year: state.year, metric: state.metric, selectedDistrict: state.selectedDistrict });

  const d = state.selectedDistrict || districts[0];
  updateLine({ dataByYear, years, metric: state.metric, district: d, brushRange: state.brush });

  updateScatter({
    dataByYear, years, districts, metric: state.metric,
    brushRange: state.brush,
    selectedDistrict: state.selectedDistrict,
    onSelectDistrict: (x) => { state.selectedDistrict = x; render(); }
  });
}

Promise.all([d3.csv(FILES.csv), d3.json(FILES.map)])
  .then(([csvRows, mapRaw]) => {
    const p = processData(csvRows);
    dataByYear = p.dataByYear;
    years = p.years;
    districts = p.districts;
    metrics = p.metrics;

    fc = pickLatestYearFeatures(asFeatureCollection(mapRaw));

    state.year = years[years.length - 1];
    state.brush = [years[0], years[years.length - 1]];

    // UI
    const metricSelect = d3.select("#metricSelect");
    metricSelect.selectAll("option")
      .data(metrics)
      .join("option")
      .attr("value", d => d)
      .text(d => metricLabels[d] || d);
    metricSelect.property("value", state.metric);

    const yearSlider = d3.select("#yearSlider");
    yearSlider
      .attr("min", years[0])
      .attr("max", years[years.length - 1])
      .property("value", state.year);
    d3.select("#yearLabel").text(state.year);

    metricSelect.on("change", (ev) => { state.metric = ev.target.value; render(); });
    yearSlider.on("input", (ev) => {
      state.year = +ev.target.value;
      d3.select("#yearLabel").text(state.year);
      render();
    });

    d3.select("#resetBtn").on("click", () => {
      state.metric = "housing_per_1000";
      state.year = years[years.length - 1];
      state.brush = [years[0], years[years.length - 1]];
      state.selectedDistrict = null;

      metricSelect.property("value", state.metric);
      yearSlider.property("value", state.year);
      d3.select("#yearLabel").text(state.year);

      render();
    });

    // Viz init
    initMap({
      featureCollection: fc,
      csvDistricts: districts,
      csvDataByYear: dataByYear,
      onSelectDistrict: (d) => { state.selectedDistrict = d; render(); }
    });

    initLine({
      onBrushChange: (r) => { state.brush = r; render(); }
    });

    initScatter({
      onSelectDistrict: (d) => { state.selectedDistrict = d; render(); }
    });

    render();
  })
  .catch(err => console.error("Erro ao carregar:", err));
