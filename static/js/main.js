
// DOM Elements
const agScoreEl = document.getElementById('ag-score');
const psoScoreEl = document.getElementById('pso-score');
const iterationEl = document.getElementById('iteration-display');
const iterationValueEl = document.getElementById('iteration-value');
const startBtn = document.getElementById('startBtn');
const functionInputEl = document.getElementById('function_expr');
const dimensionsInputEl = document.getElementById('dimensions');
const functionErrorEl = document.getElementById('function-error');
const fixedDimsGridEl = document.getElementById('fixed-dims-grid');

let ws;
let isRunning = false;
let currentIteration = 0;
let maxComputedIteration = 0;
let resizeTimer;

const historyCache = {
    ag: [],
    pso: []
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
        subtitle: "AG vs PSO on Rastrigin Surface",
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
        surface_opacity: "Surface",
        point_size: "Points",
        convergence_stop: "Stop on Convergence",
        convergence_threshold: "Threshold",
        convergence_window: "Window (iters)",
        converged_msg: "Converged!",
        continue: "Continue"
    },
    pt: {
        eyebrow: "Otimização ao Vivo",
        title: "Batalha de Otimização",
        subtitle: "AG vs PSO na Superfície Rastrigin",
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
        surface_opacity: "Superfície",
        point_size: "Pontos",
        convergence_stop: "Parar ao Convergir",
        convergence_threshold: "Limiar",
        convergence_window: "Janela (iters)",
        converged_msg: "Convergiu!",
        continue: "Continuar"
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
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        const langText = langBtn.querySelector('.toggle-text');
        const nextLang = currentLang === 'en' ? 'PT' : 'EN';
        if (langText) langText.textContent = nextLang;
        langBtn.setAttribute('data-lang', currentLang);
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
    if (iterationSeekValueEl) {
        iterationSeekValueEl.textContent = `${currentIteration}`;
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
        pso: translations[currentLang].pso_series || 'Particle Swarm'
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
    } catch (e) {
        console.log('Plotly not ready');
    }
}

function initPlots() {
    const seriesNames = getSeriesNames();
    const agPointSize = getNumberValue('ag_point_size', 5);
    const psoPointSize = getNumberValue('pso_point_size', 5);
    const agSurfaceOpacity = getNumberValue('ag_surface_opacity', 0.45);
    const psoSurfaceOpacity = getNumberValue('pso_surface_opacity', 0.45);
    cachedSurfaceZ = getSurfaceZ();
    const agSurface = { ...surfaceTrace, z: cachedSurfaceZ, opacity: agSurfaceOpacity };
    const psoSurface = { ...surfaceTrace, z: cachedSurfaceZ, opacity: psoSurfaceOpacity };
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

    // Convergence Plot
    Plotly.newPlot('convergencePlot', [
        { x: [], y: [], mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } },
        { x: [], y: [], mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } }
    ], layoutConvergence, { responsive: true, displayModeBar: false });
    updatePlotLanguage();
}

// --- WebSocket & Simulation ---
function connectWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${protocol}://${location.host}/ws/simulation`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateDashboard(data);
        if (isRunning) {
            const delay = parseInt(document.getElementById('sim_delay').value) || 0;
            if (delay > 0) setTimeout(() => requestStep(), delay);
            else requestAnimationFrame(requestStep);
        }
    };
    ws.onclose = () => { isRunning = false; updateStartBtnText(); };
    ws.onopen = () => {
        // Send initial reset to get the starting state (Iteration 0)
        resetSimulation();
    };
}

function requestStep() {
    if (isRunning && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "step" }));
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
    if (data?.ag?.max_iteration !== undefined) {
        updateSeekControls(data.ag.max_iteration, data.ag.iteration);
    }
    const layoutUpdate = {
        scene: {
            camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } } // Initial only, urevision handles rest
        },
        datarevision: data.ag.iteration, // Trigger update
        urevision: true // Preserve user interaction state (camera, zoom)
    };

    if (data.ag) {
        agScoreEl.textContent = Number.isFinite(data.ag.best_score) ? data.ag.best_score.toFixed(4) : "Inf";
        currentIteration = data.ag.iteration;
        updateIterationLabel();

        const agX = data.ag.population.map(p => p[0]);
        const agY = data.ag.population.map(p => p[1]);
        const agZ = data.ag.population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))) + 1);

        // Use Plotly.react for high-performance updates
        // We reuse the surface trace (index 0) and update scatter trace (index 1)
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
        const psoZ = data.pso.population.map(p => applyObjectiveValue(safeValue(evaluateExpressionVector(p))) + 1);

        const psoData = [{ ...surfaceTrace, z: cachedSurfaceZ, opacity: getNumberValue('pso_surface_opacity', 0.45) }, {
            x: psoX, y: psoY, z: psoZ,
            mode: 'markers',
            type: 'scatter3d',
            marker: { size: getNumberValue('pso_point_size', 5), color: '#d97706' },
            name: getSeriesNames().pso
        }];

        Plotly.react('psoPlot', psoData, document.getElementById('psoPlot').layout);
    }

    // Update Convergence Chart
    if (data.ag && data.pso) {
        renderConvergence(data.ag.iteration);

        // Check for convergence and auto-stop
        const agConverged = data.ag.converged === true;
        const psoConverged = data.pso.converged === true;

        if (agConverged || psoConverged) {
            const convergenceEnabledEl = document.getElementById('convergence_enabled');
            if (convergenceEnabledEl && convergenceEnabledEl.checked && isRunning) {
                isRunning = false;
                updateStartBtnText();

                // Show convergence notification
                const convergedMsg = translations[currentLang].converged_msg || 'Converged!';
                const who = agConverged && psoConverged ? 'AG & PSO' :
                    agConverged ? 'AG' : 'PSO';
                if (functionErrorEl) {
                    functionErrorEl.textContent = `✓ ${who} ${convergedMsg}`;
                    functionErrorEl.classList.add('success-message');
                }
            }
        }
    }
}

function toggleSimulation() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    isRunning = !isRunning;
    updateStartBtnText();
    if (isRunning) requestStep();
}

function resetSimulation() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

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
    isRunning = false;
    updateStartBtnText();
    currentIteration = 0;
    updateIterationLabel();
    resetHistoryCache();

    // Reset Plots
    Plotly.deleteTraces('convergencePlot', [0, 1]);
    const seriesNames = getSeriesNames();
    Plotly.addTraces('convergencePlot', [
        { x: [], y: [], mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } },
        { x: [], y: [], mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } }
    ]);

    const convergenceEnabledEl = document.getElementById('convergence_enabled');
    const convergenceThresholdEl = document.getElementById('convergence_threshold');
    const convergenceWindowEl = document.getElementById('convergence_window');

    const params = {
        action: "reset",
        function_expr: currentExpression,
        dimensions: currentDimensions,
        pop_size: parseInt(document.getElementById('pop_size').value),
        ag_mutation: parseFloat(document.getElementById('ag_mutation').value),
        ag_crossover: parseFloat(document.getElementById('ag_crossover').value),
        pso_w: parseFloat(document.getElementById('pso_w').value),
        pso_c1: parseFloat(document.getElementById('pso_c1').value),
        pso_c2: parseFloat(document.getElementById('pso_c2').value),
        optimization_mode: getOptimizationMode(),
        target_value: getTargetValue(),
        convergence_enabled: convergenceEnabledEl ? convergenceEnabledEl.checked : false,
        convergence_threshold: convergenceThresholdEl ? parseFloat(convergenceThresholdEl.value) : 1e-6,
        convergence_window: convergenceWindowEl ? parseInt(convergenceWindowEl.value) : 20
    };
    ws.send(JSON.stringify(params));
}

function requestSeek(iteration) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    isRunning = false;
    updateStartBtnText();
    ws.send(JSON.stringify({ action: "seek", iteration }));
}

function stepForward() {
    if (currentIteration < maxComputedIteration) {
        requestSeek(currentIteration + 1);
    }
}

function stepBackward() {
    if (currentIteration > 0) {
        requestSeek(currentIteration - 1);
    }
}

function continueSimulation() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    // First, restore to max iteration, then start running
    ws.send(JSON.stringify({ action: "continue" }));
    isRunning = true;
    updateStartBtnText();
    // Wait for response then start stepping
    const originalOnMessage = ws.onmessage;
    ws.onmessage = (event) => {
        ws.onmessage = originalOnMessage;
        originalOnMessage(event);
        if (isRunning) requestStep();
    };
}

function updateSeekControls(maxIteration, current) {
    maxComputedIteration = maxIteration;
    // Update navigation button states
    updateNavigationButtons(current, maxIteration);
}

function updateNavigationButtons(current, maxIter) {
    const prevBtn = document.getElementById('stepBackBtn');
    const nextBtn = document.getElementById('stepForwardBtn');
    const continueBtn = document.getElementById('continueBtn');

    if (prevBtn) prevBtn.disabled = current <= 0;
    if (nextBtn) nextBtn.disabled = current >= maxIter;
    if (continueBtn) {
        // Show continue button only when viewing past iteration and not at max
        const isViewingPast = current < maxIter;
        continueBtn.style.display = isViewingPast ? 'inline-flex' : 'none';
    }
}

function resetHistoryCache() {
    historyCache.ag = [];
    historyCache.pso = [];
    maxComputedIteration = 0;
    renderConvergence(0);
}

function renderConvergence(iteration) {
    const seriesNames = getSeriesNames();
    const xValues = [];
    const agValues = [];
    const psoValues = [];

    for (let i = 0; i <= iteration; i += 1) {
        if (historyCache.ag[i] === undefined || historyCache.pso[i] === undefined) continue;
        xValues.push(i);
        agValues.push(historyCache.ag[i]);
        psoValues.push(historyCache.pso[i]);
    }

    try {
        Plotly.react('convergencePlot', [
            { x: xValues, y: agValues, mode: 'lines', name: seriesNames.ag, line: { color: '#0f766e' } },
            { x: xValues, y: psoValues, mode: 'lines', name: seriesNames.pso, line: { color: '#d97706' } }
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
    updateThemeIcon(savedTheme);
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
    updateThemeIcon(theme);
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

function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('.toggle-icon');
    if (icon) icon.textContent = theme === 'light' ? '🌙' : '☀️';
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
        if (document.getElementById('convergencePlot').data) Plotly.relayout('convergencePlot', update);
    } catch (e) { console.log("Plotly not ready"); }
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (langToggleBtn) langToggleBtn.addEventListener('click', toggleLanguage);

function updatePlotControls() {
    const agSurfaceOpacity = getNumberValue('ag_surface_opacity', 0.45);
    const psoSurfaceOpacity = getNumberValue('pso_surface_opacity', 0.45);
    const agPointSize = getNumberValue('ag_point_size', 5);
    const psoPointSize = getNumberValue('pso_point_size', 5);

    try {
        Plotly.restyle('agPlot', { opacity: agSurfaceOpacity }, [0]);
        Plotly.restyle('agPlot', { 'marker.size': agPointSize }, [1]);
        Plotly.restyle('psoPlot', { opacity: psoSurfaceOpacity }, [0]);
        Plotly.restyle('psoPlot', { 'marker.size': psoPointSize }, [1]);
    } catch (e) {
        console.log('Plotly not ready');
    }
}

function initPlotControls() {
    const controlIds = [
        'ag_surface_opacity',
        'ag_point_size',
        'pso_surface_opacity',
        'pso_point_size'
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
            name: [seriesNames.ag, seriesNames.pso]
        }, [0, 1]);
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
            const convergencePlot = document.getElementById('convergencePlot');

            if (agPlot) Plotly.Plots.resize(agPlot);
            if (psoPlot) Plotly.Plots.resize(psoPlot);
            if (convergencePlot) Plotly.Plots.resize(convergencePlot);
        } catch (e) {
            console.log('Plotly not ready');
        }
    }, 120);
}

// --- Init ---
window.onload = () => {
    initPlots();  // Must run FIRST before any function that uses Plotly
    initLanguage();
    initExpressionControls();
    initTheme();
    initOptimizationControls();
    connectWebSocket();
    initPlotControls();
    window.addEventListener('resize', resizePlots);
};
