/**
 * Main Application - Client-Side Optimization Visualization
 * Static version for GitHub Pages (no backend required)
 */

// DOM Elements
const agScoreEl = document.getElementById('ag-score');
const psoScoreEl = document.getElementById('pso-score');
const edScoreEl = document.getElementById('ed-score');
const iterationEl = document.getElementById('iteration-display');
const iterationValueEl = document.getElementById('iteration-value');
const startBtn = document.getElementById('startBtn');
const functionInputEl = document.getElementById('function_expr');
const dimensionsInputEl = document.getElementById('dimensions');
const functionErrorEl = document.getElementById('function-error');
const fixedDimsGridEl = document.getElementById('fixed-dims-grid');

// Simulation state
let isRunning = false;
let currentIteration = 0;
let maxComputedIteration = 0;
let resizeTimer;
let simulationTimer = null;

// Algorithm instances
let gaInstance = null;
let psoInstance = null;
let edInstance = null;

const historyCache = {
    ag: [],
    pso: [],
    ed: []
};

const DEFAULT_EXPRESSION = '0.5 - ((sin(sqrt(x1^2 + x2^2))^2 - 0.5) / (1 + 0.001*(x1^2 + x2^2))^2)';
const DEFAULT_DIMENSIONS = 2;
let currentDimensions = DEFAULT_DIMENSIONS;
let compiledExpression = null;
let currentExpression = DEFAULT_EXPRESSION;

const allowedFunctions = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh', 'sqrt', 'abs', 'exp',
    'log', 'log10', 'pi', 'e'
]);

// Generate Static Mesh for Plotly
const size = 70;
const step = 10.24 / (size - 1);
const x_range = Array.from({ length: size }, (_, i) => -5.12 + step * i);
const y_range = Array.from({ length: size }, (_, i) => -5.12 + step * i);
let base_z_data = y_range.map(() => x_range.map(() => 0));

const surfaceTrace = {
    z: base_z_data,
    x: x_range,
    y: y_range,
    type: 'surface',
    colorscale: 'Viridis',
    opacity: 0.45,
    showscale: false
};

let cachedSurfaceZ = base_z_data;

// --- Internationalization (i18n) ---
const translations = {
    en: {
        eyebrow: "Live Optimization",
        title: "Optimization Showdown",
        subtitle: "AG vs PSO vs ED on Rastrigin Surface",
        start: "Start",
        pause: "Pause",
        reset: "Reset",
        iteration: "Iteration",
        settings: "Model Parameters & Settings",
        settings_note: "Tune population and dynamics",
        global: "Global",
        function_label: "Function",
        dimensions: "Dimensions",
        fixed_values: "Fixed values (x3+)",
        seek_iteration: "Seek",
        pop_size: "Population",
        delay: "Delay (ms)",
        optimization_mode: "Optimization",
        minimize: "Minimize",
        maximize: "Maximize",
        target_mode: "Target",
        target_value: "Target",
        theme_label: "Theme",
        ag_title: "Genetic Algorithm",
        ag_mut: "Mutation Rate",
        ag_cross: "Crossover Rate",
        pso_title: "Particle Swarm",
        pso_w: "Inertia (w)",
        pso_c1: "Cognitive (c1)",
        pso_c2: "Social (c2)",
        ed_title: "Differential Evolution",
        ed_f: "Scale Factor (F)",
        ed_cr: "Crossover Rate (CR)",
        best_value: "Best Value",
        convergence: "Convergence Comparison",
        iteration_axis: "Iteration",
        fitness_axis: "Fitness",
        objective_axis: "Objective",
        function_error_empty: "Expression is empty.",
        function_error_dims: "Dimensions must be at least 2.",
        function_error_symbol: "Unsupported symbol(s):",
        mode_min: "MIN",
        mode_max: "MAX",
        mode_target: "TARGET",
        ag_series: "Genetic Algorithm",
        pso_series: "Particle Swarm",
        ed_series: "Differential Evolution",
        surface_opacity: "Surface",
        point_size: "Points",
        convergence_stop: "Stop on Convergence",
        convergence_threshold: "Threshold",
        convergence_window: "Window (iters)",
        converged_msg: "Converged!",
        continue: "Continue",
        generate_report: "Report",
        benchmark_title: "Multi-Run Benchmark",
        benchmark_runs: "Number of Runs",
        benchmark_iters: "Iterations per Run",
        benchmark_start: "Run Benchmark",
        benchmark_stop: "Stop",
        benchmark_running: "Running...",
        benchmark_stats: "Statistics",
        benchmark_wins: "Wins per Algorithm",
        benchmark_winner: "Winner",
        benchmark_tie: "Tie",
        benchmark_result_title: "Benchmark Results",
        benchmark_result_subtitle: "runs completed",
        stat_mean: "Mean",
        stat_std: "Std Dev",
        stat_best: "Best",
        stat_worst: "Worst",
        stat_median: "Median",
        stat_wins: "Wins"
    },
    pt: {
        eyebrow: "Otimização ao Vivo",
        title: "Batalha de Otimização",
        subtitle: "AG vs PSO vs ED na Superfície Rastrigin",
        start: "Iniciar",
        pause: "Pausar",
        reset: "Resetar",
        iteration: "Iteração",
        settings: "Parâmetros do Modelo",
        settings_note: "Ajuste população e dinâmicas",
        global: "Global",
        function_label: "Funcao",
        dimensions: "Dimensoes",
        fixed_values: "Valores fixos (x3+)",
        seek_iteration: "Ir",
        pop_size: "População",
        delay: "Atraso (ms)",
        optimization_mode: "Otimização",
        minimize: "Minimizar",
        maximize: "Maximizar",
        target_mode: "Alvo",
        target_value: "Alvo",
        theme_label: "Tema",
        ag_title: "Algoritmo Genético",
        ag_mut: "Taxa de Mutação",
        ag_cross: "Taxa de Crossover",
        pso_title: "Enxame de Partículas",
        pso_w: "Inércia (w)",
        pso_c1: "Cognitivo (c1)",
        pso_c2: "Social (c2)",
        ed_title: "Evolução Diferencial",
        ed_f: "Fator de Escala (F)",
        ed_cr: "Taxa de Crossover (CR)",
        best_value: "Melhor Valor",
        convergence: "Comparação de Convergência",
        iteration_axis: "Iteração",
        fitness_axis: "Fitness",
        objective_axis: "Objetivo",
        function_error_empty: "A expressao esta vazia.",
        function_error_dims: "A dimensao deve ser pelo menos 2.",
        function_error_symbol: "Simbolo(s) nao suportado(s):",
        mode_min: "MIN",
        mode_max: "MAX",
        mode_target: "ALVO",
        ag_series: "Algoritmo Genético",
        pso_series: "Enxame de Partículas",
        ed_series: "Evolução Diferencial",
        surface_opacity: "Superfície",
        point_size: "Pontos",
        convergence_stop: "Parar ao Convergir",
        convergence_threshold: "Limiar",
        convergence_window: "Janela (iters)",
        converged_msg: "Convergiu!",
        continue: "Continuar",
        generate_report: "Relatório",
        benchmark_title: "Benchmark Multi-Execução",
        benchmark_runs: "Número de Execuções",
        benchmark_iters: "Iterações por Execução",
        benchmark_start: "Executar Benchmark",
        benchmark_stop: "Parar",
        benchmark_running: "Executando...",
        benchmark_stats: "Estatísticas",
        benchmark_wins: "Vitórias por Algoritmo",
        benchmark_winner: "Vencedor",
        benchmark_tie: "Empate",
        benchmark_result_title: "Resultados do Benchmark",
        benchmark_result_subtitle: "execuções concluídas",
        stat_mean: "Média",
        stat_std: "Desvio Padrão",
        stat_best: "Melhor",
        stat_worst: "Pior",
        stat_median: "Mediana",
        stat_wins: "Vitórias"
    }
};

let currentLang = 'en';

function initLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    currentLang = userLang.startsWith('pt') ? 'pt' : 'en';
    const savedLang = localStorage.getItem('lang');
    if (savedLang) currentLang = savedLang;
    updateLanguageUI();
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'pt' : 'en';
    localStorage.setItem('lang', currentLang);
    updateLanguageUI();
}

function updateLanguageUI() {
    document.documentElement.setAttribute('data-lang', currentLang);

    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.setAttribute('aria-checked', currentLang === 'pt' ? 'true' : 'false');
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
    updateStartBtnText();
    updateIterationLabel();
    updatePlotLanguage();
}

function updateIterationLabel() {
    if (iterationValueEl) {
        iterationValueEl.textContent = `${currentIteration}`;
    }
}

function updateStartBtnText() {
    const key = isRunning ? 'pause' : 'start';
    startBtn.textContent = translations[currentLang][key];
}

function normalizeExpression(expr) {
    return expr
        .replace(/[\u2217\u22C5\u00D7]/g, '*')
        .replace(/[\u2212\u2012\u2013\u2014]/g, '-')
        .replace(/\bln\b/g, 'log')
        .replace(/x_\{?\s*(\d+)\s*\}?/g, 'x$1')
        .trim();
}

function getExpressionValue() {
    if (!functionInputEl) return '';
    if (functionInputEl.tagName === 'MATH-FIELD' && typeof functionInputEl.getValue === 'function') {
        return functionInputEl.getValue('ascii-math');
    }
    return functionInputEl.value || '';
}

function setExpressionValue(expr) {
    if (!functionInputEl) return;
    if (functionInputEl.tagName === 'MATH-FIELD' && typeof functionInputEl.setValue === 'function') {
        functionInputEl.setValue(expr, { format: 'ascii-math' });
        return;
    }
    functionInputEl.value = expr;
}

function validateExpression(expr, dims) {
    if (!expr || !expr.trim()) {
        throw new Error(translations[currentLang].function_error_empty || 'Expression is empty.');
    }
    if (!Number.isFinite(dims) || dims < 2) {
        throw new Error(translations[currentLang].function_error_dims || 'Dimensions must be at least 2.');
    }
    if (typeof window.math === 'undefined') {
        throw new Error('MathJS is not available.');
    }

    const node = window.math.parse(expr);
    const symbols = new Set();
    const functions = new Set();

    node.traverse(child => {
        if (child.isSymbolNode) {
            symbols.add(child.name);
        }
        if (child.isFunctionNode && child.fn && child.fn.name) {
            functions.add(child.fn.name);
        }
    });

    const allowedVars = new Set(Array.from({ length: dims }, (_, i) => `x${i + 1}`));
    const allowedConsts = new Set(['pi', 'e']);

    const unknownFunctions = Array.from(functions).filter(name => !allowedFunctions.has(name));
    const unknownSymbols = Array.from(symbols).filter(name => {
        return !allowedVars.has(name) && !allowedConsts.has(name) && !allowedFunctions.has(name);
    });

    if (unknownFunctions.length || unknownSymbols.length) {
        const allUnknown = [...new Set([...unknownFunctions, ...unknownSymbols])];
        throw new Error(`${translations[currentLang].function_error_symbol || 'Unsupported symbol(s):'} ${allUnknown.join(', ')}`);
    }
}

function buildScopeFromVector(vec, dims) {
    const scope = { pi: Math.PI, e: Math.E };
    for (let i = 0; i < dims; i += 1) {
        scope[`x${i + 1}`] = vec[i] ?? 0;
    }
    return scope;
}

function getFixedDimensionValues() {
    const values = [];
    if (!fixedDimsGridEl) return values;
    fixedDimsGridEl.querySelectorAll('input[data-dim]').forEach(input => {
        const value = parseFloat(input.value);
        values.push(Number.isFinite(value) ? value : 0);
    });
    return values;
}

function compileExpression() {
    if (!functionInputEl || typeof window.math === 'undefined') return;

    const rawExpr = getExpressionValue();
    const dims = parseInt(dimensionsInputEl?.value, 10) || DEFAULT_DIMENSIONS;
    const normalized = normalizeExpression(rawExpr);

    try {
        validateExpression(normalized, dims);
        compiledExpression = window.math.compile(normalized);
        currentExpression = normalized;
        currentDimensions = dims;
        if (functionErrorEl) functionErrorEl.textContent = '';
        updateFixedDimensionInputs(dims);
        updateSurfaceTraces();
        resetSimulation();
    } catch (err) {
        compiledExpression = null;
        if (functionErrorEl) functionErrorEl.textContent = err.message || 'Invalid expression.';
    }
}

function evaluateExpressionVector(vec) {
    if (!compiledExpression) return NaN;
    try {
        return compiledExpression.evaluate(buildScopeFromVector(vec, currentDimensions));
    } catch (err) {
        return NaN;
    }
}

function evaluateExpressionAt(x1, x2) {
    const fixedValues = getFixedDimensionValues();
    const vec = [x1, x2, ...fixedValues];
    return evaluateExpressionVector(vec);
}

function updateFixedDimensionInputs(dims) {
    if (!fixedDimsGridEl) return;
    fixedDimsGridEl.innerHTML = '';
    if (dims <= 2) return;

    for (let i = 3; i <= dims; i += 1) {
        const label = document.createElement('label');
        label.textContent = `x${i}`;
        const input = document.createElement('input');
        input.type = 'number';
        input.value = '0';
        input.setAttribute('data-dim', String(i));
        input.addEventListener('input', () => {
            updateSurfaceTraces();
        });
        label.appendChild(input);
        fixedDimsGridEl.appendChild(label);
    }
}


// --- Plotly Init ---
const layout3D = {
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
        xaxis: { title: '' },
        yaxis: { title: '' },
        zaxis: { title: '' },
        camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
};

const layoutConvergence = {
    autosize: true,
    margin: { l: 55, r: 25, b: 45, t: 30 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: {
        title: { text: 'Iteration', standoff: 10 },
        automargin: true
    },
    yaxis: {
        title: { text: 'Fitness', standoff: 10 },
        automargin: true
    },
    legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.02,
        xanchor: 'center',
        x: 0.5
    }
};

function getSeriesNames() {
    return {
        ag: translations[currentLang].ag_series || 'Genetic Algorithm',
        pso: translations[currentLang].pso_series || 'Particle Swarm',
        ed: translations[currentLang].ed_series || 'Differential Evolution'
    };
}

function getNumberValue(id, fallback) {
    const el = document.getElementById(id);
    const value = el ? parseFloat(el.value) : NaN;
    return Number.isFinite(value) ? value : fallback;
}

function getOptimizationMode() {
    const select = document.getElementById('optimization_mode');
    return select ? select.value : 'max';
}

function getTargetValue() {
    return getNumberValue('optimization_target', 0);
}

function applyObjectiveValue(rawValue) {
    const mode = getOptimizationMode();
    if (mode === 'target') {
        return Math.abs(rawValue - getTargetValue());
    }
    return rawValue;
}

function safeValue(value) {
    return Number.isFinite(value) ? value : 0;
}

function getSurfaceZ() {
    if (!compiledExpression) return base_z_data;
    return y_range.map(y => x_range.map(x => applyObjectiveValue(safeValue(evaluateExpressionAt(x, y)))));
}

function getModeLabel() {
    const mode = getOptimizationMode();
    if (mode === 'min') return translations[currentLang].mode_min || 'MIN';
    if (mode === 'target') return translations[currentLang].mode_target || 'TARGET';
    return translations[currentLang].mode_max || 'MAX';
}

function updateOptimizationUI() {
    const mode = getOptimizationMode();
    const targetField = document.querySelector('.target-field');
    const targetInput = document.getElementById('optimization_target');

    if (targetField && targetInput) {
        const isTarget = mode === 'target';
        targetInput.disabled = !isTarget;
        targetField.style.opacity = isTarget ? '1' : '0.5';
    }
}

function updateModeLabels() {
    const modeLabel = getModeLabel();
    document.querySelectorAll('.best-mode-label').forEach(el => {
        el.textContent = modeLabel;
    });

    const objectiveLabel = translations[currentLang].objective_axis || 'Objective';
    try {
        Plotly.relayout('convergencePlot', {
            'yaxis.title.text': `${objectiveLabel} (${modeLabel})`
        });
    } catch (e) {
        console.log('Plotly not ready');
    }
}

function updateSurfaceTraces() {
    cachedSurfaceZ = getSurfaceZ();
    try {
        Plotly.restyle('agPlot', { z: [cachedSurfaceZ] }, [0]);
        Plotly.restyle('psoPlot', { z: [cachedSurfaceZ] }, [0]);
        Plotly.restyle('edPlot', { z: [cachedSurfaceZ] }, [0]);
    } catch (e) {
        console.log('Plotly not ready');
    }
}

function initPlots() {
    const seriesNames = getSeriesNames();
    const agPointSize = getNumberValue('ag_point_size', 5);
    const psoPointSize = getNumberValue('pso_point_size', 5);
    const edPointSize = getNumberValue('ed_point_size', 5);
    const agSurfaceOpacity = getNumberValue('ag_surface_opacity', 0.45);
    const psoSurfaceOpacity = getNumberValue('pso_surface_opacity', 0.45);
    const edSurfaceOpacity = getNumberValue('ed_surface_opacity', 0.45);
    cachedSurfaceZ = getSurfaceZ();
    const agSurface = { ...surfaceTrace, z: cachedSurfaceZ, opacity: agSurfaceOpacity };
    const psoSurface = { ...surfaceTrace, z: cachedSurfaceZ, opacity: psoSurfaceOpacity };
    const edSurface = { ...surfaceTrace, z: cachedSurfaceZ, opacity: edSurfaceOpacity };

    // AG 3D Plot
    Plotly.newPlot('agPlot', [agSurface, {
        x: [], y: [], z: [],
        mode: 'markers',
        type: 'scatter3d',
        marker: { size: agPointSize, color: '#0f766e' },
        name: seriesNames.ag
    }], layout3D, { responsive: true, displayModeBar: false });

    // PSO 3D Plot
    Plotly.newPlot('psoPlot', [psoSurface, {
        x: [], y: [], z: [],
        mode: 'markers',
        type: 'scatter3d',
        marker: { size: psoPointSize, color: '#d97706' },
        name: seriesNames.pso
    }], layout3D, { responsive: true, displayModeBar: false });

    // ED 3D Plot
    Plotly.newPlot('edPlot', [edSurface, {
        x: [], y: [], z: [],
        mode: 'markers',
        type: 'scatter3d',
        marker: { size: edPointSize, color: '#be123c' },
        name: seriesNames.ed
    }], layout3D, { responsive: true, displayModeBar: false });

    // Convergence Plot
    Plotly.newPlot('convergencePlot', [
        { x: [], y: [], mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } },
        { x: [], y: [], mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } },
        { x: [], y: [], mode: 'lines', name: seriesNames.ed, line: { color: '#be123c' } }
    ], layoutConvergence, { responsive: true, displayModeBar: false });
    updatePlotLanguage();
}

// --- Local Simulation (replaces WebSocket) ---

/**
 * Build the fitness function for algorithms
 */
function buildFitnessFunction() {
    return function (population) {
        return population.map(individual => {
            const scope = { pi: Math.PI, e: Math.E };
            for (let i = 0; i < currentDimensions; i++) {
                scope[`x${i + 1}`] = individual[i];
            }
            try {
                return compiledExpression.evaluate(scope);
            } catch (e) {
                return NaN;
            }
        });
    };
}

/**
 * Get bounds for optimization (default: [-5.12, 5.12] for each dimension)
 */
function getBounds() {
    const bounds = [];
    for (let i = 0; i < currentDimensions; i++) {
        bounds.push([-5.12, 5.12]);
    }
    return bounds;
}

/**
 * Initialize algorithm instances with current parameters
 */
function initAlgorithms() {
    if (!compiledExpression) return false;

    const fitnessFunc = buildFitnessFunction();
    const bounds = getBounds();
    const popSize = parseInt(document.getElementById('pop_size')?.value) || 50;
    const convergenceEnabled = document.getElementById('convergence_enabled')?.checked || false;
    const convergenceThreshold = parseFloat(document.getElementById('convergence_threshold')?.value) || 1e-6;
    const convergenceWindow = parseInt(document.getElementById('convergence_window')?.value) || 20;

    const gaOptions = {
        mutationRate: parseFloat(document.getElementById('ag_mutation')?.value) || 0.01,
        crossoverRate: parseFloat(document.getElementById('ag_crossover')?.value) || 0.7,
        optimizationMode: getOptimizationMode(),
        targetValue: getTargetValue(),
        convergenceThreshold: convergenceEnabled ? convergenceThreshold : 0,
        convergenceWindow: convergenceWindow
    };

    const psoOptions = {
        w: parseFloat(document.getElementById('pso_w')?.value) || 0.5,
        c1: parseFloat(document.getElementById('pso_c1')?.value) || 1.5,
        c2: parseFloat(document.getElementById('pso_c2')?.value) || 1.5,
        optimizationMode: getOptimizationMode(),
        targetValue: getTargetValue(),
        convergenceThreshold: convergenceEnabled ? convergenceThreshold : 0,
        convergenceWindow: convergenceWindow
    };

    const edOptions = {
        F: parseFloat(document.getElementById('ed_f')?.value) || 0.8,
        CR: parseFloat(document.getElementById('ed_cr')?.value) || 0.9,
        optimizationMode: getOptimizationMode(),
        targetValue: getTargetValue(),
        convergenceThreshold: convergenceEnabled ? convergenceThreshold : 0,
        convergenceWindow: convergenceWindow
    };

    try {
        gaInstance = new GeneticAlgorithm(fitnessFunc, bounds, popSize, currentDimensions, gaOptions);
        psoInstance = new ParticleSwarmOptimization(fitnessFunc, bounds, popSize, currentDimensions, psoOptions);
        edInstance = new DifferentialEvolution(fitnessFunc, bounds, popSize, currentDimensions, edOptions);
        return true;
    } catch (e) {
        console.error('Failed to initialize algorithms:', e);
        return false;
    }
}

/**
 * Perform one simulation step
 */
function simulationStep() {
    if (!gaInstance || !psoInstance || !edInstance) return;

    // Step all algorithms
    gaInstance.step();
    psoInstance.step();
    edInstance.step();

    // Get states
    const agState = gaInstance.getState();
    const psoState = psoInstance.getState();
    const edState = edInstance.getState();

    // Update dashboard
    updateDashboard({
        ag: {
            ...agState,
            best_score: agState.bestScore,
            max_iteration: agState.maxIteration
        },
        pso: {
            ...psoState,
            best_score: psoState.bestScore,
            max_iteration: psoState.maxIteration
        },
        ed: {
            ...edState,
            best_score: edState.bestScore,
            max_iteration: edState.maxIteration
        }
    });

    // Schedule next step if running
    if (isRunning) {
        const delay = parseInt(document.getElementById('sim_delay')?.value) || 0;
        if (delay > 0) {
            simulationTimer = setTimeout(simulationStep, delay);
        } else {
            simulationTimer = requestAnimationFrame(simulationStep);
        }
    }
}

function updateDashboard(data) {
    if (data?.error && functionErrorEl) {
        functionErrorEl.textContent = data.error;
    }
    if (data?.ag && Number.isFinite(data.ag.iteration)) {
        historyCache.ag[data.ag.iteration] = data.ag.best_score;
    }
    if (data?.pso && Number.isFinite(data.pso.iteration)) {
        historyCache.pso[data.pso.iteration] = data.pso.best_score;
    }
    if (data?.ed && Number.isFinite(data.ed.iteration)) {
        historyCache.ed[data.ed.iteration] = data.ed.best_score;
    }
    if (data?.ag?.max_iteration !== undefined) {
        updateSeekControls(data.ag.max_iteration, data.ag.iteration);
    }

    if (data.ag) {
        agScoreEl.textContent = Number.isFinite(data.ag.best_score) ? data.ag.best_score.toFixed(4) : "Inf";
        currentIteration = data.ag.iteration;
        updateIterationLabel();

        const agX = data.ag.population.map(p => p[0]);
        const agY = data.ag.population.map(p => p[1]);
        const agZ = data.ag.population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))));

        const agData = [{ ...surfaceTrace, z: cachedSurfaceZ, opacity: getNumberValue('ag_surface_opacity', 0.45) }, {
            x: agX, y: agY, z: agZ,
            mode: 'markers',
            type: 'scatter3d',
            marker: { size: getNumberValue('ag_point_size', 5), color: '#0f766e' },
            name: getSeriesNames().ag
        }];

        Plotly.react('agPlot', agData, document.getElementById('agPlot').layout);
    }

    if (data.pso) {
        psoScoreEl.textContent = Number.isFinite(data.pso.best_score) ? data.pso.best_score.toFixed(4) : "Inf";

        const psoX = data.pso.population.map(p => p[0]);
        const psoY = data.pso.population.map(p => p[1]);
        const psoZ = data.pso.population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))));

        const psoData = [{ ...surfaceTrace, z: cachedSurfaceZ, opacity: getNumberValue('pso_surface_opacity', 0.45) }, {
            x: psoX, y: psoY, z: psoZ,
            mode: 'markers',
            type: 'scatter3d',
            marker: { size: getNumberValue('pso_point_size', 5), color: '#d97706' },
            name: getSeriesNames().pso
        }];

        Plotly.react('psoPlot', psoData, document.getElementById('psoPlot').layout);
    }

    if (data.ed) {
        edScoreEl.textContent = Number.isFinite(data.ed.best_score) ? data.ed.best_score.toFixed(4) : "Inf";

        const edX = data.ed.population.map(p => p[0]);
        const edY = data.ed.population.map(p => p[1]);
        const edZ = data.ed.population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))));

        const edData = [{ ...surfaceTrace, z: cachedSurfaceZ, opacity: getNumberValue('ed_surface_opacity', 0.45) }, {
            x: edX, y: edY, z: edZ,
            mode: 'markers',
            type: 'scatter3d',
            marker: { size: getNumberValue('ed_point_size', 5), color: '#be123c' },
            name: getSeriesNames().ed
        }];

        Plotly.react('edPlot', edData, document.getElementById('edPlot').layout);
    }

    // Update Convergence Chart
    if (data.ag && data.pso && data.ed) {
        renderConvergence(data.ag.iteration);

        // Check for convergence and auto-stop
        const agConverged = data.ag.converged === true;
        const psoConverged = data.pso.converged === true;
        const edConverged = data.ed.converged === true;

        if (agConverged || psoConverged || edConverged) {
            const convergenceEnabledEl = document.getElementById('convergence_enabled');
            if (convergenceEnabledEl && convergenceEnabledEl.checked && isRunning) {
                isRunning = false;
                updateStartBtnText();
                stopSimulation();

                // Show convergence notification
                const convergedMsg = translations[currentLang].converged_msg || 'Converged!';
                const parts = [];
                if (agConverged) parts.push('AG');
                if (psoConverged) parts.push('PSO');
                if (edConverged) parts.push('ED');
                const who = parts.join(' & ');
                if (functionErrorEl) {
                    functionErrorEl.textContent = `✓ ${who} ${convergedMsg}`;
                    functionErrorEl.classList.add('success-message');
                }
            }
        }
    }
}

function stopSimulation() {
    if (simulationTimer) {
        if (typeof simulationTimer === 'number') {
            cancelAnimationFrame(simulationTimer);
            clearTimeout(simulationTimer);
        }
        simulationTimer = null;
    }
}

function toggleSimulation() {
    isRunning = !isRunning;
    updateStartBtnText();

    if (isRunning) {
        if (!gaInstance || !psoInstance || !edInstance) {
            if (!initAlgorithms()) {
                isRunning = false;
                updateStartBtnText();
                return;
            }
        }
        simulationStep();
    } else {
        stopSimulation();
    }
}

function resetSimulation() {
    // Stop any running simulation
    isRunning = false;
    stopSimulation();
    updateStartBtnText();

    // Clear any previous convergence message
    if (functionErrorEl) {
        functionErrorEl.textContent = '';
        functionErrorEl.classList.remove('success-message');
    }

    if (!compiledExpression) {
        compileExpression();
    }
    if (!compiledExpression) {
        if (functionErrorEl) {
            functionErrorEl.textContent = translations[currentLang].function_error_empty || 'Expression is empty.';
        }
        return;
    }

    currentIteration = 0;
    updateIterationLabel();
    resetHistoryCache();

    // Initialize fresh algorithm instances
    initAlgorithms();

    // Reset Plots
    try {
        Plotly.deleteTraces('convergencePlot', [0, 1, 2]);
        const seriesNames = getSeriesNames();
        Plotly.addTraces('convergencePlot', [
            { x: [], y: [], mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } },
            { x: [], y: [], mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } },
            { x: [], y: [], mode: 'lines', name: seriesNames.ed, line: { color: '#be123c' } }
        ]);
    } catch (e) {
        console.log('Plotly not ready');
    }

    // Show initial state
    if (gaInstance && psoInstance && edInstance) {
        const agState = gaInstance.getState();
        const psoState = psoInstance.getState();
        const edState = edInstance.getState();
        updateDashboard({
            ag: { ...agState, best_score: agState.bestScore, max_iteration: agState.maxIteration },
            pso: { ...psoState, best_score: psoState.bestScore, max_iteration: psoState.maxIteration },
            ed: { ...edState, best_score: edState.bestScore, max_iteration: edState.maxIteration }
        });
    }
}

function seekToIteration(iteration) {
    if (!gaInstance || !psoInstance || !edInstance) return;

    const agState = gaInstance.getStateAt(iteration);
    const psoState = psoInstance.getStateAt(iteration);
    const edState = edInstance.getStateAt(iteration);

    if (agState && psoState && edState) {
        gaInstance.restoreState(agState);
        psoInstance.restoreState(psoState);
        edInstance.restoreState(edState);

        updateDashboard({
            ag: {
                ...agState,
                best_score: agState.bestScore,
                iteration: agState.iteration,
                max_iteration: gaInstance.history.length - 1
            },
            pso: {
                ...psoState,
                best_score: psoState.bestScore,
                iteration: psoState.iteration,
                max_iteration: psoInstance.history.length - 1
            },
            ed: {
                ...edState,
                best_score: edState.bestScore,
                iteration: edState.iteration,
                max_iteration: edInstance.history.length - 1
            }
        });
    }
}

function stepForward() {
    if (currentIteration < maxComputedIteration) {
        seekToIteration(currentIteration + 1);
    }
}

function stepBackward() {
    if (currentIteration > 0) {
        seekToIteration(currentIteration - 1);
    }
}

function continueSimulation() {
    // Restore to max iteration first
    const maxIter = Math.max(
        gaInstance?.history?.length - 1 || 0,
        psoInstance?.history?.length - 1 || 0,
        edInstance?.history?.length - 1 || 0
    );
    if (maxIter > currentIteration) {
        seekToIteration(maxIter);
    }
    isRunning = true;
    updateStartBtnText();
    simulationStep();
}

function updateSeekControls(maxIteration, current) {
    maxComputedIteration = maxIteration;
    updateNavigationButtons(current, maxIteration);
}

function updateNavigationButtons(current, maxIter) {
    const prevBtn = document.getElementById('stepBackBtn');
    const nextBtn = document.getElementById('stepForwardBtn');
    const continueBtn = document.getElementById('continueBtn');

    if (prevBtn) prevBtn.disabled = current <= 0;
    if (nextBtn) nextBtn.disabled = current >= maxIter;
    if (continueBtn) {
        const isViewingPast = current < maxIter;
        continueBtn.style.display = isViewingPast ? 'inline-flex' : 'none';
    }
}

function resetHistoryCache() {
    historyCache.ag = [];
    historyCache.pso = [];
    historyCache.ed = [];
    maxComputedIteration = 0;
    renderConvergence(0);
}

function renderConvergence(iteration) {
    const seriesNames = getSeriesNames();
    const xValues = [];
    const agValues = [];
    const psoValues = [];
    const edValues = [];

    for (let i = 0; i <= iteration; i += 1) {
        if (historyCache.ag[i] === undefined || historyCache.pso[i] === undefined || historyCache.ed[i] === undefined) continue;
        xValues.push(i);
        agValues.push(historyCache.ag[i]);
        psoValues.push(historyCache.pso[i]);
        edValues.push(historyCache.ed[i]);
    }

    try {
        Plotly.react('convergencePlot', [
            { x: xValues, y: agValues, mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } },
            { x: xValues, y: psoValues, mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } },
            { x: xValues, y: edValues, mode: 'lines', name: seriesNames.ed, line: { color: '#be123c' } }
        ], layoutConvergence, { responsive: true, displayModeBar: false });
    } catch (e) {
        console.log('Plotly not ready');
    }
}

// --- Theme Management ---
const themeToggleBtn = document.getElementById('themeToggle');
const langToggleBtn = document.getElementById('langToggle');
const themeWipe = document.getElementById('themeWipe');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleState(savedTheme);
    updatePlotColors(savedTheme);
}

function toggleTheme(event) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    if (prefersReducedMotion || !themeWipe) {
        applyTheme(newTheme);
        return;
    }

    runThemeWipe(event, newTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggleState(theme);
    updatePlotColors(theme);
}

function runThemeWipe(event, nextTheme) {
    const source = event?.currentTarget || themeToggleBtn;
    const rect = source?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    themeWipe.style.setProperty('--wipe-x', `${centerX}px`);
    themeWipe.style.setProperty('--wipe-y', `${centerY}px`);
    const wipeColor = nextTheme === 'dark'
        ? getComputedStyle(document.documentElement).getPropertyValue('--wipe-dark').trim()
        : getComputedStyle(document.documentElement).getPropertyValue('--wipe-light').trim();
    themeWipe.style.setProperty('--wipe-color', wipeColor || (nextTheme === 'dark' ? '#0b1116' : '#f7f5f2'));

    themeWipe.classList.remove('is-active');
    void themeWipe.offsetWidth;
    themeWipe.classList.add('is-active');

    window.setTimeout(() => applyTheme(nextTheme), 180);
    window.setTimeout(() => themeWipe.classList.remove('is-active'), 720);
}

function updateThemeToggleState(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
}

function updatePlotColors(theme) {
    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue('--text-primary').trim() || (theme === 'dark' ? '#e7ecef' : '#1b1f24');
    const gridColor = styles.getPropertyValue('--border-color').trim() || (theme === 'dark' ? '#1f2a33' : '#e2ded9');

    const update = {
        'xaxis.color': textColor,
        'yaxis.color': textColor,
        'scene.xaxis.color': textColor,
        'scene.yaxis.color': textColor,
        'scene.zaxis.color': textColor,
        'font.color': textColor,
        'xaxis.gridcolor': gridColor,
        'yaxis.gridcolor': gridColor,
        'scene.xaxis.gridcolor': gridColor,
        'scene.yaxis.gridcolor': gridColor,
        'scene.zaxis.gridcolor': gridColor
    };

    try {
        if (document.getElementById('agPlot').data) Plotly.relayout('agPlot', update);
        if (document.getElementById('psoPlot').data) Plotly.relayout('psoPlot', update);
        if (document.getElementById('edPlot').data) Plotly.relayout('edPlot', update);
        if (document.getElementById('convergencePlot').data) Plotly.relayout('convergencePlot', update);
    } catch (e) { console.log("Plotly not ready"); }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
    themeToggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme(e);
        }
    });
}
if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguage);
    langToggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleLanguage();
        }
    });
}

function updatePlotControls() {
    const agSurfaceOpacity = getNumberValue('ag_surface_opacity', 0.45);
    const psoSurfaceOpacity = getNumberValue('pso_surface_opacity', 0.45);
    const edSurfaceOpacity = getNumberValue('ed_surface_opacity', 0.45);
    const agPointSize = getNumberValue('ag_point_size', 5);
    const psoPointSize = getNumberValue('pso_point_size', 5);
    const edPointSize = getNumberValue('ed_point_size', 5);

    try {
        Plotly.restyle('agPlot', { opacity: agSurfaceOpacity }, [0]);
        Plotly.restyle('agPlot', { 'marker.size': agPointSize }, [1]);
        Plotly.restyle('psoPlot', { opacity: psoSurfaceOpacity }, [0]);
        Plotly.restyle('psoPlot', { 'marker.size': psoPointSize }, [1]);
        Plotly.restyle('edPlot', { opacity: edSurfaceOpacity }, [0]);
        Plotly.restyle('edPlot', { 'marker.size': edPointSize }, [1]);
    } catch (e) {
        console.log('Plotly not ready');
    }
}

function initPlotControls() {
    const controlIds = [
        'ag_surface_opacity',
        'ag_point_size',
        'pso_surface_opacity',
        'pso_point_size',
        'ed_surface_opacity',
        'ed_point_size'
    ];

    controlIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updatePlotControls);
            el.addEventListener('change', updatePlotControls);
        }
    });
}

function handleOptimizationChange() {
    updateOptimizationUI();
    updateSurfaceTraces();
    updateModeLabels();
    resetSimulation();
}

function initOptimizationControls() {
    const modeSelect = document.getElementById('optimization_mode');
    const targetInput = document.getElementById('optimization_target');

    if (modeSelect) {
        modeSelect.addEventListener('change', handleOptimizationChange);
    }
    if (targetInput) {
        targetInput.addEventListener('input', handleOptimizationChange);
        targetInput.addEventListener('change', handleOptimizationChange);
    }

    updateOptimizationUI();
    updateModeLabels();
}

function initExpressionControls() {
    if (functionInputEl) {
        setExpressionValue(DEFAULT_EXPRESSION);
        functionInputEl.addEventListener('input', compileExpression);
        functionInputEl.addEventListener('change', compileExpression);
        functionInputEl.addEventListener('keyup', compileExpression);
    }
    if (dimensionsInputEl) {
        dimensionsInputEl.value = String(DEFAULT_DIMENSIONS);
        const dimValueEl = document.getElementById('val-dimensions');
        if (dimValueEl) dimValueEl.textContent = String(DEFAULT_DIMENSIONS);
        dimensionsInputEl.addEventListener('input', compileExpression);
        dimensionsInputEl.addEventListener('change', compileExpression);
    }
    updateFixedDimensionInputs(DEFAULT_DIMENSIONS);
    compileExpression();
}

function updatePlotLanguage() {
    const iterationLabel = translations[currentLang].iteration_axis || 'Iteration';
    const seriesNames = getSeriesNames();

    try {
        Plotly.relayout('convergencePlot', {
            'xaxis.title.text': iterationLabel
        });
        Plotly.restyle('convergencePlot', {
            name: [seriesNames.ag, seriesNames.pso, seriesNames.ed]
        }, [0, 1, 2]);
    } catch (e) {
        console.log('Plotly not ready');
    }

    updateModeLabels();
}

function resizePlots() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        try {
            const agPlot = document.getElementById('agPlot');
            const psoPlot = document.getElementById('psoPlot');
            const edPlot = document.getElementById('edPlot');
            const convergencePlot = document.getElementById('convergencePlot');

            if (agPlot) Plotly.Plots.resize(agPlot);
            if (psoPlot) Plotly.Plots.resize(psoPlot);
            if (edPlot) Plotly.Plots.resize(edPlot);
            if (convergencePlot) Plotly.Plots.resize(convergencePlot);
        } catch (e) {
            console.log('Plotly not ready');
        }
    }, 120);
}

// --- Algorithm Focus Mode ---
let focusedAlgorithm = null; // null = show all, 'ag' | 'pso' | 'ed'

function toggleFocus(algo) {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    if (focusedAlgorithm === algo) {
        // Unfocus — show all
        focusedAlgorithm = null;
        mainEl.removeAttribute('data-focus');
    } else {
        // Focus on this algorithm
        focusedAlgorithm = algo;
        mainEl.setAttribute('data-focus', algo);
    }

    // Update badge active states
    document.querySelectorAll('.badge').forEach(badge => {
        badge.classList.remove('badge-focused');
    });
    if (focusedAlgorithm) {
        const activeCard = mainEl.querySelector(`[data-algo="${focusedAlgorithm}"]`);
        if (activeCard) {
            activeCard.querySelector('.badge')?.classList.add('badge-focused');
        }
    }

    // Resize plots after CSS transition
    setTimeout(resizePlots, 350);
}

// Keyboard accessibility for badges (Enter/Space)
document.addEventListener('keydown', function(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('badge')) {
        e.preventDefault();
        e.target.click();
    }
});

// --- Report Generation (Client-Side PDF with jsPDF) ---
let titleClickCount = 0;
let titleClickTimer = null;

// --- Multi-Run Benchmark (Animated, Real-Time) ---
let benchmarkRunning = false;
let benchmarkCancelled = false;
let benchmarkTimer = null;

// Benchmark state
let benchmarkResults = null;
let benchmarkWins = null;
let benchmarkRunIndex = 0;
let benchmarkTotalRuns = 0;
let benchmarkItersPerRun = 0;
let benchmarkCurrentIter = 0;

function runBenchmark() {
    if (benchmarkRunning) return;
    if (!compiledExpression) {
        compileExpression();
        if (!compiledExpression) return;
    }

    // Stop any running simulation
    if (isRunning) {
        isRunning = false;
        stopSimulation();
        updateStartBtnText();
    }

    benchmarkRunning = true;
    benchmarkCancelled = false;

    const btn = document.getElementById('benchmarkBtn');
    const statusEl = document.getElementById('benchmarkStatus');
    const fillEl = document.getElementById('benchmarkFill');
    const labelEl = document.getElementById('benchmarkLabel');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');

    benchmarkTotalRuns = parseInt(document.getElementById('benchmark_runs')?.value) || 30;
    benchmarkItersPerRun = parseInt(document.getElementById('benchmark_iters')?.value) || 200;

    // Disable normal controls during benchmark
    if (btn) btn.style.display = 'none';
    if (startBtn) startBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
    if (statusEl) statusEl.style.display = 'flex';

    benchmarkResults = { ag: [], pso: [], ed: [] };
    benchmarkWins = { ag: 0, pso: 0, ed: 0, tie: 0 };
    benchmarkRunIndex = 0;
    benchmarkCurrentIter = 0;

    // Start first run
    startBenchmarkRun();
}

function stopBenchmark() {
    benchmarkCancelled = true;
    if (benchmarkTimer) {
        cancelAnimationFrame(benchmarkTimer);
        clearTimeout(benchmarkTimer);
        benchmarkTimer = null;
    }
    finishBenchmark(true);
}

function startBenchmarkRun() {
    if (benchmarkCancelled) return;

    // Reset simulation state for this run
    currentIteration = 0;
    updateIterationLabel();
    resetHistoryCache();

    // Clear previous convergence message
    if (functionErrorEl) {
        functionErrorEl.textContent = '';
        functionErrorEl.classList.remove('success-message');
    }

    // Initialize fresh algorithms
    if (!initAlgorithms()) {
        finishBenchmark(true);
        return;
    }

    benchmarkCurrentIter = 0;

    // Reset convergence plot for this run
    try {
        Plotly.deleteTraces('convergencePlot', [0, 1, 2]);
        const seriesNames = getSeriesNames();
        Plotly.addTraces('convergencePlot', [
            { x: [], y: [], mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } },
            { x: [], y: [], mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } },
            { x: [], y: [], mode: 'lines', name: seriesNames.ed, line: { color: '#be123c' } }
        ]);
    } catch (e) { /* Plotly not ready */ }

    // Show initial state
    const agState = gaInstance.getState();
    const psoState = psoInstance.getState();
    const edState = edInstance.getState();
    updateDashboard({
        ag: { ...agState, best_score: agState.bestScore, max_iteration: agState.maxIteration },
        pso: { ...psoState, best_score: psoState.bestScore, max_iteration: psoState.maxIteration },
        ed: { ...edState, best_score: edState.bestScore, max_iteration: edState.maxIteration }
    });

    // Update progress label
    updateBenchmarkProgress();

    // Start animated stepping
    benchmarkAnimatedStep();
}

function benchmarkAnimatedStep() {
    if (benchmarkCancelled || !gaInstance || !psoInstance || !edInstance) return;

    // Step all algorithms
    gaInstance.step();
    psoInstance.step();
    edInstance.step();

    benchmarkCurrentIter++;

    // Get states and update dashboard (visual update)
    const agState = gaInstance.getState();
    const psoState = psoInstance.getState();
    const edState = edInstance.getState();

    // Record history for convergence chart
    if (Number.isFinite(agState.bestScore)) historyCache.ag[agState.iteration] = agState.bestScore;
    if (Number.isFinite(psoState.bestScore)) historyCache.pso[psoState.iteration] = psoState.bestScore;
    if (Number.isFinite(edState.bestScore)) historyCache.ed[edState.iteration] = edState.bestScore;

    currentIteration = agState.iteration;
    updateIterationLabel();

    // Update 3D plots
    agScoreEl.textContent = Number.isFinite(agState.bestScore) ? agState.bestScore.toFixed(4) : "Inf";
    psoScoreEl.textContent = Number.isFinite(psoState.bestScore) ? psoState.bestScore.toFixed(4) : "Inf";
    edScoreEl.textContent = Number.isFinite(edState.bestScore) ? edState.bestScore.toFixed(4) : "Inf";

    const updatePlot = (plotId, population, opacity, pointSize, color, seriesName) => {
        const xs = population.map(p => p[0]);
        const ys = population.map(p => p[1]);
        const zs = population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))));
        const data = [
            { ...surfaceTrace, z: cachedSurfaceZ, opacity },
            { x: xs, y: ys, z: zs, mode: 'markers', type: 'scatter3d',
              marker: { size: pointSize, color }, name: seriesName }
        ];
        Plotly.react(plotId, data, document.getElementById(plotId).layout);
    };

    const seriesNames = getSeriesNames();
    updatePlot('agPlot', agState.population, getNumberValue('ag_surface_opacity', 0.45),
        getNumberValue('ag_point_size', 5), '#0f766e', seriesNames.ag);
    updatePlot('psoPlot', psoState.population, getNumberValue('pso_surface_opacity', 0.45),
        getNumberValue('pso_point_size', 5), '#d97706', seriesNames.pso);
    updatePlot('edPlot', edState.population, getNumberValue('ed_surface_opacity', 0.45),
        getNumberValue('ed_point_size', 5), '#be123c', seriesNames.ed);

    // Update convergence chart
    renderConvergence(agState.iteration);

    // Update progress
    updateBenchmarkProgress();

    // Check if this run is done
    if (benchmarkCurrentIter >= benchmarkItersPerRun) {
        // Record results for this run
        benchmarkResults.ag.push(gaInstance.bestScore);
        benchmarkResults.pso.push(psoInstance.bestScore);
        benchmarkResults.ed.push(edInstance.bestScore);

        // Determine run winner
        const mode = getOptimizationMode();
        const scores = [
            { key: 'ag', score: gaInstance.bestScore },
            { key: 'pso', score: psoInstance.bestScore },
            { key: 'ed', score: edInstance.bestScore }
        ];
        if (mode === 'max') {
            scores.sort((a, b) => b.score - a.score);
        } else {
            scores.sort((a, b) => a.score - b.score);
        }
        if (scores[0].score === scores[1].score) {
            benchmarkWins.tie++;
        } else {
            benchmarkWins[scores[0].key]++;
        }

        benchmarkRunIndex++;

        if (benchmarkRunIndex < benchmarkTotalRuns && !benchmarkCancelled) {
            // Pause briefly between runs so user sees the transition
            setTimeout(startBenchmarkRun, 300);
        } else {
            finishBenchmark(false);
        }
    } else {
        // Schedule next iteration
        const delay = parseInt(document.getElementById('sim_delay')?.value) || 0;
        if (delay > 0) {
            benchmarkTimer = setTimeout(benchmarkAnimatedStep, delay);
        } else {
            benchmarkTimer = requestAnimationFrame(benchmarkAnimatedStep);
        }
    }
}

function updateBenchmarkProgress() {
    const fillEl = document.getElementById('benchmarkFill');
    const labelEl = document.getElementById('benchmarkLabel');
    const t = translations[currentLang];

    const totalIters = benchmarkTotalRuns * benchmarkItersPerRun;
    const completedIters = benchmarkRunIndex * benchmarkItersPerRun + benchmarkCurrentIter;
    const pct = Math.round((completedIters / totalIters) * 100);

    if (fillEl) fillEl.style.width = pct + '%';
    if (labelEl) {
        const runLabel = `Run ${benchmarkRunIndex + 1}/${benchmarkTotalRuns}`;
        const iterLabel = `Iter ${benchmarkCurrentIter}/${benchmarkItersPerRun}`;
        labelEl.textContent = `${runLabel} • ${iterLabel}`;
    }
}

function finishBenchmark(cancelled) {
    benchmarkRunning = false;

    const btn = document.getElementById('benchmarkBtn');
    const statusEl = document.getElementById('benchmarkStatus');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Restore normal controls
    if (btn) btn.style.display = '';
    if (startBtn) startBtn.disabled = false;
    if (resetBtn) resetBtn.disabled = false;
    if (statusEl) statusEl.style.display = 'none';

    if (!cancelled && benchmarkResults && benchmarkRunIndex > 0) {
        showBenchmarkResults(benchmarkResults, benchmarkWins, benchmarkRunIndex, benchmarkItersPerRun);
    }
}

function computeStats(arr) {
    const n = arr.length;
    if (n === 0) return { mean: 0, std: 0, best: 0, worst: 0, median: 0 };

    const sorted = [...arr].sort((a, b) => a - b);
    const mean = arr.reduce((s, v) => s + v, 0) / n;
    const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

    const mode = getOptimizationMode();
    const best = mode === 'max' ? sorted[n - 1] : sorted[0];
    const worst = mode === 'max' ? sorted[0] : sorted[n - 1];

    return { mean, std, best, worst, median };
}

function showBenchmarkResults(results, wins, totalRuns, itersPerRun) {
    const t = translations[currentLang];
    const modal = document.getElementById('benchmarkModal');
    const titleEl = document.getElementById('modalTitle');
    const subtitleEl = document.getElementById('modalSubtitle');
    const bannerEl = document.getElementById('winnerBanner');
    const tableContainer = document.getElementById('statsTableContainer');
    const winsChartEl = document.getElementById('winsChart');
    const statsTitle = document.getElementById('statsTitle');
    const winsTitle = document.getElementById('winsTitle');

    if (statsTitle) statsTitle.textContent = t.benchmark_stats || 'Statistics';
    if (winsTitle) winsTitle.textContent = t.benchmark_wins || 'Wins per Algorithm';

    // Title
    titleEl.textContent = t.benchmark_result_title || 'Benchmark Results';
    subtitleEl.textContent = `${totalRuns} ${t.benchmark_result_subtitle || 'runs completed'} \u2022 ${itersPerRun} ${t.benchmark_iters || 'iterations each'}`;

    // Compute stats
    const agStats = computeStats(results.ag);
    const psoStats = computeStats(results.pso);
    const edStats = computeStats(results.ed);

    // Determine overall winner
    const mode = getOptimizationMode();
    const algorithms = [
        { key: 'ag', name: t.ag_series || 'AG', wins: wins.ag, mean: agStats.mean, color: '#0f766e', badge: 'ag-badge' },
        { key: 'pso', name: t.pso_series || 'PSO', wins: wins.pso, mean: psoStats.mean, color: '#d97706', badge: 'pso-badge' },
        { key: 'ed', name: t.ed_series || 'ED', wins: wins.ed, mean: edStats.mean, color: '#be123c', badge: 'ed-badge' }
    ];

    // Sort by wins, then by mean
    algorithms.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (mode === 'max') return b.mean - a.mean;
        return a.mean - b.mean;
    });

    const winner = algorithms[0];
    const isTie = winner.wins === algorithms[1].wins;

    // Winner banner
    if (isTie) {
        const tiedAlgs = algorithms.filter(a => a.wins === winner.wins);
        bannerEl.innerHTML = `<span class="winner-label">${t.benchmark_tie || 'Tie'}</span> <span class="winner-names">${tiedAlgs.map(a => a.name).join(' & ')}</span>`;
        bannerEl.style.background = 'linear-gradient(135deg, #6b7280, #9ca3af)';
    } else {
        bannerEl.innerHTML = `<span class="winner-trophy">\ud83c\udfc6</span> <span class="winner-label">${t.benchmark_winner || 'Winner'}:</span> <span class="winner-name">${winner.name}</span> <span class="winner-wins">(${winner.wins}/${totalRuns} ${t.stat_wins || 'wins'})</span>`;
        bannerEl.style.background = `linear-gradient(135deg, ${winner.color}, ${winner.color}dd)`;
    }

    // Stats table
    const statLabels = {
        mean: t.stat_mean || 'Mean',
        std: t.stat_std || 'Std Dev',
        best: t.stat_best || 'Best',
        worst: t.stat_worst || 'Worst',
        median: t.stat_median || 'Median',
        wins: t.stat_wins || 'Wins'
    };

    const statsMap = { ag: agStats, pso: psoStats, ed: edStats };
    const algNames = { ag: t.ag_series || 'AG', pso: t.pso_series || 'PSO', ed: t.ed_series || 'ED' };
    const algColors = { ag: '#0f766e', pso: '#d97706', ed: '#be123c' };

    let tableHTML = '<table class="stats-table"><thead><tr><th></th>';
    ['ag', 'pso', 'ed'].forEach(k => {
        tableHTML += `<th style="color:${algColors[k]}">${algNames[k]}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    ['mean', 'std', 'best', 'worst', 'median'].forEach(stat => {
        tableHTML += `<tr><td class="stat-label">${statLabels[stat]}</td>`;
        // Find best value for highlighting
        const vals = ['ag', 'pso', 'ed'].map(k => statsMap[k][stat]);
        let bestVal;
        if (stat === 'std') {
            bestVal = Math.min(...vals); // lowest std is best
        } else if (stat === 'worst') {
            bestVal = mode === 'max' ? Math.max(...vals) : Math.min(...vals);
        } else {
            bestVal = mode === 'max' ? Math.max(...vals) : Math.min(...vals);
        }

        ['ag', 'pso', 'ed'].forEach(k => {
            const v = statsMap[k][stat];
            const isBest = v === bestVal;
            tableHTML += `<td class="${isBest ? 'stat-best' : ''}">${v.toFixed(6)}</td>`;
        });
        tableHTML += '</tr>';
    });

    // Wins row
    tableHTML += `<tr class="wins-row"><td class="stat-label">${statLabels.wins}</td>`;
    const maxWins = Math.max(wins.ag, wins.pso, wins.ed);
    ['ag', 'pso', 'ed'].forEach(k => {
        const w = wins[k];
        const isBest = w === maxWins && w > 0;
        tableHTML += `<td class="${isBest ? 'stat-best' : ''}">${w}</td>`;
    });
    tableHTML += '</tr></tbody></table>';
    tableContainer.innerHTML = tableHTML;

    // Wins chart (horizontal bars)
    const maxW = Math.max(wins.ag, wins.pso, wins.ed, 1);
    let barsHTML = '';
    [{ key: 'ag', name: algNames.ag, color: algColors.ag, w: wins.ag },
     { key: 'pso', name: algNames.pso, color: algColors.pso, w: wins.pso },
     { key: 'ed', name: algNames.ed, color: algColors.ed, w: wins.ed }].forEach(item => {
        const pct = Math.round((item.w / totalRuns) * 100);
        barsHTML += `<div class="win-bar-row">
            <span class="win-bar-label">${item.name}</span>
            <div class="win-bar-track">
                <div class="win-bar-fill" style="width:${pct}%;background:${item.color}">
                    <span class="win-bar-value">${item.w}</span>
                </div>
            </div>
        </div>`;
    });
    if (wins.tie > 0) {
        const pct = Math.round((wins.tie / totalRuns) * 100);
        barsHTML += `<div class="win-bar-row">
            <span class="win-bar-label">${t.benchmark_tie || 'Tie'}</span>
            <div class="win-bar-track">
                <div class="win-bar-fill" style="width:${pct}%;background:#6b7280">
                    <span class="win-bar-value">${wins.tie}</span>
                </div>
            </div>
        </div>`;
    }
    winsChartEl.innerHTML = barsHTML;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeBenchmarkModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('benchmarkModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}


async function generatePdfReport() {
    const reportBtn = document.getElementById('reportBtn');
    if (reportBtn) {
        reportBtn.disabled = true;
        reportBtn.textContent = '⏳';
    }

    try {
        const { jsPDF } = window.jspdf;
        const aiModels = ['gemini 3 pro', 'claude opus 4.5', 'gpt-5.2-codex'];
        const aiPrompts = [
            'Gere imagens de dashboard minimalista moderno realista com AG vs Enxame de Partículas',
            'Gostei do "clean minimalist bright dashboard UI design, comparison between Genetic Algorithm (AG) and Particle Swarm (PSO), elegant charts, soft shadows, realistic render, data visualization, high end interface, 8k" implemente ele em html css javascript com animacoes, e a parte logica implemente em python, conecte tudo com fastapi no python 3.14.2 freetreat',
            'Proponha melhorias no front end do dashboard',
            'quero poder ajustar os graficos 3d diretamente na interface, e eles por padrao estao tornando dificil ver as particulas',
            'tem que ser possivel trocar de otimizacao, ou seja pode ser de maximizacao, minimizacao ou outro',
            'Quero poder trocar a funcao de interesse, para isso preciso de um campo para trocar que possua um teclado virtual para funcoes matematicas, alem disso corrija os : que estao ficando quebrados onde sao usados,Melhore os botoes de trocar de tema para que tenha uma animacao de formato circular na tela toda de troca de tema quando forem clicados, os botoes devem ser modernos, e os botoes de troca de traducao devem ser mais modernos',
            'Quero poder trocar a funcao de interesse, para isso preciso de um campo para trocar que possua um teclado virtual para funcoes matematicas, alem disso corrija os : que estao ficando quebrados onde sao usados',
            'refaça essa parte da expressao matematica por completo para usar corretamente o mathjs e o teclado deveria ser virtual',
            'o teclado virtual deveria ser completo o que vem padrao do mathjs',
            'A funcao padrao que deve vir no teclado é a da imagem',
            'não está dando para resetar',
            'Ainda não é possivel resetar ao estado inicial, de poder voltar a qualquer iteracao',
            'syntax error in part "*(x1^2+x2^2))^2)" (char 44'
        ];

        // Capture images (awaiting promises)
        const agImg = await Plotly.toImage(document.getElementById('agPlot'), { format: 'png', width: 500, height: 400 });
        const psoImg = await Plotly.toImage(document.getElementById('psoPlot'), { format: 'png', width: 500, height: 400 });
        const edImg = await Plotly.toImage(document.getElementById('edPlot'), { format: 'png', width: 500, height: 400 });
        const convImg = await Plotly.toImage(document.getElementById('convergencePlot'), { format: 'png', width: 600, height: 350 });

        const doc = new jsPDF();
        
        // Set PDF metadata
        doc.setProperties({
            title: 'Comparação entre AG, PSO e ED - Relatório SBC',
            subject: 'Relatório Técnico - Template SBC',
            author: 'João da Cruz de Natividade e Silva Neto',
            creator: 'Evolutionary Optimization Viz'
        });

        // --- SBC Layout Constants (based on sbc-template.sty) ---
        const pageWidth = doc.internal.pageSize.width;   // 210mm
        const pageHeight = doc.internal.pageSize.height; // 297mm
        const marginTop = 30;      // SBC: ~3cm top
        const marginBottom = 20;   // SBC: ~2cm bottom
        const marginLeft = 30;     // SBC: ~3cm left
        const marginRight = 20;    // SBC: ~2cm right
        const colGap = 8;          // Gap between columns

        // Column Calculations
        const contentWidth = pageWidth - marginLeft - marginRight;
        const colWidth = (contentWidth - colGap) / 2;
        const col1X = marginLeft;
        const col2X = marginLeft + colWidth + colGap;

        // State
        let currentCol = 1; // 1 or 2
        let cursorY = marginTop;
        let columnStartY = marginTop; // Track where columns should start on current page
        let isFirstPage = true; // Track if we're on the first page

        doc.setFont('times', 'normal'); // SBC uses Times

        // --- Layout Helpers ---

        function checkSpace(height) {
            if (cursorY + height > pageHeight - marginBottom) {
                if (currentCol === 1) {
                    // Move from column 1 to column 2
                    currentCol = 2;
                    // On first page, column 2 starts at columnStartY (after abstract)
                    // On other pages, column 2 starts at marginTop
                    cursorY = isFirstPage ? columnStartY : marginTop;
                } else {
                    // currentCol === 2, move to next page, column 1
                    doc.addPage();
                    currentCol = 1;
                    isFirstPage = false;
                    columnStartY = marginTop; // Reset for new pages
                    cursorY = marginTop;
                }
            }
        }

        function getCurrentX() {
            return currentCol === 1 ? col1X : col2X;
        }

        // Force move to next column (useful to balance columns)
        function nextColumn() {
            if (currentCol === 1) {
                currentCol = 2;
                cursorY = isFirstPage ? columnStartY : marginTop;
            } else {
                doc.addPage();
                currentCol = 1;
                isFirstPage = false;
                columnStartY = marginTop;
                cursorY = marginTop;
            }
        }

        // --- Content Helpers ---

        // Adds full-width text (for Title/Abstract only, forces reset to col 1 after if needed)
        // Note: SBC abstract is technically part of the header or a block before columns, 
        // but here we might just put it at top of page 1.
        function addFullWidthText(text, fontSize = 12, fontStyle = 'normal', align = 'left') {
            doc.setFont('times', fontStyle);
            doc.setFontSize(fontSize);

            const lines = doc.splitTextToSize(text, contentWidth);
            const height = lines.length * (fontSize * 0.4);

            // If we are deep in page, adds page. For title usually we are at top.
            if (cursorY + height > pageHeight - marginBottom) {
                doc.addPage();
                cursorY = marginTop;
            }

            doc.text(lines, marginLeft + (align === 'center' ? contentWidth / 2 : 0), cursorY, { align: align });
            cursorY += height + 4;
            doc.setFont('times', 'normal');
        }

        function addText(text, fontSize = 10, fontStyle = 'normal', indent = 0) {
            doc.setFont('times', fontStyle);
            doc.setFontSize(fontSize);

            // Split text for column width
            const availWidth = colWidth - indent;
            const lines = doc.splitTextToSize(text, availWidth);

            // Print line by line to handle column breaks inside a paragraph
            const lineHeight = fontSize * 0.4;

            lines.forEach(line => {
                checkSpace(lineHeight);
                doc.text(line, getCurrentX() + indent, cursorY);
                cursorY += lineHeight;
            });

            cursorY += 2; // small paragraph gap
        }

        function addSectionHeading(title) {
            cursorY += 4;
            checkSpace(8);
            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.text(title, getCurrentX(), cursorY);
            doc.setFont('times', 'normal');
            cursorY += 6;
        }

        function addSubsectionHeading(title) {
            cursorY += 2;
            checkSpace(6);
            doc.setFont('times', 'bold');
            doc.setFontSize(11); // Slightly smaller than section
            doc.text(title, getCurrentX(), cursorY);
            doc.setFont('times', 'normal');
            cursorY += 5;
        }

        function addBullet(text) {
            addText('• ' + text, 10, 'normal', 4);
        }

        function addImage(imgData, caption, height = 50) {
            checkSpace(height + 10);

            // Image fills column width
            doc.addImage(imgData, 'PNG', getCurrentX(), cursorY, colWidth, height);
            cursorY += height + 2;

            doc.setFontSize(8);
            doc.setFont('times', 'italic');
            // Centered caption
            const captionLines = doc.splitTextToSize('Fig: ' + caption, colWidth);
            doc.text(captionLines, getCurrentX() + (colWidth / 2), cursorY, { align: 'center' });
            cursorY += (captionLines.length * 3) + 4;

            doc.setFont('times', 'normal');
        }

        // --- Data Collection ---
        const data = {
            params: {
                pop_size: parseInt(document.getElementById('pop_size')?.value) || 50,
                ag_mutation: parseFloat(document.getElementById('ag_mutation')?.value) || 0.01,
                ag_crossover: parseFloat(document.getElementById('ag_crossover')?.value) || 0.7,
                pso_w: parseFloat(document.getElementById('pso_w')?.value) || 0.5,
                pso_c1: parseFloat(document.getElementById('pso_c1')?.value) || 1.5,
                pso_c2: parseFloat(document.getElementById('pso_c2')?.value) || 1.5,
                ed_f: parseFloat(document.getElementById('ed_f')?.value) || 0.8,
                ed_cr: parseFloat(document.getElementById('ed_cr')?.value) || 0.9,
                optimization_mode: getOptimizationMode(),
                target_value: getTargetValue(),
                function_expr: currentExpression,
                dimensions: currentDimensions
            },
            ag: {
                best_score: historyCache.ag.length > 0 ? historyCache.ag[historyCache.ag.length - 1] : null,
                iteration: currentIteration
            },
            pso: {
                best_score: historyCache.pso.length > 0 ? historyCache.pso[historyCache.pso.length - 1] : null,
                iteration: currentIteration
            },
            ed: {
                best_score: historyCache.ed.length > 0 ? historyCache.ed[historyCache.ed.length - 1] : null,
                iteration: currentIteration
            },
            history_ag: historyCache.ag,
            history_pso: historyCache.pso,
            history_ed: historyCache.ed
        };

        const modeLabels = { min: 'Minimização', max: 'Maximização', target: `Valor Alvo (${data.params.target_value})` };
        const modeLabel = modeLabels[data.params.optimization_mode] || data.params.optimization_mode;

        // --- Document Generation ---

        // 1. Title Area (Full Width - SBC Style: 14pt bold centered)
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('Comparação entre Algoritmo Genético, PSO e ED', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 6;
        doc.text('na Otimização de Funções Multimodais', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 12;

        // Author: 12pt normal centered
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.text('João da Cruz de Natividade e Silva Neto', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 5;

        // Institution: 12pt italic centered
        doc.setFont('times', 'italic');
        doc.text('UFPA – Universidade Federal do Pará', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 8;

        // Address: 10pt normal centered
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('Tópicos Especiais em Engenharia de Computação III', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 4;
        doc.text('joao.silva.neto@itec.ufpa.br', pageWidth / 2, cursorY, { align: 'center' });
        cursorY += 10;

        // 2. Resumo (SBC Style: "Resumo." bold + text italic, indented)
        const absIndent = 8; // Extra margin for abstract
        const absWidth = contentWidth - (absIndent * 2);

        // Construct dynamic abstract text
        const maxIter = Math.max(data.ag.iteration, data.pso.iteration, data.ed.iteration);
        let winnerText = "todos os algoritmos obtiveram desempenho similar";
        let winnerTextEN = "all algorithms performed similarly";
        const agBest = data.ag.best_score || 0;
        const psoBest = data.pso.best_score || 0;
        const edBest = data.ed.best_score || 0;

        // Determine winner among 3 algorithms
        const scores = [{ name: 'AG', nameEN: 'GA', score: agBest }, { name: 'PSO', nameEN: 'PSO', score: psoBest }, { name: 'ED', nameEN: 'DE', score: edBest }];
        if (data.params.optimization_mode === 'max') {
            scores.sort((a, b) => b.score - a.score);
        } else if (data.params.optimization_mode === 'min') {
            scores.sort((a, b) => a.score - b.score);
        } else {
            scores.forEach(s => s.diff = Math.abs(s.score - data.params.target_value));
            scores.sort((a, b) => a.diff - b.diff);
        }
        if (scores[0].score !== scores[1].score) {
            winnerText = `o ${scores[0].name} obteve melhor desempenho`;
            winnerTextEN = `${scores[0].nameEN} outperformed the others`;
        }

        const absTextPT = `Este trabalho apresenta uma análise comparativa entre o Algoritmo Genético (AG) com representação real, a Otimização por Enxame de Partículas (PSO) e a Evolução Diferencial (ED) aplicados à otimização de funções multimodais. A simulação foi executada com ${maxIter} iterações, utilizando uma população de ${data.params.pop_size} indivíduos/partículas. Os resultados demonstram que ${winnerText}. O projeto foi desenvolvido com assistência de Inteligência Artificial (IA).`;

        // RESUMO
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('Resumo.', marginLeft + absIndent, cursorY);
        
        doc.setFont('times', 'italic');
        doc.setFontSize(10);
        const splitAbsPT = doc.splitTextToSize(absTextPT, absWidth);
        doc.text(splitAbsPT, marginLeft + absIndent, cursorY + 5);
        cursorY += (splitAbsPT.length * 4) + 12;

        // Keywords PT
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text('Palavras-chave: Algoritmo Genético, PSO, Evolução Diferencial, Otimização, Inteligência Artificial', marginLeft + absIndent, cursorY);
        cursorY += 10;

        // ABSTRACT
        const absTextEN = `This paper presents a comparative analysis between the real-coded Genetic Algorithm (GA), Particle Swarm Optimization (PSO) and Differential Evolution (DE) applied to multimodal function optimization. The simulation ran for ${maxIter} iterations with a population of ${data.params.pop_size} individuals/particles. Results show that ${winnerTextEN}. This project was developed with AI assistance.`;

        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.text('Abstract.', marginLeft + absIndent, cursorY);
        
        doc.setFont('times', 'italic');
        doc.setFontSize(10);
        const splitAbsEN = doc.splitTextToSize(absTextEN, absWidth);
        doc.text(splitAbsEN, marginLeft + absIndent, cursorY + 5);
        cursorY += (splitAbsEN.length * 4) + 12;

        // Keywords EN
        doc.setFont('times', 'normal');
        doc.text('Keywords: Genetic Algorithm, PSO, Differential Evolution, Optimization, Artificial Intelligence', marginLeft + absIndent, cursorY);
        cursorY += 15;

        // Lock column start after abstracts
        columnStartY = cursorY;

        // --- Start Columns ---
        // 1. Introdução
        addSectionHeading('1. Introdução');
        addText('A otimização de funções multimodais representa um desafio significativo. Este relatório compara três algoritmos metaheurísticos populares: AG, PSO e ED.');

        addSubsectionHeading('1.1 Função Objetivo');
        addText(`Função: f(x) = ${data.params.function_expr}`);
        addText(`Domínio: [-5.12, 5.12] em ${data.params.dimensions} dimensões.`);

        addSubsectionHeading('1.2 Modo de Otimização');
        addText(`Modo selecionado: ${modeLabel}`);

        // 2. Fundamentação Teórica
        addSectionHeading('2. Fundamentação Teórica');
        addText('O Algoritmo Genético (AG) utiliza seleção por torneio, crossover BLX-alpha e mutação gaussiana. O PSO utiliza a formulação canônica com inércia. A Evolução Diferencial (ED) utiliza a estratégia DE/rand/1/bin com crossover binomial.');

        // 3. Configuração Experimental (Table)
        addSectionHeading('3. Configuração Experimental');

        // We use autoTable but constrained to column width (SBC style: simple grid)
        // Check if table fits in current column (estimate ~6 rows * 6mm = ~36mm)
        checkSpace(40);
        
        const table1Y = cursorY;
        doc.autoTable({
            startY: table1Y,
            head: [['Parâmetro', 'AG', 'PSO', 'ED']],
            body: [
                ['População', data.params.pop_size, data.params.pop_size, data.params.pop_size],
                ['Mutação', data.params.ag_mutation, '--', '--'],
                ['Crossover', data.params.ag_crossover, '--', data.params.ed_cr],
                ['Inércia (w)', '--', data.params.pso_w, '--'],
                ['Cognitivo (c1)', '--', data.params.pso_c1, '--'],
                ['Social (c2)', '--', data.params.pso_c2, '--'],
                ['Fator F', '--', '--', data.params.ed_f]
            ],
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, lineWidth: 0.3 },
            styles: { fontSize: 9, font: 'times', cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
            margin: { left: getCurrentX() },
            tableWidth: colWidth
        });

        // Update cursorY based on table height
        cursorY = doc.lastAutoTable.finalY + 5;

        // Add 3D Plots
        addImage(agImg, 'População Final (AG)', 50);
        addImage(psoImg, 'População Final (PSO)', 50);
        addImage(edImg, 'População Final (ED)', 50);

        // 4. Resultados
        addSectionHeading('4. Resultados Experimentais');

        addSubsectionHeading('4.1 Resumo');
        checkSpace(25); // Estimate table height
        doc.autoTable({
            startY: cursorY,
            head: [['Métrica', 'AG', 'PSO', 'ED']],
            body: [
                ['Melhor Fitness', (data.ag.best_score?.toFixed(6) || 'N/A'), (data.pso.best_score?.toFixed(6) || 'N/A'), (data.ed.best_score?.toFixed(6) || 'N/A')],
                ['Iterações', data.ag.iteration, data.pso.iteration, data.ed.iteration]
            ],
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9, lineWidth: 0.3 },
            styles: { fontSize: 9, font: 'times', cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.2 },
            margin: { left: getCurrentX() },
            tableWidth: colWidth
        });
        cursorY = doc.lastAutoTable.finalY + 5;

        addSubsectionHeading('4.2 Convergência');

        addImage(convImg, 'Curva de Convergência (Fitness vs Iteração)', 45);

        // Sampling for table
        const total = data.history_ag.length;
        let step = Math.max(1, Math.floor(total / 10)); // fewer rows for PDF
        const convRows = [];
        for (let i = 0; i < total; i += step) {
            const agV = data.history_ag[i];
            const psoV = data.history_pso[i];
            const edV = data.history_ed[i];
            if (agV !== undefined && psoV !== undefined && edV !== undefined) {
                convRows.push([i, agV.toFixed(4), psoV.toFixed(4), edV.toFixed(4)]);
            }
        }
        if (total > 0 && (total - 1) % step !== 0) {
            const i = total - 1;
            convRows.push([i, data.history_ag[i].toFixed(4), data.history_pso[i].toFixed(4), data.history_ed[i].toFixed(4)]);
        }

        // Check space for convergence table (estimate rows * 5mm + header)
        checkSpace(convRows.length * 5 + 10);
        
        doc.autoTable({
            startY: cursorY,
            head: [['Iteração', 'AG', 'PSO', 'ED']],
            body: convRows,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.3 },
            styles: { fontSize: 8, font: 'times', cellPadding: 1.5, lineColor: [0, 0, 0], lineWidth: 0.2 },
            margin: { left: getCurrentX() },
            tableWidth: colWidth
        });
        cursorY = doc.lastAutoTable.finalY + 5;

        // Check if we need to move to next column after table
        if (cursorY > pageHeight - marginBottom) {
            nextColumn();
        }

        // 5. Implementação
        addSectionHeading('5. Implementação');
        addText('O backend em FastAPI executa AG/PSO/ED e expõe uma API para geração de relatório. O frontend em JavaScript usa Plotly para os gráficos 3D e convergência, enviando parâmetros via interface interativa.');
        addSubsectionHeading('5.1 Integração');
        addBullet('WebSocket para streaming de estados e histórico.');
        addBullet('Expressões validadas com math.js/numexpr.');
        addBullet('Relatório exportado em PDF seguindo o template SBC (2025-2026).');

        addSubsectionHeading('5.2 Uso de IA');
        addText('Modelos utilizados:');
        aiModels.forEach(model => addBullet(model));
        addText('Prompts utilizados:');
        aiPrompts.forEach(prompt => addBullet(prompt));
        addText('Template SBC (2025-2026): https://github.com/uefs/sbc-template-latex');

        // 6. Discussão
        addSectionHeading('6. Discussão');
        addSubsectionHeading('6.1 Algoritmo Genético');
        addBullet('Diversidade via mutação');
        addBullet('Convergência robusta');

        addSubsectionHeading('6.2 PSO');
        addBullet('Convergência rápida');
        addBullet('Comportamento de enxame');

        addSubsectionHeading('6.3 ED');
        addBullet('Poucos parâmetros de controle');
        addBullet('Robusto em funções multimodais');
        addBullet('Operação de mutação diferencial eficiente');

        // 7. Conclusões
        addSectionHeading('7. Conclusões');
        addBullet('Os três algoritmos são eficazes.');
        addBullet('PSO: velocidade inicial.');
        addBullet('AG: robustez a longo prazo.');
        addBullet('ED: eficiência com poucos parâmetros.');

        // 8. Disponibilidade
        addSectionHeading('8. Disponibilidade');
        addText('A simulação interativa está disponível em:');
        doc.setTextColor(0, 0, 255);
        addText('https://joaosnet.github.io/evolutionary-optimization-viz/', 9, 'normal');
        doc.setTextColor(0, 0, 0);

        // 9. Referências (SBC Style)
        addSectionHeading('Referências');
        doc.setFontSize(9);
        addText('[1] Holland, J. H. (1992). Adaptation in Natural and Artificial Systems. MIT Press.', 9);
        addText('[2] Kennedy, J. and Eberhart, R. (1995). Particle Swarm Optimization. In IEEE Intl. Conf. on Neural Networks.', 9);
        addText('[3] Goldberg, D. E. (1989). Genetic Algorithms in Search, Optimization, and Machine Learning. Addison-Wesley.', 9);
        addText('[4] Storn, R. and Price, K. (1997). Differential Evolution – A Simple and Efficient Heuristic for Global Optimization over Continuous Spaces. Journal of Global Optimization, 11(4), 341-359.', 9);
        addText('[5] Eberhart, R. C. and Shi, Y. (2001). Particle swarm optimization: developments, applications and resources. In Congress on Evolutionary Computation.', 9);

        // Footer: Data geração
        cursorY += 10;
        doc.setFontSize(8);
        doc.setTextColor(100);
        addText(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 8, 'italic');
        doc.setTextColor(0, 0, 0);

        // Save PDF
        doc.save('relatorio_sbc_ag_pso_ed.pdf');

    } catch (err) {
        console.error('PDF generation failed:', err);
        if (typeof functionErrorEl !== 'undefined' && functionErrorEl) {
            functionErrorEl.textContent = 'Erro ao gerar PDF: ' + err.message;
        } else {
            alert('Erro ao gerar PDF: ' + err.message);
        }
    } finally {
        if (reportBtn) {
            reportBtn.disabled = false;
            if (typeof translations !== 'undefined' && translations[currentLang]) {
                reportBtn.innerHTML = '📄 <span data-i18n="generate_report">' +
                    (translations[currentLang]?.generate_report || 'Relatório') + '</span>';
            } else {
                reportBtn.textContent = 'Relatório';
            }
        }
    }
}



function revealReportButton() {
    const reportBtn = document.getElementById('reportBtn');
    if (reportBtn) {
        reportBtn.classList.remove('hidden');
        reportBtn.classList.add('revealed');
    }
}

function initReportButton() {
    const mainTitle = document.getElementById('mainTitle');
    const reportBtn = document.getElementById('reportBtn');

    // Triple-click on title to reveal button
    if (mainTitle) {
        mainTitle.addEventListener('click', () => {
            titleClickCount++;

            if (titleClickTimer) clearTimeout(titleClickTimer);

            titleClickTimer = setTimeout(() => {
                titleClickCount = 0;
            }, 500);

            if (titleClickCount >= 3) {
                revealReportButton();
                titleClickCount = 0;
            }
        });
    }

    // Attach click handler to report button
    if (reportBtn) {
        reportBtn.addEventListener('click', generatePdfReport);
    }

    // Ctrl+Shift+R keybind
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            revealReportButton();
            generatePdfReport();
        }
    });
}

// --- Init ---
window.onload = () => {
    initPlots();
    initLanguage();
    initExpressionControls();
    initTheme();
    initOptimizationControls();
    initPlotControls();
    initReportButton();
    window.addEventListener('resize', resizePlots);

    // Initialize algorithms and show initial state
    setTimeout(() => {
        if (initAlgorithms()) {
            const agState = gaInstance.getState();
            const psoState = psoInstance.getState();
            const edState = edInstance.getState();
            updateDashboard({
                ag: { ...agState, best_score: agState.bestScore, max_iteration: agState.maxIteration },
                pso: { ...psoState, best_score: psoState.bestScore, max_iteration: psoState.maxIteration },
                ed: { ...edState, best_score: edState.bestScore, max_iteration: edState.maxIteration }
            });
        }
    }, 100);
};
