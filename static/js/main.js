
// DOM Elements
const agScoreEl = document.getElementById('ag-score');
const psoScoreEl = document.getElementById('pso-score');
const iterationEl = document.getElementById('iteration-display');
const startBtn = document.getElementById('startBtn');

let ws;
let isRunning = false;

// --- Helper: Rastrigin Function for 3D Surface ---
function rastrigin(x, y) {
    const A = 10;
    return 20 + (x ** 2 - A * Math.cos(2 * Math.PI * x)) + (y ** 2 - A * Math.cos(2 * Math.PI * y));
}

// Generate Static Mesh for Plotly
const size = 100;
const x_range = Array.from({ length: size }, (_, i) => -5.12 + (10.24 / size) * i);
const y_range = Array.from({ length: size }, (_, i) => -5.12 + (10.24 / size) * i);
const z_data = y_range.map(y => x_range.map(x => rastrigin(x, y)));

const surfaceTrace = {
    z: z_data,
    x: x_range,
    y: y_range,
    type: 'surface',
    colorscale: 'Viridis',
    opacity: 0.8,
    showscale: false
};

// --- Internationalization (i18n) ---
const translations = {
    en: {
        title: "Optimization Showdown",
        start: "Start",
        pause: "Pause",
        reset: "Reset",
        iteration: "Iteration",
        settings: "Model Parameters & Settings",
        global: "Global",
        pop_size: "Population",
        delay: "Delay (ms)",
        ag_title: "Genetic Algorithm",
        ag_mut: "Mutation Rate",
        ag_cross: "Crossover Rate",
        pso_title: "Particle Swarm",
        pso_w: "Inertia (w)",
        pso_c1: "Cognitive (c1)",
        pso_c2: "Social (c2)",
        best_score: "Best Score",
        convergence: "Convergence Comparison"
    },
    pt: {
        title: "Batalha de Otimização",
        start: "Iniciar",
        pause: "Pausar",
        reset: "Resetar",
        iteration: "Iteração",
        settings: "Parâmetros do Modelo",
        global: "Global",
        pop_size: "População",
        delay: "Atraso (ms)",
        ag_title: "Algoritmo Genético",
        ag_mut: "Taxa de Mutação",
        ag_cross: "Taxa de Crossover",
        pso_title: "Enxame de Partículas",
        pso_w: "Inércia (w)",
        pso_c1: "Cognitivo (c1)",
        pso_c2: "Social (c2)",
        best_score: "Melhor Score",
        convergence: "Comparação de Convergência"
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
    if (langBtn) langBtn.textContent = currentLang === 'en' ? '🇧🇷 PT' : '🇺🇸 EN';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
    updateStartBtnText();
}

function updateStartBtnText() {
    const key = isRunning ? 'pause' : 'start';
    startBtn.textContent = translations[currentLang][key];
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
    margin: { l: 40, r: 20, b: 40, t: 20 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { title: 'Iteration' },
    yaxis: { title: 'Fitness' }
};

function initPlots() {
    // AG 3D Plot
    Plotly.newPlot('agPlot', [surfaceTrace, {
        x: [], y: [], z: [],
        mode: 'markers',
        type: 'scatter3d',
        marker: { size: 4, color: '#3b82f6' },
        name: 'AG Population'
    }], layout3D, { responsive: true, displayModeBar: false });

    // PSO 3D Plot
    Plotly.newPlot('psoPlot', [surfaceTrace, {
        x: [], y: [], z: [],
        mode: 'markers',
        type: 'scatter3d',
        marker: { size: 4, color: '#10b981' },
        name: 'PSO Particles'
    }], layout3D, { responsive: true, displayModeBar: false });

    // Convergence Plot
    Plotly.newPlot('convergencePlot', [
        { x: [], y: [], mode: 'lines', name: 'Genetic Algorithm', line: { color: '#3b82f6' } },
        { x: [], y: [], mode: 'lines', name: 'Particle Swarm', line: { color: '#10b981' } }
    ], layoutConvergence, { responsive: true, displayModeBar: false });
}

// --- WebSocket & Simulation ---
function connectWebSocket() {
    ws = new WebSocket(`ws://${location.host}/ws/simulation`);
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
    const layoutUpdate = {
        scene: {
            camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } } // Initial only, urevision handles rest
        },
        datarevision: data.ag.iteration, // Trigger update
        urevision: true // Preserve user interaction state (camera, zoom)
    };

    if (data.ag) {
        agScoreEl.textContent = Number.isFinite(data.ag.best_score) ? data.ag.best_score.toFixed(4) : "Inf";
        iterationEl.textContent = `${translations[currentLang].iteration}: ${data.ag.iteration}`;

        const agX = data.ag.population.map(p => p[0]);
        const agY = data.ag.population.map(p => p[1]);
        const agZ = data.ag.population.map(p => rastrigin(p[0], p[1]) + 1);

        // Use Plotly.react for high-performance updates
        // We reuse the surface trace (index 0) and update scatter trace (index 1)
        const agData = [surfaceTrace, {
            x: agX, y: agY, z: agZ,
            mode: 'markers',
            type: 'scatter3d',
            marker: { size: 4, color: '#3b82f6' },
            name: 'AG Population'
        }];

        Plotly.react('agPlot', agData, document.getElementById('agPlot').layout);
    }

    if (data.pso) {
        psoScoreEl.textContent = Number.isFinite(data.pso.best_score) ? data.pso.best_score.toFixed(4) : "Inf";

        const psoX = data.pso.population.map(p => p[0]);
        const psoY = data.pso.population.map(p => p[1]);
        const psoZ = data.pso.population.map(p => rastrigin(p[0], p[1]) + 1);

        const psoData = [surfaceTrace, {
            x: psoX, y: psoY, z: psoZ,
            mode: 'markers',
            type: 'scatter3d',
            marker: { size: 4, color: '#10b981' },
            name: 'PSO Particles'
        }];

        Plotly.react('psoPlot', psoData, document.getElementById('psoPlot').layout);
    }

    // Update Convergence Chart
    if (data.ag && data.ag.iteration % 1 === 0) {
        Plotly.extendTraces('convergencePlot', {
            x: [[data.ag.iteration], [data.ag.iteration]],
            y: [[data.ag.best_score], [data.pso.best_score]]
        }, [0, 1]);
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
    isRunning = false;
    updateStartBtnText();

    // Reset Plots
    Plotly.deleteTraces('convergencePlot', [0, 1]);
    Plotly.addTraces('convergencePlot', [
        { x: [], y: [], mode: 'lines', name: 'Genetic Algorithm', line: { color: '#3b82f6' } },
        { x: [], y: [], mode: 'lines', name: 'Particle Swarm', line: { color: '#10b981' } }
    ]);

    const params = {
        action: "reset",
        pop_size: parseInt(document.getElementById('pop_size').value),
        ag_mutation: parseFloat(document.getElementById('ag_mutation').value),
        ag_crossover: parseFloat(document.getElementById('ag_crossover').value),
        pso_w: parseFloat(document.getElementById('pso_w').value),
        pso_c1: parseFloat(document.getElementById('pso_c1').value),
        pso_c2: parseFloat(document.getElementById('pso_c2').value)
    };
    ws.send(JSON.stringify(params));
}

// --- Theme Management ---
const themeToggleBtn = document.getElementById('themeToggle');
const langToggleBtn = document.getElementById('langToggle');

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updatePlotColors(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    updatePlotColors(newTheme);
}

function updateThemeIcon(theme) {
    if (themeToggleBtn) themeToggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
}

function updatePlotColors(theme) {
    const textColor = theme === 'dark' ? '#f8fafc' : '#1f2937';
    const gridColor = theme === 'dark' ? '#334155' : '#e5e7eb';

    const update = {
        'xaxis.color': textColor,
        'yaxis.color': textColor,
        'scene.xaxis.color': textColor,
        'scene.yaxis.color': textColor,
        'scene.zaxis.color': textColor,
        'font.color': textColor,
        'xaxis.gridcolor': gridColor,
        'yaxis.gridcolor': gridColor
    };

    try {
        if (document.getElementById('agPlot').data) Plotly.relayout('agPlot', update);
        if (document.getElementById('psoPlot').data) Plotly.relayout('psoPlot', update);
        if (document.getElementById('convergencePlot').data) Plotly.relayout('convergencePlot', update);
    } catch (e) { console.log("Plotly not ready"); }
}

if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
if (langToggleBtn) langToggleBtn.addEventListener('click', toggleLanguage);

// --- Init ---
window.onload = () => {
    initLanguage();
    initPlots();
    initTheme();
    connectWebSocket();
};
