import { metricLabels, formatValue } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";

let svg, g, iw, ih, x, y, xA, yA, dots;
let xLabel, yLabel;

const m = { t: 18, r: 18, b: 52, l: 78 };

export function initScatter({ onSelectDistrict }) {
  const c = d3.select("#scatter-container");
  c.selectAll("*").remove();

  const w = c.node().clientWidth || 900;
  const h = c.node().clientHeight || 520;

  svg = c.append("svg").attr("viewBox", `0 0 ${w} ${h}`);
  g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

  iw = w - m.l - m.r;
  ih = h - m.t - m.b;

  x = d3.scaleLinear().range([0, iw]);
  y = d3.scaleLinear().range([ih, 0]);

  xA = g.append("g").attr("class", "axis").attr("transform", `translate(0,${ih})`);
  yA = g.append("g").attr("class", "axis");

  xLabel = g.append("text")
    .attr("class", "axis-label")
    .attr("x", iw / 2)
    .attr("y", ih + 42)
    .attr("text-anchor", "middle");

  yLabel = g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2)
    .attr("y", -56)
    .attr("text-anchor", "middle");

  dots = g.append("g");
}

export function updateScatter({
  dataByYear,
  years,
  districts,
  metric,
  brushRange,
  selectedDistrict,
  onSelectDistrict
}) {
  const year = years[years.length - 1];

  const data = districts
    .map(d => {
      const r = dataByYear[year]?.[d];
      return r ? { district: d, x: r.population, y: r[metric] } : null;
    })
    .filter(d => Number.isFinite(d?.x) && Number.isFinite(d?.y));

  if (!data.length) return;

  x.domain(d3.extent(data, d => d.x)).nice();
  y.domain(d3.extent(data, d => d.y)).nice();

  xA.call(d3.axisBottom(x).ticks(6));
  yA.call(d3.axisLeft(y).ticks(6));

  xLabel.text("População");
  yLabel.text(metricLabels[metric] || metric);

  const u = dots.selectAll("circle").data(data, d => d.district);

  u.join(
    e => e.append("circle")
      .attr("r", 5)
      .attr("class", "scatter-dot")
      .on("mouseover", (ev, d) => {
        showTooltip(
          `<strong>${d.district}</strong><br>` +
          `População: ${formatValue("population", d.x)}<br>` +
          `${metricLabels[metric] || metric}: ${formatValue(metric, d.y)}`
        );
        moveTooltip(ev.pageX, ev.pageY);
      })
      .on("mousemove", ev => moveTooltip(ev.pageX, ev.pageY))
      .on("mouseout", hideTooltip)
      .on("click", (ev, d) => {
        onSelectDistrict(d.district);
        ev.stopPropagation();
      }),
    u => u,
    xit => xit.remove()
  )
  .attr("cx", d => x(d.x))
  .attr("cy", d => y(d.y))
  .attr("opacity", d =>
    (selectedDistrict && d.district !== selectedDistrict) ? 0.25 : 1
  );
}
