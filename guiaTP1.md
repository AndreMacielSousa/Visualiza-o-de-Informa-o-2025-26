📘 Trabalho 1 — Exploração Inicial e Prototipagem Experimental
👥 Grupo

Pedro Pereira – 1102837

Miguel Correia – 1103691

André Maciel – 1300012

📖 1. Introdução

Este trabalho integra a fase exploratória inicial da unidade curricular Visualização de Informação, cujo objetivo é testar diferentes técnicas visuais, levantar hipóteses e compreender como a estrutura dos dados afeta a eficácia da visualização.

Nesta fase não se espera um resultado final polido, mas sim uma abordagem aberta, experimental e iterativa, alinhada com o espírito do Trabalho 1: experimentar, comparar e aprender com erros.

📊 2. Dados utilizados

Dataset selecionado:
Alojamentos Familiares Clássicos à data dos Censos (INE, 1940–2021)

Características:

dados quantitativos

desagregação territorial por distrito

observações discretas em nove operações censitárias

elevado valor analítico para o estudo de Habitação

Justificação:

permite analisar evolução temporal de mais de 80 anos

ideal para técnicas de mapeamento e comparação regional

compatível com múltiplos idioms visuais discutidos por Munzner

🧭 3. Estratégia de exploração

Em vez de organizar o trabalho por distrito, optámos por dividir por tipo de visualização, explorando a diversidade de técnicas permitidas por ferramentas como RAWGraphs, Datawrapper e Python.

Visualizações previstas:

Mapa coroplético (anos antigo + recente)

Treemap espacialmente consciente

Heatmap temporal

Linhas temporais distorcidas (fluxos)

Small multiples comparativos

Esta abordagem permite:

testar hipóteses diferentes para o mesmo conjunto de dados

comparar a eficácia de vários encodings

identificar limitações específicas de cada técnica

responder ao enunciado, que valoriza exploração e diversidade visual

🏠 4. Pertinência para o estudo da Habitação

A evolução dos alojamentos familiares ao longo de oito décadas possibilita investigar:

crescimento urbano

assimetrias regionais

ciclos demográficos e económicos

fenómenos interior vs litoral

Padrões deste tipo são ideais para aplicar:

técnicas de mapeamento,

codificação por cor,

comparação temporal,

análise multiescala.

🔍 5. O que estes padrões permitem explorar

De acordo com o Trabalho 1, procurámos realizar visualizações que permitem:

Identificar tendências

Testar diferentes encodings

Aprender com erros de mapeamento

Observar limitações do dataset

baixa granularidade temporal

assimetrias geográficas

risco de ilusões perceptivas (área vs cor)

A reflexão crítica será integrada no relatório final.

🧩 6. Distribuição de tarefas
André Maciel — Mapa Coroplético

Criar mapa coroplético (RAWGraphs ou Datawrapper)

Comparar ano antigo (ex.: 1940/1970) com 2021

Testar escalas de cor e limites perceptivos

Explicar acertos/erros (áreas, cores, dispersão geográfica)

Pedro Pereira — Treemap + Small Multiples

Treemap espacialmente consciente

Representação proporcional

Testar impacto de perder georreferência

Explicar diferenças face ao mapa

Small multiples

Criar grelha por ano ou por distrito

Avaliar visibilidade de padrões e comparação temporal

Miguel Correia — Heatmap + Linhas temporais distorcidas

Heatmap temporal

Matriz distrito × ano

Identificar padrões e contrastes

Avaliar limites (perda de geografia)

Linhas temporais distorcidas

Testar técnicas que acentuam variações

Explorar tendências e rupturas

📌 7. Próximos passos

Gerar as cinco visualizações exploratórias

Criar texto crítico para cada visualização

Unir tudo no relatório (4–6 páginas)

Exportar PDF com imagens integradas

Submissão no Moodle
