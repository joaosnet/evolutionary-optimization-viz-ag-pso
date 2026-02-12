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
    maxDetailedBenchmarkRuns: 6,
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

const ALG_COLORS = {
    ag: '#0f766e',
    pso: '#d97706',
    ed: '#be123c'
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

class PdfLayout {
    constructor(doc, config = REPORT_CONFIG, options = {}) {
        this.doc = doc;
        this.cfg = config;
        this.totalCols = options.columns === 1 ? 1 : 2;

        const m = config.margins;
        this.pageWidth = doc.internal.pageSize.width;   // 210mm
        this.pageHeight = doc.internal.pageSize.height;   // 297mm
        this.contentWidth = this.pageWidth - m.left - m.right;
        this.colWidth = this.totalCols === 1
            ? this.contentWidth
            : (this.contentWidth - config.colGap) / 2;
        this.col1X = m.left;
        this.col2X = m.left + this.colWidth + config.colGap;

        // State
        this.currentCol = 1;
        this.cursorY = m.top;
        this.columnStartY = m.top;
        this.isFirstPage = true;

        doc.setFont(config.font, 'normal');
    }

    // ── Navigation ──

    /** Garante que há espaço suficiente; se não, pula coluna/página */
    checkSpace(height) {
        if (this.cursorY + height > this.pageHeight - this.cfg.margins.bottom) {
            if (this.totalCols === 2 && this.currentCol === 1) {
                this.currentCol = 2;
                this.cursorY = this.isFirstPage ? this.columnStartY : this.cfg.margins.top;
            } else {
                this.doc.addPage();
                this.currentCol = 1;
                this.isFirstPage = false;
                this.columnStartY = this.cfg.margins.top;
                this.cursorY = this.cfg.margins.top;
            }
        }
    }

    /** Retorna posição X da coluna atual */
    getX() {
        if (this.totalCols === 1) return this.col1X;
        return this.currentCol === 1 ? this.col1X : this.col2X;
    }

    /** Pula para a próxima coluna ou página */
    nextColumn() {
        if (this.totalCols === 2 && this.currentCol === 1) {
            this.currentCol = 2;
            this.cursorY = this.isFirstPage ? this.columnStartY : this.cfg.margins.top;
        } else {
            this.doc.addPage();
            this.currentCol = 1;
            this.isFirstPage = false;
            this.columnStartY = this.cfg.margins.top;
            this.cursorY = this.cfg.margins.top;
        }
    }

    /** Marca onde as colunas começam (chamado após header/abstract) */
    lockColumnStart() {
        this.columnStartY = this.cursorY;
    }

    // ── Texto — Full Width (para título/abstract) ──

    addFullWidthText(text, { fontSize = 12, fontStyle = 'normal', align = 'left' } = {}) {
        const doc = this.doc;
        doc.setFont(this.cfg.font, fontStyle);
        doc.setFontSize(fontSize);

        const lines = doc.splitTextToSize(text, this.contentWidth);
        const height = lines.length * (fontSize * 0.4);

        if (this.cursorY + height > this.pageHeight - this.cfg.margins.bottom) {
            doc.addPage();
            this.cursorY = this.cfg.margins.top;
        }

        const x = this.cfg.margins.left + (align === 'center' ? this.contentWidth / 2 : 0);
        doc.text(lines, x, this.cursorY, { align });
        this.cursorY += height + 4;
        doc.setFont(this.cfg.font, 'normal');
    }

    // ── Texto — Coluna ──

    addText(text, { fontSize = 10, fontStyle = 'normal', indent = 0 } = {}) {
        const doc = this.doc;
        doc.setFont(this.cfg.font, fontStyle);
        doc.setFontSize(fontSize);

        const availWidth = this.colWidth - indent;
        const lines = doc.splitTextToSize(text, availWidth);
        const lineHeight = fontSize * 0.4;

        lines.forEach(line => {
            this.checkSpace(lineHeight);
            doc.text(line, this.getX() + indent, this.cursorY);
            this.cursorY += lineHeight;
        });
        this.cursorY += 2;
    }

    addBullet(text) {
        this.addText('• ' + text, { indent: 4 });
    }

    // ── Headings ──

    addSectionHeading(title) {
        this.cursorY += 4;
        this.checkSpace(8);
        this.doc.setFont(this.cfg.font, 'bold');
        this.doc.setFontSize(12);
        this.doc.text(title, this.getX(), this.cursorY);
        this.doc.setFont(this.cfg.font, 'normal');
        this.cursorY += 6;
    }

    addSubsectionHeading(title) {
        this.cursorY += 2;
        this.checkSpace(6);
        this.doc.setFont(this.cfg.font, 'bold');
        this.doc.setFontSize(11);
        this.doc.text(title, this.getX(), this.cursorY);
        this.doc.setFont(this.cfg.font, 'normal');
        this.cursorY += 5;
    }

    // ── Imagem ──

    addImage(imgData, caption, height = 50) {
        this.checkSpace(height + 10);
        this.doc.addImage(imgData, 'PNG', this.getX(), this.cursorY, this.colWidth, height);
        this.cursorY += height + 2;

        this.doc.setFontSize(8);
        this.doc.setFont(this.cfg.font, 'italic');
        const captionLines = this.doc.splitTextToSize('Fig: ' + caption, this.colWidth);
        this.doc.text(captionLines, this.getX() + (this.colWidth / 2), this.cursorY, { align: 'center' });
        this.cursorY += (captionLines.length * 3) + 4;
        this.doc.setFont(this.cfg.font, 'normal');
    }

    // ── Tabela (jspdf-autotable) ──

    addTable(head, body, { fontSize = 9, cellPadding = 2 } = {}) {
        const estimatedH = (body.length + 1) * 6 + 10;
        this.checkSpace(Math.min(estimatedH, 40));

        this.doc.autoTable({
            startY: this.cursorY,
            head: [head],
            body,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize, lineWidth: 0.3 },
            styles: { fontSize, font: this.cfg.font, cellPadding, lineColor: [0, 0, 0], lineWidth: 0.2 },
            margin: { left: this.getX() },
            tableWidth: this.colWidth
        });
        this.cursorY = this.doc.lastAutoTable.finalY + 5;
    }

    // ── Link ──

    addLink(url, { fontSize = 9 } = {}) {
        this.doc.setTextColor(0, 0, 255);
        this.addText(url, { fontSize });
        this.doc.setTextColor(0, 0, 0);
    }

    // ── Espaçamento Extra ──

    addSpace(mm = 4) {
        this.cursorY += mm;
    }
}

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
            const runHistories = (typeof benchmarkRunHistories !== 'undefined' && benchmarkRunHistories) ? benchmarkRunHistories : null;
            const runMetrics = (typeof benchmarkRunMetrics !== 'undefined' && benchmarkRunMetrics) ? benchmarkRunMetrics : null;
            if (typeof benchmarkMaxFEs !== 'undefined') maxFEs = benchmarkMaxFEs;
            if (typeof benchmarkGlobalMin !== 'undefined') globalMin = benchmarkGlobalMin;

            benchmark = {
                stats, wins, totalRuns, itersPerRun, enabledKeys: bKeys,
                winner: sorted[0],
                isTie: sorted.length >= 2 && sorted[0].wins === sorted[1].wins,
                // CEC data
                errorStats, successRate, checkpoints, wilcoxon, maxFEs, globalMin,
                runHistories, runMetrics,
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

async function captureReportImages(data) {
    const imgs = {};
    const enabledKeys = data.enabledKeys;
    const functionExpr = data.params.function_expr;
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

    if (data.benchmark && data.benchmark.runHistories) {
        try {
            const detailedRuns = await captureBenchmarkRunCharts(
                data.benchmark,
                enabledKeys,
                REPORT_CONFIG.maxDetailedBenchmarkRuns || 6
            );
            imgs.benchmarkRuns = detailedRuns.runs;
            imgs.benchmarkRunsMeta = {
                shown: detailedRuns.runs.length,
                total: detailedRuns.totalRuns
            };
        } catch (e) {
            console.warn('Failed to render benchmark run charts:', e);
        }
    }

    return imgs;
}

function pickRunIndices(totalRuns, maxRuns) {
    if (totalRuns <= 0) return [];
    if (maxRuns <= 0) return [];
    if (totalRuns <= maxRuns) return Array.from({ length: totalRuns }, (_, i) => i);

    const indices = new Set();
    for (let i = 0; i < maxRuns; i++) {
        const pos = Math.round((i * (totalRuns - 1)) / (maxRuns - 1));
        indices.add(pos);
    }
    return Array.from(indices).sort((a, b) => a - b);
}

async function captureBenchmarkRunCharts(benchmarkData, enabledKeys, maxRuns = 6) {
    if (!benchmarkData || !benchmarkData.runHistories) return [];

    const runCount = Math.max(
        ...enabledKeys.map(k => (benchmarkData.runHistories[k] && benchmarkData.runHistories[k].length) || 0),
        0
    );
    if (runCount === 0) return { runs: [], totalRuns: 0 };

    const runIndices = pickRunIndices(runCount, maxRuns);

    const plotEl = document.createElement('div');
    plotEl.style.position = 'fixed';
    plotEl.style.left = '-99999px';
    plotEl.style.top = '0';
    plotEl.style.width = '700px';
    plotEl.style.height = '320px';
    document.body.appendChild(plotEl);

    const charts = [];
    try {
        for (const runIdx of runIndices) {
            const traces = [];
            enabledKeys.forEach(k => {
                const y = benchmarkData.runHistories[k]?.[runIdx];
                if (Array.isArray(y) && y.length > 0) {
                    traces.push({
                        x: y.map((_, i) => i),
                        y,
                        mode: 'lines',
                        name: ALG_NAMES[k].shortPT,
                        line: { color: ALG_COLORS[k] }
                    });
                }
            });

            if (traces.length === 0) continue;

            await Plotly.react(plotEl, traces, {
                width: 700,
                height: 320,
                margin: { l: 50, r: 20, t: 28, b: 45 },
                title: { text: `Benchmark - Execução ${runIdx + 1}`, font: { size: 12 } },
                xaxis: { title: 'Iteração' },
                yaxis: { title: 'Fitness' },
                showlegend: enabledKeys.length > 1
            }, { displayModeBar: false, staticPlot: true });

            const image = await Plotly.toImage(plotEl, { format: 'png', width: 700, height: 320 });
            charts.push({
                run: runIdx + 1,
                image,
                metrics: benchmarkData.runMetrics?.[runIdx] || null
            });
        }
    } finally {
        try { Plotly.purge(plotEl); } catch (_e) { /* noop */ }
        document.body.removeChild(plotEl);
    }

    return { runs: charts, totalRuns: runCount };
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

const REPORT_SECTIONS = [

    // ── Cabeçalho (título, autor, instituição) ──────────────────────────────
    {
        id: 'header',
        title: 'Cabeçalho',
        render(ctx) {
            const { layout, data } = ctx;
            const doc = layout.doc;
            const meta = REPORT_CONFIG.metadata;
            const shortTitle = enabledShortTitle(data.enabledKeys);
            const isSingle = data.enabledKeys.length === 1;

            // Título 14pt bold centralizado
            doc.setFont(layout.cfg.font, 'bold');
            doc.setFontSize(14);
            const titleLine1 = isSingle
                ? `Avaliação do ${shortTitle}`
                : `Comparação entre ${shortTitle}`;
            doc.text(titleLine1, layout.pageWidth / 2, layout.cursorY, { align: 'center' });
            layout.cursorY += 6;
            doc.text('na Otimização de Funções Multimodais', layout.pageWidth / 2, layout.cursorY, { align: 'center' });
            layout.cursorY += 12;

            // Autor
            doc.setFont(layout.cfg.font, 'normal');
            doc.setFontSize(12);
            doc.text(meta.author, layout.pageWidth / 2, layout.cursorY, { align: 'center' });
            layout.cursorY += 5;

            // Instituição
            doc.setFont(layout.cfg.font, 'italic');
            doc.text(meta.institution, layout.pageWidth / 2, layout.cursorY, { align: 'center' });
            layout.cursorY += 8;

            // Departamento e email
            doc.setFont(layout.cfg.font, 'normal');
            doc.setFontSize(10);
            doc.text(meta.department, layout.pageWidth / 2, layout.cursorY, { align: 'center' });
            layout.cursorY += 4;
            doc.text(meta.email, layout.pageWidth / 2, layout.cursorY, { align: 'center' });
            layout.cursorY += 10;
        }
    },

    // ── Resumo (PT) ─────────────────────────────────────────────────────────
    {
        id: 'resumo',
        title: 'Resumo PT',
        render(ctx) {
            const { layout, data } = ctx;
            const doc = layout.doc;
            const m = layout.cfg.margins;
            const absIndent = 8;
            const absWidth = layout.contentWidth - (absIndent * 2);

            const keys = data.enabledKeys;
            const maxIter = Math.max(...keys.map(k => data.scores[k]?.iteration || 0), 0);
            const winner = determineWinner(data);

            const isSingle = keys.length === 1;
            const benchmarkNote = data.benchmark ? ` Adicionalmente, um benchmark estatístico com ${data.benchmark.totalRuns} execuções independentes foi realizado para validar a robustez dos resultados.` : '';
            const introText = isSingle
                ? `Este trabalho apresenta uma avaliação do ${enabledFullPT(keys)} aplicado à otimização de funções multimodais.`
                : `Este trabalho apresenta uma análise comparativa entre ${enabledFullPT(keys)} aplicados à otimização de funções multimodais.`;
            const absText = `${introText} A simulação foi executada com ${maxIter} iterações, utilizando uma população de ${data.params.pop_size} indivíduos/partículas.${benchmarkNote} Os resultados demonstram que ${winner.pt}. O projeto foi desenvolvido com assistência de Inteligência Artificial (IA).`;

            doc.setFont(layout.cfg.font, 'bold');
            doc.setFontSize(12);
            doc.text('Resumo.', m.left + absIndent, layout.cursorY);

            doc.setFont(layout.cfg.font, 'italic');
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(absText, absWidth);
            doc.text(lines, m.left + absIndent, layout.cursorY + 5);
            layout.cursorY += (lines.length * 4) + 12;

            // Palavras-chave
            doc.setFont(layout.cfg.font, 'normal');
            doc.setFontSize(10);
            doc.text(`Palavras-chave: ${enabledShortPT(keys)}, Otimização, Inteligência Artificial`, m.left + absIndent, layout.cursorY);
            layout.cursorY += 10;
        }
    },

    // ── Abstract (EN) ───────────────────────────────────────────────────────
    {
        id: 'abstract',
        title: 'Abstract EN',
        render(ctx) {
            const { layout, data } = ctx;
            const doc = layout.doc;
            const m = layout.cfg.margins;
            const absIndent = 8;
            const absWidth = layout.contentWidth - (absIndent * 2);

            const keys = data.enabledKeys;
            const maxIter = Math.max(...keys.map(k => data.scores[k]?.iteration || 0), 0);
            const winner = determineWinner(data);

            const isSingle = keys.length === 1;
            const benchmarkNoteEN = data.benchmark ? ` Additionally, a statistical benchmark with ${data.benchmark.totalRuns} independent runs was performed to validate result robustness.` : '';
            const introTextEN = isSingle
                ? `This paper presents an evaluation of ${enabledFullEN(keys)} applied to multimodal function optimization.`
                : `This paper presents a comparative analysis between ${enabledFullEN(keys)} applied to multimodal function optimization.`;
            const absText = `${introTextEN} The simulation ran for ${maxIter} iterations with a population of ${data.params.pop_size} individuals/particles.${benchmarkNoteEN} Results show that ${winner.en}. This project was developed with AI assistance.`;

            doc.setFont(layout.cfg.font, 'bold');
            doc.setFontSize(12);
            doc.text('Abstract.', m.left + absIndent, layout.cursorY);

            doc.setFont(layout.cfg.font, 'italic');
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(absText, absWidth);
            doc.text(lines, m.left + absIndent, layout.cursorY + 5);
            layout.cursorY += (lines.length * 4) + 12;

            // Keywords
            doc.setFont(layout.cfg.font, 'normal');
            doc.text('Keywords: Genetic Algorithm, PSO, Differential Evolution, Optimization, Artificial Intelligence', m.left + absIndent, layout.cursorY);
            layout.cursorY += 15;

            // Marca onde começam as colunas
            layout.lockColumnStart();
        }
    },

    // ── 1. Introdução ───────────────────────────────────────────────────────
    {
        id: 'introducao',
        title: '1. Introdução',
        render(ctx) {
            const { layout, data, images } = ctx;
            const keys = data.enabledKeys;

            layout.addSectionHeading('1. Introdução');
            const introSentence = keys.length === 1
                ? `A otimização de funções multimodais representa um desafio significativo. Este relatório avalia o desempenho do ${enabledShortPT(keys)}.`
                : `A otimização de funções multimodais representa um desafio significativo. Este relatório compara ${keys.length} algoritmos metaheurísticos: ${enabledShortPT(keys)}.`;
            layout.addText(introSentence);

            layout.addSubsectionHeading('1.1 Função Objetivo');
            // If we have a rendered math image, include it; otherwise fall back to plain text
            if (images && images.function) {
                layout.addImage(images.function, `Função Objetivo: ${data.params.function_expr}`, 18);
            } else {
                layout.addText(`Função: f(x) = ${data.params.function_expr}`);
            }
            layout.addText(`Domínio: [-5.12, 5.12] em ${data.params.dimensions} dimensões.`);

            layout.addSubsectionHeading('1.2 Modo de Otimização');
            const modeLabels = { min: 'Minimização', max: 'Maximização', target: `Valor Alvo (${data.params.target_value})` };
            layout.addText(`Modo selecionado: ${modeLabels[data.params.optimization_mode] || data.params.optimization_mode}`);
        }
    },

    // ── 2. Fundamentação Teórica ────────────────────────────────────────────
    {
        id: 'fundamentacao',
        title: '2. Fundamentação Teórica',
        render(ctx) {
            const { layout, data } = ctx;

            layout.addSectionHeading('2. Fundamentação Teórica');
            if (data.enabled.ag) {
                layout.addSubsectionHeading('2.1 Algoritmo Genético (AG)');
                layout.addText('O Algoritmo Genético (AG) é inspirado na evolução biológica. Utiliza seleção por torneio para escolher indivíduos mais aptos, crossover BLX-alpha para combinar material genético de dois pais, e mutação gaussiana para introduzir diversidade. A cada geração, a população evolui em direção a soluções melhores.');
            }
            if (data.enabled.pso) {
                const psoSub = data.enabled.ag ? '2.2' : '2.1';
                layout.addSubsectionHeading(`${psoSub} Otimização por Enxame de Partículas (PSO)`);
                layout.addText('O PSO simula o comportamento social de bandos de pássaros ou cardumes de peixes. Cada partícula ajusta sua velocidade com base em sua melhor posição pessoal (pbest) e na melhor posição global do enxame (gbest), utilizando a formulação canônica com peso de inércia w para balancear exploração e explotação.');
            }
            if (data.enabled.ed) {
                let edSub = '2.1';
                if (data.enabled.ag && data.enabled.pso) edSub = '2.3';
                else if (data.enabled.ag || data.enabled.pso) edSub = '2.2';
                layout.addSubsectionHeading(`${edSub} Evolução Diferencial (ED)`);
                layout.addText('A Evolução Diferencial (ED), proposta por Storn e Price (1997), é um algoritmo de otimização estocástica para espaços contínuos. A implementação utiliza a estratégia DE/rand/1/bin, que opera em três fases:');
                layout.addBullet('Mutacao: gera um vetor doador v = xa + F*(xb - xc), onde a, b, c sao indices aleatorios distintos e F e o fator de escala (differential weight).');
                layout.addBullet('Crossover binomial: cada dimensao do vetor trial e herdada do doador com probabilidade CR, com garantia de pelo menos uma dimensao via indice jRand aleatorio.');
                layout.addBullet('Selecao greedy: o trial substitui o individuo atual apenas se for melhor ou igual, garantindo convergencia monotonica.');
                layout.addText('A ED possui apenas dois hiperparametros alem do tamanho da populacao: F (fator de escala, tipicamente 0.4-1.0) e CR (taxa de crossover, tipicamente 0.1-1.0), o que simplifica significativamente o ajuste em comparacao com outros metodos.');
            }
        }
    },

    // ── 3. Configuração Experimental ────────────────────────────────────────
    {
        id: 'configuracao',
        title: '3. Configuração Experimental',
        render(ctx) {
            const { layout, data } = ctx;
            const keys = data.enabledKeys;

            layout.addSectionHeading('3. Configuracao Experimental');

            // Cabecalho dinamico
            const head = ['Parametro', ...keys.map(k => ALG_NAMES[k].shortPT)];
            const body = [['Populacao', ...keys.map(() => data.params.pop_size)]];

            if (data.enabled.ag) {
                const rowMut = ['Mutacao'];
                keys.forEach(k => rowMut.push(k === 'ag' ? data.params.ag_mutation : '--'));
                body.push(rowMut);

                const rowCx = ['Crossover'];
                keys.forEach(k => rowCx.push(k === 'ag' ? data.params.ag_crossover : k === 'ed' ? data.params.ed_cr : '--'));
                body.push(rowCx);
            } else if (data.enabled.ed) {
                const row = ['Crossover (CR)'];
                keys.forEach(k => row.push(k === 'ed' ? data.params.ed_cr : '--'));
                body.push(row);
            }

            if (data.enabled.pso) {
                ['Inercia (w)', 'Cognitivo (c1)', 'Social (c2)'].forEach((label, idx) => {
                    const vals = [data.params.pso_w, data.params.pso_c1, data.params.pso_c2];
                    const row = [label];
                    keys.forEach(k => row.push(k === 'pso' ? vals[idx] : '--'));
                    body.push(row);
                });
            }

            if (data.enabled.ed) {
                const row = ['Fator F'];
                keys.forEach(k => row.push(k === 'ed' ? data.params.ed_f : '--'));
                body.push(row);
            }

            // Remove rows where all data cells are '--' (empty columns)
            const filteredBody = body.filter(row => {
                const dataCells = row.slice(1);
                return !dataCells.every(cell => cell === '--');
            });

            layout.addTable(head, filteredBody);
        }
    },

    // ── 3D Plots ────────────────────────────────────────────────────────────
    {
        id: 'plots3d',
        title: 'Gráficos 3D',
        render(ctx) {
            const { layout, data, images } = ctx;
            const captions = { ag: 'População Final (AG)', pso: 'População Final (PSO)', ed: 'População Final (ED)' };

            data.enabledKeys.forEach(k => {
                if (images[k]) layout.addImage(images[k], captions[k], 50);
            });
        }
    },

    // ── 4. Resultados Experimentais ─────────────────────────────────────────
    {
        id: 'resultados',
        title: '4. Resultados',
        render(ctx) {
            const { layout, data, images } = ctx;
            const keys = data.enabledKeys;

            layout.addSectionHeading('4. Resultados Experimentais');

            // 4.1 Resumo
            layout.addSubsectionHeading('4.1 Resumo');
            layout.addTable(
                ['Métrica', ...keys.map(k => ALG_NAMES[k].shortPT)],
                [
                    ['Melhor Fitness', ...keys.map(k => data.scores[k]?.best_score?.toFixed(6) || 'N/A')],
                    ['Iterações', ...keys.map(k => data.scores[k]?.iteration ?? 'N/A')]
                ]
            );

            // 4.2 Convergência
            layout.addSubsectionHeading('4.2 Convergência');
            if (images.convergence) layout.addImage(images.convergence, 'Curva de Convergência (Fitness vs Iteração)', 45);

            // Tabela de convergência amostrada
            const total = Math.max(...keys.map(k => data.history[k].length), 0);
            const step = Math.max(1, Math.floor(total / 10));
            const convRows = [];

            for (let i = 0; i < total; i += step) {
                if (keys.every(k => data.history[k][i] !== undefined)) {
                    convRows.push([i, ...keys.map(k => data.history[k][i].toFixed(4))]);
                }
            }
            // Último ponto
            if (total > 0 && (total - 1) % step !== 0) {
                const i = total - 1;
                if (keys.every(k => data.history[k][i] !== undefined)) {
                    convRows.push([i, ...keys.map(k => data.history[k][i].toFixed(4))]);
                }
            }

            if (convRows.length > 0) {
                layout.addTable(
                    ['Iteração', ...keys.map(k => ALG_NAMES[k].shortPT)],
                    convRows,
                    { fontSize: 8, cellPadding: 1.5 }
                );
            }

            if (layout.cursorY > layout.pageHeight - layout.cfg.margins.bottom) {
                layout.nextColumn();
            }
        }
    },

    // ── Resultados do Benchmark (CEC) ────────────────────────────────────────
    {
        id: 'benchmark',
        title: 'Benchmark CEC',
        render(ctx) {
            const { layout, data, images } = ctx;
            const b = data.benchmark;
            if (!b) return;

            const keys = b.enabledKeys;
            const isSingle = keys.length === 1;
            const fmt = (v) => { if (v === 0) return '0.00e+00'; if (!Number.isFinite(v)) return 'Inf'; return v.toExponential(2); };

            layout.addSectionHeading('5. Benchmark Estatístico (Critérios IEEE CEC)');

            // 5.1 Protocolo CEC
            let subSec = 1;
            layout.addSubsectionHeading(`5.${subSec} Protocolo CEC`);
            const protocolIntro = isSingle
                ? `O benchmark seguiu os critérios do IEEE CEC (Congress on Evolutionary Computation). Foram executadas ${b.totalRuns} execuções independentes do ${ALG_NAMES[keys[0]].shortPT}.`
                : `O benchmark seguiu os critérios do IEEE CEC (Congress on Evolutionary Computation). Foram executadas ${b.totalRuns} execuções independentes de cada algoritmo.`;
            layout.addText(protocolIntro);
            layout.addBullet(`MaxFEs: ${b.maxFEs ? b.maxFEs.toLocaleString() : '20.000'} (10.000 x D)`);
            layout.addBullet(`Iteracoes por execucao: ${b.itersPerRun}`);
            layout.addBullet(`Otimo global (f*): ${b.globalMin || 0}`);
            layout.addBullet(`Erro: e = |f(x*) - f*|`);
            layout.addBullet(`Limiar de sucesso: e < ${b.successThreshold || 1e-8}`);
            layout.addText('Referencia: Awad, N. H., et al. "Problem Definitions and Evaluation Criteria for the CEC 2017 Special Session." NTU Tech Report, 2016.');

            // 5.2 Tabela de Erro CEC
            subSec++;
            if (b.errorStats && Object.keys(b.errorStats).length > 0) {
                layout.addSubsectionHeading(`5.${subSec} Tabela de Erro (Formato CEC)`);
                layout.addTable(
                    ['Métrica', ...keys.map(k => ALG_NAMES[k].shortPT)],
                    [
                        ['Mean', ...keys.map(k => b.errorStats[k] ? fmt(b.errorStats[k].mean) : 'N/A')],
                        ['Std', ...keys.map(k => b.errorStats[k] ? fmt(b.errorStats[k].std) : 'N/A')],
                        ['Best', ...keys.map(k => b.errorStats[k] ? fmt(b.errorStats[k].best) : 'N/A')],
                        ['Worst', ...keys.map(k => b.errorStats[k] ? fmt(b.errorStats[k].worst) : 'N/A')],
                        ['Median', ...keys.map(k => b.errorStats[k] ? fmt(b.errorStats[k].median) : 'N/A')]
                    ],
                    { fontSize: 8, cellPadding: 1.5 }
                );
            }

            // 5.3 Success Rate
            subSec++;
            if (b.successRate) {
                layout.addSubsectionHeading(`5.${subSec} Taxa de Sucesso`);
                layout.addTable(
                    ['Algoritmo', 'Sucessos', 'Taxa (%)'],
                    keys.map(k => [
                        ALG_NAMES[k].shortPT,
                        `${b.successRate[k] || 0}/${b.totalRuns}`,
                        `${((b.successRate[k] || 0) / b.totalRuns * 100).toFixed(1)}%`
                    ])
                );
                layout.addText(`Sucesso definido como erro e < ${b.successThreshold || 1e-8}.`);
            }

            // 5.4 Erro nos Checkpoints FEs
            subSec++;
            if (b.checkpoints && b.checkpointPcts && b.checkpointPcts.length > 0) {
                layout.addSubsectionHeading(`5.${subSec} Convergência por FEs`);
                const cpRows = b.checkpointPcts.map(pct => {
                    const feCount = Math.round(pct * (b.maxFEs || 20000));
                    const row = [`${(pct * 100).toFixed(0)}% (${feCount.toLocaleString()})`];
                    keys.forEach(k => {
                        let sum = 0, count = 0;
                        if (b.checkpoints[k]) {
                            b.checkpoints[k].forEach(runData => {
                                if (runData && runData[pct] !== undefined) { sum += runData[pct]; count++; }
                            });
                        }
                        row.push(count > 0 ? fmt(sum / count) : 'N/A');
                    });
                    return row;
                });
                layout.addTable(
                    ['FEs %', ...keys.map(k => ALG_NAMES[k].shortPT)],
                    cpRows,
                    { fontSize: 7, cellPadding: 1 }
                );
                layout.addText('Tabela mostra a média do erro nas execuções independentes em cada checkpoint de FEs.');
            }

            // 5.X Gráficos por execução (iteração a iteração)
            subSec++;
            if (images && images.benchmarkRuns && images.benchmarkRuns.length > 0) {
                layout.addSubsectionHeading(`5.${subSec} Convergência por Execução (Geração)`);
                const fmtFixed = (v) => Number.isFinite(v) ? v.toFixed(6) : 'N/A';

                const shownRuns = images.benchmarkRunsMeta?.shown || images.benchmarkRuns.length;
                const totalRuns = images.benchmarkRunsMeta?.total || shownRuns;
                if (totalRuns > shownRuns) {
                    layout.addText(`Para evitar relatórios muito longos, esta seção mostra ${shownRuns} execuções representativas de um total de ${totalRuns}. As métricas agregadas consideram todas as execuções.`);
                }

                images.benchmarkRuns.forEach(runData => {
                    layout.addImage(runData.image, `Benchmark - Execução ${runData.run} (Fitness vs Iteração)`, 42);

                    if (runData.metrics) {
                        const runHead = ['Métrica', ...keys.map(k => ALG_NAMES[k].shortPT)];
                        const finalFitnessRow = ['Fitness final', ...keys.map(k => fmtFixed(runData.metrics.scores?.[k]))];
                        const finalErrorRow = ['Erro final', ...keys.map(k => {
                            const err = runData.metrics.errors?.[k];
                            return Number.isFinite(err) ? err.toExponential(2) : 'N/A';
                        })];
                        const iterRow = ['Iterações', ...keys.map(() => runData.metrics.iterations ?? 'N/A')];
                        const feRow = ['FEs', ...keys.map(() => runData.metrics.fes ?? 'N/A')];
                        layout.addTable(runHead, [finalFitnessRow, finalErrorRow, iterRow, feRow], { fontSize: 8, cellPadding: 1.2 });
                    }
                });
            }

            // 5.5 Wilcoxon Signed-Rank Test
            subSec++;
            if (b.wilcoxon && keys.length >= 2) {
                layout.addSubsectionHeading(`5.${subSec} Teste de Wilcoxon Signed-Rank`);
                layout.addText('Comparação estatística par-a-par dos erros finais (nível de significância α = 0.05).');
                const wilcoxonRows = [];
                for (const pairKey of Object.keys(b.wilcoxon)) {
                    const w = b.wilcoxon[pairKey];
                    const [a, , bk] = pairKey.split('_');
                    const sigLabel = w.result === '+' ? `${ALG_NAMES[a]?.shortPT || a}+`
                        : w.result === '−' ? `${ALG_NAMES[bk]?.shortPT || bk}+` : '=';
                    wilcoxonRows.push([
                        `${ALG_NAMES[a]?.shortPT || a} vs ${ALG_NAMES[bk]?.shortPT || bk}`,
                        w.Rplus.toFixed(1), w.Rminus.toFixed(1),
                        w.p < 0.001 ? '<0.001' : w.p.toFixed(4),
                        sigLabel
                    ]);
                }
                layout.addTable(['Par', 'R+', 'R-', 'p-value', 'Sig.'], wilcoxonRows, { fontSize: 8 });
                layout.addText('Referência: Wilcoxon, F. "Individual Comparisons by Ranking Methods." Biometrics Bulletin, 1945.');
            }

            // 5.6 Vitórias
            subSec++;
            if (!isSingle) {
                layout.addSubsectionHeading(`5.${subSec} Contagem de Vitórias`);
                const winsRows = keys.map(k => [ALG_NAMES[k].shortPT, b.wins[k] || 0, `${Math.round(((b.wins[k] || 0) / b.totalRuns) * 100)}%`]);
                if (b.wins.tie > 0) {
                    winsRows.push(['Empate', b.wins.tie, `${Math.round((b.wins.tie / b.totalRuns) * 100)}%`]);
                }
                layout.addTable(['Algoritmo', 'Vitórias', '%'], winsRows);

                if (b.isTie) {
                    layout.addText('O benchmark resultou em empate técnico entre os algoritmos.');
                } else {
                    layout.addText(`O vencedor do benchmark foi o ${ALG_NAMES[b.winner.key].shortPT} com ${b.winner.wins} vitórias em ${b.totalRuns} execuções (${Math.round((b.winner.wins / b.totalRuns) * 100)}%).`);
                }
            }

            // 5.7 Ranking Final
            subSec++;
            if (b.errorStats && keys.length >= 2) {
                layout.addSubsectionHeading(`5.${subSec} Ranking Final`);
                const ranked = keys.map(k => ({
                    name: ALG_NAMES[k].shortPT,
                    meanError: b.errorStats[k]?.mean || 0
                })).sort((a, b2) => a.meanError - b2.meanError);
                layout.addTable(
                    ['#', 'Algoritmo', 'Mean Error'],
                    ranked.map((r, idx) => [idx + 1, r.name, fmt(r.meanError)])
                );
            }

            // 5.X Robustez
            subSec++;
            layout.addSubsectionHeading(`5.${subSec} Análise de Robustez`);
            keys.forEach(k => {
                const s = b.stats[k];
                const cv = s.mean !== 0 ? ((s.std / Math.abs(s.mean)) * 100).toFixed(1) : 'N/A';
                layout.addBullet(`${ALG_NAMES[k].shortPT}: CV = ${cv}%, amplitude = ${(s.worst - s.best).toFixed(6)}`);
            });
            layout.addText('O coeficiente de variação (CV) indica a estabilidade relativa de cada algoritmo.');
        }
    },

    // ── 5/6. Implementação ──────────────────────────────────────────────────
    {
        id: 'implementacao',
        title: 'Implementação',
        // Nota: a numeração se adapta dinamicamente à presença do benchmark
        render(ctx) {
            const { layout, data } = ctx;
            const secNum = data.benchmark ? '6' : '5';

            layout.addSectionHeading(`${secNum}. Implementação`);
            layout.addText('A aplicação foi desenvolvida integralmente em JavaScript client-side, permitindo deploy estático no GitHub Pages. O frontend utiliza Plotly.js para os gráficos 3D e convergência, math.js para avaliação de expressões matemáticas, MathLive para teclado virtual de entrada de funções, e jsPDF para geração de relatórios PDF.');

            layout.addSubsectionHeading(`${secNum}.1 Arquitetura`);
            layout.addBullet('Classe base OptimizationAlgorithm com interface unificada para AG, PSO e ED.');
            layout.addBullet('Sistema de snapshot/restore para navegação de iterações.');
            layout.addBullet('Detecção automática de convergência configurável.');
            layout.addBullet('Benchmark multi-run com animação em tempo real.');
            layout.addBullet('Seleção dinâmica de algoritmos (toggle on/off).');

            layout.addSubsectionHeading(`${secNum}.2 Tecnologias`);
            layout.addBullet('Plotly.js 2.27 — gráficos 3D de superfície e convergência.');
            layout.addBullet('math.js 11.11 — parsing e avaliação segura de expressões.');
            layout.addBullet('MathLive 0.100.0 — teclado virtual matemático.');
            layout.addBullet('jsPDF + jspdf-autotable — geração de relatório PDF no cliente.');
            layout.addBullet('Jest 29.7 — 30 testes automatizados (CI com GitHub Actions).');

            layout.addSubsectionHeading(`${secNum}.3 Uso de IA`);
            layout.addText('Modelos utilizados:');
            REPORT_AI_MODELS.forEach(m => layout.addBullet(m));
            layout.addText('Prompts utilizados:');
            REPORT_AI_PROMPTS.forEach(p => layout.addBullet(p));

            layout.addText(`Template SBC (2025-2026): ${REPORT_CONFIG.templateUrl}`);
        }
    },

    // ── Discussão ───────────────────────────────────────────────────────────
    {
        id: 'discussao',
        title: 'Discussão',
        render(ctx) {
            const { layout, data } = ctx;
            const secNum = data.benchmark ? '7' : '6';

            layout.addSectionHeading(`${secNum}. Discussão`);
            let sub = 1;
            if (data.enabled.ag) {
                layout.addSubsectionHeading(`${secNum}.${sub} Algoritmo Genético`);
                layout.addText('O AG demonstra boa capacidade de exploração do espaço de busca graças aos operadores genéticos. A mutação gaussiana mantém diversidade populacional, enquanto o crossover BLX-alpha permite exploração interpolativa e extrapolativa entre pais. A seleção por torneio com pressão seletiva moderada equilibra convergência e diversidade.');
                layout.addBullet('Pontos fortes: manutenção de diversidade, robustez a longo prazo.');
                layout.addBullet('Pontos fracos: convergência mais lenta que métodos diretos, muitos hiperparâmetros (taxa de mutação, taxa de crossover, tamanho do torneio).');
                sub++;
            }
            if (data.enabled.pso) {
                layout.addSubsectionHeading(`${secNum}.${sub} PSO`);
                layout.addText('O PSO se destaca pela velocidade de convergência inicial, guiada pela comunicação social entre partículas. O peso de inércia w controla a transição entre exploração global (w alto) e refinamento local (w baixo). Os coeficientes c1 (cognitivo) e c2 (social) balanceiam experiência individual versus coletiva.');
                layout.addBullet('Pontos fortes: convergência rápida, poucos parâmetros, paralelizável.');
                layout.addBullet('Pontos fracos: risco de convergência prematura em funções altamente multimodais, sensível aos valores de w, c1, c2.');
                sub++;
            }
            if (data.enabled.ed) {
                layout.addSubsectionHeading(`${secNum}.${sub} Evolução Diferencial`);
                layout.addText('A ED combina simplicidade de implementação com eficácia comprovada em otimização global contínua. Com apenas dois parâmetros de controle (F e CR), é significativamente mais simples de ajustar que AG ou PSO.');
                layout.addBullet('Mutação diferencial: a perturbação é auto-adaptativa pois utiliza diferenças entre vetores da própria população — em populações diversas as perturbações são grandes (exploração), e em populações convergentes são pequenas (refinamento).');
                layout.addBullet('Crossover binomial com jRand: garante que pelo menos uma dimensão do vetor doador é incorporada ao trial, evitando stagnação.');
                layout.addBullet('Seleção greedy: garante convergência monotônica — o fitness nunca piora.');
                layout.addBullet('Pontos fortes: poucos parâmetros, robusto em funções multimodais, convergência monotônica.');
                layout.addBullet('Pontos fracos: pode ser mais lento que PSO em funções unimodais simples.');
            }

            // Benchmark discussion
            if (data.benchmark) {
                const bKeys = data.benchmark.enabledKeys;
                const isSingleBench = bKeys.length === 1;
                layout.addSubsectionHeading(`${secNum}.${sub + 1} Análise do Benchmark`);
                const b = data.benchmark;
                if (isSingleBench) {
                    layout.addText(`O benchmark com ${b.totalRuns} execuções independentes permite uma avaliação estatisticamente robusta da consistência do ${ALG_NAMES[bKeys[0]].shortPT}. A variabilidade observada (desvio padrão e coeficiente de variação) revela a sensibilidade do algoritmo às condições iniciais aleatórias.`);
                } else {
                    layout.addText(`O benchmark com ${b.totalRuns} execuções independentes permite uma avaliação estatisticamente mais robusta do que uma única simulação. A variabilidade observada (desvio padrão e coeficiente de variação) revela a sensibilidade de cada algoritmo às condições iniciais aleatórias.`);
                    if (!b.isTie) {
                        layout.addText(`O ${ALG_NAMES[b.winner.key].shortPT} apresentou superioridade estatística com ${b.winner.wins} vitórias (${Math.round((b.winner.wins / b.totalRuns) * 100)}%), sugerindo que é a melhor escolha para este tipo de função objetivo e configuração de parâmetros.`);
                    } else {
                        layout.addText('O empate técnico sugere que os algoritmos possuem capacidades similares para esta configuração, sendo a escolha entre eles dependente de critérios adicionais como velocidade de convergência ou estabilidade.');
                    }
                }
            }
        }
    },

    // ── Histórico de Desenvolvimento do ED ──────────────────────────────────
    {
        id: 'historico_ed',
        title: 'Histórico ED',
        render(ctx) {
            const { layout, data } = ctx;
            if (!data.enabled.ed) return; // Só mostra se ED estiver habilitado

            const secNum = data.benchmark ? '8' : '7';

            layout.addSectionHeading(`${secNum}. Histórico de Desenvolvimento da ED`);
            layout.addText('A Evolução Diferencial foi implementada neste projeto ao longo de múltiplas iterações de desenvolvimento assistido por IA. A seguir, o cronograma completo de cada fase:');

            ED_DEVELOPMENT_HISTORY.forEach((entry, i) => {
                layout.addSubsectionHeading(`${secNum}.${i + 1} ${entry.phase}`);
                layout.addText(entry.description);
            });
        }
    },

    // ── Conclusões ──────────────────────────────────────────────────────────
    {
        id: 'conclusoes',
        title: 'Conclusões',
        render(ctx) {
            const { layout, data } = ctx;
            const keys = data.enabledKeys;
            let secNum;
            if (data.enabled.ed && data.benchmark) secNum = '9';
            else if (data.enabled.ed || data.benchmark) secNum = '8';
            else secNum = '7';

            layout.addSectionHeading(`${secNum}. Conclusões`);

            if (keys.length > 1) {
                layout.addText('A análise comparativa dos algoritmos metaheurísticos implementados permite as seguintes conclusões:');
            } else {
                layout.addText(`A avaliação do ${ALG_NAMES[keys[0]].shortPT} permite as seguintes conclusões:`);
            }

            if (data.enabled.ag) layout.addBullet('O AG demonstra robustez a longo prazo e boa exploração do espaço de busca mediante operadores genéticos.');
            if (data.enabled.pso) layout.addBullet('O PSO se destaca pela velocidade de convergência inicial, sendo adequado quando soluções rápidas aproximadas são suficientes.');
            if (data.enabled.ed) layout.addBullet('A ED oferece excelente relação custo-benefício, combinando poucos parâmetros de controle (F e CR) com convergência monotônica e robustez em funções multimodais.');

            if (data.benchmark) {
                const b = data.benchmark;
                if (keys.length === 1) {
                    layout.addBullet(`O benchmark estatístico com ${b.totalRuns} execuções confirmou a consistência do ${ALG_NAMES[keys[0]].shortPT}, com desvio padrão de ${b.stats[keys[0]].std.toFixed(6)}.`);
                } else if (!b.isTie) {
                    layout.addBullet(`O benchmark estatístico com ${b.totalRuns} execuções confirmou a superioridade do ${ALG_NAMES[b.winner.key].shortPT} para a configuração testada.`);
                } else {
                    layout.addBullet(`O benchmark com ${b.totalRuns} execuções resultou em empate técnico, indicando desempenho comparável entre os algoritmos testados.`);
                }
            }

            layout.addText('Como trabalhos futuros, sugere-se a implementação de variantes adaptativas (JADE, SHADE para ED; PSO com inércia decrescente) e a avaliação em funções de benchmark padronizadas (CEC 2017).');
        }
    },

    // ── Disponibilidade ─────────────────────────────────────────────────────
    {
        id: 'disponibilidade',
        title: 'Disponibilidade',
        render(ctx) {
            const { layout, data } = ctx;
            let secNum;
            if (data.enabled.ed && data.benchmark) secNum = '10';
            else if (data.enabled.ed || data.benchmark) secNum = '9';
            else secNum = '8';

            layout.addSectionHeading(`${secNum}. Disponibilidade`);
            layout.addText('A simulação interativa está disponível em:');
            layout.addLink(REPORT_CONFIG.projectUrl);
        }
    },

    // ── Referências ─────────────────────────────────────────────────────────
    {
        id: 'referencias',
        title: 'Referências',
        render(ctx) {
            const { layout } = ctx;

            layout.addSectionHeading('Referências');
            REPORT_REFERENCES.forEach((ref, i) => {
                layout.addText(`[${i + 1}] ${ref}`, { fontSize: 9 });
            });
        }
    },

    // ── Footer ──────────────────────────────────────────────────────────────
    {
        id: 'footer',
        title: 'Footer',
        render(ctx) {
            const { layout } = ctx;

            layout.addSpace(10);
            layout.doc.setFontSize(8);
            layout.doc.setTextColor(100);
            layout.addText(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, { fontSize: 8, fontStyle: 'italic' });
            layout.doc.setTextColor(0, 0, 0);
        }
    }
];

// =============================================================================
//  Função Principal — Gera o PDF
// =============================================================================

async function generatePdfReport() {
    const reportBtn = document.getElementById('reportBtn');
    if (reportBtn) {
        reportBtn.disabled = true;
        reportBtn.textContent = '⏳';
    }

    try {
        const { jsPDF } = window.jspdf;

        // 1. Coleta dados
        const data = collectReportData();

        // 2. Captura imagens
        const images = await captureReportImages(data);

        // 3. Cria documento
        const doc = new jsPDF();
        const pdfTitle = data.enabledKeys.length === 1
            ? `Avaliação do ${enabledShortPT(data.enabledKeys)} - Relatório SBC`
            : `Comparação entre ${enabledShortPT(data.enabledKeys)} - Relatório SBC`;
        doc.setProperties({
            title: pdfTitle,
            subject: 'Relatório Técnico - Template SBC',
            author: REPORT_CONFIG.metadata.author,
            creator: REPORT_CONFIG.metadata.creator
        });

        // 4. Cria layout engine
        const layout = new PdfLayout(doc, REPORT_CONFIG, {
            columns: data.enabledKeys.length === 1 ? 1 : 2
        });

        // 5. Renderiza cada seção
        const ctx = { layout, data, images };
        for (const section of REPORT_SECTIONS) {
            section.render(ctx);
        }

        // 6. Salva
        doc.save(`relatorio_sbc_${data.enabledKeys.join('_')}.pdf`);

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
            if (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang]) {
                reportBtn.innerHTML = '📄 <span data-i18n="generate_report">' +
                    (translations[currentLang]?.generate_report || 'Relatório') + '</span>';
            } else {
                reportBtn.textContent = 'Relatório';
            }
        }
    }
}
