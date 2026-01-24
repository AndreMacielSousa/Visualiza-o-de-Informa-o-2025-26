import { metricLabels, formatValue, buildNameResolver } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";
import { renderLegend } from "./legend.js";

let svg, g, path, projection, fc, dataByYear, resolver;

function geoName(f) {
  return f?.properties?.dis_name
    || f?.properties?.NAME_1
    || f?.properties?.Distrito
    || f?.properties?.name
    || f?.properties?.NOME
    || f?.properties?.dis_name_upper
    || "";
}

function colorScaleFor(values) {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return () => "rgba(255,255,255,.10)";
  const min = d3.min(finite), max = d3.max(finite);
  const domain = (min === max) ? [min - 1, max + 1] : [min, max];
  return d3.scaleQuantize().domain(domain).range(d3.schemeBlues[7]);
}

// Função auxiliar para forçar a correção do anel
function ensureRingCorrect(ring, isExterior) {
  // Cálculo da área planar (Shoelace formula)
  // Nota: Em GeoJSON [lon, lat], a ordem CCW (Anti-Horário) é o padrão para exterior.
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += (ring[i][0] - ring[j][0]) * (ring[i][1] + ring[j][1]);
  }
  // area > 0 implica CW (Horário) num plano cartesiano Y-up?
  // Na prática D3 espera CCW para exterior.
  // Vamos usar d3.geoArea depois, mas primeiro garantimos que os dados não estão "cruzados".
  
  // Se invertermos cegamente pode dar erro. Vamos confiar no d3.geoArea dentro do initMap.
  return ring;
}

export function initMap({ featureCollection, csvDistricts, csvDataByYear, onSelectDistrict }) {
  if (!featureCollection?.features) return;

  fc = featureCollection;

  // --- CORREÇÃO ROBUSTA DE GEOMETRIA ---
  // 1. Garante que é Polygon ou MultiPolygon
  // 2. Verifica se o D3 acha que o polígono é o "globo inteiro" (Area > 2*PI)
  let fixedCount = 0;
  fc.features.forEach(f => {
    const geom = f.geometry;
    if (!geom) return;

    // Função interna para inverter anéis
    const reversePoly = (coords) => coords.forEach(ring => ring.reverse());

    // Verifica a área esférica projetada
    if (d3.geoArea(f) > 2 * Math.PI) {
      fixedCount++;
      if (geom.type === "Polygon") {
        reversePoly(geom.coordinates);
      } else if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach(poly => reversePoly(poly));
      }
    }
  });
  
  if (fixedCount > 0) {
    console.log(`Mapa: Corrigidos ${fixedCount} distritos que estavam com geometria invertida.`);
  }
  // -------------------------------------

  dataByYear = csvDataByYear;
  resolver = buildNameResolver(csvDistricts);

  const container = d3.select("#map-container");
  container.selectAll("*").remove();

  const w = container.node().clientWidth || 900;
  const h = container.node().clientHeight || 520;

  svg = container.append("svg").attr("viewBox", `0 0 ${w} ${h}`);
  g = svg.append("g");

  // Projeção: Trocamos para Mercator temporariamente se Conic falhar, mas Conic deve funcionar agora.
  // fitSize ajusta automaticamente o zoom e centro
  projection = d3.geoConicConformal()
    .parallels([38, 42])
    .rotate([8, 0])
    .fitSize([w, h], fc);

  path = d3.geoPath(projection);

  // Ordenar features para desenhar os pequenos por cima dos grandes
  const feats = [...fc.features].sort((a, b) => d3.geoArea(b) - d3.geoArea(a));

  g.selectAll("path")
    .data(feats, d => geoName(d))
    .join("path")
    .attr("class", "district")
    .attr("d", path)
    .attr("fill", "rgba(255,255,255,.10)") // Cor base inicial
    .attr("stroke", "#333")
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

  svg.on("click", () => onSelectDistrict(null));
}

export function updateMap({ year, metric, selectedDistrict }) {
  if (!fc || !g) return;

  const yd = dataByYear[year] || {};

  // Recalcular escala de cores baseada apenas nos distritos visíveis
  const vals = fc.features.map(f => {
    const d = resolver.resolve(geoName(f));
    return yd?.[d]?.[metric]; // retorna valor ou undefined
  }).filter(Number.isFinite); // filtra inválidos

  const scale = d3.scaleQuantize()
    .domain(vals.length ? [d3.min(vals), d3.max(vals)] : [0, 1])
    .range(d3.schemeBlues[7]);

  g.selectAll("path.district")
    .transition().duration(400) // Animação suave na cor
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

  // Atualiza tooltip no hover (re-bind para garantir dados frescos)
  g.selectAll("path.district").on("mouseover", (event, d) => {
      const name = geoName(d);
      const key = resolver.resolve(name);
      const v = yd?.[key]?.[metric];

      showTooltip(
        `<strong>${name}</strong><br>` +
        `${metricLabels[metric] || metric}: <strong>${formatValue(metric, v)}</strong><br>` +
        `<span style="color:rgba(255,255,255,.7)">Ano: ${year}</span>`
      );
      moveTooltip(event.pageX, event.pageY);
  });

  renderLegend(scale, metric);
}