/**
 * =============================================================================
 *  PDF Report Generator — Modular Template System
 * =============================================================================
 *
 *  COMO EDITAR O RELATÓRIO:
 *
 *  1. LAYOUT & MARGENS  → edite REPORT_CONFIG
 *  2. METADADOS          → edite REPORT_CONFIG.metadata
 *  3. ADICIONAR SEÇÃO    → crie uma função render(ctx) e adicione em REPORT_SECTIONS
 *  4. REMOVER SEÇÃO      → comente ou remova a entrada em REPORT_SECTIONS
 *  5. REORDENAR SEÇÕES   → mova as entradas em REPORT_SECTIONS
 *  6. TEXTO / BULLETS    → edite diretamente na função render da seção
 *  7. REFERÊNCIAS        → edite REPORT_REFERENCES
 *  8. AI MODELS/PROMPTS  → edite REPORT_AI_MODELS e REPORT_AI_PROMPTS
 *
 * =============================================================================
 */

// ─── Configuração Global ────────────────────────────────────────────────────

const REPORT_CONFIG = {
    margins: { top: 30, bottom: 20, left: 30, right: 20 },
    colGap: 8,
    font: 'times',
    metadata: {
        author: 'João da Cruz de Natividade e Silva Neto',
        institution: 'UFPA – Universidade Federal do Pará',
        department: 'Tópicos Especiais em Engenharia de Computação III',
        email: 'joao.silva.neto@itec.ufpa.br',
        creator: 'Evolutionary Optimization Viz'
    },
    projectUrl: 'https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/',
    templateUrl: 'https://github.com/uefs/sbc-template-latex'
};

// ─── Nomes dos Algoritmos (para reuso) ──────────────────────────────────────

const ALG_NAMES = {
    ag: { fullPT: 'Algoritmo Genético (AG)', fullEN: 'Genetic Algorithm (GA)', shortPT: 'AG', shortEN: 'GA' },
    pso: { fullPT: 'Otimização por Enxame de Partículas (PSO)', fullEN: 'Particle Swarm Optimization (PSO)', shortPT: 'PSO', shortEN: 'PSO' },
    ed: { fullPT: 'Evolução Diferencial (ED)', fullEN: 'Differential Evolution (DE)', shortPT: 'ED', shortEN: 'DE' }
};

// ─── Modelos e Prompts de IA ────────────────────────────────────────────────

const REPORT_AI_MODELS = [
    'gemini 3 pro',
    'claude opus 4.5',
    'gpt-5.2-codex'
];

const REPORT_AI_PROMPTS = [
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
    'syntax error in part "*(x1^2+x2^2))^2)" (char 44',
    'Implementar Evolução Diferencial (ED) como terceiro algoritmo de otimização',
    'Remover backend Python e tornar client-only para GitHub Pages',
    'Adicionar benchmark multi-run com animação em tempo real e exibição de vencedor',
    'Adicionar modo foco por algoritmo — clicar no badge expande o card',
    'Dashboard deve ocupar largura total da tela',
    'Benchmark deve respeitar configurações de convergência',
    'Deve poder selecionar 1 só algoritmo, 2 dois, ou 3 para comparar'
];

// ─── Histórico de Desenvolvimento do ED ─────────────────────────────────────
// Cronologia completa da implementação da Evolução Diferencial neste projeto,
// baseada no histórico de conversa com IA.

const ED_DEVELOPMENT_HISTORY = [
    {
        phase: 'Concepção e Implementação Inicial',
        description: 'A Evolução Diferencial (ED) foi adicionada como terceiro algoritmo metaheurístico ao dashboard, que originalmente continha apenas AG e PSO. A implementação seguiu a estratégia clássica DE/rand/1/bin proposta por Storn e Price (1997).'
    },
    {
        phase: 'Arquitetura de Classes',
        description: 'A classe DifferentialEvolution herda de OptimizationAlgorithm (classe base compartilhada com AG e PSO), garantindo interface consistente. Implementa dois parâmetros de controle: F (fator de escala, padrão 0.8) e CR (taxa de crossover, padrão 0.9).'
    },
    {
        phase: 'Operadores Implementados',
        description: 'Mutação: vetor doador gerado como x_a + F*(x_b - x_c), onde a, b, c são índices aleatórios distintos. Crossover binomial: cada dimensão do vetor trial é herdada do doador com probabilidade CR, com garantia de pelo menos uma dimensão do doador (jRand). Seleção greedy: o trial substitui o indivíduo corrente se for melhor ou igual.'
    },
    {
        phase: 'Testes Automatizados',
        description: 'Foram criados 10 testes unitários específicos para ED com Jest: inicialização correta, arrays de fitness, incremento de iteração, melhoria do bestScore em minimização, limites da população, registro de histórico, snapshot com campos específicos (fitness, objectiveFitness), restauração de estado, seleção de índices distintos, e convergência na função esfera.'
    },
    {
        phase: 'Integração ao Dashboard',
        description: 'O card do ED foi adicionado ao grid de 3 colunas com cor temática rosa (#be123c). Inclui controles interativos para F e CR, plot 3D independente, e integração completa com o gráfico de convergência, benchmark multi-run e sistema de navegação de iterações.'
    },
    {
        phase: 'Remoção do Backend Python',
        description: 'O projeto foi convertido de FastAPI + Python para client-only JavaScript, permitindo deploy estático no GitHub Pages. A lógica do ED (e dos demais algoritmos) foi toda portada para JS puro, mantendo a mesma API de classes.'
    },
    {
        phase: 'Benchmark Multi-Run',
        description: 'O sistema de benchmark com animação em tempo real foi implementado, permitindo N execuções consecutivas de todos os algoritmos habilitados. O ED participa das rodadas com seu próprio registro de estatísticas (média, desvio padrão, melhor, pior, mediana, vitórias).'
    },
    {
        phase: 'Seleção Dinâmica de Algoritmos',
        description: 'Toggle on/off foi adicionado a cada card de algoritmo. O ED pode ser habilitado/desabilitado independentemente, com o grid se ajustando dinamicamente (1, 2 ou 3 colunas). Toda a simulação, benchmark e relatório PDF respeitam a seleção.'
    },
    {
        phase: 'Refatoração do Relatório PDF',
        description: 'O sistema de geração de relatório foi modularizado em seções independentes (report.js), facilitando manutenção. O ED aparece dinamicamente em todas as seções conforme habilitado: configuração, resultados, convergência, discussão e conclusões.'
    }
];

// ─── Referências Bibliográficas ─────────────────────────────────────────────

const REPORT_REFERENCES = [
    'Holland, J. H. (1992). Adaptation in Natural and Artificial Systems. MIT Press.',
    'Kennedy, J. and Eberhart, R. (1995). Particle Swarm Optimization. In IEEE Intl. Conf. on Neural Networks.',
    'Goldberg, D. E. (1989). Genetic Algorithms in Search, Optimization, and Machine Learning. Addison-Wesley.',
    'Storn, R. and Price, K. (1997). Differential Evolution – A Simple and Efficient Heuristic for Global Optimization over Continuous Spaces. Journal of Global Optimization, 11(4), 341-359.',
    'Eberhart, R. C. and Shi, Y. (2001). Particle swarm optimization: developments, applications and resources. In Congress on Evolutionary Computation.'
];

// =============================================================================
//  Layout Engine — classe PdfLayout
// =============================================================================

// PdfLayout class removed (replaced by SwiftLaTeX)

// =============================================================================
//  Data Collector — coleta dados do DOM e das instâncias
// =============================================================================

function collectReportData() {
    const enabled = getEnabledAlgorithms();
    const enabledKeys = getEnabledKeys();

    // Collect benchmark data if available
    let benchmark = null;
    if (typeof benchmarkResults !== 'undefined' && benchmarkResults) {
        const bKeys = enabledKeys.filter(k => benchmarkResults[k] && benchmarkResults[k].length > 0);
        if (bKeys.length > 0) {
            const stats = {};
            bKeys.forEach(k => { stats[k] = computeStats(benchmarkResults[k]); });

            const wins = (typeof benchmarkWins !== 'undefined' && benchmarkWins) ? benchmarkWins : { ag: 0, pso: 0, ed: 0, tie: 0 };
            const totalRuns = (typeof benchmarkRunIndex !== 'undefined') ? benchmarkRunIndex : 0;
            const itersPerRun = (typeof benchmarkItersPerRun !== 'undefined') ? benchmarkItersPerRun : 0;

            // Determine benchmark winner
            const mode = getOptimizationMode();
            const sorted = bKeys.map(k => ({ key: k, wins: wins[k] || 0, mean: stats[k].mean }))
                .sort((a, b) => {
                    if (b.wins !== a.wins) return b.wins - a.wins;
                    return mode === 'max' ? b.mean - a.mean : a.mean - b.mean;
                });

            // CEC-specific data
            let errorStats = null, successRate = null, checkpoints = null, wilcoxon = null;
            let maxFEs = 0, globalMin = 0;

            if (typeof benchmarkErrorResults !== 'undefined' && benchmarkErrorResults) {
                errorStats = {};
                bKeys.forEach(k => {
                    if (benchmarkErrorResults[k] && benchmarkErrorResults[k].length > 0) {
                        errorStats[k] = computeStats(benchmarkErrorResults[k]);
                    }
                });
            }
            if (typeof benchmarkSuccessCount !== 'undefined' && benchmarkSuccessCount) {
                successRate = {};
                bKeys.forEach(k => { successRate[k] = benchmarkSuccessCount[k] || 0; });
            }
            if (typeof benchmarkCheckpoints !== 'undefined' && benchmarkCheckpoints) {
                checkpoints = benchmarkCheckpoints;
            }
            if (typeof benchmarkWilcoxon !== 'undefined' && benchmarkWilcoxon) {
                wilcoxon = benchmarkWilcoxon;
            }
            if (typeof benchmarkMaxFEs !== 'undefined') maxFEs = benchmarkMaxFEs;
            if (typeof benchmarkGlobalMin !== 'undefined') globalMin = benchmarkGlobalMin;

            benchmark = {
                stats, wins, totalRuns, itersPerRun, enabledKeys: bKeys,
                winner: sorted[0],
                isTie: sorted.length >= 2 && sorted[0].wins === sorted[1].wins,
                // CEC data
                errorStats, successRate, checkpoints, wilcoxon, maxFEs, globalMin,
                successThreshold: (typeof CEC_SUCCESS_THRESHOLD !== 'undefined') ? CEC_SUCCESS_THRESHOLD : 1e-8,
                checkpointPcts: (typeof CEC_CHECKPOINT_PCTS !== 'undefined') ? CEC_CHECKPOINT_PCTS : []
            };
        }
    }

    return {
        enabled,
        enabledKeys,
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
        scores: {
            ag: { best_score: historyCache.ag.length > 0 ? historyCache.ag[historyCache.ag.length - 1] : null, iteration: currentIteration },
            pso: { best_score: historyCache.pso.length > 0 ? historyCache.pso[historyCache.pso.length - 1] : null, iteration: currentIteration },
            ed: { best_score: historyCache.ed.length > 0 ? historyCache.ed[historyCache.ed.length - 1] : null, iteration: currentIteration }
        },
        history: {
            ag: historyCache.ag,
            pso: historyCache.pso,
            ed: historyCache.ed
        },
        benchmark
    };
}

// =============================================================================
//  Helper — captura de imagens (Plotly)
// =============================================================================

async function captureReportImages(enabledKeys, functionExpr) {
    const imgs = {};
    const plotIds = { ag: 'agPlot', pso: 'psoPlot', ed: 'edPlot' };

    for (const k of enabledKeys) {
        const el = document.getElementById(plotIds[k]);
        if (el) imgs[k] = await Plotly.toImage(el, { format: 'png', width: 500, height: 400 });
    }

    const convEl = document.getElementById('convergencePlot');
    if (convEl) imgs.convergence = await Plotly.toImage(convEl, { format: 'png', width: 600, height: 350 });

    // Render function expression as math image (LaTeX via KaTeX + SVG -> PNG)
    if (functionExpr) {
        try {
            imgs.function = await renderLatexFunctionImage(functionExpr);
        } catch (e) {
            console.warn('Failed to render function LaTeX image:', e);
        }
    }

    return imgs;
}

// ─── Math Rendering Helpers (KaTeX) ───────────────────────────────────────

async function ensureKaTeXLoaded() {
    if (window.katex) return;
    // If already loading, wait for script to be present
    if (document.getElementById('katex-js')) {
        return new Promise((resolve, reject) => {
            const check = setInterval(() => { if (window.katex) { clearInterval(check); resolve(); } }, 50);
            setTimeout(() => { clearInterval(check); if (!window.katex) reject(new Error('KaTeX load timeout')); }, 5000);
        });
    }

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.id = 'katex-js';
        script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load KaTeX'));
        document.head.appendChild(script);
    });
}

function expressionToLatex(expr) {
    if (!expr) return '';
    let s = String(expr);
    // Convert x1, x2 -> x_{1}
    s = s.replace(/\b(x)(\d+)/g, (_m, _x, num) => `x_{${num}}`);
    // Replace * with \cdot for better appearance
    s = s.replace(/\*/g, ' \\cdot ');
    // Wrap in function form
    return `f(\\mathbf{x}) = ${s}`;
}

async function renderLatexToPng(latex, { fontSize = 18, scale = 2 } = {}) {
    await ensureKaTeXLoaded();
    const html = katex.renderToString(latex, { throwOnError: false, displayMode: true });

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.padding = '4px';
    container.innerHTML = html;
    document.body.appendChild(container);

    const rect = container.getBoundingClientRect();
    const width = Math.max(100, Math.ceil(rect.width));
    const height = Math.max(24, Math.ceil(rect.height));

    const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\"><foreignObject width=\"100%\" height=\"100%\"><div xmlns=\"http://www.w3.org/1999/xhtml\" style=\"font-family: 'Times New Roman'; font-size: ${fontSize}px; color: #000;\">${html}</div></foreignObject></svg>`;

    document.body.removeChild(container);

    const img = new Image();
    const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svg64;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
}

async function renderLatexFunctionImage(expr) {
    try {
        const latex = expressionToLatex(expr);
        return await renderLatexToPng(latex, { fontSize: 16, scale: 3 });
    } catch (e) {
        console.warn('renderLatexFunctionImage error', e);
        return null;
    }
}

// =============================================================================
//  Helpers — texto dinâmico
// =============================================================================

function enabledFullPT(keys) { return keys.map(k => ALG_NAMES[k].fullPT).join(', '); }
function enabledFullEN(keys) { return keys.map(k => ALG_NAMES[k].fullEN).join(', '); }
function enabledShortPT(keys) { return keys.map(k => ALG_NAMES[k].shortPT).join(', '); }
function enabledShortTitle(keys) { return keys.map(k => ALG_NAMES[k].shortPT).join(' vs '); }

function determineWinner(data) {
    const keys = data.enabledKeys;
    const mode = data.params.optimization_mode;
    const scores = keys.map(k => ({
        key: k,
        namePT: ALG_NAMES[k].shortPT,
        nameEN: ALG_NAMES[k].shortEN,
        score: data.scores[k]?.best_score || 0
    }));

    if (scores.length < 2) {
        const s = scores[0];
        return {
            pt: `o ${s.namePT} foi avaliado individualmente`,
            en: `${s.nameEN} was evaluated individually`
        };
    }

    if (mode === 'max') {
        scores.sort((a, b) => b.score - a.score);
    } else if (mode === 'min') {
        scores.sort((a, b) => a.score - b.score);
    } else {
        scores.forEach(s => s.diff = Math.abs(s.score - data.params.target_value));
        scores.sort((a, b) => a.diff - b.diff);
    }

    if (scores[0].score !== scores[1].score) {
        return {
            pt: `o ${scores[0].namePT} obteve melhor desempenho`,
            en: `${scores[0].nameEN} outperformed the others`
        };
    }
    return {
        pt: 'todos os algoritmos obtiveram desempenho similar',
        en: 'all algorithms performed similarly'
    };
}

// =============================================================================
//  Seções do Relatório
// =============================================================================
//  Cada seção é { id, title, render(ctx) }
//  ctx = { layout, data, images }
//
//  Para adicionar uma seção:   adicione um objeto ao array REPORT_SECTIONS
//  Para remover uma seção:     comente ou delete a entrada
//  Para reordenar:             mova a entrada no array
// =============================================================================

// Report sections removed (replaced by LaTeX template)

// =============================================================================
//  Função Principal — Gera o PDF
// =============================================================================

// =============================================================================
//  Função Principal — Gera o PDF via SwiftLaTeX
// =============================================================================

async function generatePdfReport() {
    const reportBtn = document.getElementById('reportBtn');
    if (reportBtn) {
        reportBtn.disabled = true;
        reportBtn.textContent = '⏳';
    }

    try {
        const updateStatus = (msg) => {
            if (reportBtn) reportBtn.textContent = '⏳ ' + msg;
        };

        // 1. Load modules dynamically
        updateStatus('Carregando módulos...');
        const [LatexEngine, ReportTemplate] = await Promise.all([
            import('./latex-engine.js'),
            import('./report-template.js')
        ]);

        // 2. Collect data
        updateStatus('Coletando dados...');
        const data = collectReportData();

        // 3. Capture images
        updateStatus('Capturando gráficos...');
        const images = await captureReportImages(data.enabledKeys, data.params.function_expr);

        // 4. Generate LaTeX source
        console.log('Generating LaTeX source...');
        const latexSource = ReportTemplate.generateLatexSource(data, images);
        console.log('LaTeX Source length:', latexSource.length);

        // 5. Compile to PDF
        updateStatus('Compilando LaTeX...');
        const pdfBlob = await LatexEngine.compileLatexToPdf(latexSource, images, updateStatus);

        // 6. trigger download
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_sbc_${data.enabledKeys.join('_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000); // cleanup

    } catch (err) {
        console.error('PDF generation failed:', err);
        const errEl = document.querySelector('.function-error');
        if (errEl) {
            errEl.textContent = 'Erro ao gerar PDF: ' + err.message;
        } else {
            alert('Erro ao gerar PDF: ' + err.message);
        }
    } finally {
        if (reportBtn) {
            reportBtn.disabled = false;
            // Restore button text
            if (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang]) {
                reportBtn.innerHTML = '📄 <span data-i18n="generate_report">' +
                    (translations[currentLang]?.generate_report || 'Relatório') + '</span>';
            } else {
                reportBtn.textContent = 'Relatório';
            }
        }
    }
}
