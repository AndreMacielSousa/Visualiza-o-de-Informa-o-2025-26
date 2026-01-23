const tip = d3.select("#tooltip");

export function showTooltip(html) {
  tip.style("opacity", 1).html(html);
}
export function moveTooltip(x, y) {
  tip.style("left", (x + 12) + "px").style("top", (y + 12) + "px");
}
export function hideTooltip() {
  tip.style("opacity", 0);
}
