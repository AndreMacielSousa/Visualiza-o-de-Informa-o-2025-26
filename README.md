# Visualização da Informação — Parque Habitacional e População em Portugal (1940–2021)

Este repositório reúne os trabalhos desenvolvidos no âmbito da unidade curricular de
**Visualização da Informação**, organizados de forma incremental e coerente com as
diferentes fases de desenvolvimento do projeto.

O tema central do projeto é a análise da relação entre a evolução do **parque habitacional**
e da **população residente** em Portugal, entre 1940 e 2021, com especial atenção às
dinâmicas territoriais ao nível dos distritos.

---

## Organização do repositório

O trabalho encontra-se estruturado de forma **progressiva**, refletindo a lógica
metodológica da unidade curricular e a evolução do projeto ao longo do semestre.

<table width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td bgcolor="#f3f4f6" style="padding:16px 20px; border-left:6px solid #64748b;">
      <strong>Trabalho 1 — Exploração inicial e prototipagem experimental</strong><br>
      Fase exploratória, orientada para a experimentação de diferentes técnicas de
      visualização e para a formulação de hipóteses visuais.
    </td>
  </tr>
</table>

<br>

<table width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td bgcolor="#f3f4f6" style="padding:16px 20px; border-left:6px solid #2563eb;">
      <strong>Trabalho 2 — Protótipo estático com ferramentas de dashboard</strong><br>
      Fase de consolidação, focada na seleção informada das visualizações mais funcionais
      e na construção de um protótipo visual coeso.
    </td>
  </tr>
</table>

<br>

<table width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td bgcolor="#f3f4f6" style="padding:16px 20px; border-left:6px solid #16a34a;">
      <strong>Projeto Final — Visualização interativa</strong><br>
      Fase final de integração, implementação e refinamento, materializando as decisões
      tomadas nas fases anteriores num protótipo interativo funcional.
    </td>
  </tr>
</table>

---

## Trabalho 1 — Exploração inicial

O **Trabalho 1** corresponde à fase de exploração aberta dos dados, tendo como objetivos:

- compreender a estrutura e limitações dos dados disponíveis;
- experimentar diferentes técnicas de visualização (espaciais, temporais e proporcionais);
- identificar padrões, ruturas e assimetrias territoriais;
- formular hipóteses visuais, mesmo que inconclusivas ou parcialmente incorretas.

Nesta fase foram testadas múltiplas abordagens para duas grandes perspetivas analíticas:

1. **Distribuição espacial e totais globais**
2. **Evolução temporal (série histórica)**

A diversidade de visualizações teve um caráter deliberadamente exploratório, servindo
como base para reflexão crítica, discussão em fórum e apoio à tomada de decisões nas
fases seguintes.

📁 Os materiais do Trabalho 1 encontram-se organizados na pasta:

/Trabalho_1/


---

## Trabalho 2 — Consolidação e protótipo de dashboard

O **Trabalho 2** representa a evolução do projeto após a fase exploratória inicial,
incorporando o feedback da equipa docente e as conclusões retiradas do Trabalho 1.

Nesta fase, o foco deixa de ser a experimentação de múltiplos formatos e passa a ser a
**seleção consciente das visualizações mais funcionais** para cada perspetiva analítica.

Em particular:

- o **mapa coroplético** é adotado como visualização espacial principal, por preservar a
  estrutura geográfica do território e facilitar comparações regionais;
- para a **evolução temporal**, opta-se por uma hierarquia clara de visualizações, com
  destaque para o **heatmap (Distrito × Ano)** como âncora temporal;
- as séries temporais e os *small multiples* são utilizados apenas de forma complementar.

Adicionalmente, o Trabalho 2 introduz:
- a integração explícita da **dimensão populacional**;
- métricas normalizadas (ex.: habitações por 1000 habitantes);
- um protótipo de dashboard estático desenvolvido em **Tableau Public**.

📁 Os materiais do Trabalho 2 encontram-se organizados na pasta:

/Trabalho_2/


---

## Projeto Final — Visualização interativa

O **Projeto Final** corresponde à fase de materialização e síntese do trabalho
desenvolvido anteriormente, transformando as decisões analíticas e visuais num
**protótipo interativo funcional**.

Esta fase integra:
- as visualizações selecionadas e validadas no Trabalho 2;
- mecanismos de interação orientados à exploração dos dados;
- uma estrutura visual coerente e alinhada com os princípios de percepção,
  codificação visual e design discutidos na unidade curricular.

📁 O projeto final encontra-se organizado na pasta:

/VIS_WG_FINAL/


---

## Nota final

A separação entre **Trabalho 1**, **Trabalho 2** e **Projeto Final** reflete a lógica
incremental da unidade curricular, distinguindo claramente:

- uma fase de **exploração e formulação de hipóteses**;
- uma fase de **decisão, consolidação e prototipagem estática**;
- uma fase de **implementação e integração interativa**.

O repositório foi estruturado para tornar essa progressão explícita, transparente e
facilmente compreensível para qualquer leitor.
