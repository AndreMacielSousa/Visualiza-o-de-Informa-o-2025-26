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

  xA = g
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${ih})`);
  yA = g.append("g").attr("class", "axis");

  xLabel = g
    .append("text")
    .attr("class", "axis-label")
    .attr("x", iw / 2)
    .attr("y", ih + 42)
    .attr("text-anchor", "middle");

  yLabel = g
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -ih / 2)
    .attr("y", -56)
    .attr("text-anchor", "middle");

  dots = g.append("g");
}

function yearsInRange(years, brushRange) {
  if (!brushRange) return [years[years.length - 1]]; // default: último ano (mantém o comportamento antigo)
  const [lo, hi] = brushRange;
  return years.filter((y) => y >= lo && y <= hi);
}

function meanOverYears(dataByYear, district, yearsList, field) {
  const vals = yearsList
    .map((yr) => dataByYear[yr]?.[district]?.[field])
    .filter(Number.isFinite);
  return vals.length ? d3.mean(vals) : NaN;
}

export function updateScatter({
  dataByYear,
  years,
  districts,
  metric,
  brushRange,
  selectedDistrict,
  onSelectDistrict,
}) {
  const yrs = yearsInRange(years, brushRange);

  const data = districts
    .map((d) => {
      const mx = meanOverYears(dataByYear, d, yrs, "population");
      const my = meanOverYears(dataByYear, d, yrs, metric);
      if (!Number.isFinite(mx) || !Number.isFinite(my)) return null;
      return { district: d, x: mx, y: my };
    })
    .filter(Boolean);

  if (!data.length) return;

  x.domain(d3.extent(data, (d) => d.x)).nice();
  y.domain(d3.extent(data, (d) => d.y)).nice();

  xA.call(d3.axisBottom(x).ticks(6));
  yA.call(d3.axisLeft(y).ticks(6));

  // ✅ Labels coerentes com o intervalo
  xLabel.text(brushRange ? "População (média no intervalo)" : "População (último ano)");
  yLabel.text((metricLabels[metric] || metric) + (brushRange ? " (média no intervalo)" : " (último ano)"));

  const u = dots.selectAll("circle").data(data, (d) => d.district);

  u.join(
    (e) =>
      e
        .append("circle")
        .attr("r", 5)
        .attr("class", "scatter-dot")
        .on("mouseover", (ev, d) => {
          const intervaloTxt = brushRange
            ? `Intervalo: <strong>${brushRange[0]}–${brushRange[1]}</strong><br>`
            : "";

          showTooltip(
            `<strong>${d.district}</strong><br>` +
              intervaloTxt +
              `População: ${formatValue("population", d.x)}<br>` +
              `${metricLabels[metric] || metric}: ${formatValue(metric, d.y)}`
          );
          moveTooltip(ev.pageX, ev.pageY);
        })
        .on("mousemove", (ev) => moveTooltip(ev.pageX, ev.pageY))
        .on("mouseout", hideTooltip)
        .on("click", (ev, d) => {
          onSelectDistrict(d.district);
          ev.stopPropagation();
        }),
    (u) => u,
    (xit) => xit.remove()
  )
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("opacity", (d) =>
      selectedDistrict && d.district !== selectedDistrict ? 0.25 : 1
    );
}
