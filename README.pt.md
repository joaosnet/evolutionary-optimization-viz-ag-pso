# Evolutionary Optimization Viz: AG vs PSO vs ED

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Plotly](https://img.shields.io/badge/Plotly.js-2.27-3F4F75?style=flat-square&logo=plotly&logoColor=white)](https://plotly.com/javascript/)
[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-111827?style=flat-square)](LICENSE)
[![Demonstração Online](https://img.shields.io/badge/Demo-GitHub%20Pages-2563EB?style=flat-square)](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)

[English](README.md) | [Português](README.pt.md) | [Español](README.es.md)

---

Ambiente visual client-side para análise comparativa entre Algoritmo Genético (AG), Otimização por Enxame de Partículas (PSO) e Evolução Diferencial (ED) em superfícies de teste multidimensionais.

![Demonstração da Simulação](demo.gif)

## Execução Local

A aplicação roda diretamente no navegador, sem necessidade de backend ou etapa de compilação.

```bash
# Clonar o repositório
git clone https://github.com/joaosnet/evolutionary-optimization-viz-ag-pso.git
cd evolutionary-optimization-viz-ag-pso

# Executar um servidor estático local
npx serve .
# ou
python -m http.server 8000
```

Acesse `http://localhost:8000` no navegador.

Demonstração online: [joaosnet.github.io/evolutionary-optimization-viz-ag-pso](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)

## Algoritmos

| Algoritmo | Paradigma | Representação | Operadores e Hiperparâmetros |
| :--- | :--- | :--- | :--- |
| **AG** (Algoritmo Genético) | Evolucionário | Vetor real contínuo | Seleção por torneio ($k=3$), crossover aritmético ($P_c$), mutação uniforme limitada ($P_m$). |
| **PSO** (Enxame de Partículas) | Inteligência de Enxame | Posição e velocidade contínuas | Inércia ($w$), aceleração cognitiva ($c_1$), aceleração social ($c_2$), limitação de velocidade. |
| **ED** (Evolução Diferencial) | Evolucionário | Vetor contínuo | Estratégia `DE/rand/1/bin`: vetor doador com fator de escala $F$, crossover binomial ($CR$), seleção gulosa. |

## Recursos Implementados

- **Visualização 3D da População**: Superfície interativa em Plotly WebGL sincronizada com nuvem de dispersão das partículas a cada geração.
- **Funções Matemáticas Customizadas**: Entrada de fórmulas em LaTeX via MathLive e avaliação de AST com Math.js em até 12 dimensões, com fixação de valores para $x_3 \dots x_n$.
- **Critérios de Otimização**: Suporte a minimização, maximização e convergência para valor-alvo com tolerância ajustável.
- **Controle Temporal de Execução**: Registro de snapshots por iteração para pausa, retrocesso, avanço passo a passo, reconfiguração dinâmica de parâmetros e retomada.
- **Módulo de Benchmark Estatístico**: Execuções automatizadas em lote (5 a 100 repetições) com cálculo de média, desvio padrão, iteração de convergência e taxa de vitória por método.
- **Relatórios no Padrão SBC**: Geração client-side de artigos técnicos em PDF conforme as normas da Sociedade Brasileira de Computação (jsPDF + autoTable), incluindo gráficos vetoriais e tabelas de parâmetros.
- **Execução Nativa no Navegador**: Implementação pura em ES6+ com aceleração de canvas 2D (`willReadFrequently`), alternância de tema claro/escuro e sem dependências de servidor.

## Licença

Distribuído sob a licença [MIT](LICENSE).
