##Descrição do Dataset Normalizado e Nota sobre Limitações

O dataset utilizado neste trabalho foi extraído diretamente do Instituto Nacional de Estatística (INE) em 22 de novembro de 2025, às 17:57:22, através do portal oficial (http://www.ine.pt
). Os dados originais, referentes aos “Alojamentos Familiares Clássicos à data dos Censos”, encontravam-se organizados em formato matricial, com distritos distribuídos em linhas e anos em colunas, o que dificultava a aplicação direta das metodologias de visualização.

Para garantir consistência analítica e alinhamento com boas práticas de preparação de dados, procedeu-se à normalização completa do dataset. O ficheiro resultante (habitacoes_normalizado.xlsx) segue um formato tabular estruturado da seguinte forma:

#Distrito | Ano | Habitações

A normalização contemplou:

- Transposição da matriz original para formato longo, adequado para séries temporais e análises comparativas;

- Uniformização dos nomes dos distritos e verificação de coerência interna;

- Conversão de valores numéricos, removendo símbolos ou formatos ambíguos;

- Garantia de granularidade única, assegurando que cada linha representa exclusivamente uma combinação Distrito–Ano;

- Adaptação do dataset para compatibilidade com diferentes técnicas de visualização, tais como mapas coropléticos, treemaps, heatmaps temporais, fluxos e small multiples.

#Limitação Identificada: Ausência de Dados Fiáveis para o Censo de 1970

Durante o processo de recolha e validação dos dados, constatou-se uma limitação relevante referente ao Censo de 1970. Apesar de existir documentação em PDF no site do INE, esta apresenta problemas que impossibilitam a sua utilização rigorosa:

- Formatação inconsistente, dificultando a leitura e interpretação das tabelas;

- Tabelas incompletas ou visualmente degradadas, impedindo a extração fiável dos valores;

- Incoerências numéricas quando comparadas com os valores dos Censos de 1960 e 1981;

- Ausência de um formato digital estruturado, compatível com processos de análise e visualização.

Face a estas limitações, e para assegurar a integridade metodológica do trabalho, foi decidido excluir os valores relativos ao ano de 1970 do dataset normalizado. Esta decisão evita a incorporação de dados potencialmente incorretos e garante que as visualizações produzidas se baseiam apenas em fontes verificáveis e consistentes.

Apesar desta ausência, a análise exploratória não fica comprometida, uma vez que a continuidade temporal e a coerência dos restantes anos fornecem uma base sólida para comparação visual. Ainda assim, a limitação é registada de forma explícita, servindo como alerta para futuras fases de validação cruzada ou eventual recolha manual certificada, caso seja necessária uma série histórica completa.