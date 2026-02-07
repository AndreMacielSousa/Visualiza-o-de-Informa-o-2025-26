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
  if (!brushRange) return null;
  const [lo, hi] = brushRange;
  return years.filter((yr) => yr >= lo && yr <= hi);
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
  currentYear,
  selectedDistrict,
  onSelectDistrict,
}) {
  // lista de anos caso exista brush
  const yrs = yearsInRange(years, brushRange);

  // ✅ dados do scatter: GUARDA contexto para tooltip (ano/intervalo) + valores exatos do ponto
  const data = districts
    .map((d) => {
      let px, py, context;

      if (yrs && yrs.length) {
        px = meanOverYears(dataByYear, d, yrs, "population");
        py = meanOverYears(dataByYear, d, yrs, metric);
        context = { type: "range", lo: brushRange[0], hi: brushRange[1] };
      } else {
        px = dataByYear[currentYear]?.[d]?.population;
        py = dataByYear[currentYear]?.[d]?.[metric];
        context = { type: "year", year: currentYear };
      }

      if (!Number.isFinite(px) || !Number.isFinite(py)) return null;

      return {
        district: d,
        x: px,
        y: py,
        context, // <- isto garante tooltip fiável
      };
    })
    .filter(Boolean);

  if (!data.length) return;

  x.domain(d3.extent(data, (d) => d.x)).nice();
  y.domain(d3.extent(data, (d) => d.y)).nice();

  xA.call(d3.axisBottom(x).ticks(6));
  yA.call(d3.axisLeft(y).ticks(6));

  // ✅ labels coerentes com o modo
  if (yrs && yrs.length) {
    xLabel.text("População (média no intervalo)");
    yLabel.text(`${metricLabels[metric] || metric} (média no intervalo)`);
  } else {
    xLabel.text(`População (${currentYear})`);
    yLabel.text(`${metricLabels[metric] || metric} (${currentYear})`);
  }

  const u = dots.selectAll("circle").data(data, (d) => d.district);

  u.join(
    (e) =>
      e
        .append("circle")
        .attr("r", 5)
        .attr("class", "scatter-dot")
        .on("mouseover", (ev, d) => {
          const ctx =
            d.context.type === "range"
              ? `Intervalo: <strong>${d.context.lo}–${d.context.hi}</strong><br>`
              : `Ano: <strong>${d.context.year}</strong><br>`;

          // ✅ tooltip usa EXACTAMENTE d.x e d.y (os valores desenhados)
          showTooltip(
            `<strong>${d.district}</strong><br>` +
              ctx +
              `População: <strong>${formatValue("population", d.x)}</strong><br>` +
              `${metricLabels[metric] || metric}: <strong>${formatValue(metric, d.y)}</strong>`
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
