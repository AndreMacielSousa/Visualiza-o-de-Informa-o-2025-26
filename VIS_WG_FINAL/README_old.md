# VIS_WG_FINAL (D3.js)

## Estrutura
- index.html
- css/styles.css
- js/ (ES modules)
- data/
  - housing_population_long.csv
  - georef-portugal-distrito-millesime.geojson

## Implementado (responde aos desafios anteriores)
- Mapa coroplético com hover + clique (seleção de distrito).
- Série temporal do distrito selecionado.
- Brush na série temporal (intervalo) que atualiza o scatter.
- Scatter por distrito (média no intervalo) com clique para selecionar.
- Reset (métrica, ano, brush e seleção).
- Inclui aliases para Açores e Madeira (utils.js).

## CSV esperado
district_name, year, population, housing, housing_per_1000, housing_yoy_pct, population_yoy_pct, delta_growth
