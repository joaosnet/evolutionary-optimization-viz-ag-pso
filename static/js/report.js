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
    projectUrl: 'https://joaosnet.github.io/evolutionary-optimization-viz/',
    templateUrl: 'https://github.com/uefs/sbc-template-latex'
};

// ─── Nomes dos Algoritmos (para reuso) ──────────────────────────────────────

const ALG_NAMES = {
    ag: { fullPT: 'Algoritmo Genético (AG)', fullEN: 'Genetic Algorithm (GA)',    shortPT: 'AG', shortEN: 'GA' },
    pso:{ fullPT: 'Otimização por Enxame de Partículas (PSO)', fullEN: 'Particle Swarm Optimization (PSO)', shortPT: 'PSO', shortEN: 'PSO' },
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
    'syntax error in part "*(x1^2+x2^2))^2)" (char 44'
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
    constructor(doc, config = REPORT_CONFIG) {
        this.doc = doc;
        this.cfg = config;

        const m = config.margins;
        this.pageWidth  = doc.internal.pageSize.width;   // 210mm
        this.pageHeight = doc.internal.pageSize.height;   // 297mm
        this.contentWidth = this.pageWidth - m.left - m.right;
        this.colWidth = (this.contentWidth - config.colGap) / 2;
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
            if (this.currentCol === 1) {
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
        return this.currentCol === 1 ? this.col1X : this.col2X;
    }

    /** Pula para a próxima coluna ou página */
    nextColumn() {
        if (this.currentCol === 1) {
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

    return {
        enabled,
        enabledKeys,
        params: {
            pop_size:    parseInt(document.getElementById('pop_size')?.value) || 50,
            ag_mutation:  parseFloat(document.getElementById('ag_mutation')?.value) || 0.01,
            ag_crossover: parseFloat(document.getElementById('ag_crossover')?.value) || 0.7,
            pso_w:  parseFloat(document.getElementById('pso_w')?.value)  || 0.5,
            pso_c1: parseFloat(document.getElementById('pso_c1')?.value) || 1.5,
            pso_c2: parseFloat(document.getElementById('pso_c2')?.value) || 1.5,
            ed_f:   parseFloat(document.getElementById('ed_f')?.value)   || 0.8,
            ed_cr:  parseFloat(document.getElementById('ed_cr')?.value)  || 0.9,
            optimization_mode: getOptimizationMode(),
            target_value: getTargetValue(),
            function_expr: currentExpression,
            dimensions: currentDimensions
        },
        scores: {
            ag:  { best_score: historyCache.ag.length  > 0 ? historyCache.ag[historyCache.ag.length - 1]   : null, iteration: currentIteration },
            pso: { best_score: historyCache.pso.length > 0 ? historyCache.pso[historyCache.pso.length - 1] : null, iteration: currentIteration },
            ed:  { best_score: historyCache.ed.length  > 0 ? historyCache.ed[historyCache.ed.length - 1]   : null, iteration: currentIteration }
        },
        history: {
            ag:  historyCache.ag,
            pso: historyCache.pso,
            ed:  historyCache.ed
        }
    };
}

// =============================================================================
//  Helper — captura de imagens (Plotly)
// =============================================================================

async function captureReportImages(enabledKeys) {
    const imgs = {};
    const plotIds = { ag: 'agPlot', pso: 'psoPlot', ed: 'edPlot' };

    for (const k of enabledKeys) {
        const el = document.getElementById(plotIds[k]);
        if (el) imgs[k] = await Plotly.toImage(el, { format: 'png', width: 500, height: 400 });
    }

    const convEl = document.getElementById('convergencePlot');
    if (convEl) imgs.convergence = await Plotly.toImage(convEl, { format: 'png', width: 600, height: 350 });

    return imgs;
}

// =============================================================================
//  Helpers — texto dinâmico
// =============================================================================

function enabledFullPT(keys)    { return keys.map(k => ALG_NAMES[k].fullPT).join(', '); }
function enabledFullEN(keys)    { return keys.map(k => ALG_NAMES[k].fullEN).join(', '); }
function enabledShortPT(keys)   { return keys.map(k => ALG_NAMES[k].shortPT).join(', '); }
function enabledShortTitle(keys){ return keys.map(k => ALG_NAMES[k].shortPT).join(' vs '); }

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

            // Título 14pt bold centralizado
            doc.setFont(layout.cfg.font, 'bold');
            doc.setFontSize(14);
            doc.text(`Comparação entre ${shortTitle}`, layout.pageWidth / 2, layout.cursorY, { align: 'center' });
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

            const absText = `Este trabalho apresenta uma análise comparativa entre ${enabledFullPT(keys)} aplicados à otimização de funções multimodais. A simulação foi executada com ${maxIter} iterações, utilizando uma população de ${data.params.pop_size} indivíduos/partículas. Os resultados demonstram que ${winner.pt}. O projeto foi desenvolvido com assistência de Inteligência Artificial (IA).`;

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

            const absText = `This paper presents a comparative analysis between ${enabledFullEN(keys)} applied to multimodal function optimization. The simulation ran for ${maxIter} iterations with a population of ${data.params.pop_size} individuals/particles. Results show that ${winner.en}. This project was developed with AI assistance.`;

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
            const { layout, data } = ctx;
            const keys = data.enabledKeys;

            layout.addSectionHeading('1. Introdução');
            layout.addText(`A otimização de funções multimodais representa um desafio significativo. Este relatório compara ${keys.length === 1 ? 'o algoritmo' : keys.length + ' algoritmos metaheurísticos'}: ${enabledShortPT(keys)}.`);

            layout.addSubsectionHeading('1.1 Função Objetivo');
            layout.addText(`Função: f(x) = ${data.params.function_expr}`);
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
            const parts = [];
            if (data.enabled.ag)  parts.push('O Algoritmo Genético (AG) utiliza seleção por torneio, crossover BLX-alpha e mutação gaussiana.');
            if (data.enabled.pso) parts.push('O PSO utiliza a formulação canônica com inércia.');
            if (data.enabled.ed)  parts.push('A Evolução Diferencial (ED) utiliza a estratégia DE/rand/1/bin com crossover binomial.');
            layout.addText(parts.join(' '));
        }
    },

    // ── 3. Configuração Experimental ────────────────────────────────────────
    {
        id: 'configuracao',
        title: '3. Configuração Experimental',
        render(ctx) {
            const { layout, data } = ctx;
            const keys = data.enabledKeys;

            layout.addSectionHeading('3. Configuração Experimental');

            // Cabeçalho dinâmico
            const head = ['Parâmetro', ...keys.map(k => ALG_NAMES[k].shortPT)];
            const body = [['População', ...keys.map(() => data.params.pop_size)]];

            if (data.enabled.ag) {
                const rowMut = ['Mutação'];
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
                ['Inércia (w)', 'Cognitivo (c1)', 'Social (c2)'].forEach((label, idx) => {
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

            layout.addTable(head, body);
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
                    ['Iterações',      ...keys.map(k => data.scores[k]?.iteration ?? 'N/A')]
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

    // ── 5. Implementação ────────────────────────────────────────────────────
    {
        id: 'implementacao',
        title: '5. Implementação',
        render(ctx) {
            const { layout } = ctx;

            layout.addSectionHeading('5. Implementação');
            layout.addText('O backend em FastAPI executa AG/PSO/ED e expõe uma API para geração de relatório. O frontend em JavaScript usa Plotly para os gráficos 3D e convergência, enviando parâmetros via interface interativa.');

            layout.addSubsectionHeading('5.1 Integração');
            layout.addBullet('WebSocket para streaming de estados e histórico.');
            layout.addBullet('Expressões validadas com math.js/numexpr.');
            layout.addBullet('Relatório exportado em PDF seguindo o template SBC (2025-2026).');

            layout.addSubsectionHeading('5.2 Uso de IA');
            layout.addText('Modelos utilizados:');
            REPORT_AI_MODELS.forEach(m => layout.addBullet(m));
            layout.addText('Prompts utilizados:');
            REPORT_AI_PROMPTS.forEach(p => layout.addBullet(p));
            layout.addText(`Template SBC (2025-2026): ${REPORT_CONFIG.templateUrl}`);
        }
    },

    // ── 6. Discussão ────────────────────────────────────────────────────────
    {
        id: 'discussao',
        title: '6. Discussão',
        render(ctx) {
            const { layout, data } = ctx;

            layout.addSectionHeading('6. Discussão');
            let sub = 1;
            if (data.enabled.ag) {
                layout.addSubsectionHeading(`6.${sub} Algoritmo Genético`);
                layout.addBullet('Diversidade via mutação');
                layout.addBullet('Convergência robusta');
                sub++;
            }
            if (data.enabled.pso) {
                layout.addSubsectionHeading(`6.${sub} PSO`);
                layout.addBullet('Convergência rápida');
                layout.addBullet('Comportamento de enxame');
                sub++;
            }
            if (data.enabled.ed) {
                layout.addSubsectionHeading(`6.${sub} ED`);
                layout.addBullet('Poucos parâmetros de controle');
                layout.addBullet('Robusto em funções multimodais');
                layout.addBullet('Operação de mutação diferencial eficiente');
            }
        }
    },

    // ── 7. Conclusões ───────────────────────────────────────────────────────
    {
        id: 'conclusoes',
        title: '7. Conclusões',
        render(ctx) {
            const { layout, data } = ctx;
            const keys = data.enabledKeys;

            layout.addSectionHeading('7. Conclusões');
            layout.addBullet(`${keys.length === 1 ? 'O algoritmo é eficaz' : 'Os algoritmos são eficazes'}.`);
            if (data.enabled.pso) layout.addBullet('PSO: velocidade inicial.');
            if (data.enabled.ag)  layout.addBullet('AG: robustez a longo prazo.');
            if (data.enabled.ed)  layout.addBullet('ED: eficiência com poucos parâmetros.');
        }
    },

    // ── 8. Disponibilidade ──────────────────────────────────────────────────
    {
        id: 'disponibilidade',
        title: '8. Disponibilidade',
        render(ctx) {
            const { layout } = ctx;

            layout.addSectionHeading('8. Disponibilidade');
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
        const images = await captureReportImages(data.enabledKeys);

        // 3. Cria documento
        const doc = new jsPDF();
        doc.setProperties({
            title: `Comparação entre ${enabledShortPT(data.enabledKeys)} - Relatório SBC`,
            subject: 'Relatório Técnico - Template SBC',
            author: REPORT_CONFIG.metadata.author,
            creator: REPORT_CONFIG.metadata.creator
        });

        // 4. Cria layout engine
        const layout = new PdfLayout(doc);

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
