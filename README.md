# 🧬 Evolutionary Optimization Viz — AG vs PSO vs ED

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)
![Plotly](https://img.shields.io/badge/Plotly.js-2.27-3F4F75?logo=plotly)
![License](https://img.shields.io/badge/License-MIT-green)

[🇺🇸 English](#english) | [🇧🇷 Português Brasileiro](#português-brasileiro)

---

<a name="english"></a>
## 🇺🇸 English

> Interactive client-side visualization comparing **Genetic Algorithm (AG)**, **Particle Swarm Optimization (PSO)** and **Differential Evolution (ED)** on benchmark functions.
>
> **Live Demo:** [https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)


### 🚀 Getting Started

This project runs entirely in the browser — no backend required!

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/joaosnet/evolutionary-optimization-viz-ag-pso.git
    cd evolutionary-optimization-viz-ag-pso
    ```

2.  **Serve locally** (any static file server):
    ```bash
    npx serve .
    # or
    python -m http.server 8000
    ```

3.  **Open the application:**
    Open your browser at `http://localhost:8000` (or whatever port your server uses).

### 🎯 Features

- ✅ **3D Visualization**: Interactive Plotly 3D surface + scatter of each algorithm's population.
- ✅ **Real-Coded GA**: Tournament selection, single-point crossover, uniform mutation.
- ✅ **PSO**: Canonical particle swarm with inertia weight, cognitive and social components.
- ✅ **Differential Evolution (DE/rand/1/bin)**: Mutation, binomial crossover, greedy selection.
- ✅ **Real-time Convergence**: Live comparison chart of all three algorithms.
- ✅ **Custom Functions**: Enter any math expression via MathLive virtual keyboard.
- ✅ **SBC Reports**: Generate PDF reports in the Brazilian Computer Society format (client-side via jsPDF).
- ✅ **Interactive Controls**: Tweak hyperparameters on the fly.
- ✅ **i18n**: English and Portuguese (BR) interface.
- ✅ **Dark/Light Theme**: Animated day/night toggle.

### 📚 Algorithms

| Algorithm | Key Parameters | Strategy |
|-----------|---------------|----------|
| **AG** (Genetic Algorithm) | Mutation rate, Crossover rate | Tournament selection, single-point crossover, uniform mutation |
| **PSO** (Particle Swarm) | w, c1, c2 | Velocity/position update with personal & global best |
| **ED** (Differential Evolution) | F (scale factor), CR (crossover rate) | DE/rand/1/bin: donor vector + binomial crossover + greedy selection |

---

<a name="português-brasileiro"></a>
## 🇧🇷 Português Brasileiro

> Visualização interativa no navegador comparando **Algoritmo Genético (AG)**, **Otimização por Enxame de Partículas (PSO)** e **Evolução Diferencial (ED)** em funções benchmark.
>
> **Demonstração Online:** [https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)


### 🚀 Instalação e Execução

Este projeto roda inteiramente no navegador — sem backend necessário!

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/joaosnet/evolutionary-optimization-viz-ag-pso.git
    cd evolutionary-optimization-viz-ag-pso
    ```

2.  **Sirva localmente** (qualquer servidor de arquivos estáticos):
    ```bash
    npx serve .
    # ou
    python -m http.server 8000
    ```

3.  **Abra a aplicação:**
    Acesse no seu navegador: `http://localhost:8000`.

### 🎯 Funcionalidades

- ✅ **Visualização 3D**: Superfície Plotly 3D + scatter da população de cada algoritmo.
- ✅ **AG com representação real**: Seleção por torneio, crossover de ponto único, mutação uniforme.
- ✅ **PSO**: Enxame de partículas canônico com inércia, componentes cognitivo e social.
- ✅ **Evolução Diferencial (DE/rand/1/bin)**: Mutação diferencial, crossover binomial, seleção greedy.
- ✅ **Gráfico de Convergência**: Comparação em tempo real dos três algoritmos.
- ✅ **Funções Customizadas**: Insira qualquer expressão matemática via teclado virtual MathLive.
- ✅ **Relatórios SBC**: Geração de relatórios PDF no formato da Sociedade Brasileira de Computação (via jsPDF).
- ✅ **Controles Interativos**: Ajuste de hiperparâmetros em tempo de execução.
- ✅ **i18n**: Interface em Inglês e Português (BR).
- ✅ **Tema Claro/Escuro**: Alternância animada dia/noite.

### 📚 Algoritmos

| Algoritmo | Parâmetros Principais | Estratégia |
|-----------|----------------------|------------|
| **AG** (Algoritmo Genético) | Taxa de mutação, Taxa de crossover | Seleção por torneio, crossover ponto único, mutação uniforme |
| **PSO** (Enxame de Partículas) | w, c1, c2 | Atualização velocidade/posição com melhor pessoal e global |
| **ED** (Evolução Diferencial) | F (fator de escala), CR (taxa de crossover) | DE/rand/1/bin: vetor doador + crossover binomial + seleção greedy |

---

## 📄 Licença / License
MIT License

**Topics**: `evolutionary-computing` `genetic-algorithm` `particle-swarm-optimization` `differential-evolution` `pso` `dataviz` `interactive-simulation` `optimization` `javascript`