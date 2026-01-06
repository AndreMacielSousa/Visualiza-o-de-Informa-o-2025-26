# Manual prático — Criação das visualizações no Tableau  
**Trabalho 2 — Protótipo estático de dashboard**

Este manual descreve os **passos essenciais para criar as visualizações principais no Tableau Public**, garantindo coerência metodológica, visual e analítica no desenvolvimento do protótipo do Trabalho 2.

---

## 1. Preparação inicial no Tableau

### 1.1 Importar os dados estatísticos

1. Abrir o **Tableau Public**.
2. Em **Connect**, selecionar:
   - *Text File* (CSV), ou  
   - *Microsoft Excel* (XLSX).
3. Importar o dataset consolidado contendo, no mínimo:
   - `Distrito`
   - `Ano`
   - `Habitacoes`
   - `Populacao`
   - métricas derivadas (ex.: `Habitacoes_por_1000_hab`).

Confirmar:
- `Ano` como **Dimensão** (numérica ou data discreta);
- métricas como **Measures**.

---

### 1.2 Importar o ficheiro GeoJSON

1. Em **Connect**, selecionar **Spatial File**.
2. Carregar o ficheiro `distritos.geojson`.
3. O Tableau criará automaticamente um campo do tipo **Geometry**.

---

### 1.3 Relacionar os dados

1. No separador **Data Source**, criar uma **Relationship** entre:
   - campo `Distrito` do dataset estatístico;
   - campo correspondente do GeoJSON.
2. Confirmar correspondência exata dos nomes dos distritos.

> ⚠️ Sempre que possível, utilizar *relationships* em vez de *joins* rígidos, para maior flexibilidade.

---

## 2. Visualização 1 — Mapa coroplético (Distribuição espacial)

### Objetivo
Representar a distribuição espacial das métricas por distrito.

### Passos

1. Criar uma nova **Sheet**.
2. Arrastar o campo **Geometry** para o espaço de trabalho.
3. Arrastar a métrica pretendida (ex.: `Habitacoes_por_1000_hab`) para **Color**.
4. Em **Color → Edit Colors**:
   - escolher uma paleta contínua;
   - evitar contrastes excessivos;
   - garantir legibilidade.

5. Ajustar:
   - legenda clara;
   - unidades normalizadas;
   - título informativo.

**Boas práticas**
- Preferir métricas per capita.
- Evitar valores absolutos muito elevados sem formatação.

---

## 3. Visualização 2 — Heatmap (Distrito × Ano)

### Objetivo
Analisar padrões temporais e assimetrias regionais.

### Passos

1. Criar nova **Sheet**.
2. Arrastar `Distrito` para **Rows**.
3. Arrastar `Ano` para **Columns**.
4. Arrastar a métrica para **Color**.
5. Em **Marks**, selecionar **Square**.
6. Ajustar o tamanho dos quadrados para preencher a grelha.

**Recomendações**
- Ordenar distritos de forma consistente (alfabética ou por valor médio).
- Usar a mesma paleta cromática do mapa, sempre que possível.

---

## 4. Visualização 3 — Séries temporais (complementar)

### Objetivo
Analisar a evolução temporal global ou por subconjunto de distritos.

### Passos

1. Criar nova **Sheet**.
2. Arrastar `Ano` para **Columns**.
3. Arrastar a métrica para **Rows**.
4. (Opcional) Arrastar `Distrito` para **Color**.
5. Reduzir a espessura das linhas para evitar sobreposição.

**Alternativa**
- Criar **Small Multiples**, colocando `Distrito` em **Rows** ou **Columns**.

---

## 5. Ajustes visuais essenciais (obrigatórios)

Antes de integrar no dashboard, garantir:

- Eixos formatados em **milhares ou milhões**;
- Fontes legíveis (evitar *tick marks* demasiado pequenos);
- Paletas testadas quanto à **discriminabilidade**;
- Títulos claros e autoexplicativos;
- *Tooltips* informativos mas concisos.

---

## 6. Construção do Dashboard

### Passos

1. Criar um novo **Dashboard**.
2. Definir tamanho fixo (adequado a ecrã ou PDF).
3. Arrastar as visualizações:
   - mapa como âncora espacial;
   - heatmap como foco temporal;
   - séries temporais como apoio analítico.
4. Adicionar filtros globais:
   - Ano;
   - Distrito;
   - Métrica (se aplicável).
5. Testar coerência visual e narrativa.

---

## 7. Exportação e publicação

- Exportar visualizações em **SVG** quando integradas no relatório.
- Publicar o dashboard no **Tableau Public**.
- Copiar o link público para:
  - o relatório em PDF;
  - o `README.md` do repositório.

---

## 8. Checklist final

- [ ] Visualizações respondem à pergunta de investigação  
- [ ] Cor usada como canal informativo  
- [ ] Escalas e legendas legíveis  
- [ ] Decisões visuais justificáveis  
- [ ] Dashboard coeso e sem redundâncias  

---

Este manual serve como **referência operacional comum** para o desenvolvimento do Trabalho 2.
