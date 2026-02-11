/**
 * Wrapper for SwiftLaTeX PdfTeX Enigne
 * Handles loading the engine, writing files to MemFS, and compilation.
 */

let engineInstance = null;

async function getEngine() {
    if (engineInstance) return engineInstance;

    // Ensure PdfTeXEngine is loaded globally via script tag
    if (typeof PdfTeXEngine === 'undefined') {
        throw new Error('PdfTeXEngine.js not loaded');
    }

    engineInstance = new PdfTeXEngine();
    await engineInstance.loadEngine();
    return engineInstance;
}

/**
 * Compiles a LaTeX source string to PDF blob.
 * @param {string} latexSource - The full LaTeX document source.
 * @param {Object} images - Map of filename -> base64 string (data URI) or Uint8Array.
 * @param {Function} onStatus - Optional callback for status updates.
 * @returns {Promise<Blob>} - The PDF blob.
 */
export async function compileLatexToPdf(latexSource, images = {}, onStatus) {
    if (onStatus) onStatus('Carregando engine LaTeX...');

    const engine = await getEngine();

    if (onStatus) onStatus('Escrevendo arquivos...');

    // Write main.tex
    engine.writeMemFSFile("main.tex", latexSource);

    // Write images
    for (const [filename, data] of Object.entries(images)) {
        let binaryData;
        if (typeof data === 'string' && data.startsWith('data:')) {
            // Convert base64 data URI to Uint8Array
            const base64 = data.split(',')[1];
            const binaryString = atob(base64);
            const len = binaryString.length;
            binaryData = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                binaryData[i] = binaryString.charCodeAt(i);
            }
        } else if (data instanceof Uint8Array) {
            binaryData = data;
        } else {
            console.warn(`Skipping image ${filename}: unknown format`);
            continue;
        }

        // Ensure filenames are simple (no paths) and have .png extension if missing
        let cleanName = filename.split('/').pop();
        if (!cleanName.toLowerCase().endsWith('.png')) {
            cleanName += '.png';
        }
        engine.writeMemFSFile(cleanName, binaryData);
    }

    engine.setEngineMainFile("main.tex");

    if (onStatus) onStatus('Compilando LaTeX (pode demorar)...');

    const result = await engine.compileLaTeX();

    // Check log for errors even if status is 0, sometimes it fails silently or produces bad PDF
    // But usually status 0 means success.

    if (result.status !== 0) {
        console.error('LaTeX Compilation Log:', result.log);
        throw new Error('Erro na compilação LaTeX. Veja o console para o log completo.');
    }

    return new Blob([result.pdf], { type: 'application/pdf' });
}
