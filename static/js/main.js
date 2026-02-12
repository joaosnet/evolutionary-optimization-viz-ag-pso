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

// Algorithm selection — which algorithms are enabled
function getEnabledAlgorithms() {
    return {
        ag: document.getElementById('algo_ag_enabled')?.checked !== false,
        pso: document.getElementById('algo_pso_enabled')?.checked !== false,
        ed: document.getElementById('algo_ed_enabled')?.checked !== false
    };
}

function getEnabledKeys() {
    const e = getEnabledAlgorithms();
    return ['ag', 'pso', 'ed'].filter(k => e[k]);
}

function onAlgoToggle() {
    const enabled = getEnabledAlgorithms();
    const enabledCount = Object.values(enabled).filter(Boolean).length;

    // Prevent disabling all — re-check the one that was just unchecked
    if (enabledCount === 0) {
        document.getElementById('algo_ag_enabled').checked = true;
        enabled.ag = true;
    }

    // Update card visibility
    ['ag', 'pso', 'ed'].forEach(algo => {
        const card = document.querySelector(`.algorithm-card[data-algo="${algo}"]`);
        if (card) {
            if (enabled[algo]) {
                card.classList.remove('algo-disabled');
            } else {
                card.classList.add('algo-disabled');
            }
        }
    });

    // Update main grid columns based on enabled count
    const mainEl = document.querySelector('main');
    if (mainEl) {
        const count = getEnabledKeys().length;
        mainEl.setAttribute('data-algo-count', count);
    }

    // If focused on a disabled algo, unfocus
    if (focusedAlgorithm && !enabled[focusedAlgorithm]) {
        toggleFocus(focusedAlgorithm); // unfocus
    }

    // Resize plots
    setTimeout(resizePlots, 100);
}

const historyCache = {
    ag: [],
    pso: [],
    ed: []
};

function buildF6Expression(dimensions = 10) {
    const terms = [];
    for (let i = 1; i <= dimensions; i += 1) {
        terms.push(`(x${i}^2 - 10 * cos(2 * pi * x${i}))`);
    }
    return `${10 * dimensions} + ${terms.join(' + ')}`;
}

const DEFAULT_DIMENSIONS = 10;
const DEFAULT_EXPRESSION = buildF6Expression(DEFAULT_DIMENSIONS);
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
        iteration: "Generation",
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
        webgl_disabled_msg: "WebGL is disabled — using 2D fallbacks. Some features may be limited.",
        iteration_axis: "Generation",
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
        benchmark_title: "Multi-Experiment Benchmark",
        benchmark_runs: "Number of Experiments",
        benchmark_iters: "Generations per Experiment",
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
        stat_wins: "Wins",
        cec_error_table: "Error Table (CEC Format)",
        cec_success_rate: "Success Rate",
        cec_checkpoints: "Error at FE Checkpoints",
        cec_wilcoxon: "Wilcoxon Signed-Rank Test",
        cec_ranking: "Final Ranking",
        cec_algorithm: "Algorithm",
        cec_pair: "Pair",
        cec_significance: "Sig."
    },
    pt: {
        eyebrow: "Otimização ao Vivo",
        title: "Batalha de Otimização",
        subtitle: "AG vs PSO vs ED na Superfície Rastrigin",
        start: "Iniciar",
        pause: "Pausar",
        reset: "Resetar",
        iteration: "Geração",
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
        webgl_disabled_msg: "WebGL está desabilitado — usando visualização 2D. Algumas funcionalidades podem estar limitadas.",
        iteration_axis: "Geração",
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
        benchmark_title: "Benchmark Multi-Experimentos",
        benchmark_runs: "Número de Experimentos",
        benchmark_iters: "Gerações por Experimento",
        benchmark_start: "Executar Benchmark",
        benchmark_stop: "Parar",
        benchmark_running: "Executando...",
        benchmark_stats: "Estatísticas",
        benchmark_wins: "Vitórias por Algoritmo",
        benchmark_winner: "Vencedor",
        benchmark_tie: "Empate",
        benchmark_result_title: "Resultados do Benchmark",
        benchmark_result_subtitle: "experimentos concluídos",
        stat_mean: "Média",
        stat_std: "Desvio Padrão",
        stat_best: "Melhor",
        stat_worst: "Pior",
        stat_median: "Mediana",
        stat_wins: "Vitórias",
        cec_error_table: "Tabela de Erro (Formato CEC)",
        cec_success_rate: "Taxa de Sucesso",
        cec_checkpoints: "Erro nos Checkpoints de FEs",
        cec_wilcoxon: "Teste de Wilcoxon Signed-Rank",
        cec_ranking: "Ranking Final",
        cec_algorithm: "Algoritmo",
        cec_pair: "Par",
        cec_significance: "Sig."
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

// WebGL detection + 2D fallback layout
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
    } catch (e) {
        return false;
    }
}

const WEBGL_AVAILABLE = isWebGLAvailable();

const layout2D = {
    autosize: true,
    margin: { l: 50, r: 25, b: 45, t: 10 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { title: '' },
    yaxis: { title: '' }
};

const surface2DTrace = {
    z: base_z_data,
    x: x_range,
    y: y_range,
    type: 'heatmap',
    colorscale: 'Viridis',
    showscale: false
};

function showWebGLNotice() {
    if (!WEBGL_AVAILABLE && functionErrorEl) {
        functionErrorEl.textContent = translations[currentLang].webgl_disabled_msg || 'WebGL is disabled — using 2D fallbacks.';
        functionErrorEl.classList.add('warning-message');
    }
}

function getSeriesNames() {
    return {
        ag: translations[currentLang].ag_series || 'Genetic Algorithm',
        pso: translations[currentLang].pso_series || 'Particle Swarm',
        ed: translations[currentLang].ed_series || 'Differential Evolution'
    };
}

// Call webgl notice early so users see fallback info
if (typeof window !== 'undefined') {
    // show the notice when script loads; window.onload will also call initPlots
    showWebGLNotice();
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

    if (WEBGL_AVAILABLE) {
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
    } else {
        // 2D fallback using heatmap + 2D scatter
        const agSurface2D = { ...surface2DTrace, z: cachedSurfaceZ, colorscale: 'Viridis' };
        const psoSurface2D = { ...surface2DTrace, z: cachedSurfaceZ, colorscale: 'Viridis' };
        const edSurface2D = { ...surface2DTrace, z: cachedSurfaceZ, colorscale: 'Viridis' };

        Plotly.newPlot('agPlot', [agSurface2D, { x: [], y: [], mode: 'markers', type: 'scatter', marker: { size: agPointSize, color: '#0f766e' }, name: seriesNames.ag }], layout2D, { responsive: true, displayModeBar: false });
        Plotly.newPlot('psoPlot', [psoSurface2D, { x: [], y: [], mode: 'markers', type: 'scatter', marker: { size: psoPointSize, color: '#d97706' }, name: seriesNames.pso }], layout2D, { responsive: true, displayModeBar: false });
        Plotly.newPlot('edPlot', [edSurface2D, { x: [], y: [], mode: 'markers', type: 'scatter', marker: { size: edPointSize, color: '#be123c' }, name: seriesNames.ed }], layout2D, { responsive: true, displayModeBar: false });
    }

    // Convergence Plot (always 2D)
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
        const enabled = getEnabledAlgorithms();
        gaInstance = enabled.ag ? new GeneticAlgorithm(fitnessFunc, bounds, popSize, currentDimensions, gaOptions) : null;
        psoInstance = enabled.pso ? new ParticleSwarmOptimization(fitnessFunc, bounds, popSize, currentDimensions, psoOptions) : null;
        edInstance = enabled.ed ? new DifferentialEvolution(fitnessFunc, bounds, popSize, currentDimensions, edOptions) : null;
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
    const enabled = getEnabledAlgorithms();

    // Need at least one enabled algorithm instance
    if ((enabled.ag && !gaInstance) && (enabled.pso && !psoInstance) && (enabled.ed && !edInstance)) return;

    // Step enabled algorithms
    if (enabled.ag && gaInstance) gaInstance.step();
    if (enabled.pso && psoInstance) psoInstance.step();
    if (enabled.ed && edInstance) edInstance.step();

    // Build data object with only enabled algorithms
    const data = {};
    if (enabled.ag && gaInstance) {
        const s = gaInstance.getState();
        data.ag = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration };
    }
    if (enabled.pso && psoInstance) {
        const s = psoInstance.getState();
        data.pso = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration };
    }
    if (enabled.ed && edInstance) {
        const s = edInstance.getState();
        data.ed = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration };
    }

    // Update dashboard
    updateDashboard(data);

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

        let agData;
        if (WEBGL_AVAILABLE) {
            agData = [{ ...surfaceTrace, z: cachedSurfaceZ, opacity: getNumberValue('ag_surface_opacity', 0.45) }, {
                x: agX, y: agY, z: agZ,
                mode: 'markers',
                type: 'scatter3d',
                marker: { size: getNumberValue('ag_point_size', 5), color: '#0f766e' },
                name: getSeriesNames().ag
            }];
        } else {
            agData = [{ ...surface2DTrace, z: cachedSurfaceZ }, {
                x: agX, y: agY,
                mode: 'markers',
                type: 'scatter',
                marker: { size: getNumberValue('ag_point_size', 5), color: '#0f766e' },
                name: getSeriesNames().ag
            }];
        }

        Plotly.react('agPlot', agData, document.getElementById('agPlot').layout);
    }

    if (data.pso) {
        psoScoreEl.textContent = Number.isFinite(data.pso.best_score) ? data.pso.best_score.toFixed(4) : "Inf";

        const psoX = data.pso.population.map(p => p[0]);
        const psoY = data.pso.population.map(p => p[1]);
        const psoZ = data.pso.population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))));

        let psoData;
        if (WEBGL_AVAILABLE) {
            psoData = [{ ...surfaceTrace, z: cachedSurfaceZ, opacity: getNumberValue('pso_surface_opacity', 0.45) }, {
                x: psoX, y: psoY, z: psoZ,
                mode: 'markers',
                type: 'scatter3d',
                marker: { size: getNumberValue('pso_point_size', 5), color: '#d97706' },
                name: getSeriesNames().pso
            }];
        } else {
            psoData = [{ ...surface2DTrace, z: cachedSurfaceZ }, {
                x: psoX, y: psoY,
                mode: 'markers',
                type: 'scatter',
                marker: { size: getNumberValue('pso_point_size', 5), color: '#d97706' },
                name: getSeriesNames().pso
            }];
        }

        Plotly.react('psoPlot', psoData, document.getElementById('psoPlot').layout);
    }

    if (data.ed) {
        edScoreEl.textContent = Number.isFinite(data.ed.best_score) ? data.ed.best_score.toFixed(4) : "Inf";

        const edX = data.ed.population.map(p => p[0]);
        const edY = data.ed.population.map(p => p[1]);
        const edZ = data.ed.population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))));

        let edData;
        if (WEBGL_AVAILABLE) {
            edData = [{ ...surfaceTrace, z: cachedSurfaceZ, opacity: getNumberValue('ed_surface_opacity', 0.45) }, {
                x: edX, y: edY, z: edZ,
                mode: 'markers',
                type: 'scatter3d',
                marker: { size: getNumberValue('ed_point_size', 5), color: '#be123c' },
                name: getSeriesNames().ed
            }];
        } else {
            edData = [{ ...surface2DTrace, z: cachedSurfaceZ }, {
                x: edX, y: edY,
                mode: 'markers',
                type: 'scatter',
                marker: { size: getNumberValue('ed_point_size', 5), color: '#be123c' },
                name: getSeriesNames().ed
            }];
        }

        Plotly.react('edPlot', edData, document.getElementById('edPlot').layout);
    }

    // Update Convergence Chart — render if at least one algorithm has data
    const anyData = data.ag || data.pso || data.ed;
    if (anyData) {
        const iter = (data.ag?.iteration) || (data.pso?.iteration) || (data.ed?.iteration) || 0;
        renderConvergence(iter);

        // Check for convergence and auto-stop
        const agConverged = data.ag?.converged === true;
        const psoConverged = data.pso?.converged === true;
        const edConverged = data.ed?.converged === true;

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
        const enabled = getEnabledAlgorithms();
        const hasInstance = (enabled.ag && gaInstance) || (enabled.pso && psoInstance) || (enabled.ed && edInstance);
        if (!hasInstance) {
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
    // Re-show WebGL fallback notice if applicable
    showWebGLNotice();

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
    const enabled = getEnabledAlgorithms();
    const traces = [];

    // Build x values from any available history
    const maxIter = iteration;
    const xValues = [];

    for (let i = 0; i <= maxIter; i++) {
        const hasAg = !enabled.ag || historyCache.ag[i] !== undefined;
        const hasPso = !enabled.pso || historyCache.pso[i] !== undefined;
        const hasEd = !enabled.ed || historyCache.ed[i] !== undefined;
        if (hasAg && hasPso && hasEd) xValues.push(i);
    }

    if (enabled.ag) {
        traces.push({ x: xValues, y: xValues.map(i => historyCache.ag[i]), mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } });
    }
    if (enabled.pso) {
        traces.push({ x: xValues, y: xValues.map(i => historyCache.pso[i]), mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } });
    }
    if (enabled.ed) {
        traces.push({ x: xValues, y: xValues.map(i => historyCache.ed[i]), mode: 'lines', name: seriesNames.ed, line: { color: '#be123c' } });
    }

    // If no traces, show empty
    if (traces.length === 0) {
        traces.push({ x: [], y: [], mode: 'lines', name: '', line: { color: '#999' } });
    }

    try {
        Plotly.react('convergencePlot', traces, layoutConvergence, { responsive: true, displayModeBar: false });
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
        modeSelect.value = 'min';
    }

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
document.addEventListener('keydown', function (e) {
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

// --- IEEE CEC Benchmark State ---
let benchmarkTotalFEs = 0;          // FEs accumulated in current run
let benchmarkMaxFEs = 0;            // Budget = 10000 * D
let benchmarkGlobalMin = 0;         // Known optimal value for error calc
let benchmarkErrorResults = null;   // { ag: [errors per run], pso: [...], ed: [...] }
let benchmarkSuccessCount = null;   // { ag: count, pso: count, ed: count }
let benchmarkCheckpoints = null;    // { ag: [[checkpoint errors per run]], ... }
let benchmarkWilcoxon = null;       // Computed after benchmark finishes
let benchmarkRunHistories = null;   // { ag: [[fitness by iter per run]], pso: [...], ed: [...] }
let benchmarkRunMetrics = null;     // [{ run, iterations, fes, scores:{}, errors:{} }]
const CEC_SUCCESS_THRESHOLD = 1e-8;
const CEC_CHECKPOINT_PCTS = [0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

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

    // --- CEC initialization ---
    const dims = currentDimensions || 2;
    benchmarkMaxFEs = 10000 * dims;
    // Detect global minimum from BENCHMARKS registry
    benchmarkGlobalMin = 0;
    if (typeof BENCHMARKS !== 'undefined' && currentExpression) {
        for (const key of Object.keys(BENCHMARKS)) {
            if (BENCHMARKS[key].expression === currentExpression) {
                benchmarkGlobalMin = BENCHMARKS[key].globalMin || 0;
                break;
            }
        }
    }
    benchmarkErrorResults = { ag: [], pso: [], ed: [] };
    benchmarkSuccessCount = { ag: 0, pso: 0, ed: 0 };
    benchmarkCheckpoints = { ag: [], pso: [], ed: [] };
    benchmarkWilcoxon = null;
    benchmarkRunHistories = { ag: [], pso: [], ed: [] };
    benchmarkRunMetrics = [];

    // Compute max iterations from MaxFEs
    const popSize = parseInt(document.getElementById('pop_size')?.value) || 50;
    const maxItersFromFEs = Math.ceil(benchmarkMaxFEs / popSize);
    benchmarkItersPerRun = Math.min(benchmarkItersPerRun, maxItersFromFEs);

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

    const enabled = getEnabledAlgorithms();

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
    benchmarkTotalFEs = 0; // Reset FE counter for this run

    const enabledKeys = getEnabledKeys();
    enabledKeys.forEach(k => {
        if (!benchmarkRunHistories[k][benchmarkRunIndex]) benchmarkRunHistories[k][benchmarkRunIndex] = [];
    });

    // Reset convergence plot for this run
    try {
        const plotEl = document.getElementById('convergencePlot');
        const nTraces = plotEl?.data?.length || 3;
        const indices = Array.from({ length: nTraces }, (_, i) => i);
        if (indices.length > 0) Plotly.deleteTraces('convergencePlot', indices);
        const seriesNames = getSeriesNames();
        const newTraces = [];
        if (enabled.ag) newTraces.push({ x: [], y: [], mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } });
        if (enabled.pso) newTraces.push({ x: [], y: [], mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } });
        if (enabled.ed) newTraces.push({ x: [], y: [], mode: 'lines', name: seriesNames.ed, line: { color: '#be123c' } });
        if (newTraces.length > 0) Plotly.addTraces('convergencePlot', newTraces);
    } catch (e) { /* Plotly not ready */ }

    // Show initial state
    const data = {};
    if (enabled.ag && gaInstance) { const s = gaInstance.getState(); data.ag = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration }; }
    if (enabled.pso && psoInstance) { const s = psoInstance.getState(); data.pso = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration }; }
    if (enabled.ed && edInstance) { const s = edInstance.getState(); data.ed = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration }; }

    // Record initial fitness (iteration 0) for benchmark run history
    enabledKeys.forEach(k => {
        const inst = k === 'ag' ? gaInstance : k === 'pso' ? psoInstance : edInstance;
        if (inst && Number.isFinite(inst.bestScore)) {
            benchmarkRunHistories[k][benchmarkRunIndex].push(inst.bestScore);
        }
    });

    updateDashboard(data);

    // Update progress label
    updateBenchmarkProgress();

    // Start animated stepping
    benchmarkAnimatedStep();
}

function benchmarkAnimatedStep() {
    if (benchmarkCancelled) return;
    const enabled = getEnabledAlgorithms();
    const hasAny = (enabled.ag && gaInstance) || (enabled.pso && psoInstance) || (enabled.ed && edInstance);
    if (!hasAny) return;

    // Step enabled algorithms
    if (enabled.ag && gaInstance) gaInstance.step();
    if (enabled.pso && psoInstance) psoInstance.step();
    if (enabled.ed && edInstance) edInstance.step();

    benchmarkCurrentIter++;

    // --- CEC: Count Function Evaluations ---
    const popSize = parseInt(document.getElementById('pop_size')?.value) || 50;
    benchmarkTotalFEs += popSize; // Each step evaluates the entire population

    // Record history and update scores for enabled algorithms
    let currentIter = benchmarkCurrentIter;
    const seriesNames = getSeriesNames();

    if (enabled.ag && gaInstance) {
        const s = gaInstance.getState();
        if (Number.isFinite(s.bestScore)) historyCache.ag[s.iteration] = s.bestScore;
        if (Number.isFinite(s.bestScore) && benchmarkRunHistories?.ag?.[benchmarkRunIndex]) {
            benchmarkRunHistories.ag[benchmarkRunIndex].push(s.bestScore);
        }
        currentIter = s.iteration;
        agScoreEl.textContent = Number.isFinite(s.bestScore) ? s.bestScore.toFixed(4) : "Inf";
    }
    if (enabled.pso && psoInstance) {
        const s = psoInstance.getState();
        if (Number.isFinite(s.bestScore)) historyCache.pso[s.iteration] = s.bestScore;
        if (Number.isFinite(s.bestScore) && benchmarkRunHistories?.pso?.[benchmarkRunIndex]) {
            benchmarkRunHistories.pso[benchmarkRunIndex].push(s.bestScore);
        }
        currentIter = s.iteration;
        psoScoreEl.textContent = Number.isFinite(s.bestScore) ? s.bestScore.toFixed(4) : "Inf";
    }
    if (enabled.ed && edInstance) {
        const s = edInstance.getState();
        if (Number.isFinite(s.bestScore)) historyCache.ed[s.iteration] = s.bestScore;
        if (Number.isFinite(s.bestScore) && benchmarkRunHistories?.ed?.[benchmarkRunIndex]) {
            benchmarkRunHistories.ed[benchmarkRunIndex].push(s.bestScore);
        }
        currentIter = s.iteration;
        edScoreEl.textContent = Number.isFinite(s.bestScore) ? s.bestScore.toFixed(4) : "Inf";
    }

    currentIteration = currentIter;
    updateIterationLabel();

    // Update 3D plots for enabled algorithms
    const updatePlot = (plotId, population, opacity, pointSize, color, seriesName) => {
        const xs = population.map(p => p[0]);
        const ys = population.map(p => p[1]);
        const zs = population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))));
        let data;
        if (WEBGL_AVAILABLE) {
            data = [
                { ...surfaceTrace, z: cachedSurfaceZ, opacity },
                {
                    x: xs, y: ys, z: zs, mode: 'markers', type: 'scatter3d',
                    marker: { size: pointSize, color }, name: seriesName
                }
            ];
        } else {
            data = [
                { ...surface2DTrace, z: cachedSurfaceZ },
                { x: xs, y: ys, mode: 'markers', type: 'scatter', marker: { size: pointSize, color }, name: seriesName }
            ];
        }
        Plotly.react(plotId, data, document.getElementById(plotId).layout);
    };

    if (enabled.ag && gaInstance) {
        const s = gaInstance.getState();
        updatePlot('agPlot', s.population, getNumberValue('ag_surface_opacity', 0.45),
            getNumberValue('ag_point_size', 5), '#0f766e', seriesNames.ag);
    }
    if (enabled.pso && psoInstance) {
        const s = psoInstance.getState();
        updatePlot('psoPlot', s.population, getNumberValue('pso_surface_opacity', 0.45),
            getNumberValue('pso_point_size', 5), '#d97706', seriesNames.pso);
    }
    if (enabled.ed && edInstance) {
        const s = edInstance.getState();
        updatePlot('edPlot', s.population, getNumberValue('ed_surface_opacity', 0.45),
            getNumberValue('ed_point_size', 5), '#be123c', seriesNames.ed);
    }

    // Update convergence chart
    renderConvergence(currentIter);

    // Update progress
    updateBenchmarkProgress();

    // Check convergence (respect model's convergence settings)
    const convergenceEnabled = document.getElementById('convergence_enabled')?.checked || false;
    let runDone = benchmarkCurrentIter >= benchmarkItersPerRun || benchmarkTotalFEs >= benchmarkMaxFEs;

    if (!runDone && convergenceEnabled) {
        const agConv = enabled.ag && gaInstance ? gaInstance.getState().converged : false;
        const psoConv = enabled.pso && psoInstance ? psoInstance.getState().converged : false;
        const edConv = enabled.ed && edInstance ? edInstance.getState().converged : false;
        if (agConv || psoConv || edConv) {
            runDone = true;
        }
    }

    // --- CEC: Record error at checkpoints ---
    const feRatio = benchmarkTotalFEs / benchmarkMaxFEs;
    const enabledKeys = getEnabledKeys();

    // Check if this run is done
    if (runDone) {
        const runScores = {};
        const runErrors = {};

        // Record results for enabled algorithms
        enabledKeys.forEach(k => {
            const inst = k === 'ag' ? gaInstance : k === 'pso' ? psoInstance : edInstance;
            if (inst) {
                benchmarkResults[k].push(inst.bestScore);
                runScores[k] = inst.bestScore;
                // CEC: Record error = |bestScore - globalMin|
                const error = Math.abs(inst.bestScore - benchmarkGlobalMin);
                benchmarkErrorResults[k].push(error);
                runErrors[k] = error;
                // CEC: Success if error < threshold
                if (error < CEC_SUCCESS_THRESHOLD) benchmarkSuccessCount[k]++;
                // CEC: Record checkpoint errors (final state at 100%)
                if (!benchmarkCheckpoints[k][benchmarkRunIndex]) {
                    benchmarkCheckpoints[k][benchmarkRunIndex] = {};
                }
                // Fill all remaining checkpoints with final error
                CEC_CHECKPOINT_PCTS.forEach(pct => {
                    if (benchmarkCheckpoints[k][benchmarkRunIndex][pct] === undefined) {
                        benchmarkCheckpoints[k][benchmarkRunIndex][pct] = error;
                    }
                });
            }
        });

        benchmarkRunMetrics[benchmarkRunIndex] = {
            run: benchmarkRunIndex + 1,
            iterations: benchmarkCurrentIter,
            fes: benchmarkTotalFEs,
            scores: runScores,
            errors: runErrors
        };

        // Determine run winner among enabled algorithms
        const mode = getOptimizationMode();
        const scores = enabledKeys.map(k => {
            const inst = k === 'ag' ? gaInstance : k === 'pso' ? psoInstance : edInstance;
            return { key: k, score: inst ? inst.bestScore : (mode === 'max' ? -Infinity : Infinity) };
        });
        if (mode === 'max') {
            scores.sort((a, b) => b.score - a.score);
        } else {
            scores.sort((a, b) => a.score - b.score);
        }
        if (scores.length >= 2 && scores[0].score === scores[1].score) {
            benchmarkWins.tie++;
        } else if (scores.length >= 1) {
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
        // --- CEC: Record checkpoint errors mid-run ---
        enabledKeys.forEach(k => {
            const inst = k === 'ag' ? gaInstance : k === 'pso' ? psoInstance : edInstance;
            if (inst) {
                if (!benchmarkCheckpoints[k][benchmarkRunIndex]) {
                    benchmarkCheckpoints[k][benchmarkRunIndex] = {};
                }
                CEC_CHECKPOINT_PCTS.forEach(pct => {
                    if (feRatio >= pct && benchmarkCheckpoints[k][benchmarkRunIndex][pct] === undefined) {
                        benchmarkCheckpoints[k][benchmarkRunIndex][pct] = Math.abs(inst.bestScore - benchmarkGlobalMin);
                    }
                });
            }
        });

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
        // --- CEC: Compute Wilcoxon signed-rank test between all pairs ---
        const enabledKeys = getEnabledKeys();
        if (enabledKeys.length >= 2 && benchmarkErrorResults) {
            benchmarkWilcoxon = {};
            for (let i = 0; i < enabledKeys.length; i++) {
                for (let j = i + 1; j < enabledKeys.length; j++) {
                    const a = enabledKeys[i], b = enabledKeys[j];
                    const pairKey = `${a}_vs_${b}`;
                    benchmarkWilcoxon[pairKey] = wilcoxonSignedRankTest(
                        benchmarkErrorResults[a], benchmarkErrorResults[b]
                    );
                }
            }
        }
        showBenchmarkResults(benchmarkResults, benchmarkWins, benchmarkRunIndex, benchmarkItersPerRun);
    }
}

// =============================================================================
//  Wilcoxon Signed-Rank Test (inline, no dependencies)
// =============================================================================
function wilcoxonSignedRankTest(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 5) return { W: 0, Rplus: 0, Rminus: 0, p: 1, result: '=' };

    // Step 1: Compute differences and remove zeros
    const diffs = [];
    for (let i = 0; i < n; i++) {
        const d = x[i] - y[i];
        if (Math.abs(d) > 1e-15) diffs.push(d);
    }
    const nr = diffs.length;
    if (nr === 0) return { W: 0, Rplus: 0, Rminus: 0, p: 1, result: '=' };

    // Step 2: Rank absolute differences
    const absDiffs = diffs.map((d, i) => ({ idx: i, abs: Math.abs(d), sign: Math.sign(d) }));
    absDiffs.sort((a, b) => a.abs - b.abs);

    // Handle ties (average ranks)
    const ranks = new Array(nr);
    let i = 0;
    while (i < nr) {
        let j = i;
        while (j < nr && Math.abs(absDiffs[j].abs - absDiffs[i].abs) < 1e-15) j++;
        const avgRank = (i + 1 + j) / 2;
        for (let k = i; k < j; k++) ranks[k] = avgRank;
        i = j;
    }

    // Step 3: Sum positive and negative ranks
    let Rplus = 0, Rminus = 0;
    for (let k = 0; k < nr; k++) {
        if (absDiffs[k].sign > 0) Rplus += ranks[k];
        else Rminus += ranks[k];
    }

    const W = Math.min(Rplus, Rminus);

    // Step 4: Compute p-value using normal approximation (for n >= 10)
    const meanW = nr * (nr + 1) / 4;
    const stdW = Math.sqrt(nr * (nr + 1) * (2 * nr + 1) / 24);
    const z = stdW > 0 ? (W - meanW) / stdW : 0;
    // Two-tailed p-value from normal approximation
    const p = 2 * normalCDF(-Math.abs(z));

    // Result: + means x is significantly better (lower error), - means y is better
    let result = '=';
    if (p < 0.05) {
        result = Rplus < Rminus ? '+' : '−';
    }

    return { W, Rplus, Rminus, p, z, result };
}

// Standard normal CDF approximation (Abramowitz & Stegun)
function normalCDF(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1.0 + sign * y);
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

// Format number in CEC scientific notation
function cecFormat(val) {
    if (val === 0) return '0.00e+00';
    if (!Number.isFinite(val)) return 'Inf';
    return val.toExponential(2);
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

    if (statsTitle) statsTitle.textContent = t.benchmark_stats || 'CEC Statistics';
    if (winsTitle) winsTitle.textContent = t.benchmark_wins || 'Wins per Algorithm';

    // Only show enabled algorithms
    const enabledKeys = getEnabledKeys();
    const algNames = { ag: t.ag_series || 'AG', pso: t.pso_series || 'PSO', ed: t.ed_series || 'ED' };
    const algColors = { ag: '#0f766e', pso: '#d97706', ed: '#be123c' };

    // Title
    titleEl.textContent = t.benchmark_result_title || 'IEEE CEC Benchmark Results';
    const maxFEsLabel = benchmarkMaxFEs ? ` • MaxFEs: ${benchmarkMaxFEs.toLocaleString()}` : '';
    subtitleEl.textContent = `${totalRuns} ${t.benchmark_result_subtitle || 'runs'} • ${itersPerRun} ${t.benchmark_iters || 'iterations'}${maxFEsLabel}`;

    // Compute fitness stats
    const statsMap = {};
    enabledKeys.forEach(k => { statsMap[k] = computeStats(results[k]); });

    // Compute error stats
    const errorStatsMap = {};
    if (benchmarkErrorResults) {
        enabledKeys.forEach(k => { errorStatsMap[k] = computeStats(benchmarkErrorResults[k]); });
    }

    // Determine overall winner
    const mode = getOptimizationMode();
    const algorithms = enabledKeys.map(k => ({
        key: k, name: algNames[k], wins: wins[k], mean: statsMap[k].mean, color: algColors[k]
    }));

    algorithms.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (mode === 'max') return b.mean - a.mean;
        return a.mean - b.mean;
    });

    const winner = algorithms[0];
    const isTie = algorithms.length >= 2 && winner.wins === algorithms[1].wins;

    // Winner banner
    if (algorithms.length === 1) {
        bannerEl.innerHTML = `<span class="winner-trophy">\ud83c\udfc6</span> <span class="winner-name">${winner.name}</span>`;
        bannerEl.style.background = `linear-gradient(135deg, ${winner.color}, ${winner.color}dd)`;
    } else if (isTie) {
        const tiedAlgs = algorithms.filter(a => a.wins === winner.wins);
        bannerEl.innerHTML = `<span class="winner-label">${t.benchmark_tie || 'Tie'}</span> <span class="winner-names">${tiedAlgs.map(a => a.name).join(' & ')}</span>`;
        bannerEl.style.background = 'linear-gradient(135deg, #6b7280, #9ca3af)';
    } else {
        bannerEl.innerHTML = `<span class="winner-trophy">\ud83c\udfc6</span> <span class="winner-label">${t.benchmark_winner || 'Winner'}:</span> <span class="winner-name">${winner.name}</span> <span class="winner-wins">(${winner.wins}/${totalRuns} ${t.stat_wins || 'wins'})</span>`;
        bannerEl.style.background = `linear-gradient(135deg, ${winner.color}, ${winner.color}dd)`;
    }

    // ═════════════════════════════════════════════════════════════════════
    //  Build all tables in tableContainer
    // ═════════════════════════════════════════════════════════════════════
    let html = '';

    // ── 1. CEC Error Table ──────────────────────────────────────────────
    if (benchmarkErrorResults && Object.keys(errorStatsMap).length > 0) {
        html += `<h4 class="cec-section-title">📊 ${t.cec_error_table || 'Error Table (CEC Format)'}</h4>`;
        html += '<table class="stats-table cec-table"><thead><tr><th></th>';
        enabledKeys.forEach(k => {
            html += `<th style="color:${algColors[k]}">${algNames[k]}</th>`;
        });
        html += '</tr></thead><tbody>';

        const errorLabels = ['Mean', 'Std', 'Best', 'Worst', 'Median'];
        const errorFields = ['mean', 'std', 'best', 'worst', 'median'];
        errorFields.forEach((field, fi) => {
            html += `<tr><td class="stat-label">${errorLabels[fi]}</td>`;
            const vals = enabledKeys.map(k => errorStatsMap[k][field]);
            const bestVal = field === 'std' ? Math.min(...vals) : Math.min(...vals);
            enabledKeys.forEach(k => {
                const v = errorStatsMap[k][field];
                const isBest = Math.abs(v - bestVal) < 1e-15;
                html += `<td class="${isBest ? 'stat-best' : ''}">${cecFormat(v)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
    }

    // ── 2. Success Rate ─────────────────────────────────────────────────
    if (benchmarkSuccessCount) {
        html += `<h4 class="cec-section-title">✅ ${t.cec_success_rate || 'Success Rate'} (ε < ${CEC_SUCCESS_THRESHOLD})</h4>`;
        html += '<table class="stats-table cec-table"><thead><tr><th></th>';
        enabledKeys.forEach(k => {
            html += `<th style="color:${algColors[k]}">${algNames[k]}</th>`;
        });
        html += '</tr></thead><tbody><tr><td class="stat-label">Rate</td>';
        enabledKeys.forEach(k => {
            const rate = ((benchmarkSuccessCount[k] / totalRuns) * 100).toFixed(1);
            html += `<td>${rate}% (${benchmarkSuccessCount[k]}/${totalRuns})</td>`;
        });
        html += '</tr></tbody></table>';
    }

    // ── 3. FE Checkpoint Convergence ────────────────────────────────────
    if (benchmarkCheckpoints && enabledKeys.length > 0) {
        html += `<h4 class="cec-section-title">📈 ${t.cec_checkpoints || 'Error at FE Checkpoints'}</h4>`;
        html += '<table class="stats-table cec-table cec-checkpoint-table"><thead><tr><th>FEs %</th>';
        enabledKeys.forEach(k => {
            html += `<th style="color:${algColors[k]}">${algNames[k]}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Show averaged errors across runs for each checkpoint
        CEC_CHECKPOINT_PCTS.forEach(pct => {
            const feCount = Math.round(pct * benchmarkMaxFEs);
            html += `<tr><td class="stat-label">${(pct * 100).toFixed(0)}% (${feCount.toLocaleString()})</td>`;
            enabledKeys.forEach(k => {
                // Average errors across runs for this checkpoint
                let sum = 0, count = 0;
                benchmarkCheckpoints[k].forEach(runData => {
                    if (runData && runData[pct] !== undefined) {
                        sum += runData[pct];
                        count++;
                    }
                });
                const avg = count > 0 ? sum / count : NaN;
                html += `<td>${Number.isFinite(avg) ? cecFormat(avg) : 'N/A'}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
    }

    // ── 4. Wilcoxon Signed-Rank Test ────────────────────────────────────
    if (benchmarkWilcoxon && enabledKeys.length >= 2) {
        html += `<h4 class="cec-section-title">🧪 ${t.cec_wilcoxon || 'Wilcoxon Signed-Rank Test'} (α = 0.05)</h4>`;
        html += '<table class="stats-table cec-table"><thead><tr>';
        html += `<th>${t.cec_pair || 'Pair'}</th><th>R+</th><th>R−</th><th>p-value</th><th>${t.cec_significance || 'Sig.'}</th>`;
        html += '</tr></thead><tbody>';

        for (const pairKey of Object.keys(benchmarkWilcoxon)) {
            const w = benchmarkWilcoxon[pairKey];
            const [a, , b] = pairKey.split('_');
            const sigClass = w.result === '+' ? 'wilcoxon-plus' : w.result === '−' ? 'wilcoxon-minus' : 'wilcoxon-equal';
            const sigLabel = w.result === '+' ? `${algNames[a]}+` : w.result === '−' ? `${algNames[b]}+` : '=';
            html += `<tr>`;
            html += `<td class="stat-label">${algNames[a]} vs ${algNames[b]}</td>`;
            html += `<td>${w.Rplus.toFixed(1)}</td>`;
            html += `<td>${w.Rminus.toFixed(1)}</td>`;
            html += `<td>${w.p < 0.001 ? '<0.001' : w.p.toFixed(4)}</td>`;
            html += `<td class="${sigClass}">${sigLabel}</td>`;
            html += `</tr>`;
        }
        html += '</tbody></table>';
    }

    // ── 5. Fitness Stats (traditional) ──────────────────────────────────
    html += `<h4 class="cec-section-title">📋 ${t.benchmark_stats || 'Fitness Statistics'}</h4>`;
    html += '<table class="stats-table"><thead><tr><th></th>';
    enabledKeys.forEach(k => {
        html += `<th style="color:${algColors[k]}">${algNames[k]}</th>`;
    });
    html += '</tr></thead><tbody>';

    const statLabels = {
        mean: t.stat_mean || 'Mean', std: t.stat_std || 'Std Dev',
        best: t.stat_best || 'Best', worst: t.stat_worst || 'Worst',
        median: t.stat_median || 'Median', wins: t.stat_wins || 'Wins'
    };

    ['mean', 'std', 'best', 'worst', 'median'].forEach(stat => {
        html += `<tr><td class="stat-label">${statLabels[stat]}</td>`;
        const vals = enabledKeys.map(k => statsMap[k][stat]);
        let bestVal;
        if (stat === 'std') {
            bestVal = Math.min(...vals);
        } else {
            bestVal = mode === 'max' ? Math.max(...vals) : Math.min(...vals);
        }
        enabledKeys.forEach(k => {
            const v = statsMap[k][stat];
            const isBest = v === bestVal;
            html += `<td class="${isBest ? 'stat-best' : ''}">${v.toFixed(6)}</td>`;
        });
        html += '</tr>';
    });

    // Wins row
    html += `<tr class="wins-row"><td class="stat-label">${statLabels.wins}</td>`;
    const maxWins = Math.max(...enabledKeys.map(k => wins[k]));
    enabledKeys.forEach(k => {
        const w = wins[k];
        const isBest = w === maxWins && w > 0;
        html += `<td class="${isBest ? 'stat-best' : ''}">${w}</td>`;
    });
    html += '</tr></tbody></table>';

    // ── 6. Ranking ──────────────────────────────────────────────────────
    if (benchmarkErrorResults && enabledKeys.length >= 2) {
        html += `<h4 class="cec-section-title">🏅 ${t.cec_ranking || 'Final Ranking'}</h4>`;
        const ranked = enabledKeys.map(k => ({
            key: k, name: algNames[k], meanError: errorStatsMap[k]?.mean || 0, color: algColors[k]
        })).sort((a, b) => a.meanError - b.meanError);

        html += '<table class="stats-table cec-table"><thead><tr>';
        html += `<th>#</th><th>${t.cec_algorithm || 'Algorithm'}</th><th>Mean Error</th>`;
        html += '</tr></thead><tbody>';
        ranked.forEach((r, idx) => {
            html += `<tr><td>${idx + 1}</td><td style="color:${r.color};font-weight:bold">${r.name}</td><td>${cecFormat(r.meanError)}</td></tr>`;
        });
        html += '</tbody></table>';
    }

    tableContainer.innerHTML = html;

    // Wins chart (horizontal bars)
    let barsHTML = '';
    enabledKeys.forEach(k => {
        const pct = Math.round((wins[k] / totalRuns) * 100);
        barsHTML += `<div class="win-bar-row">
            <span class="win-bar-label">${algNames[k]}</span>
            <div class="win-bar-track">
                <div class="win-bar-fill" style="width:${pct}%;background:${algColors[k]}">
                    <span class="win-bar-value">${wins[k]}</span>
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


// generatePdfReport() movido para report.js


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
    onAlgoToggle(); // Set initial grid count
    window.addEventListener('resize', resizePlots);

    // Initialize algorithms and show initial state
    setTimeout(() => {
        if (initAlgorithms()) {
            const enabled = getEnabledAlgorithms();
            const data = {};
            if (enabled.ag && gaInstance) {
                const s = gaInstance.getState();
                data.ag = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration };
            }
            if (enabled.pso && psoInstance) {
                const s = psoInstance.getState();
                data.pso = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration };
            }
            if (enabled.ed && edInstance) {
                const s = edInstance.getState();
                data.ed = { ...s, best_score: s.bestScore, max_iteration: s.maxIteration };
            }
            updateDashboard(data);
        }
    }, 100);
};
