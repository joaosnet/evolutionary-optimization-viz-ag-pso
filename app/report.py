"""
Módulo de Geração de Relatório LaTeX/PDF Completo

Gera relatórios acadêmicos completos a partir dos resultados da simulação AG vs PSO,
seguindo o template SBC (2025-2026).
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
    "gemini 3 pro",
    "claude opus 4.5",
    "gpt-5.2-codex",
]

AI_PROMPTS = [
    "Gere imagens de dashboard minimalista moderno realista com AG vs Enxame de Partículas",
    'Gostei do "clean minimalist bright dashboard UI design, comparison between Genetic Algorithm (AG) and Particle Swarm (PSO), elegant charts, soft shadows, realistic render, data visualization, high end interface, 8k" implemente ele em html css javascript com animacoes, e a parte logica implemente em python, conecte tudo com fastapi no python 3.14.2 freetreat',
    "Proponha melhorias no front end do dashboard",
    "quero poder ajustar os graficos 3d diretamente na interface, e eles por padrao estao tornando dificil ver as particulas",
    "tem que ser possivel trocar de otimizacao, ou seja pode ser de maximizacao, minimizacao ou outro",
    "Quero poder trocar a funcao de interesse, para isso preciso de um campo para trocar que possua um teclado virtual para funcoes matematicas, alem disso corrija os : que estao ficando quebrados onde sao usados,Melhore os botoes de trocar de tema para que tenha uma animacao de formato circular na tela toda de troca de tema quando forem clicados, os botoes devem ser modernos, e os botoes de troca de traducao devem ser mais modernos",
    "Quero poder trocar a funcao de interesse, para isso preciso de um campo para trocar que possua um teclado virtual para funcoes matematicas, alem disso corrija os : que estao ficando quebrados onde sao usados",
    "refaça essa parte da expressao matematica por completo para usar corretamente o mathjs e o teclado deveria ser virtual",
    "o teclado virtual deveria ser completo o que vem padrao do mathjs",
    "A funcao padrao que deve vir no teclado é a da imagem",
    "não está dando para resetar",
    "Ainda não é possivel resetar ao estado inicial, de poder voltar a qualquer iteracao",
    'syntax error in part "∗(x1^2+x2^2))^2)" (char 44',
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
    date_str = datetime.now().strftime("%d de %B de %Y")

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
        [f"\\item {escape_latex(normalize_prompt(prompt))}" for prompt in AI_PROMPTS]
    )

    latex_template = (
        r"""\documentclass[12pt]{article}
\usepackage{sbc-template}
\usepackage[utf8]{inputenc}
\usepackage[brazil]{babel}
\usepackage{graphicx,url}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{float}
\usepackage{booktabs}
\usepackage{hyperref}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{fancyvrb}
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

\title{Comparação entre Algoritmo Genético e PSO\\na Otimização de Funções Multimodais}
\author{João da Cruz de Natividade e Silva Neto}

\address{UFPA -- Universidade Federal do Pará\\
Gerado em: """
        + date_str
        + r"""}

\begin{document}

\maketitle

\begin{abstract}
Este relatório apresenta uma análise comparativa detalhada entre o Algoritmo Genético (AG) 
com representação real e a Otimização por Enxame de Partículas (PSO) aplicados à otimização
de funções multimodais. A simulação foi executada com """
        + str(analysis["iterations"])
        + r""" iterações,
utilizando uma população de """
        + str(pop_size)
        + r""" indivíduos/partículas. Os resultados demonstram que
"""
        + winner_text
        + r""", com o AG atingindo """
        + ag_best_str
        + r""" e o PSO atingindo """
        + pso_best_str
        + r""".
Este documento inclui a fundamentação teórica, detalhes de implementação, parâmetros utilizados,
análise de convergência e conclusões baseadas nos dados experimentais obtidos.
\end{abstract}

\begin{resumo}
Este artigo registra a implementação da simulação AG vs PSO e inclui a rastreabilidade dos prompts
e modelos de IA utilizados durante o desenvolvimento.
\end{resumo}

%==============================================================================
\section{Introdução}
%==============================================================================

A otimização de funções multimodais representa um desafio significativo para algoritmos
de busca. Métodos evolutivos e de inteligência de enxames têm demonstrado eficácia na
resolução deste tipo de problema, devido à sua capacidade de explorar o espaço de busca
de forma paralela e escapar de ótimos locais.

Este relatório documenta uma simulação interativa que compara dois dos mais populares
algoritmos metaheurísticos: o Algoritmo Genético (AG) e a Otimização por Enxame de
Partículas (PSO, do inglês \textit{Particle Swarm Optimization}).

\subsection{Função Objetivo}

A função objetivo utilizada nesta simulação é definida como:

\begin{equation}
f(\mathbf{x}) = """
        + latex_expr
        + r"""
\end{equation}

O domínio de busca é $x_i \in [-5.12, 5.12]$ para $i = 1, \ldots, """
        + str(dimensions)
        + r"""$.

\subsection{Modo de Otimização}

O modo de otimização selecionado foi: \textbf{"""
        + mode_text
        + r"""}.

\begin{itemize}
    \item \textbf{Maximização}: Busca pelo maior valor possível da função objetivo
    \item \textbf{Minimização}: Busca pelo menor valor possível da função objetivo
    \item \textbf{Valor Alvo}: Busca por um valor específico, minimizando a diferença absoluta
\end{itemize}

%==============================================================================
\section{Fundamentação Teórica}
%==============================================================================

\subsection{Algoritmo Genético}

O Algoritmo Genético (AG) é uma metaheurística inspirada no processo de seleção natural
de Darwin. A implementação utilizada emprega representação real dos cromossomas,
evitando a necessidade de codificação/decodificação binária.

\subsubsection{Representação}

Cada indivíduo é representado por um vetor de números reais de dimensão """
        + str(dimensions)
        + r""":
$$\mathbf{x} = (x_1, x_2, \ldots, x_{"""
        + str(dimensions)
        + r"""}) \in [-5.12, 5.12]^{"""
        + str(dimensions)
        + r"""}$$

\subsubsection{Seleção por Torneio}

A seleção por torneio com $k=3$ competidores foi escolhida pela sua simplicidade e
capacidade de manter pressão seletiva adequada:

\begin{lstlisting}[caption={Seleção}, label={lst:sel}, basicstyle=\ttfamily\scriptsize]
def tournament_selection(pop, k=3):
    cands = random.sample(pop, k)
    return max(cands, key=lambda i: i.fit)
\end{lstlisting}

\subsubsection{Crossover BLX-$\alpha$}

O operador de crossover Blend (BLX-$\alpha$) com $\alpha = 0.5$ permite exploração
além dos limites definidos pelos pais:

\begin{equation}
c_i = rand(min_i - \alpha d_i, max_i + \alpha d_i)
\end{equation}

onde $d_i = |p1_i - p2_i|$ é a distância entre os pais na dimensão $i$.

\subsubsection{Mutação Gaussiana}

A mutação utiliza perturbação gaussiana com desvio padrão configurável:

\begin{equation}
x'_i = x_i + \mathcal{N}(0, \sigma)
\end{equation}

onde $\sigma$ é proporcional à taxa de mutação configurada ("""
        + f"{ag_mutation:.4f}"
        + r""").

\subsubsection{Elitismo}

Os melhores indivíduos são preservados a cada geração, garantindo monotonia
no melhor fitness encontrado e evitando perda de boas soluções.

%------------------------------------------------------------------------------
\subsection{PSO}
%------------------------------------------------------------------------------

O PSO foi implementado seguindo a formulação canônica com inércia, inspirado no
comportamento coletivo de bandos de pássaros e cardumes de peixes.

\subsubsection{Atualização de Velocidade}

\begin{equation}
\begin{split}
v_i^{t+1} = w \cdot v_i^t &+ c_1 r_1 (pBest_i - x_i)\\
&+ c_2 r_2 (gBest - x_i)
\end{split}
\end{equation}

onde:
\begin{itemize}
    \item $w = """
        + f"{pso_w:.2f}"
        + r"""$ é o coeficiente de inércia
    \item $c_1 = """
        + f"{pso_c1:.2f}"
        + r"""$ é o coeficiente cognitivo
    \item $c_2 = """
        + f"{pso_c2:.2f}"
        + r"""$ é o coeficiente social
    \item $r_1, r_2 \sim U(0,1)$ são aleatórios
\end{itemize}

\subsubsection{Atualização de Posição}

\begin{equation}
x_i^{t+1} = x_i^t + v_i^{t+1}
\end{equation}

A velocidade máxima é limitada para evitar explosão do enxame e garantir
convergência estável.

%==============================================================================
\section{Implementação}
%==============================================================================

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
    \item O estado atualizado (populações, fitness, histórico) é enviado ao cliente
    \item O cliente renderiza as visualizações 3D e gráficos de convergência
\end{enumerate}

\subsection{Fluxo de Dados e Integração}

\begin{itemize}
    \item Interface web coleta parâmetros (população, mutação, crossover, inércia, modo de otimização e função objetivo).
    \item O backend converte a expressão via \texttt{numexpr} e valida símbolos permitidos.
    \item As iterações são executadas com envio incremental do estado via WebSocket.
    \item O relatório é gerado como \LaTeX{} e compilado para PDF quando o compilador está disponível.
\end{itemize}

\subsection{Detalhes dos Algoritmos}

\textbf{Algoritmo Genético (AG).} Implementado com seleção por torneio, crossover de ponto único e mutação uniforme:
\begin{lstlisting}[caption={Ciclo do AG}, basicstyle=\ttfamily\scriptsize]
scores = update_best()
selected = tournament_selection(scores)
next_pop = crossover(selected)
mutation()
record_state()
\end{lstlisting}

\textbf{PSO.} Atualiza velocidades e posições considerando inércia, componentes cognitivo e social:
\begin{lstlisting}[caption={Ciclo do PSO}, basicstyle=\ttfamily\scriptsize]
r1, r2 = random_coeffs()
v = w*v + c1*r1*(pbest-x) + c2*r2*(gbest-x)
x = x + v
clip_bounds(x)
record_state()
\end{lstlisting}

\subsection{Rastreamento de IA}

Os modelos de IA utilizados para suporte à implementação e geração de código foram:
\begin{itemize}
"""
        + ai_models_text
        + r"""
\end{itemize}

Prompts utilizados:
\begin{itemize}
"""
        + ai_prompts_text
        + r"""
\end{itemize}

Template SBC (2025-2026) utilizado: \url{"""
        + TEMPLATE_SOURCE_URL
        + r"""}.

\subsection{Função Rastrigin (Padrão)}

A função Rastrigin é um benchmark clássico para algoritmos de otimização:

\begin{lstlisting}[caption={Rastrigin}, basicstyle=\ttfamily\scriptsize]
def rastrigin(x):
  A = 10
  n = len(x)
  return A*n+sum(x**2-A*np.cos(2*np.pi*x))
\end{lstlisting}

%==============================================================================
\section{Configuração Experimental}
%==============================================================================

\begin{table}[H]
\centering
\caption{Parâmetros da simulação}
\resizebox{\columnwidth}{!}{
\begin{tabular}{lcc}
\toprule
\textbf{Parâmetro} & \textbf{AG} & \textbf{PSO} \\
\midrule
Pop./Enxame & """
        + str(pop_size)
        + r""" & """
        + str(pop_size)
        + r""" \\
Dimensões & """
        + str(dimensions)
        + r""" & """
        + str(dimensions)
        + r""" \\
Mutação & """
        + f"{ag_mutation:.4f}"
        + r""" & -- \\
Crossover & """
        + f"{ag_crossover:.2f}"
        + r""" & -- \\
Inércia ($w$) & -- & """
        + f"{pso_w:.2f}"
        + r""" \\
Cog. ($c_1$) & -- & """
        + f"{pso_c1:.2f}"
        + r""" \\
Soc. ($c_2$) & -- & """
        + f"{pso_c2:.2f}"
        + r""" \\
\midrule
Modo & \multicolumn{2}{c}{"""
        + mode_text
        + r"""} \\
\bottomrule
\end{tabular}
}
\end{table}

%==============================================================================
\section{Resultados}
%==============================================================================

\subsection{Resumo}

Após """
        + str(max(ag_iteration, pso_iteration))
        + r""" iterações:

\begin{table}[H]
\centering
\caption{Resultados finais}
\resizebox{\columnwidth}{!}{
\begin{tabular}{lcc}
\toprule
\textbf{Métrica} & \textbf{AG} & \textbf{PSO} \\
\midrule
Melhor Valor & """
        + ag_best_str
        + r""" & """
        + pso_best_str
        + r""" \\
Iterações & """
        + str(ag_iteration)
        + r""" & """
        + str(pso_iteration)
        + r""" \\
\bottomrule
\end{tabular}
}
\end{table}

\subsection{Convergência}

\begin{table}[H]
\centering
\caption{Histórico (Amostra)}
\resizebox{\columnwidth}{!}{
\begin{tabular}{cccc}
\toprule
\textbf{Iter} & \textbf{AG} & \textbf{PSO} & \textbf{Diff} \\
\midrule
"""
        + convergence_rows
        + r"""
\bottomrule
\end{tabular}
}
\end{table}

\subsection{Análise Comparativa}

"""
        + winner_analysis
        + r"""

\begin{table}[H]
\centering
\caption{Comparação Qualitativa}
\resizebox{\columnwidth}{!}{
\begin{tabular}{lccc}
\toprule
\textbf{Critério} & \textbf{AG} & \textbf{PSO} & \textbf{Top} \\
\midrule
Velocidade & Med & Alta & PSO \\
Diversidade & Alta & Med & AG \\
Escape Ót. Locais & Bom & Med & AG \\
Parâmetros & Alto & Baixo & PSO \\
Implementação & Med & Simples & PSO \\
\bottomrule
\end{tabular}
}
\end{table}

%==============================================================================
\section{Discussão}
%==============================================================================

\subsection{Algoritmo Genético}

O AG demonstrou:
\begin{itemize}
    \item Manutenção de diversidade genética via mutação
    \item Exploração eficiente inicial
    \item Robustez contra mínimos locais
\end{itemize}

\subsection{PSO}

O PSO apresentou:
\begin{itemize}
    \item Convergência rápida inicial
    \item Balanço exploração/explotação
    \item Menor número de parâmetros
\end{itemize}

%==============================================================================
\section{Conclusões}
%==============================================================================

Conclusões principais:
\begin{enumerate}
    \item Ambos otimizam bem funções multimodais
    \item PSO converge mais rápido inicialmente
    \item AG oferece maior robustez
    \item A visualização facilita a compreensão
\end{enumerate}

\subsection{Trabalhos Futuros}

\begin{itemize}
    \item Hibridização (Meméticos)
    \item Adaptação de parâmetros
    \item Comparação com DE/CMA-ES
\end{itemize}

%==============================================================================
\section{Disponibilidade}
%==============================================================================

O código fonte e a versão interativa desta simulação estão disponíveis em:

\begin{itemize}
    \item \textbf{Projeto}: \url{https://joaosnet.github.io/evolutionary-optimization-viz-ag-pso/}
    \item \textbf{Repositório}: \url{https://github.com/joaosnet/evolutionary-optimization-viz-ag-pso}
\end{itemize}

%==============================================================================
\section*{Informações}
%==============================================================================

Relatório gerado a partir de simulação computacional.
\begin{itemize}
    \item \textbf{Data}: """
        + datetime.now().strftime("%d/%m/%y %H:%M")
        + r"""
    \item \textbf{Iter}: """
        + str(max(ag_iteration, pso_iteration))
        + r"""
    \item \textbf{Pop}: """
        + str(pop_size)
        + r"""
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
