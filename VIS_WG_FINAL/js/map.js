// map.js

// Parâmetros de dimensões iniciais (podem ser adaptados conforme o container)
const width = 800;
const height = 600;

// Variáveis globais (estado atual) para métrica e ano selecionados
let currentMetric = null;
let currentYear = null;

// Referência ao SVG e camada do mapa (group dos distritos)
let svg, mapLayer;

// Escala de cor (será definida posteriormente com base na métrica selecionada)
let colorScale;

/**
 * Inicializa o mapa desenhando os polígonos dos distritos.
 * @param {Object} geoData - objeto TopoJSON já convertido em GeoJSON (features dos distritos).
 * @param {Object} dataByYear - dados estruturados por ano (resultado de processData).
 * @param {number} initialYear - ano inicial a visualizar.
 * @param {string} initialMetric - métrica inicial a visualizar.
 */
function initMap(geoData, dataByYear, initialYear, initialMetric) {
  currentYear = initialYear;
  currentMetric = initialMetric;

  // Criar projeção geográfica e path generator
  const projection = d3.geoMercator()
    .center([-8.5, 39.5])      // centro aproximado de Portugal para projeção Mercator
    .translate([width/2, height/2])
    .scale(2000);
  const geoPath = d3.geoPath().projection(projection);

  // Criar SVG dentro do container do mapa
  svg = d3.select("#map-container")
          .append("svg")
          .attr("viewBox", `0 0 ${width} ${height}`)  // viewBox para escalabilidade responsiva
          .attr("preserveAspectRatio", "xMidYMid meet");

  // Agrupar distritos (camada de mapa)
  mapLayer = svg.append("g").attr("class", "map-layer");

  // Desenhar cada distrito como path
  mapLayer.selectAll("path")
    .data(geoData.features)   // geoData.features é um array de features GeoJSON
    .join("path")
      .attr("d", geoPath)
      .attr("class", "district")
      .attr("fill", "#ccc")  // preenchimento inicial neutro (será atualizado depois)
      .on("mouseover", function(event, d) {
        // Destacar distrito atual (opcional: contorno mais espesso)
        d3.select(this).raise().attr("stroke", "#000").attr("stroke-width", 2);
        // Obter valores para tooltip
        const districtName = d.properties.NAME_1 || d.properties.Distrito || d.properties.name || d.properties.NOME; 
        // (acima, tentamos diferentes propriedades possíveis - ajuste conforme o TopoJSON)
        const metricLabel = metricLabels[currentMetric] || currentMetric;
        const value = dataByYear[currentYear][districtName]?.[currentMetric];
        const valueStr = formatValue(currentMetric, value);
        showTooltip(districtName, metricLabel, valueStr);
      })
      .on("mousemove", function(event) {
        moveTooltip(event.pageX, event.pageY);
      })
      .on("mouseout", function() {
        // Reverter destaque e esconder tooltip
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1);
        hideTooltip();
      });

  // Desenhar legenda de cores (grupo g separado)
  svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(20, ${height - 30})`);  // posicionada no canto inferior esquerdo

  // Aplicar cores iniciais e atualizar legenda
  updateMap(currentYear, currentMetric, dataByYear);
}

/**
 * Atualiza o preenchimento dos distritos e a legenda, com base no ano e métrica selecionados.
 * @param {number} year - Ano selecionado.
 * @param {string} metric - Métrica selecionada.
 * @param {Object} dataByYear - Dados estruturados por ano (como em processData).
 */
function updateMap(year, metric, dataByYear) {
  currentYear = year;
  currentMetric = metric;

  // Extrair todos os valores da métrica selecionada para o ano dado (para definir domínio da escala)
  const values = Object.values(dataByYear[year]).map(d => d[metric]);
  const minVal = d3.min(values);
  const maxVal = d3.max(values);

  // Definir a escala de cor (usaremos uma escala quantize para intervalos iguais de valores)
  colorScale = d3.scaleQuantize()
    .domain([minVal, maxVal])
    .range(d3.schemeBlues[7]);  // 7 tons de azul (pode ajustar cores ou quantidade)

  // Atualizar cor de preenchimento de cada distrito de acordo com o valor
  mapLayer.selectAll("path.district")
    .transition().duration(500)
    .attr("fill", function(d) {
      const name = d.properties.NAME_1 || d.properties.Distrito || d.properties.name || d.properties.NOME;
      const val = dataByYear[year][name]?.[metric];
      return val != null ? colorScale(val) : "#ccc";
    });

  // Atualizar legenda
  renderLegend(colorScale, metric);
}

// Labels legíveis para cada métrica (em Português, para usar na tooltip/legenda)
const metricLabels = {
  "Populacao": "População",
  "Habitacoes": "Nº de Habitações",
  "Habitacoes_por_1000_hab": "Habitações por 1000 hab",
  "Var_Habitacoes_%": "Variação de Habitações (%)",
  "Var_Populacao_%": "Variação da População (%)",
  "Desvio_Crescimento_%": "Desvio do Crescimento (%)"
};

/**
 * Renderiza (ou atualiza) a legenda de cor no SVG com base na escala de cor atual.
 * @param {d3.ScaleQuantize} scale - Escala de cor quantize usada no mapa.
 * @param {string} metric - Métrica atual (usada para rótulo da legenda).
 */
function renderLegend(scale, metric) {
  const legendGroup = svg.select("g.legend");
  legendGroup.selectAll("*").remove(); // limpa qualquer elemento prévio na legenda

  // Gerar rótulos de intervalo para cada cor
  const colorRange = scale.range();
  const legendItemHeight = 15;
  const legendItemWidth = 30;
  const legendSpacing = 5;

  // Texto título da legenda (nome da métrica)
  legendGroup.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .text(metricLabels[metric] || metric);

  // Para cada cor na escala, criar um quadrado e um rótulo de texto
  colorRange.forEach((color, i) => {
    const [from, to] = scale.invertExtent(color);
    const y = i * (legendItemHeight + legendSpacing);

    // Caixa de cor
    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", y)
      .attr("width", legendItemWidth)
      .attr("height", legendItemHeight)
      .attr("fill", color)
      .attr("stroke", "#ccc");

    // Texto do intervalo
    legendGroup.append("text")
      .attr("x", legendItemWidth + 5)
      .attr("y", y + legendItemHeight / 2)
      .attr("dy", "0.35em")
      .text(`${formatValue(metric, from)} - ${formatValue(metric, to)}`);
  });
}
