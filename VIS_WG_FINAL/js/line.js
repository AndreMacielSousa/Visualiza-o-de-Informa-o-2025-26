import { metricLabels, formatValue } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";

let svg, g, iw, ih, x, y, xA, yA, grid, line, dots, brushG;
let xLabel, yLabel;

const m = { t: 18, r: 18, b: 52, l: 78 };

export function initLine({ onBrushChange }) {
  const c = d3.select("#line-container");
  c.selectAll("*").remove();

  const w = c.node().clientWidth || 900;
  const h = c.node().clientHeight || 280;

  svg = c.append("svg").attr("viewBox", `0 0 ${w} ${h}`);
  g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

  iw = w - m.l - m.r;
  ih = h - m.t - m.b;

  x = d3.scaleLinear().range([0, iw]);
  y = d3.scaleLinear().range([ih, 0]);

  grid = g.append("g").attr("class", "gridline");
  xA = g.append("g").attr("class", "axis").attr("transform", `translate(0,${ih})`);
  yA = g.append("g").attr("class", "axis");

  // Axis labels
  xLabel = g.append("text")
    .attr("class", "axis-label")
    .attr("x", iw / 2)
    .attr("y", ih + 42)
    .attr("text-anchor", "middle")
    .text("Ano");

  yLabel = g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2)
    .attr("y", -56)
    .attr("text-anchor", "middle");

  line = g.append("path").attr("class", "line");
  dots = g.append("g");
  brushG = g.append("g").attr("class", "brush");

  const brush = d3.brushX()
    .extent([[0, 0], [iw, ih]])
    .on("end", (ev) => {
      if (!ev.selection) {
        onBrushChange(null);
        return;
      }
      const [x0, x1] = ev.selection;
      const a = Math.round(x.invert(x0));
      const b = Math.round(x.invert(x1));
      onBrushChange([Math.min(a, b), Math.max(a, b)]);
    });

  brushG.call(brush);
}

function meanForYear(dataByYear, year, metric) {
  const vals = Object.values(dataByYear[year] || {})
    .map(d => d?.[metric])
    .filter(Number.isFinite);
  return vals.length ? d3.mean(vals) : NaN;
}

export function updateLine({ dataByYear, years, metric, district, brushRange }) {
  const s = years.map(yr => ({
    year: yr,
    value: district
      ? dataByYear[yr]?.[district]?.[metric]
      : meanForYear(dataByYear, yr, metric)
  })).filter(d => Number.isFinite(d.value));

  if (!s.length) {
    line.attr("d", null);
    dots.selectAll("*").remove();
    return;
  }

  x.domain(d3.extent(s, d => d.year));
  const ext = d3.extent(s, d => d.value);
  const pad = (ext[1] - ext[0]) * 0.08 || 1;
  y.domain([ext[0] - pad, ext[1] + pad]);

  xA.call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")));
  yA.call(d3.axisLeft(y).ticks(6));
  grid.call(d3.axisLeft(y).ticks(6).tickSize(-iw).tickFormat(""));

  yLabel.text(metricLabels[metric] || metric);

  const l = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value));

  line.datum(s).attr("d", l);

  const seriesLabel = district || "Média nacional";

  const u = dots.selectAll("circle").data(s, d => d.year);
  u.join(
    e => e.append("circle")
      .attr("class", "dot")
      .attr("r", 3.6)
      .on("mouseover", (ev, d) => {
        showTooltip(
          `<strong>${seriesLabel}</strong><br>` +
          `Ano: <strong>${d.year}</strong><br>` +
          `${metricLabels[metric] || metric}: <strong>${formatValue(metric, d.value)}</strong>`
        );
        moveTooltip(ev.pageX, ev.pageY);
      })
      .on("mousemove", ev => moveTooltip(ev.pageX, ev.pageY))
      .on("mouseout", hideTooltip),
    u => u,
    xit => xit.remove()
  )
  .attr("cx", d => x(d.year))
  .attr("cy", d => y(d.value))
  .attr("opacity", d =>
    (brushRange && (d.year < brushRange[0] || d.year > brushRange[1])) ? 0.25 : 1
  );
}
