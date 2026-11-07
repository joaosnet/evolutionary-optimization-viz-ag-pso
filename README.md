# Evolutionary Optimization Viz: GA vs PSO vs DE

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Plotly](https://img.shields.io/badge/Plotly.js-2.27-3F4F75?style=flat-square&logo=plotly&logoColor=white)](https://plotly.com/javascript/)
[![License: MIT](https://img.shields.io/badge/License-MIT-111827?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-2563EB?style=flat-square)](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)

[English](README.md) | [Português](README.pt.md) | [Español](README.es.md)

---

Client-side visual workbench comparing Genetic Algorithm (GA), Particle Swarm Optimization (PSO), and Differential Evolution (DE) across multi-dimensional benchmark landscapes.

![Optimization Simulation](demo.gif)

## Quickstart

The application runs entirely in the browser without backends or build steps.

```bash
# Clone the repository
git clone https://github.com/joaosnet/evolutionary-optimization-viz-ag-pso.git
cd evolutionary-optimization-viz-ag-pso

# Serve with any static web server
npx serve .
# or
python -m http.server 8000
```

Open `http://localhost:8000` in any modern web browser.

Live deployment: [joaosnet.github.io/evolutionary-optimization-viz-ag-pso](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)

## Algorithms

| Algorithm | Paradigm | Representation | Core Operators & Hyperparameters |
| :--- | :--- | :--- | :--- |
| **GA** (Genetic Algorithm) | Evolutionary | Real-coded vector | Tournament selection ($k=3$), arithmetic crossover ($P_c$), uniform bounded mutation ($P_m$). |
| **PSO** (Particle Swarm) | Swarm Intelligence | Continuous position & velocity | Inertia weight ($w$), cognitive acceleration ($c_1$), social acceleration ($c_2$), velocity clamping. |
| **DE** (Differential Evolution) | Evolutionary | Continuous vector | Strategy `DE/rand/1/bin`: mutation difference vector scaled by $F$, binomial crossover ($CR$), greedy 1-to-1 selection. |

## Technical Capabilities

- **3D Landscape & Swarm Projection**: Interactive Plotly WebGL surface combined with live population scatter coordinates updated per generation.
- **Arbitrary Objective Functions**: Parses mathematical expressions up to 12 dimensions with MathLive LaTeX input and Math.js AST evaluation, supporting slice planes for $x_3 \dots x_n$.
- **Optimization Modes**: Supports global minimization, maximization, and target value convergence with user-defined tolerance.
- **Deterministic Playback & State Rewind**: Per-generation snapshots support pausing, stepping backward/forward, parameter adjustments mid-run, and resuming execution.
- **Statistical Benchmark Engine**: Automated Monte Carlo execution across multiple runs (5 to 100 seeds) reporting mean fitness, standard deviation, convergence generation, and win distribution.
- **SBC Paper Reports**: Client-side PDF generation following Sociedade Brasileira de Computação article standards via jsPDF and autoTable, embedding plots, parameter tables, and mathematical notation.
- **Zero-Dependency Runtime**: Written in standard ES6+ with native canvas acceleration (`willReadFrequently`), zero server overhead, and dark/light UI modes.

## License

Distributed under the [MIT License](LICENSE).
