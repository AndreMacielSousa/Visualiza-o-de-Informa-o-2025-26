// js/tooltip.js
const tooltip = d3.select("#tooltip");

export function showTooltip(html){
  tooltip.style("opacity", 1).html(html);
}

export function moveTooltip(x, y){
  tooltip
    .style("left", (x + 12) + "px")
    .style("top", (y + 12) + "px");
}

export function hideTooltip(){
  tooltip.style("opacity", 0);
}
