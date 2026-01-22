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
*/

(async function () {
  const url = "data/districts.topo.json";
  const resp = await fetch(url, { cache: "no-store" });
  console.log("Topo status:", resp.status, resp.statusText);

  const topo = await resp.json();
  console.log("Topo type:", topo.type);
  console.log("Objects disponíveis:", Object.keys(topo.objects || {}));

  const firstObjKey = Object.keys(topo.objects || {})[0];
  console.log("Primeiro objeto:", firstObjKey);

  const geo = topojson.feature(topo, topo.objects[firstObjKey]);
  console.log("N features:", geo.features.length);

  const p = geo.features[0]?.properties || {};
  console.log("Propriedades (feature 0):", Object.keys(p));
  console.log("Exemplo properties:", p);
})();

