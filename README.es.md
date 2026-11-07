# Evolutionary Optimization Viz: AG vs PSO vs ED

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Plotly](https://img.shields.io/badge/Plotly.js-2.27-3F4F75?style=flat-square&logo=plotly&logoColor=white)](https://plotly.com/javascript/)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-111827?style=flat-square)](LICENSE)
[![Demostración en Vivo](https://img.shields.io/badge/Demo-GitHub%20Pages-2563EB?style=flat-square)](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)

[English](README.md) | [Português](README.pt.md) | [Español](README.es.md)

---

Entorno visual del lado del cliente para el análisis comparativo entre Algoritmo Genético (AG), Optimización por Enjambre de Partículas (PSO) y Evolución Diferencial (ED) en funciones de prueba multidimensionales.

![Demostración de la Simulación](demo.gif)

## Inicio Rápido

La aplicación se ejecuta directamente en el navegador, sin necesidad de backend ni pasos de compilación.

```bash
# Clonar el repositorio
git clone https://github.com/joaosnet/evolutionary-optimization-viz-ag-pso.git
cd evolutionary-optimization-viz-ag-pso

# Servir con cualquier servidor web estático
npx serve .
# o
python -m http.server 8000
```

Abra `http://localhost:8000` en cualquier navegador web moderno.

Demostración en vivo: [joaosnet.github.io/evolutionary-optimization-viz-ag-pso](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)

## Algoritmos

| Algoritmo | Paradigma | Representación | Operadores e Hiperparámetros |
| :--- | :--- | :--- | :--- |
| **AG** (Algoritmo Genético) | Evolutivo | Vector real continuo | Selección por torneo ($k=3$), cruce aritmético ($P_c$), mutación uniforme acotada ($P_m$). |
| **PSO** (Enjambre de Partículas) | Inteligencia de Enjambre | Posición y velocidad continuas | Peso de inercia ($w$), aceleración cognitiva ($c_1$), aceleración social ($c_2$), limitación de velocidad. |
| **ED** (Evolución Diferencial) | Evolutivo | Vector continuo | Estrategia `DE/rand/1/bin`: vector donante escalado por $F$, cruce binomial ($CR$), selección voraz (greedy). |

## Capacidades Técnicas

- **Superficie 3D y Proyección del Enjambre**: Superficie interactiva con Plotly WebGL sincronizada con las posiciones de la población actualizadas en cada generación.
- **Funciones Objetivo Arbitrarias**: Evaluación de expresiones matemáticas hasta 12 dimensiones mediante entrada LaTeX en MathLive y AST con Math.js, permitiendo fijar valores para los cortes $x_3 \dots x_n$.
- **Criterios de Optimización**: Soporte para minimización global, maximización y convergencia a un valor objetivo con tolerancia configurable.
- **Control Temporal y Restauración de Estado**: Instantáneas (snapshots) por iteración que permiten pausar, retroceder, avanzar paso a paso, reajustar parámetros y reanudar la ejecución.
- **Motor de Pruebas Estadísticas (Benchmark)**: Ejecución automatizada tipo Monte Carlo (5 a 100 repeticiones) con cálculo de media, desviación estándar, iteración de convergencia y distribución de victorias.
- **Informes Técnicos en Formato SBC**: Generación en el cliente de documentos PDF según las normas de la Sociedade Brasileira de Computação (jsPDF + autoTable), con gráficos vectoriales y tablas de parámetros.
- **Tiempo de Ejecución sin Dependencias**: Código en ES6+ estándar con aceleración de canvas 2D (`willReadFrequently`), alternancia de modo oscuro/claro y sin carga de servidor.

## Licencia

Distribuido bajo la [Licencia MIT](LICENSE).
