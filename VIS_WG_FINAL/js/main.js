// main.js

// Caminhos dos ficheiros de dados (ajuste caso necessário)
const DATA_CSV = "metricas_derivadas_habitacao_populacao_1940_2021.csv";
const MAP_TOPOJSON = "portugal-distritos-ilhas.topojson";  // ficheiro TopoJSON do mapa de Portugal (Continente + Ilhas)

// Carregar CSV de dados e TopoJSON do mapa em paralelo
Promise.all([
  d3.csv(DATA_CSV),
  d3.json(MAP_TOPOJSON)
]).then(([csvData, topoData]) => {
  // Processar dados CSV
  const { dataByYear, years, metrics } = processData(csvData);

  // Converter TopoJSON para GeoJSON (extrair os distritos)
  // Nota: substitua 'distritos' pelo nome do objeto dentro do TopoJSON.
  const geoData = topojson.feature(topoData, topoData.objects.distritos); 

  // Inicializar opções dos dropdowns:
  const yearSelect = d3.select("#yearDropdown");
  yearSelect.selectAll("option")
    .data(years)
    .join("option")
      .attr("value", d => d)
      .text(d => d);

  const metricSelect = d3.select("#metricDropdown");
  metricSelect.selectAll("option")
    .data(metrics)
    .join("option")
      .attr("value", d => d)
      .text(d => metricLabels[d] || d);

  // Definir ano e métrica iniciais (por exemplo, último ano e População)
  const initialYear = years[years.length - 1];      // ano mais recente
  const initialMetric = "Populacao";                // métrica padrão inicial

  // Selecionar como padrão nos dropdowns
  yearSelect.property("value", initialYear);
  metricSelect.property("value", initialMetric);

  // Inicializar mapa com dados geográficos e dados estatísticos
  initMap(geoData, dataByYear, initialYear, initialMetric);

  // Configurar eventos de mudança nos dropdowns para atualizar o mapa
  yearSelect.on("change", function(event) {
    const newYear = +event.target.value;
    updateMap(newYear, currentMetric, dataByYear);
  });
  metricSelect.on("change", function(event) {
    const newMetric = event.target.value;
    updateMap(currentYear, newMetric, dataByYear);
  });
}).catch(error => {
  console.error("Erro ao carregar dados: ", error);
});
