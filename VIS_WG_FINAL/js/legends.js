import { metricLabels, formatValue } from "./utils.js";

export function renderLegend(scale, metric) {
  const host = d3.select("#legend-container");
  host.selectAll("*").remove();

  host.append("div")
    .text(metricLabels[metric] || metric)
    .style("font-weight", "700");

  const row = host.append("div")
    .style("display", "flex")
    .style("gap", "8px")
    .style("flex-wrap", "wrap")
    .style("margin-top", "6px");

  scale.range().forEach(c => {
    const [a, b] = scale.invertExtent(c);
    const item = row.append("div")
      .style("display", "flex")
      .style("gap", "6px")
      .style("align-items", "center");

    item.append("span")
      .style("display", "inline-block")
      .style("width", "16px")
      .style("height", "12px")
      .style("border-radius", "4px")
      .style("background", c)
      .style("border", "1px solid rgba(255,255,255,.12)");

    item.append("span")
      .style("font-size", "11px")
      .style("color", "rgba(255,255,255,.75)")
      .text(`${formatValue(metric, a)}–${formatValue(metric, b)}`);
  });
}
