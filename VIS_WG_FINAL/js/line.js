import { metricLabels, formatValue } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";

let svg, g, iw, ih, x, y, xA, yA, grid, line, dots, brushG;
const m = { t: 18, r: 14, b: 38, l: 56 };

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

  line = g.append("path").attr("class", "line");
  dots = g.append("g");
  brushG = g.append("g").attr("class", "brush");

  const brush = d3.brushX()
    .extent([[0, 0], [iw, ih]])
    .on("end", (ev) => {
      if (!ev.selection) return;
      const [x0, x1] = ev.selection;
      const a = Math.round(x.invert(x0));
      const b = Math.round(x.invert(x1));
      onBrushChange([Math.min(a, b), Math.max(a, b)]);
    });

  brushG.call(brush);
}

export function updateLine({ dataByYear, years, metric, district, brushRange }) {
  const s = years
    .map(yr => ({ year: yr, value: dataByYear[yr]?.[district]?.[metric] }))
    .filter(d => Number.isFinite(d.value));

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

  const l = d3.line().x(d => x(d.year)).y(d => y(d.value));
  line.datum(s).attr("d", l);

  const u = dots.selectAll("circle").data(s, d => d.year);

  u.join(
    e => e.append("circle")
      .attr("class", "dot")
      .attr("r", 3.6)
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.value))
      .on("mouseover", (ev, d) => {
        showTooltip(
          `<strong>${d.year}</strong><br>` +
          `${metricLabels[metric] || metric}: <strong>${formatValue(metric, d.value)}</strong>`
        );
        moveTooltip(ev.pageX, ev.pageY);
      })
      .on("mousemove", (ev) => moveTooltip(ev.pageX, ev.pageY))
      .on("mouseout", () => hideTooltip()),
    u => u,
    xit => xit.remove()
  );

  dots.selectAll("circle")
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.value))
    .attr("opacity", d =>
      (brushRange && (d.year < brushRange[0] || d.year > brushRange[1])) ? 0.25 : 1
    );
}
