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

---
<table width="100%" cellspacing="0" cellpadding="0">
  <tr>
   <td bgcolor="#e90b16ff" style="padding:14px 18px;">
      <strong>Organização do trabalho</strong><br>
      As secções seguintes descrevem a componente <em>operacional</em> do Trabalho&nbsp;2,
      incluindo a distribuição de tarefas pela equipa e os procedimentos técnicos
      necessários à implementação do protótipo de dashboard.
    </td>
  </tr>
</table>






<hr>

# Trabalho 2 — Protótipo de Dashboard  
## Parque Habitacional e População em Portugal (1940–2021)

Este documento descreve a **distribuição de tarefas** da equipa e os **procedimentos técnicos** para integração dos dados geográficos (GeoJSON) no Tableau, no âmbito do Trabalho 2 da unidade curricular de Visualização da Informação.

---

## 1. Distribuição de tarefas

A organização do trabalho foi definida de forma a separar claramente responsabilidades técnicas, analíticas e de comunicação, garantindo eficiência e coerência metodológica.

### 1.1 Dados e integração (Responsável A)

**Objetivo:** preparar um dataset único e consistente para utilização no Tableau.

Tarefas:
- Recolha dos dados de **população por distrito e ano censitário**.
- Harmonização das chaves (`Distrito`, `Ano`) entre:
  - alojamentos familiares clássicos;
  - população residente.
- Criação de métricas derivadas:
  - `Habitações por 1000 habitantes`;
  - variação percentual de habitações;
  - variação percentual da população;
  - desvio entre crescimento habitacional e crescimento populacional.
- Análise e tentativa de colmatar os **dados em falta dos anos 197X**, documentando o processo e as decisões tomadas.
- Validação básica dos dados (coerência temporal e territorial).

Entregáveis:
- Dataset final (`CSV` ou `XLSX`) pronto para Tableau.
- Notas de limpeza e validação para inclusão no relatório.

---

### 1.2 Geografia e mapa (Responsável B)

**Objetivo:** garantir a correta integração da componente geográfica no Tableau.

Tarefas:
- Validação do ficheiro **GeoJSON dos distritos de Portugal**.
- Identificação do campo que representa o nome do distrito no GeoJSON.
- Normalização dos nomes dos distritos, assegurando correspondência com o dataset estatístico.
- Apoio à criação do mapa coroplético no Tableau.
- Criação de tabela de correspondência (mapping), se necessário, para resolver inconsistências de nomes.

Entregáveis:
- Ficheiro `distritos.geojson` validado.
- Eventual tabela auxiliar de correspondência de nomes.

---

### 1.3 Dashboard e visualizações (Responsável C)

**Objetivo:** construir o protótipo de dashboard estático no Tableau.

Tarefas:
- Criação das visualizações principais:
  - mapa coroplético (distribuição espacial);
  - heatmap Distrito × Ano;
  - séries temporais ou small multiples;
  - visualização complementar de ranking ou comparação, se aplicável.
- Implementação de filtros globais (Ano, Distrito, Métrica).
- Garantia de coerência visual:
  - paletas de cor adequadas;
  - eixos com escalas legíveis (milhares);
  - tooltips informativos.
- Construção do dashboard final, integrando as visualizações de forma coesa.

Entregáveis:
- Link público do Tableau Public (ou ficheiro `.twb/.twbx`).
- Capturas de ecrã das visualizações para o relatório.

---

### 1.4 Relatório (Responsável D)

**Objetivo:** redigir o relatório final (6–8 páginas).

Tarefas:
- Formulação da pergunta de investigação e questões secundárias.
- Descrição dos dados, limpeza e validação (incluindo anos 197X).
- Justificação das escolhas visuais e exclusão de alternativas menos funcionais.
- Análise e interpretação dos resultados.
- Reflexão crítica sobre limitações e melhorias futuras.
- Revisão de citações e bibliografia (consistência total).

Entregáveis:
- Relatório final em PDF.

---

## 2. Integração do GeoJSON no Tableau

### 2.1 Preparação do ficheiro GeoJSON

Antes da importação no Tableau, deve garantir-se que:
- o ficheiro está num único `.geojson`;
- cada distrito corresponde a um único polígono;
- existe um campo identificador do distrito (ex.: `name`, `district`, `DISTRITO`);
- os nomes dos distritos coincidem exatamente com os do dataset estatístico.

---

### 2.2 Importar GeoJSON no Tableau Desktop / Tableau Public (app)

Passos:
1. Abrir o Tableau.
2. Em **Connect**, selecionar **Spatial File**.
3. Escolher o ficheiro `distritos.geojson`.
4. O Tableau irá criar automaticamente um campo do tipo **Geometry**.
5. Arrastar o campo **Geometry** para a área de trabalho para criar o mapa base.
6. Adicionar o dataset estatístico (habitação + população).
7. Criar uma **Relationship** ou **Join** entre:
   - campo do distrito no GeoJSON;
   - campo `Distrito` do dataset estatístico.

---

### 2.3 Importar GeoJSON no Tableau Public (web)

Caso seja utilizado o Tableau no browser:
1. Criar um novo workbook.
2. Na secção **Files**, fazer upload do ficheiro `distritos.geojson`.
3. Adicionar o ficheiro de dados estatísticos.
4. Relacionar as tabelas pelo campo do distrito.
5. Construir o mapa coroplético a partir do campo **Geometry**.

> Nota: a disponibilidade desta opção depende do tipo de acesso/licença do Tableau.

---

### 2.4 Boas práticas para o mapa coroplético

- Utilizar métricas normalizadas (ex.: habitações por 1000 habitantes).
- Evitar escalas com valores absolutos muito grandes sem formatação.
- Garantir legendas claras e fontes legíveis.
- Usar o mapa como visualização âncora, complementada por vistas temporais.

---

## 3. Nota final

A distribuição de tarefas e os procedimentos técnicos descritos visam garantir:
- coerência metodológica;
- alinhamento com o feedback da equipa docente;
- foco na análise temporal e territorial;
- integração consistente entre dados estatísticos e geográficos.

Este README serve como referência operacional para o desenvolvimento do Trabalho 2.

