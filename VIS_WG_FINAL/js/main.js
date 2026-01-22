import { loadData } from "./data.js";

(async function () {
  console.log("main.js carregou ✅");

  const data = await loadData();
  console.log("DADOS OK ✅", {
    distritosNoMapa: data.geo.features.length,
    linhasCSV: data.rows.length,
    anos: [data.years[0], data.years[data.years.length - 1]],
    distritosCSV: data.districtIds.length
  });
})();
