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
  const min = d3.min(finite), max = d3.max(finite);

  // evita domínio colapsado (min==max) que dá “tudo igual”
  const domain = (min === max) ? [min - 1, max + 1] : [min, max];

  return d3.scaleQuantize()
    .domain(domain)
    .range(d3.schemeBlues[7]);
}

export function initMap({ featureCollection, csvDistricts, csvDataByYear, onSelectDistrict }) {
  fc = featureCollection;
  dataByYear = csvDataByYear;
  resolver = buildNameResolver(csvDistricts);

  const container = d3.select("#map-container");
  container.selectAll("*").remove();

  const w = container.node().clientWidth || 900;
  const h = container.node().clientHeight || 520;

  svg = container.append("svg").attr("viewBox", `0 0 ${w} ${h}`);
  g = svg.append("g");

  projection = d3.geoMercator().fitSize([w, h], fc);
  path = d3.geoPath(projection);

  // ordenar por área (desenho consistente)
  const feats = [...fc.features].sort((a, b) => d3.geoArea(b) - d3.geoArea(a));

  g.selectAll("path")
    .data(feats, d => geoName(d))
    .join("path")
    .attr("class", "district")
    .attr("d", path)
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

  // clique fora limpa seleção
  svg.on("click", () => onSelectDistrict(null));
}

export function updateMap({ year, metric, selectedDistrict }) {
  const yd = dataByYear[year] || {};

  const vals = fc.features.map(f => {
    const d = resolver.resolve(geoName(f));
    const v = yd?.[d]?.[metric];
    return Number.isFinite(v) ? v : NaN;
  });

  const scale = colorScaleFor(vals);

  g.selectAll("path.district")
    .attr("fill", d => {
      const key = resolver.resolve(geoName(d));
      const v = yd?.[key]?.[metric];
      return Number.isFinite(v) ? scale(v) : "rgba(255,255,255,.10)";
    })
    .classed("is-selected", d => selectedDistrict && resolver.resolve(geoName(d)) === selectedDistrict)
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
