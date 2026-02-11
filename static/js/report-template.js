/**
 * Generates the LaTeX source code for the Optimization Report
 * adhering to SBC (Sociedade Brasileira de Computação) style.
 */

const ALG_NAMES = {
    ag: { full: 'Algoritmo Genético', short: 'AG' },
    pso: { full: 'Otimização por Enxame de Partículas', short: 'PSO' },
    ed: { full: 'Evolução Diferencial', short: 'ED' }
};

export function generateLatexSource(data, images) {
    const keys = data.enabledKeys;
    const isSingle = keys.length === 1;
    const shortTitle = keys.map(k => ALG_NAMES[k].short).join(' vs ');
    const title = isSingle
        ? `Avaliação do ${ALG_NAMES[keys[0]].full} na Otimização de Funções Multimodais`
        : `Comparação entre ${shortTitle} na Otimização de Funções Multimodais`;

    // Abstract generation
    const winner = determineWinner(data);
    const abstractPT = `Este trabalho apresenta uma análise ${isSingle ? 'do desempenho do' : 'comparativa entre'} ${keys.map(k => ALG_NAMES[k].full).join(', ')}. Os experimentos foram realizados na função ${data.params.function_expr}, com população de ${data.params.pop_size} indivíduos. Os resultados indicam que ${winner.pt}.`;

    const abstractEN = `This paper presents a ${isSingle ? 'performance analysis of' : 'comparative analysis between'} ${keys.map(k => ALG_NAMES[k].short).join(', ')}. Experiments were conducted on the function ${data.params.function_expr}, with a population of ${data.params.pop_size} individuals. Results indicate that ${winner.en}.`;

    return `
\\documentclass[12pt]{article}
\\usepackage{sbc-template}
\\usepackage{graphicx,url}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[brazil]{babel}
\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}
\\usepackage{float}
\\usepackage{multicol}

\\title{${title}}

\\author{João da Cruz de Natividade e Silva Neto\\inst{1}, Gemini 3 Pro\\inst{2}, Claude Opus\\inst{2}}

\\address{Universidade Federal do Pará (UFPA) -- Belém, PA -- Brasil
  \\nextinstitute
  AI Assistants Co-Authors
  \\email{joao.silva.neto@itec.ufpa.br}
}

\\begin{document}

\\maketitle

\\begin{abstract}
  ${abstractEN}
\\end{abstract}

\\begin{resumo}
  ${abstractPT}
\\end{resumo}

\\section{Introdução}
A otimização de funções multimodais é um desafio clássico em computação evolucionária. 
Este relatório foi gerado automaticamente a partir de uma simulação interativa rodando 100\\% no navegador.
O objetivo é avaliar o comportamento de algoritmos metaheurísticos na função:
\\[ f(\\mathbf{x}) = ${data.params.function_expr} \\]
definida no domínio $[-5.12, 5.12]$ em ${data.params.dimensions} dimensões.

\\section{Fundamentação Teórica}
${generateTheoreticalBackground(data)}

\\section{Configuração Experimental}
A Tabela \\ref{tab:params} resume os parâmetros utilizados na simulação.

\\begin{table}[H]
\\centering
\\caption{Parâmetros de Configuração}
\\label{tab:params}
\\begin{tabular}{@{}ll@{}}
\\toprule
Parâmetro & Valor \\\\ \\midrule
População & ${data.params.pop_size} \\\\
Dimensões & ${data.params.dimensions} \\\\
Modo & ${data.params.optimization_mode} \\\\
${data.enabled.ag ? `AG Mutação & ${data.params.ag_mutation} \\\\` : ''}
${data.enabled.ag ? `AG Crossover & ${data.params.ag_crossover} \\\\` : ''}
${data.enabled.pso ? `PSO Inércia (w) & ${data.params.pso_w} \\\\` : ''}
${data.enabled.pso ? `PSO c1/c2 & ${data.params.pso_c1}/${data.params.pso_c2} \\\\` : ''}
${data.enabled.ed ? `ED F & ${data.params.ed_f} \\\\` : ''}
${data.enabled.ed ? `ED CR & ${data.params.ed_cr} \\\\` : ''}
\\bottomrule
\\end{tabular}
\\end{table}

\\section{Resultados e Discussão}

A Figura \\ref{fig:convergence} apresenta as curvas de convergência média dos algoritmos.

\\begin{figure}[H]
\\centering
\\includegraphics[width=0.9\\linewidth]{convergence.png}
\\caption{Curvas de Convergência (Fitness x Iteração)}
\\label{fig:convergence}
\\end{figure}

${generateResultsTable(data)}

\\subsection{Análise Visual}
As Figuras abaixo mostram o estado final das populações no espaço de busca 3D.

${generate3DFigures(data, images)}

${data.benchmark ? generateBenchmarkSection(data) : ''}

\\section{Conclusão}
Com base nos experimentos realizados, conclui-se que ${winner.pt}.
A ferramenta de visualização permitiu identificar claramente as diferenças de comportamento entre os algoritmos para a função testada.

\\bibliographystyle{sbc}
\\begin{thebibliography}{99}
\\bibitem{holland} Holland, J. H. (1992). Adaptation in Natural and Artificial Systems. MIT Press.
\\bibitem{kennedy} Kennedy, J.; Eberhart, R. (1995). Particle Swarm Optimization. IEEE Intl. Conf. on Neural Networks.
\\bibitem{storn} Storn, R.; Price, K. (1997). Differential Evolution. Journal of Global Optimization.
\\end{thebibliography}

\\end{document}
    `;
}

function determineWinner(data) {
    // Simplified logic, similar to original report.js
    const scores = data.enabledKeys.map(k => ({
        key: k,
        name: ALG_NAMES[k].short,
        score: data.scores[k]?.best_score || 0
    }));

    // Sort logic (assuming minimization for simplicity in text generation logic placeholder)
    scores.sort((a, b) => a.score - b.score);

    if (scores.length < 2) return { pt: 'o algoritmo foi executado com sucesso', en: 'the algorithm executed successfully' };

    return {
        pt: `o ${scores[0].name} obteve o melhor desempenho final`,
        en: `${scores[0].name} achieved the best final performance`
    };
}

function generateTheoreticalBackground(data) {
    let text = '';
    if (data.enabled.ag) text += "\\subsection{Algoritmo Genético (AG)}\nO AG utiliza seleção, cruzamento e mutação para evoluir uma população.\n\n";
    if (data.enabled.pso) text += "\\subsection{Particle Swarm Optimization (PSO)}\nO PSO baseia-se na inteligência de enxames, atualizando velocidades e posições.\n\n";
    if (data.enabled.ed) text += "\\subsection{Evolução Diferencial (ED)}\nA ED utiliza vetores de diferença para gerar perturbações na população.\n\n";
    return text;
}

function generateResultsTable(data) {
    const keys = data.enabledKeys;
    let header = 'Métrica';
    keys.forEach(k => header += ` & ${ALG_NAMES[k].short}`);

    let bestRow = 'Melhor Fitness';
    keys.forEach(k => bestRow += ` & ${data.scores[k]?.best_score?.toExponential(4) || 'N/A'}`);

    let iterRow = 'Iterações';
    keys.forEach(k => iterRow += ` & ${data.scores[k]?.iteration}`);

    return `
\\begin{table}[H]
\\centering
\\caption{Resultados Finais}
\\label{tab:results}
\\begin{tabular}{@{}l${'c'.repeat(keys.length)}@{}}
\\toprule
${header} \\\\ \\midrule
${bestRow} \\\\
${iterRow} \\\\
\\bottomrule
\\end{tabular}
\\end{table}
    `;
}

function generate3DFigures(data, images) {
    let latex = '';
    data.enabledKeys.forEach(k => {
        if (images[k]) {
            latex += `
\\begin{figure}[H]
\\centering
\\includegraphics[width=0.7\\linewidth]{${k}.png}
\\caption{População Final - ${ALG_NAMES[k].short}}
\\label{fig:${k}}
\\end{figure}
            `;
        }
    });
    return latex;
}

function generateBenchmarkSection(data) {
    const b = data.benchmark;
    if (!b) return '';

    // Create benchmark table rows
    let tableContent = '';
    const keys = b.enabledKeys;

    // Header
    tableContent += `Algoritmo & Média & Std Dev & Melhor & Pior \\\\ \\midrule\n`;

    keys.forEach(k => {
        const s = b.stats[k];
        if (s) {
            tableContent += `${ALG_NAMES[k].short} & ${s.mean.toExponential(2)} & ${s.std.toExponential(2)} & ${s.best.toExponential(2)} & ${s.worst.toExponential(2)} \\\\\n`;
        }
    });

    return `
\\section{Benchmark Estatístico}
Para validar a consistência dos resultados, foram realizadas ${b.totalRuns} execuções independentes.
A Tabela \\ref{tab:benchmark} resume as estatísticas coletadas.

\\begin{table}[H]
\\centering
\\caption{Estatísticas do Benchmark (${b.totalRuns} execuções)}
\\label{tab:benchmark}
\\begin{tabular}{@{}lcccc@{}}
\\toprule
${tableContent}
\\bottomrule
\\end{tabular}
\\end{table}
    `;
}
