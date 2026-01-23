import { metricLabels, formatValue } from "./utils.js";
import { showTooltip, moveTooltip, hideTooltip } from "./tooltip.js";

let svg, g, iw, ih, x, y, xA, yA, grid, dots;
const m = { t: 18, r: 14, b: 44, l: 56 };

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

  grid = g.append("g").attr("class", "gridline");
  xA = g.append("g").attr("class", "axis").attr("transform", `translate(0,${ih})`);
  yA = g.append("g").attr("class", "axis");

  dots = g.append("g");

  svg.on("click", () => onSelectDistrict(null));
}

function meanFinite(a) {
  const f = a.filter(Number.isFinite);
  return f.length ? d3.mean(f) : NaN;
}

export function updateScatter({ dataByYear, years, districts, metric, brushRange, selectedDistrict, onSelectDistrict }) {
  const A = brushRange?.[0] ?? years[0];
  const B = brushRange?.[1] ?? years[years.length - 1];

  const pts = districts.map(d => {
    const xs = [], ys = [];
    for (const yr of years) {
      if (yr < A || yr > B) continue;
      const row = dataByYear[yr]?.[d];
      if (!row) continue;
      xs.push(row[metric]);
      ys.push(row.population);
    }
    return { district: d, x: meanFinite(xs), y: meanFinite(ys) };
  }).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));

  if (!pts.length) {
    dots.selectAll("*").remove();
    return;
  }

  x.domain(d3.extent(pts, d => d.x)).nice();
  y.domain(d3.extent(pts, d => d.y)).nice();

  xA.call(d3.axisBottom(x).ticks(6));
  yA.call(d3.axisLeft(y).ticks(6));
  grid.call(d3.axisLeft(y).ticks(6).tickSize(-iw).tickFormat(""));

  const u = dots.selectAll("circle").data(pts, d => d.district);

  u.join(
    e => e.append("circle")
      .attr("class", "scatter-dot")
      .attr("r", 5.2)
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .on("mouseover", (ev, d) => {
        showTooltip(
          `<strong>${d.district}</strong><br>` +
          `${metricLabels[metric] || metric}: <strong>${formatValue(metric, d.x)}</strong><br>` +
          `População: <strong>${formatValue("population", d.y)}</strong><br>` +
          `<span style="color:rgba(255,255,255,.7)">Intervalo: ${A}–${B}</span>`
        );
        moveTooltip(ev.pageX, ev.pageY);
      })
      .on("mousemove", (ev) => moveTooltip(ev.pageX, ev.pageY))
      .on("mouseout", () => hideTooltip())
      .on("click", (ev, d) => { onSelectDistrict(d.district); ev.stopPropagation(); }),
    u => u,
    xit => xit.remove()
  );

  dots.selectAll("circle")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .classed("is-selected", d => selectedDistrict && d.district === selectedDistrict);
}
