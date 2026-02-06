import { metricLabels, formatValue, buildNameResolver } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";
import { renderLegend } from "./legend.js";

let svg, gMain, gAz, gMad;
let pathMain, pathAz, pathMad;
let projMain, projAz, projMad;
let fc, dataByYear, resolver;

function geoName(f) {
  return f?.properties?.dis_name
    || f?.properties?.NAME_1
    || f?.properties?.Distrito
    || f?.properties?.name
    || f?.properties?.NOME
    || f?.properties?.dis_name_upper
    || "";
}

function fixInvertedGeometry(featureCollection) {
  if (!featureCollection?.features) return 0;

  let fixedCount = 0;

  // Corrige casos em que o D3 interpreta a geometria como “globo inteiro”
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

function drawRegion({
  group,
  regionFc,
  projection,
  path,
  sortByArea = true,
  onSelectDistrict
}) {
  const feats = sortByArea
    ? [...regionFc.features].sort((a, b) => d3.geoArea(b) - d3.geoArea(a))
    : [...regionFc.features];

  group.selectAll("path")
    .data(feats, d => geoName(d))
    .join("path")
    .attr("class", "district")
    .attr("d", path)
    .attr("fill", "rgba(255,255,255,.10)")
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

function drawInsetFrame(group, box, label) {
  // Fundo “caixa”
  group.append("rect")
    .attr("x", box.x)
    .attr("y", box.y)
    .attr("width", box.w)
    .attr("height", box.h)
    .attr("rx", 12)
    .attr("ry", 12)
    .attr("fill", "rgba(255,255,255,0.03)")
    .attr("stroke", "rgba(255,255,255,0.18)")
    .attr("stroke-width", 1);

  // Título da caixa
  group.append("text")
    .attr("x", box.x + 10)
    .attr("y", box.y + 18)
    .attr("fill", "rgba(255,255,255,0.85)")
    .attr("font-size", 12)
    .attr("font-weight", 700)
    .text(label);
}

export function initMap({ featureCollection, csvDistricts, csvDataByYear, onSelectDistrict }) {
  if (!featureCollection?.features) return;

  fc = featureCollection;

  // Correção robusta de geometria (mantém a vossa lógica)
  const fixedCount = fixInvertedGeometry(fc);
  if (fixedCount > 0) {
    console.log(`Mapa: Corrigidos ${fixedCount} distritos com geometria invertida.`);
  }

  dataByYear = csvDataByYear;
  resolver = buildNameResolver(csvDistricts);

  const container = d3.select("#map-container");
  container.selectAll("*").remove();

  const w = container.node().clientWidth || 900;
  const h = container.node().clientHeight || 520;

  svg = container.append("svg").attr("viewBox", `0 0 ${w} ${h}`);

  // 3 grupos: continente (base), e insets (por cima)
  gMain = svg.append("g").attr("class", "layer-main");
  gAz = svg.append("g").attr("class", "layer-azores");
  gMad = svg.append("g").attr("class", "layer-madeira");

  const { fcMain, fcAz, fcMad } = regionFeatureCollections(fc);

  // Caixas dos insets (em coordenadas do viewBox)
  // Ajusta estes valores se quiseres maior/menor.
  const pad = 10;

  const azBox = {
    w: Math.round(w * 0.30),
    h: Math.round(h * 0.24),
    x: pad,
    y: h - Math.round(h * 0.24) - pad
  };

  const madBox = {
    w: Math.round(w * 0.24),
    h: Math.round(h * 0.20),
    x: w - Math.round(w * 0.24) - pad,
    y: h - Math.round(h * 0.20) - pad
  };

  // Projeções separadas (aqui está a chave para a escala diferente)
  projMain = d3.geoConicConformal()
    .parallels([38, 42])
    .rotate([8, 0])
    .fitSize([w, h], fcMain);

  pathMain = d3.geoPath(projMain);

  // Açores: fit ao tamanho da caixa (com margem interior)
  const azInner = [azBox.w - 16, azBox.h - 26]; // margem para título
  projAz = d3.geoConicConformal()
    .parallels([38, 42])
    .rotate([8, 0])
    .fitSize(azInner, fcAz);

  pathAz = d3.geoPath(projAz);

  // Madeira: fit ao tamanho da caixa (com margem interior)
  const madInner = [madBox.w - 16, madBox.h - 26];
  projMad = d3.geoConicConformal()
    .parallels([38, 42])
    .rotate([8, 0])
    .fitSize(madInner, fcMad);

  pathMad = d3.geoPath(projMad);

  // Desenha continente
  drawRegion({
    group: gMain,
    regionFc: fcMain,
    projection: projMain,
    path: pathMain,
    onSelectDistrict
  });

  // Desenha “caixa” Açores + paths traduzidos para dentro da caixa
  if (fcAz.features.length) {
    drawInsetFrame(gAz, azBox, "Açores");

    const gAzMap = gAz.append("g")
      .attr("transform", `translate(${azBox.x + 8},${azBox.y + 22})`);

    gAzMap.selectAll("path")
      .data(fcAz.features, d => geoName(d))
      .join("path")
      .attr("class", "district")
      .attr("d", pathAz)
      .attr("fill", "rgba(255,255,255,.10)")
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

  // Desenha “caixa” Madeira + paths traduzidos para dentro da caixa
  if (fcMad.features.length) {
    drawInsetFrame(gMad, madBox, "Madeira");

    const gMadMap = gMad.append("g")
      .attr("transform", `translate(${madBox.x + 8},${madBox.y + 22})`);

    gMadMap.selectAll("path")
      .data(fcMad.features, d => geoName(d))
      .join("path")
      .attr("class", "district")
      .attr("d", pathMad)
      .attr("fill", "rgba(255,255,255,.10)")
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

  // Clique fora limpa seleção
  svg.on("click", () => onSelectDistrict(null));
}

export function updateMap({ year, metric, selectedDistrict }) {
  if (!fc || !svg) return;

  const yd = dataByYear[year] || {};

  // escala de cores com base nos valores existentes
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
      return Number.isFinite(v) ? scale(v) : "rgba(255,255,255,.05)";
    })
    .attr("stroke", d => {
      const isSel = selectedDistrict && resolver.resolve(geoName(d)) === selectedDistrict;
      return isSel ? "white" : "rgba(0,0,0,0.3)";
    })
    .attr("stroke-width", d => {
      const isSel = selectedDistrict && resolver.resolve(geoName(d)) === selectedDistrict;
      return isSel ? 2 : 0.5;
    });

  // tooltip com valor + ano
  svg.selectAll("path.district")
    .on("mouseover", (event, d) => {
      const name = geoName(d);
      const key = resolver.resolve(name);
      const v = yd?.[key]?.[metric];

      showTooltip(
        `<strong>${name}</strong><br>` +
        `${metricLabels[metric] || metric}: <strong>${formatValue(metric, v)}</strong><br>` +
        `<span style="color:rgba(255,255,255,.7)">Ano: ${year}</span>`
      );
      moveTooltip(event.pageX, event.pageY);
    })
    .on("mousemove", (event) => moveTooltip(event.pageX, event.pageY))
    .on("mouseout", () => hideTooltip());

  renderLegend(scale, metric);
}
