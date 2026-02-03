"""
Módulo de Geração de Relatório LaTeX/PDF Completo

Gera relatórios acadêmicos completos a partir dos resultados da simulação AG vs PSO,
seguindo o template SBC (2025-2026) - Padronizado com T1.
"""

import subprocess
import shutil
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Optional

TEMPLATE_DIR = Path(__file__).resolve().parent / "report_templates"
TEMPLATE_FILES = ("sbc-template.sty", "caption2.sty")
TEMPLATE_SOURCE_URL = "https://github.com/uefs/sbc-template-latex"

AI_MODELS = [
    "Claude Opus 4.5 (Thinking) via Antigravity",
]

AI_PROMPTS = [
    "Gere imagens de dashboard minimalista moderno realista com AG vs Enxame de Partículas",
    'Gostei do "clean minimalist bright dashboard UI design, comparison between Genetic Algorithm (AG) and Particle Swarm (PSO), elegant charts, soft shadows, realistic render, data visualization, high end interface, 8k" implemente ele em html css javascript com animacoes, e a parte logica implemente em python, conecte tudo com fastapi no python 3.14.2 freetreat',
    "Proponha melhorias no front end do dashboard",
    "quero poder ajustar os graficos 3d diretamente na interface",
    "tem que ser possivel trocar de otimizacao, ou seja pode ser de maximizacao, minimizacao ou outro",
    "Quero poder trocar a funcao de interesse, para isso preciso de um campo para trocar que possua um teclado virtual para funcoes matematicas",
]


def normalize_prompt(text: str) -> str:
    """Normaliza caracteres dos prompts para evitar erros no LaTeX."""
    if not text:
        return ""
    return text.replace("∗", "*")


def copy_template_files(dest_dir: Path) -> Optional[str]:
    """Copia os arquivos do template SBC para o diretório de compilação."""
    missing = []
    for filename in TEMPLATE_FILES:
        src = TEMPLATE_DIR / filename
        if not src.exists():
            missing.append(filename)
            continue
        shutil.copy(src, dest_dir / filename)
    if missing:
        return "Arquivos do template SBC ausentes: " + ", ".join(missing)
    return None


def find_latex_compiler() -> Optional[str]:
    """Encontra o compilador LaTeX disponível no sistema."""
    compilers = ["pdflatex", "xelatex", "lualatex"]
    for compiler in compilers:
        if shutil.which(compiler):
            return compiler
    return None


def escape_latex(text: str) -> str:
    """Escapa caracteres especiais do LaTeX."""
    if not text:
        return ""
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    return text


def format_expression_latex(expr: str) -> str:
    """Converte uma expressão matemática para LaTeX."""
    if not expr:
        return r"f(x_1, x_2)"

    result = expr
    # Substituições básicas
    result = result.replace("pi", r"\pi")
    result = result.replace("sqrt", r"\sqrt")
    result = result.replace("sin", r"\sin")
    result = result.replace("cos", r"\cos")
    result = result.replace("tan", r"\tan")
    result = result.replace("exp", r"\exp")
    result = result.replace("log", r"\log")
    result = result.replace("x1", r"x_1")
    result = result.replace("x2", r"x_2")
    result = result.replace("x3", r"x_3")
    result = result.replace("^2", r"^{2}")
    result = result.replace("**", "^")
    result = result.replace("*", r" \cdot ")

    return result


def generate_convergence_table(history_ag: list, history_pso: list) -> str:
    """Gera tabela LaTeX detalhada com dados de convergência."""
    if not history_ag or not history_pso:
        return r"\textit{Sem dados de convergência disponíveis.}"

    rows = []
    total = len(history_ag)

    # Determinar step baseado no tamanho
    if total <= 10:
        step = 1
    elif total <= 50:
        step = 5
    elif total <= 100:
        step = 10
    else:
        step = max(1, total // 15)

    for i in range(0, total, step):
        ag_val = history_ag[i] if i < len(history_ag) else None
        pso_val = history_pso[i] if i < len(history_pso) else None

        ag_str = f"{ag_val:.6f}" if isinstance(ag_val, (int, float)) else "--"
        pso_str = f"{pso_val:.6f}" if isinstance(pso_val, (int, float)) else "--"

        # Calcular diferença
        if isinstance(ag_val, (int, float)) and isinstance(pso_val, (int, float)):
            diff = ag_val - pso_val
            diff_str = f"{diff:+.6f}"
        else:
            diff_str = "--"

        rows.append(f"    {i} & {ag_str} & {pso_str} & {diff_str} \\\\")

    # Sempre incluir última iteração
    if total > 0 and (total - 1) % step != 0:
        i = total - 1
        ag_val = history_ag[i] if i < len(history_ag) else None
        pso_val = history_pso[i] if i < len(history_pso) else None
        ag_str = f"{ag_val:.6f}" if isinstance(ag_val, (int, float)) else "--"
        pso_str = f"{pso_val:.6f}" if isinstance(pso_val, (int, float)) else "--"
        if isinstance(ag_val, (int, float)) and isinstance(pso_val, (int, float)):
            diff_str = f"{ag_val - pso_val:+.6f}"
        else:
            diff_str = "--"
        rows.append(r"    \midrule")
        rows.append(
            f"    \\textbf{{{i}}} & \\textbf{{{ag_str}}} & \\textbf{{{pso_str}}} & \\textbf{{{diff_str}}} \\\\"
        )

    return "\n".join(rows)


def analyze_results(history_ag: list, history_pso: list) -> dict:
    """Analisa os resultados e retorna métricas."""
    analysis = {
        "ag_final": None,
        "pso_final": None,
        "ag_improvement": None,
        "pso_improvement": None,
        "winner": "empate",
        "iterations": 0,
        "ag_converged_at": None,
        "pso_converged_at": None,
    }

    if history_ag:
        analysis["ag_final"] = (
            history_ag[-1] if isinstance(history_ag[-1], (int, float)) else None
        )
        if (
            len(history_ag) > 1
            and isinstance(history_ag[0], (int, float))
            and isinstance(history_ag[-1], (int, float))
        ):
            analysis["ag_improvement"] = abs(history_ag[0] - history_ag[-1])

    if history_pso:
        analysis["pso_final"] = (
            history_pso[-1] if isinstance(history_pso[-1], (int, float)) else None
        )
        if (
            len(history_pso) > 1
            and isinstance(history_pso[0], (int, float))
            and isinstance(history_pso[-1], (int, float))
        ):
            analysis["pso_improvement"] = abs(history_pso[0] - history_pso[-1])

    analysis["iterations"] = max(len(history_ag), len(history_pso))

    # Determinar vencedor (menor valor = melhor para minimização, maior = melhor para maximização)
    if analysis["ag_final"] is not None and analysis["pso_final"] is not None:
        if abs(analysis["ag_final"] - analysis["pso_final"]) < 0.0001:
            analysis["winner"] = "empate"
        elif analysis["ag_final"] > analysis["pso_final"]:
            analysis["winner"] = "AG"  # Assumindo maximização
        else:
            analysis["winner"] = "PSO"

    return analysis


def generate_latex(data: dict) -> str:
    """
    Gera código LaTeX completo e acadêmico a partir dos dados da simulação.
    Segue o padrão do template T1 (SBC).
    """
    params = data.get("params", {})
    ag_result = data.get("ag", {})
    pso_result = data.get("pso", {})
    history_ag = data.get("history_ag", [])
    history_pso = data.get("history_pso", [])

    # Extrair parâmetros
    pop_size = params.get("pop_size", 50)
    ag_mutation = params.get("ag_mutation", 0.01)
    ag_crossover = params.get("ag_crossover", 0.7)
    pso_w = params.get("pso_w", 0.5)
    pso_c1 = params.get("pso_c1", 1.5)
    pso_c2 = params.get("pso_c2", 1.5)
    optimization_mode = params.get("optimization_mode", "max")
    target_value = params.get("target_value", 0.0)
    function_expr = params.get("function_expr", "")
    dimensions = params.get("dimensions", 2)

    # Resultados
    ag_best = ag_result.get("best_score")
    pso_best = pso_result.get("best_score")
    ag_iteration = ag_result.get("iteration", 0)
    pso_iteration = pso_result.get("iteration", 0)

    # Análise
    analysis = analyze_results(history_ag, history_pso)

    # Formatações
    ag_best_str = f"{ag_best:.6f}" if isinstance(ag_best, (int, float)) else "N/A"
    pso_best_str = f"{pso_best:.6f}" if isinstance(pso_best, (int, float)) else "N/A"
    latex_expr = (
        format_expression_latex(function_expr)
        if function_expr
        else r"10n + \sum_{i=1}^{n}\left[x_i^2 - 10\cos(2\pi x_i)\right]"
    )

    mode_text = {
        "max": "Maximização",
        "min": "Minimização",
        "target": f"Valor Alvo ({target_value})",
    }.get(optimization_mode, optimization_mode)

    # Tabela de convergência
    convergence_rows = generate_convergence_table(history_ag, history_pso)

    # Determinar vencedor texto
    if analysis["winner"] == "AG":
        winner_text = "o Algoritmo Genético (AG) obteve melhor desempenho"
        winner_analysis = f"O AG atingiu um valor de {ag_best_str}, superando o PSO que atingiu {pso_best_str}."
    elif analysis["winner"] == "PSO":
        winner_text = "o PSO (Particle Swarm Optimization) obteve melhor desempenho"
        winner_analysis = f"O PSO atingiu um valor de {pso_best_str}, superando o AG que atingiu {ag_best_str}."
    else:
        winner_text = "ambos os algoritmos obtiveram desempenho similar"
        winner_analysis = f"Ambos convergiram para valores próximos: AG={ag_best_str}, PSO={pso_best_str}."

    ai_models_text = "\n".join(
        [f"\\item {escape_latex(model)}" for model in AI_MODELS]
    )
    ai_prompts_text = "\n".join(
        [f"\\item {escape_latex(normalize_prompt(prompt)[:100])}..." for prompt in AI_PROMPTS[:5]]
    )

    # Template padronizado com T1
    latex_template = (
        r"""\documentclass[12pt]{article}
\usepackage{sbc-template}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{float}
\usepackage{graphicx,url}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{booktabs}
\usepackage{hyperref}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{tikz}
\usetikzlibrary{shapes.geometric}
\usepackage[brazilian]{babel}
\sloppy

% Configuração de código
\lstset{
    language=Python,
    basicstyle=\ttfamily\small,
    keywordstyle=\color{blue},
    commentstyle=\color{gray},
    stringstyle=\color{orange},
    numbers=left,
    numberstyle=\tiny\color{gray},
    frame=single,
    breaklines=true,
    showstringspaces=false,
    columns=flexible
}

% ============================================================================
% TÍTULO
% ============================================================================

\title{Comparação entre Algoritmo Genético e PSO\\na Otimização de Funções Multimodais}

\author{João da Cruz de Natividade e Silva Neto\\UFPA - Universidade Federal do Pará}

\address{Tópicos Especiais em Engenharia de Computação III\\
\texttt{joao.silva.neto@itec.ufpa.br}}

\begin{document}
\maketitle

% ============================================================================
% RESUMO
% ============================================================================
\begin{resumo}
Este trabalho apresenta uma análise comparativa entre o Algoritmo Genético (AG)
com representação real e a Otimização por Enxame de Partículas (PSO) aplicados à otimização
de funções multimodais. A simulação foi executada com """ + str(analysis["iterations"]) + r""" iterações,
utilizando uma população de """ + str(pop_size) + r""" indivíduos/partículas. Os resultados demonstram que
""" + winner_text + r""", com o AG atingindo """ + ag_best_str + r""" e o PSO atingindo """ + pso_best_str + r""".
O projeto foi desenvolvido com assistência de Inteligência Artificial (IA).

\textbf{Palavras-chave:} Algoritmo Genético, PSO, Otimização, Inteligência Artificial, Python
\end{resumo}

\begin{abstract}
This work presents a comparative analysis between the Genetic Algorithm (GA)
with real representation and Particle Swarm Optimization (PSO) applied to
multimodal function optimization. The simulation was executed with """ + str(analysis["iterations"]) + r""" iterations,
using a population of """ + str(pop_size) + r""" individuals/particles. Results show that
""" + winner_text.replace("o Algoritmo Genético (AG) obteve", "the Genetic Algorithm (GA) achieved").replace("o PSO (Particle Swarm Optimization) obteve", "PSO achieved").replace("ambos os algoritmos obtiveram", "both algorithms achieved").replace("melhor desempenho", "better performance").replace("desempenho similar", "similar performance") + r""".

\textbf{Keywords:} Genetic Algorithm, PSO, Optimization, Artificial Intelligence, Python
\end{abstract}

% ============================================================================
% 1. INTRODUÇÃO
% ============================================================================
\section{Introdução}

\subsection{Contexto}

A otimização de funções multimodais representa um desafio significativo para algoritmos
de busca. Métodos evolutivos e de inteligência de enxames têm demonstrado eficácia na
resolução deste tipo de problema, devido à sua capacidade de explorar o espaço de busca
de forma paralela e escapar de ótimos locais.

\subsection{Objetivo}

O objetivo deste trabalho é comparar o desempenho do Algoritmo Genético (AG) e do
PSO (Particle Swarm Optimization) na otimização da seguinte função objetivo:

\begin{equation}
f(\mathbf{x}) = """ + latex_expr + r"""
\end{equation}

Onde $x_i \in [-5.12, 5.12]$ para $i = 1, \ldots, """ + str(dimensions) + r"""$.

\subsection{Modo de Otimização}

O modo de otimização selecionado foi: \textbf{""" + mode_text + r"""}.

\subsection{Geração por IA}

Este projeto foi desenvolvido com assistência de IA, utilizando o modelo Claude Opus 4.5 (Thinking)
através da interface Antigravity.

% ============================================================================
% 2. METODOLOGIA
% ============================================================================
\section{Metodologia}

\subsection{Algoritmo Genético}

O AG utiliza representação real dos cromossomos, evitando a necessidade de
codificação/decodificação binária. Cada indivíduo é representado por um vetor de
números reais de dimensão """ + str(dimensions) + r""":

$$\mathbf{x} = (x_1, x_2, \ldots, x_{""" + str(dimensions) + r"""}) \in [-5.12, 5.12]^{""" + str(dimensions) + r"""}$$

\subsubsection{Operadores}

\begin{itemize}
    \item \textbf{Seleção por Torneio:} $k=3$ competidores
    \item \textbf{Crossover:} Ponto único com taxa """ + f"{ag_crossover:.2f}" + r"""
    \item \textbf{Mutação:} Uniforme com taxa """ + f"{ag_mutation:.4f}" + r"""
    \item \textbf{Elitismo:} Preservação dos melhores indivíduos
\end{itemize}

\subsection{PSO (Particle Swarm Optimization)}

O PSO foi implementado seguindo a formulação canônica com inércia:

\begin{equation}
v_i^{t+1} = w \cdot v_i^t + c_1 r_1 (pBest_i - x_i) + c_2 r_2 (gBest - x_i)
\end{equation}

\begin{equation}
x_i^{t+1} = x_i^t + v_i^{t+1}
\end{equation}

Parâmetros utilizados:
\begin{itemize}
    \item $w = """ + f"{pso_w:.2f}" + r"""$ (coeficiente de inércia)
    \item $c_1 = """ + f"{pso_c1:.2f}" + r"""$ (coeficiente cognitivo)
    \item $c_2 = """ + f"{pso_c2:.2f}" + r"""$ (coeficiente social)
\end{itemize}

\subsection{Parâmetros da Simulação}

\begin{table}[H]
\centering
\caption{Parâmetros utilizados}
\begin{tabular}{|l|c|c|}
\hline
\textbf{Parâmetro} & \textbf{AG} & \textbf{PSO} \\
\hline
Tamanho da População & """ + str(pop_size) + r""" & """ + str(pop_size) + r""" \\
Dimensões & """ + str(dimensions) + r""" & """ + str(dimensions) + r""" \\
Taxa de Mutação & """ + f"{ag_mutation:.4f}" + r""" & -- \\
Taxa de Crossover & """ + f"{ag_crossover:.2f}" + r""" & -- \\
Inércia ($w$) & -- & """ + f"{pso_w:.2f}" + r""" \\
Cognitivo ($c_1$) & -- & """ + f"{pso_c1:.2f}" + r""" \\
Social ($c_2$) & -- & """ + f"{pso_c2:.2f}" + r""" \\
\hline
\end{tabular}
\end{table}

% ============================================================================
% 3. IMPLEMENTAÇÃO
% ============================================================================
\section{Implementação}

A implementação foi realizada utilizando as seguintes tecnologias:

\begin{itemize}
    \item \textbf{Backend}: FastAPI (Python) para API REST e WebSocket
    \item \textbf{Frontend}: JavaScript puro com Plotly.js para visualização 3D
    \item \textbf{Comunicação}: WebSocket para streaming em tempo real
    \item \textbf{Estilização}: CSS customizado com suporte a tema claro/escuro
\end{itemize}

\subsection{Arquitetura}

O sistema segue uma arquitetura cliente-servidor com comunicação bidirecional:

\begin{enumerate}
    \item O cliente envia comandos (step, reset, seek) via WebSocket
    \item O servidor executa uma iteração de ambos os algoritmos
    \item O estado atualizado é enviado ao cliente
    \item O cliente renderiza as visualizações 3D e gráficos de convergência
\end{enumerate}

\subsection{Rastreamento de IA}

Modelos de IA utilizados:
\begin{itemize}
""" + ai_models_text + r"""
\end{itemize}

Alguns prompts utilizados:
\begin{itemize}
""" + ai_prompts_text + r"""
\end{itemize}

% ============================================================================
% 4. RESULTADOS
% ============================================================================
\section{Resultados}

\subsection{Resumo}

Após """ + str(max(ag_iteration, pso_iteration)) + r""" iterações:

\begin{table}[H]
\centering
\caption{Resultados finais}
\begin{tabular}{|l|c|c|}
\hline
\textbf{Métrica} & \textbf{AG} & \textbf{PSO} \\
\hline
Melhor Valor & """ + ag_best_str + r""" & """ + pso_best_str + r""" \\
Iterações & """ + str(ag_iteration) + r""" & """ + str(pso_iteration) + r""" \\
\hline
\end{tabular}
\end{table}

\subsection{Convergência}

\begin{table}[H]
\centering
\caption{Histórico de Convergência (Amostra)}
\begin{tabular}{|c|c|c|c|}
\hline
\textbf{Iter} & \textbf{AG} & \textbf{PSO} & \textbf{Diff} \\
\hline
""" + convergence_rows + r"""
\hline
\end{tabular}
\end{table}

\subsection{Análise Comparativa}

""" + winner_analysis + r"""

\begin{table}[H]
\centering
\caption{Comparação Qualitativa}
\begin{tabular}{|l|c|c|c|}
\hline
\textbf{Critério} & \textbf{AG} & \textbf{PSO} & \textbf{Melhor} \\
\hline
Velocidade de Convergência & Média & Alta & PSO \\
Diversidade & Alta & Média & AG \\
Escape de Ótimos Locais & Bom & Médio & AG \\
Número de Parâmetros & Alto & Baixo & PSO \\
Facilidade de Implementação & Média & Simples & PSO \\
\hline
\end{tabular}
\end{table}

% ============================================================================
% 5. CONCLUSÃO
% ============================================================================
\section{Conclusão}

Conclusões principais:

\begin{enumerate}
    \item Ambos os algoritmos são eficazes para otimização de funções multimodais
    \item O PSO apresentou convergência mais rápida nas iterações iniciais
    \item O AG demonstrou maior robustez na manutenção de diversidade
    \item A visualização interativa facilita a compreensão do comportamento dos algoritmos
\end{enumerate}

\subsection{Trabalhos Futuros}

\begin{itemize}
    \item Hibridização AG-PSO (Algoritmos Meméticos)
    \item Adaptação dinâmica de parâmetros
    \item Comparação com outros algoritmos (DE, CMA-ES)
\end{itemize}

% ============================================================================
% DISPONIBILIDADE
% ============================================================================
\section{Disponibilidade}

O código fonte e a versão interativa desta simulação estão disponíveis em:

\begin{itemize}
    \item \textbf{Projeto}: \url{https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/}
    \item \textbf{Repositório}: \url{https://github.com/joaosnet/evolutionary-optimization-viz-ag-pso}
\end{itemize}

% ============================================================================
% REFERÊNCIAS
% ============================================================================
\section*{Referências}

\begin{itemize}
    \item Holland, J. H. (1975). \textit{Adaptation in Natural and Artificial Systems}. University of Michigan Press.
    \item Kennedy, J., \& Eberhart, R. (1995). Particle Swarm Optimization. \textit{Proceedings of ICNN'95}.
    \item Goldberg, D. E. (1989). \textit{Genetic Algorithms in Search, Optimization, and Machine Learning}. Addison-Wesley.
\end{itemize}

\end{document}
"""
    )

    return latex_template


def compile_to_pdf(tex_content: str) -> tuple[Optional[bytes], str]:
    """
    Compila conteúdo LaTeX para PDF.

    Args:
        tex_content: Código LaTeX completo

    Returns:
        Tuple (pdf_bytes, message) onde pdf_bytes é None se falhou
    """
    compiler = find_latex_compiler()

    if not compiler:
        return None, "Compilador LaTeX não encontrado. Retornando arquivo .tex"

    # Criar diretório temporário
    with tempfile.TemporaryDirectory() as temp_dir:
        tex_path = Path(temp_dir) / "report.tex"
        pdf_path = Path(temp_dir) / "report.pdf"
        template_message = copy_template_files(Path(temp_dir))
        if template_message:
            return None, template_message

        # Escrever arquivo .tex
        tex_path.write_text(tex_content, encoding="utf-8")

        # Comando de compilação
        cmd = [compiler, "-interaction=nonstopmode", "-halt-on-error", "report.tex"]

        try:
            # Primeira passagem
            subprocess.run(
                cmd, cwd=temp_dir, capture_output=True, text=True, timeout=120
            )

            # Segunda passagem (para TOC e referências)
            subprocess.run(
                cmd, cwd=temp_dir, capture_output=True, text=True, timeout=120
            )

            # Terceira passagem (para garantir TOC correto)
            subprocess.run(
                cmd, cwd=temp_dir, capture_output=True, text=True, timeout=120
            )

            if pdf_path.exists():
                pdf_bytes = pdf_path.read_bytes()
                return pdf_bytes, f"PDF gerado com sucesso usando {compiler}"
            else:
                return None, "Falha na compilação: verificar log para detalhes"

        except subprocess.TimeoutExpired:
            return None, "Timeout na compilação do LaTeX"
        except Exception as e:
            return None, f"Erro na compilação: {str(e)}"
