// utils.js

/**
 * Processa os dados CSV de população/habitação.
 * - Converte strings numéricas em números.
 * - Adapta os nomes dos distritos para corresponder aos do TopoJSON.
 * - Organiza os dados num objeto aninhado por ano->distrito->{métricas}.
 * Retorna um objeto com:
 *    dataByYear: { [ano]: { [distrito]: {Populacao:..., Habitacoes:..., ...} } },
 *    years: Array de anos disponíveis (ordenados),
 *    metrics: Array de identificadores de métricas (nomes das colunas, exceto Distrito/Ano).
 */
function processData(csvData) {
  const dataByYear = {};
  const yearsSet = new Set();
  let metrics = [];

  csvData.forEach(row => {
    // Converter campos numéricos de string para Number (inteiros ou floats)
    row.Ano = +row.Ano;
    row.Populacao = +row.Populacao;
    row.Habitacoes = +row.Habitacoes;
    row.Habitacoes_por_1000_hab = +row.Habitacoes_por_1000_hab;
    // Campos de variação podem estar vazios para o primeiro ano, tratar vazios como 0
    row.Var_Habitacoes_% = row["Var_Habitacoes_%"] ? +row["Var_Habitacoes_%"] : 0;
    row.Var_Populacao_% = row["Var_Populacao_%"] ? +row["Var_Populacao_%"] : 0;
    row.Desvio_Crescimento_% = row["Desvio_Crescimento_%"] ? +row["Desvio_Crescimento_%"] : 0;

    // Adaptar nomes dos distritos para corresponder ao TopoJSON, se necessário
    if (row.Distrito === "Açores") {
      row.Distrito = "Região Autónoma dos Açores";
    } else if (row.Distrito === "Madeira") {
      row.Distrito = "Região Autónoma da Madeira";
    }
    // (Certifique-se que estes nomes correspondem exatamente às propriedades do TopoJSON)

    // Construir estrutura aninhada
    const year = row.Ano;
    const district = row.Distrito;
    yearsSet.add(year);
    if (!dataByYear[year]) {
      dataByYear[year] = {};
    }
    // Guardar objeto de métricas do distrito neste ano
    dataByYear[year][district] = {
      Populacao: row.Populacao,
      Habitacoes: row.Habitacoes,
      Habitacoes_por_1000_hab: row.Habitacoes_por_1000_hab,
      Var_Habitacoes_%: row.Var_Habitacoes_%,
      Var_Populacao_%: row.Var_Populacao_%,
      Desvio_Crescimento_%: row.Desvio_Crescimento_%
    };
  });

  // Extrair lista de métricas (colunas, excluindo Distrito e Ano)
  if (csvData.length > 0) {
    const sample = csvData[0];
    metrics = Object.keys(sample).filter(key => key !== "Distrito" && key !== "Ano");
  }

  return {
    dataByYear: dataByYear,
    years: Array.from(yearsSet).sort((a,b) => a - b),
    metrics: metrics
  };
}

/**
 * Formata um valor de acordo com o tipo de métrica para apresentação na tooltip/legenda.
 * - Para Populacao e Habitacoes (valores absolutos grandes): adiciona separador de milhar.
 * - Para percentagens (métricas terminadas em '%'): formata com uma casa decimal + '%' sufixo.
 * - Para rácios (habitações por 1000 hab): formata com uma casa decimal.
 * - Caso geral (fallback): retorna o valor original.
 */
function formatValue(metricKey, value) {
  if (metricKey.includes("%")) {
    // Métricas percentuais
    return value.toFixed(1) + "%";
  }
  if (metricKey === "Habitacoes_por_1000_hab") {
    return value.toFixed(1);
  }
  if (metricKey === "Populacao" || metricKey === "Habitacoes") {
    // Formatar com separador de milhar (ex: 1234567 -> "1,234,567")
    return value.toLocaleString('pt-PT');
  }
  // Caso geral
  return value;
}
