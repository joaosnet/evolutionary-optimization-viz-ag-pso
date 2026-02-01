#!/usr/bin/env python3
"""
Compilador de Relatório LaTeX para PDF

Este script compila o relatório LaTeX para PDF usando pdflatex ou xelatex.
Requer uma instalação do LaTeX (TeXLive, MiKTeX, etc.)

Uso:
    python compilar_relatorio.py

Requisitos:
    - Python 3.6+
    - LaTeX instalado (pdflatex ou xelatex no PATH)
"""

import subprocess
import os
import sys
import shutil
from pathlib import Path


def find_latex_compiler():
    """Encontra o compilador LaTeX disponível no sistema."""
    compilers = ['pdflatex', 'xelatex', 'lualatex']
    
    for compiler in compilers:
        if shutil.which(compiler):
            return compiler
    
    return None


def compile_latex(tex_file: str, output_dir: str = None, compiler: str = None):
    """
    Compila um ficheiro .tex para PDF.
    
    Args:
        tex_file: Caminho para o ficheiro .tex
        output_dir: Diretório de saída (opcional)
        compiler: Compilador a usar (pdflatex, xelatex, etc.)
    
    Returns:
        bool: True se compilou com sucesso
    """
    tex_path = Path(tex_file).resolve()
    
    if not tex_path.exists():
        print(f"❌ Erro: Ficheiro não encontrado: {tex_file}")
        return False
    
    # Encontrar compilador
    if compiler is None:
        compiler = find_latex_compiler()
        if compiler is None:
            print("❌ Erro: Nenhum compilador LaTeX encontrado!")
            print("   Instale o TeXLive ou MiKTeX:")
            print("   - Windows: https://miktex.org/download")
            print("   - Linux: sudo apt install texlive-full")
            print("   - macOS: brew install --cask mactex")
            return False
    
    print(f"📄 Compilando {tex_path.name} com {compiler}...")
    
    # Diretório de trabalho
    work_dir = tex_path.parent
    
    # Comandos de compilação (2 passagens para referências)
    cmd = [
        compiler,
        '-interaction=nonstopmode',
        '-halt-on-error',
        tex_path.name
    ]
    
    if output_dir:
        cmd.insert(1, f'-output-directory={output_dir}')
    
    try:
        # Primeira passagem
        print("   → Passagem 1/2...")
        result = subprocess.run(
            cmd,
            cwd=work_dir,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        # Segunda passagem (para referências e índice)
        print("   → Passagem 2/2...")
        result = subprocess.run(
            cmd,
            cwd=work_dir,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            pdf_name = tex_path.stem + '.pdf'
            pdf_path = work_dir / pdf_name
            print(f"✅ PDF gerado com sucesso: {pdf_path}")
            return True
        else:
            print(f"❌ Erro na compilação!")
            print("   Verifique o ficheiro .log para detalhes.")
            # Mostrar últimas linhas do erro
            error_lines = result.stdout.split('\n')[-20:]
            for line in error_lines:
                if line.strip():
                    print(f"   {line}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Timeout: A compilação demorou demasiado.")
        return False
    except FileNotFoundError:
        print(f"❌ Erro: Compilador '{compiler}' não encontrado no PATH.")
        return False


def clean_aux_files(tex_file: str):
    """Remove ficheiros auxiliares gerados pelo LaTeX."""
    tex_path = Path(tex_file).resolve()
    work_dir = tex_path.parent
    stem = tex_path.stem
    
    aux_extensions = ['.aux', '.log', '.out', '.toc', '.lof', '.lot', '.bbl', '.blg', '.nav', '.snm']
    
    print("🧹 Limpando ficheiros auxiliares...")
    for ext in aux_extensions:
        aux_file = work_dir / (stem + ext)
        if aux_file.exists():
            aux_file.unlink()
            print(f"   Removido: {stem}{ext}")


def main():
    """Função principal."""
    print("=" * 60)
    print("  Compilador de Relatório LaTeX - AG vs PSO")
    print("=" * 60)
    print()
    
    # Encontrar o ficheiro .tex
    script_dir = Path(__file__).parent
    tex_file = script_dir / "relatorio.tex"
    
    if not tex_file.exists():
        print(f"❌ Erro: Ficheiro relatorio.tex não encontrado em {script_dir}")
        sys.exit(1)
    
    # Compilar
    success = compile_latex(str(tex_file))
    
    if success:
        # Limpar ficheiros auxiliares
        clean_aux_files(str(tex_file))
        print()
        print("🎉 Compilação concluída com sucesso!")
        print(f"   Abra o ficheiro: {tex_file.stem}.pdf")
    else:
        print()
        print("💡 Dica: Se não tem LaTeX instalado, pode usar um editor online:")
        print("   - Overleaf: https://www.overleaf.com")
        print("   - Papeeria: https://papeeria.com")
        sys.exit(1)


if __name__ == "__main__":
    main()
