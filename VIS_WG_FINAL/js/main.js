/*
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


(async function () {
  const url = "data/districts.topo.json"; // pode continuar com este nome
  const resp = await fetch(url, { cache: "no-store" });
  console.log("GeoJSON status:", resp.status, resp.statusText);

  const geo = await resp.json();
  console.log("GeoJSON type:", geo.type);
  console.log("N features:", geo.features?.length);

  const p = geo.features?.[0]?.properties || {};
  console.log("Propriedades (feature 0):", Object.keys(p));
  console.log("Exemplo properties:", p);
})();

*/

import { loadData } from "./data.js";

(async function () {
  console.log("main.js carregou ✅");

  const d = await loadData();

  console.log("LOAD OK ✅", {
    geoFeatures: d.geo.features.length,
    csvRows: d.rows.length,
    years: [d.years[0], d.years[d.years.length - 1]],
    csvDistricts: d.districtKeys.length
  });

  console.log("Match check ✅", d.matchCheck);

  // Mostra exemplos para confirmar a chave
  console.log("Exemplo geo key:", d.geo.features[0]?.properties?.district_key, d.geo.features[0]?.properties?.district_name);
  console.log("Exemplo csv key:", d.rows[0]?.district_key, d.rows[0]?.district_name);
})();
