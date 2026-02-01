# 🧬 AG vs PSO - Evolutionary Optimization / Otimização Evolutiva

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-green)

[🇺🇸 English](#english) | [🇧🇷 Português Brasileiro](#português-brasileiro)

---

<a name="english"></a>
## 🇺🇸 English

> Interactive visualization comparing Genetic Algorithms (Real-Coded) and PSO on the Rastrigin function.
>
> **Live Demo:** [https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)

### 📸 Screenshots

![Simulation](screenshot-simulation.png)

### 🚀 Installation & Running

This project uses a **Python/FastAPI** backend for simulation logic and a **React** frontend.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/seu-usuario/evolutionary-optimization-viz-ag-pso.git
    cd evolutionary-optimization-viz-ag-pso
    ```

2.  **Install dependencies and run (using `uv`):**
    ```bash
    # Sync dependencies
    uv sync

    # Run the server
    uv run uvicorn app.main:app --reload
    ```
    *Alternatively, using standard pip:*
    ```bash
    pip install -r requirements.txt  # (If requirements.txt exists)
    # OR manually: pip install fastapi uvicorn numpy websockets
    python -m uvicorn app.main:app --reload
    ```

3.  **Open the application:**
    Open your browser at `http://localhost:8000`.

### dart Features

- ✅ **2D Visualization**: Interactive heatmap of the Rastrigin function.
- ✅ **Real-Coded GA**: BLX-α crossover, Gaussian mutation, Tournament selection.
- ✅ **PSO**: Particle Swarm with adaptive inertia.
- ✅ **Real-time Convergence**: Live graphing of population/swarm fitness.
- ✅ **SBC Reports**: Generate PDF reports in the Brazilian Computer Society format.
- ✅ **Interactive Controls**: Tweak hyperparameters on the fly.

### 📚 Theory (Brief)

**Rastrigin Function**:
$f(x) = 10n + \sum[x_i^2 - 10 \cdot \cos(2\pi x_i)]$

---

<a name="português-brasileiro"></a>
## 🇧🇷 Português Brasileiro

> Visualização interativa comparando Algoritmos Genéticos (Real-Coded) e PSO na função Rastrigin.
>
> **Demonstração Online:** [https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/](https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/)

### 📸 Screenshots

![Simulação](screenshot-simulation.png)

### 🚀 Instalação e Execução

Este projeto utiliza um backend **Python/FastAPI** para a lógica de simulação e um frontend **React**.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/evolutionary-optimization-viz-ag-pso.git
    cd evolutionary-optimization-viz-ag-pso
    ```

2.  **Instale as dependências e execute (usando `uv`):**
    ```bash
    # Sincronizar dependências
    uv sync

    # Rodar o servidor
    uv run uvicorn app.main:app --reload
    ```
    *Alternativamente, usando pip padrão:*
    ```bash
    pip install -r requirements.txt # (Se houver arquivo requirements)
    # OU manualmente: pip install fastapi uvicorn numpy websockets
    python -m uvicorn app.main:app --reload
    ```

3.  **Abra a aplicação:**
    Acesse no seu navegador: `http://localhost:8000`.

### 🎯 Funcionalidades

- ✅ **Visualização 2D**: Mapa de calor interativo da função Rastrigin.
- ✅ **AG com representação real**: Crossover BLX-α, Mutação Gaussiana, Torneio.
- ✅ **PSO**: Velocidade adaptativa com componentes cognitivo e social.
- ✅ **Gráfico de Convergência**: Acompanhamento em tempo real.
- ✅ **Relatórios SBC**: Geração de relatórios PDF no formato da Sociedade Brasileira de Computação.
- ✅ **Controles Interativos**: Ajuste de hiperparâmetros em tempo de execução.

### 📚 Teoria (Resumo)

**Função Rastrigin**:
$f(x) = 10n + \sum[x_i^2 - 10 \cdot \cos(2\pi x_i)]$

---

## 📄 Licença / License
MIT License

**Topics**: `evolutionary-computing` `genetic-algorithm` `particle-swarm-optimization` `pso` `react` `dataviz` `interactive-simulation` `rastrigin` `optimization`