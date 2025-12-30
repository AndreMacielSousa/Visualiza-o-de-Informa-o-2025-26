# Visualização da Informação — Parque Habitacional e População em Portugal (1940–2021)

## Enquadramento

Este repositório contém o desenvolvimento do **Trabalho 2 — Protótipo estático com ferramentas de dashboard**, no âmbito da unidade curricular de **Visualização da Informação**.

Após a fase exploratória inicial (Trabalho 1) e tendo em conta o feedback da equipa docente, o projeto evolui de uma exploração ampla de possibilidades visuais para uma **narrativa visual mais focada e coesa**, centrada na relação entre **habitação e população** em Portugal ao longo do tempo.

---

## Pergunta de investigação (guião principal)

O trabalho procura responder à seguinte pergunta central:

> **De que forma a evolução do parque habitacional em Portugal acompanhou — ou divergiu — da evolução da população entre 1940 e 2021, e como variam essas dinâmicas entre os diferentes distritos?**

Esta pergunta orienta todas as decisões relativas aos dados, às visualizações e à estrutura do protótipo de dashboard.

---

## Questões secundárias

Para operacionalizar a análise, foram definidas as seguintes questões secundárias:

- **O crescimento do número de habitações foi proporcional ao crescimento da população ao longo do tempo?**
- **Existem distritos onde o número de habitações cresceu mais rapidamente do que a população, e outros onde ocorreu o inverso?**
- **Em que períodos temporais se observam desvios mais significativos entre a evolução da população e a evolução do parque habitacional?**

Estas questões guiam a escolha das visualizações e a organização do dashboard.

---

## Decisões metodológicas (com base no feedback do docente)

### Do Trabalho 1 para o Trabalho 2: foco e escolha informada

Na fase exploratória inicial, foram testadas múltiplas visualizações para analisar duas grandes perspetivas:

1. **Totais globais e distribuição espacial**
2. **Evolução temporal (série histórica)**

Tal como assinalado pela equipa docente:

> "Neste momento, o que acontece é que com as visualizações em si, vocês estão basicamente a testar duas ideias em formatos diferentes. Uma das ideias sendo a apresentação dos totais globais e outra a apresentação da evolução da versão temporal ou da série temporal, como quiserem. E, portanto, nas próximas etapas, a ideia será decidir para uma determinada perspetiva, qual das visualizações é mais funcional. Aqui, penso que não será preciso dizer-vos que o mapa coroplético funciona bastante melhor do que o Tree Map, porque estamos a falar de dados geográficos e, portanto, a apresentação geográfica é evidente."

Assim, neste Trabalho 2, deixamos de “testar formatos em paralelo” e passamos a **selecionar explicitamente as visualizações mais funcionais** para cada perspetiva analítica.

### Escolha de visualizações

- **Distribuição espacial (dados geográficos)**  
  O **mapa coroplético** é adotado como visualização principal para a análise espacial, por preservar a estrutura geográfica do território e permitir uma leitura imediata das assimetrias regionais.  
  O **treemap** é mantido apenas como referência exploratória do Trabalho 1 (ou alternativa comparativa), mas não como visualização central do protótipo, dado que abstrai a dimensão territorial.

- **Evolução temporal (foco do Trabalho 2)**  
  Dado o foco analítico deste trabalho, privilegiam-se visualizações **temporais**, nomeadamente:
  - heatmaps (Distrito × Ano),
  - séries temporais,
  - small multiples.

Estas decisões refletem a transição de uma fase exploratória para uma fase de **escolha informada**, orientada pela adequação das codificações visuais à pergunta de investigação.

---

## Dados e próximos passos

### Integração da dimensão populacional

Para responder à pergunta de investigação, o projeto será alargado com a integração de uma nova dimensão:

- **Número de habitantes por distrito**, por ano censitário.

Esta integração permitirá:
- análises per capita (habitações por habitante);
- identificação de situações de crescimento habitacional sem crescimento populacional;
- leitura mais contextualizada das dinâmicas territoriais.

### Anos em falta (197X)

Reconhecendo a relevância histórica da década de 1970, será realizado um esforço adicional para:

- identificar fontes alternativas ou complementares para os dados em falta;
- avaliar a viabilidade de integração dos dados de 1970;
- documentar explicitamente os processos de validação, exclusão ou decisão metodológica associados a este período.

Independentemente do resultado, estas decisões serão descritas de forma transparente no relatório.

---

## Ferramentas

- **Tableau Public** — construção do protótipo de dashboard estático;
- **Python** — preparação, limpeza e harmonização dos dados;
- **HTML / GitHub Pages** — disponibilização pública das visualizações;
- **GitHub** — versionamento e documentação do projeto.

---

## Estrutura do repositório

/
├── data/ # Datasets (habitação, população, geográficos)
├── notebooks/ # Scripts de preparação e validação dos dados
├── tableau/ # Ligações ou exports do Tableau Public
├── docs/ # Relatórios e documentação
├── site/ # Página do projeto (GitHub Pages)
└── README.md


---

## Nota final

Este trabalho assume explicitamente uma **postura analítica e crítica**, reconhecendo a visualização como um processo iterativo de descoberta. As escolhas efetuadas refletem a adequação funcional das representações às perguntas colocadas, em coerência com os objetivos da unidade curricular e com o feedback da equipa docente.
