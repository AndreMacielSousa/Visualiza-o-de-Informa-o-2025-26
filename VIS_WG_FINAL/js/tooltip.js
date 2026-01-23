// tooltip.js

// Selecionar o elemento tooltip (div) existente no HTML
const tooltip = d3.select("#tooltip");

/**
 * Mostra a tooltip com determinada informação.
 * @param {string} districtName - Nome do distrito/região.
 * @param {string} metricLabel - Nome legível da métrica (para mostrar no título da tooltip).
 * @param {any} valueFormatted - Valor formatado a mostrar.
 */
function showTooltip(districtName, metricLabel, valueFormatted) {
  tooltip
    .style("opacity", 1)  // tornar visível
    .html(`<strong>${districtName}</strong><br>${metricLabel}: <strong>${valueFormatted}</strong>`);
}

/**
 * Atualiza a posição da tooltip conforme o ponteiro do rato se move.
 * Deve ser chamado em eventos 'mousemove'.
 * @param {number} x - Posição X (píxeis) do ponteiro.
 * @param {number} y - Posição Y (píxeis) do ponteiro.
 */
function moveTooltip(x, y) {
  // Ajustar levemente a posição para não cobrir totalmente o cursor
  const offset = 10;
  tooltip
    .style("left", (x + offset) + "px")
    .style("top",  (y + offset) + "px");
}

/** Esconde a tooltip. */
function hideTooltip() {
  tooltip.style("opacity", 0);
}
