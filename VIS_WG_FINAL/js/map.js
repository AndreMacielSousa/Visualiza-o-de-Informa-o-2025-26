import { metricLabels, formatValue, buildNameResolver } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";
import { renderLegend } from "./legend.js";

let svg, fc, dataByYear, resolver;

// Grupos por região
let gMain, gAz, gMad;

function geoName(f) {
  return f?.properties?.dis_name
    || f?.properties?.NAME_1
    || f?.properties?.Distrito
    || f?.properties?.name
    || f?.properties?.NOME
    || f?.properties?.dis_name_upper
    || "";
}

// --- CORREÇÃO ROBUSTA DE GEOMETRIA ---
// Verifica se o D3 acha que o polígono é o "globo inteiro" (Area > 2*PI) e inverte anéis.
function fixInvertedGeometry(featureCollection) {
  if (!featureCollection?.features) return 0;

  let fixedCount = 0;

  featureCollection.features.forEach(f => {
    const geom = f.geometry;
    if (!geom) return;

    const reversePoly = (coords) => coords.forEach(ring => ring.reverse());

    if (d3.geoArea(f) > 2 * Math.PI) {
      fixedCount++;
      if (geom.type === "Polygon") {
        reversePoly(geom.coordinates);
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach(poly => reversePoly(poly));
      }
    }
  });

  return fixedCount;
}

function regionFeatureCollections(featureCollection) {
  const feats = featureCollection.features || [];

  const isAzores = (f) => geoName(f) === "Açores";
  const isMadeira = (f) => geoName(f) === "Madeira";

  const fcAz = { type: "FeatureCollection", features: feats.filter(isAzores) };
  const fcMad = { type: "FeatureCollection", features: feats.filter(isMadeira) };
  const fcMain = { type: "FeatureCollection", features: feats.filter(f => !isAzores(f) && !isMadeira(f)) };

  return { fcMain, fcAz, fcMad };
}

/* ✅ Agora: moldura/título usam classes e CSS variables (tema claro/escuro) */
function drawInsetFrame(layer, box, label) {
  layer.append("rect")
    .attr("class", "map-frame")
    .attr("x", box.x)
    .attr("y", box.y)
    .attr("width", box.w)
    .attr("height", box.h)
    .attr("rx", 14)
    .attr("ry", 14);

  layer.append("text")
    .attr("class", "map-inset-title")
    .attr("x", box.x + 10)
    .attr("y", box.y + 18)
    .text(label);
}

function bindDistrictEvents(selection, onSelectDistrict) {
  selection
    .on("mouseover", (event, d) => {
      const name = geoName(d);
      showTooltip(`<strong>${name}</strong>`);
      moveTooltip(event.pageX, event.pageY);
    })
    .on("mousemove", (event) => moveTooltip(event.pageX, event.pageY))
    .on("mouseout", () => hideTooltip())
    .on("click", (event, d) => {
      onSelectDistrict(resolver.resolve(geoName(d)));
      event.stopPropagation();
    });
}

export function initMap({ featureCollection, csvDistricts, csvDataByYear, onSelectDistrict }) {
  if (!featureCollection?.features) return;

  fc = featureCollection;

  const fixedCount = fixInvertedGeometry(fc);
  if (fixedCount > 0) {
    console.log(`Mapa: Corrigidos ${fixedCount} distritos que estavam com geometria invertida.`);
  }

  dataByYear = csvDataByYear;
  resolver = buildNameResolver(csvDistricts);

  const container = d3.select("#map-container");
  container.selectAll("*").remove();

  const w = container.node().clientWidth || 900;
  const h = container.node().clientHeight || 520;

  svg = container.append("svg").attr("viewBox", `0 0 ${w} ${h}`);

  // Layers (continente por baixo, caixas por cima)
  gMain = svg.append("g").attr("class", "layer-main");
  gAz = svg.append("g").attr("class", "layer-azores");
  gMad = svg.append("g").attr("class", "layer-madeira");

  const { fcMain, fcAz, fcMad } = regionFeatureCollections(fc);

  // ---- LAYOUT (como o rascunho) ----
  const pad = 12;

  // coluna esquerda (caixas das ilhas)
  const leftColW = Math.round(w * 0.33);

  const azBox = {
    x: pad,
    y: pad,
    w: leftColW - pad * 2,
    h: Math.round(h * 0.42)
  };

  const madBox = {
    x: pad,
    y: azBox.y + azBox.h + pad,
    w: leftColW - pad * 2,
    h: h - (azBox.y + azBox.h + pad) - pad
  };

  // continente à direita (caixa grande)
  const mainBox = {
    x: leftColW + pad,
    y: pad,
    w: w - (leftColW + pad * 2),
    h: h - pad * 2
  };

  // ---- Continente (fit à caixa da direita) ----
  const projMain = d3.geoConicConformal()
    .parallels([38, 42])
    .rotate([8, 0])
    .fitSize([mainBox.w, mainBox.h], fcMain);

  const pathMain = d3.geoPath(projMain);

  // ✅ moldura do continente com class (tema)
  gMain.append("rect")
    .attr("class", "map-frame")
    .attr("x", mainBox.x)
    .attr("y", mainBox.y)
    .attr("width", mainBox.w)
    .attr("height", mainBox.h)
    .attr("rx", 14)
    .attr("ry", 14);

  const gMainMap = gMain.append("g")
    .attr("transform", `translate(${mainBox.x},${mainBox.y})`);

  // Ordena para desenhar pequenos por cima dos grandes
  const featsMain = [...fcMain.features].sort((a, b) => d3.geoArea(b) - d3.geoArea(a));

  const mainPaths = gMainMap.selectAll("path")
    .data(featsMain, d => geoName(d))
    .join("path")
    .attr("class", "district")
    .attr("d", pathMain)
    // ✅ fill inicial: variável (tema)
    .attr("fill", "var(--mapMissingFill)")
    // stroke de base vem do CSS (.district), mas aqui mantemos o teu para já
    .attr("stroke", "rgba(0,0,0,0.3)")
    .attr("stroke-width", 0.5);

  bindDistrictEvents(mainPaths, onSelectDistrict);

  // ---- Açores (fit à caixa superior esquerda) ----
  if (fcAz.features.length) {
    drawInsetFrame(gAz, azBox, "Açores");

    const azInner = [azBox.w - 16, azBox.h - 28]; // margem interior
    const projAz = d3.geoConicConformal()
      .parallels([38, 42])
      .rotate([8, 0])
      .fitSize(azInner, fcAz);

    const pathAz = d3.geoPath(projAz);

    const gAzMap = gAz.append("g")
      .attr("transform", `translate(${azBox.x + 8},${azBox.y + 22})`);

    const azPaths = gAzMap.selectAll("path")
      .data(fcAz.features, d => geoName(d))
      .join("path")
      .attr("class", "district")
      .attr("d", pathAz)
      .attr("fill", "var(--mapMissingFill)")
      .attr("stroke", "rgba(0,0,0,0.3)")
      .attr("stroke-width", 0.5);

    bindDistrictEvents(azPaths, onSelectDistrict);
  }

  // ---- Madeira (fit à caixa inferior esquerda) ----
  if (fcMad.features.length) {
    drawInsetFrame(gMad, madBox, "Madeira");

    const madInner = [madBox.w - 16, madBox.h - 28];
    const projMad = d3.geoConicConformal()
      .parallels([38, 42])
      .rotate([8, 0])
      .fitSize(madInner, fcMad);

    const pathMad = d3.geoPath(projMad);

    const gMadMap = gMad.append("g")
      .attr("transform", `translate(${madBox.x + 8},${madBox.y + 22})`);

    const madPaths = gMadMap.selectAll("path")
      .data(fcMad.features, d => geoName(d))
      .join("path")
      .attr("class", "district")
      .attr("d", pathMad)
      .attr("fill", "var(--mapMissingFill)")
      .attr("stroke", "rgba(0,0,0,0.3)")
      .attr("stroke-width", 0.5);

    bindDistrictEvents(madPaths, onSelectDistrict);
  }

  // Clique fora limpa seleção
  svg.on("click", () => onSelectDistrict(null));
}

export function updateMap({ year, metric, selectedDistrict }) {
  if (!fc || !svg) return;

  const yd = dataByYear[year] || {};

  // escala baseada nos valores existentes
  const vals = fc.features.map(f => {
    const d = resolver.resolve(geoName(f));
    return yd?.[d]?.[metric];
  }).filter(Number.isFinite);

  const scale = d3.scaleQuantize()
    .domain(vals.length ? [d3.min(vals), d3.max(vals)] : [0, 1])
    .range(d3.schemeBlues[7]);

  // aplica a TODOS os distritos (continente + insets)
  svg.selectAll("path.district")
    .transition().duration(400)
    .attr("fill", d => {
      const key = resolver.resolve(geoName(d));
      const v = yd?.[key]?.[metric];
      return Number.isFinite(v) ? scale(v) : "var(--mapMissingFill)";
    })
    .attr("stroke", d => {
      const isSel = selectedDistrict && resolver.resolve(geoName(d)) === selectedDistrict;
      return isSel ? "white" : "rgba(0,0,0,0.3)";
    })
    .attr("stroke-width", d => {
      const isSel = selectedDistrict && resolver.resolve(geoName(d)) === selectedDistrict;
      return isSel ? 2 : 0.5;
    });

  // tooltip com valor + ano (re-bind para dados frescos)
  svg.selectAll("path.district")
    .on("mouseover", (event, d) => {
      const name = geoName(d);
      const key = resolver.resolve(name);
      const v = yd?.[key]?.[metric];

      showTooltip(
        `<strong>${name}</strong><br>` +
        `${metricLabels[metric] || metric}: <strong>${formatValue(metric, v)}</strong><br>` +
        `<span style="color:var(--muted)">Ano: ${year}</span>`
      );
      moveTooltip(event.pageX, event.pageY);
    })
    .on("mousemove", (event) => moveTooltip(event.pageX, event.pageY))
    .on("mouseout", () => hideTooltip());

  renderLegend(scale, metric);
}
