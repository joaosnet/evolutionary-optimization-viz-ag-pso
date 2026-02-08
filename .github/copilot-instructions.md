# Copilot Instructions — Evolutionary Optimization Viz

## Architecture

Client-only static site (GitHub Pages). No backend. All logic runs in the browser.

**Script load order** (in `index.html`):
`base.js → ga.js → pso.js → ed.js → benchmarks.js → report.js → main.js`

Classes depend on globals set by earlier scripts (e.g., `OptimizationAlgorithm`, `ArrayUtils`).

| File | Role |
|------|------|
| `static/js/algorithms/base.js` | `OptimizationAlgorithm` base class, `ArrayUtils`, `ExpressionEvaluator` |
| `static/js/algorithms/ga.js` | `GeneticAlgorithm extends OptimizationAlgorithm` |
| `static/js/algorithms/pso.js` | `ParticleSwarmOptimization extends OptimizationAlgorithm` |
| `static/js/algorithms/ed.js` | `DifferentialEvolution extends OptimizationAlgorithm` (DE/rand/1/bin) |
| `static/js/benchmarks.js` | Benchmark functions catalog |
| `static/js/report.js` | PDF report generator — modular section system (`REPORT_SECTIONS` array) |
| `static/js/main.js` | Application orchestrator — DOM, Plotly plots, simulation loop, benchmark runner, i18n |
| `index.html` | Single-page app entry point |

## Algorithm Pattern

Every algorithm extends `OptimizationAlgorithm` and must implement `step()`. Key interface:
- `snapshotState()` / `restoreState(snapshot)` — iteration navigation
- `recordState()` — push snapshot to history
- `checkConvergence()` — auto-detect stagnation
- `isBetter(a, b)` — respects `optimizationMode` (min/max/target)

Dual-export pattern for browser + Jest:
```js
class MyAlgo extends OptimizationAlgorithm { /* ... */ }
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MyAlgo };
}
```

## Report System (`report.js`)

The PDF report is built from `REPORT_SECTIONS` — an ordered array of `{ id, title, render(ctx) }` objects. To add/remove/reorder sections, edit this array. `ctx` provides `{ layout, data, images }` where `layout` is a `PdfLayout` instance with column-aware helpers (`addText`, `addTable`, `addImage`, `addBullet`, `checkSpace`, `nextColumn`).

Section numbering is **dynamic** — it adjusts based on whether benchmark data exists and which algorithms are enabled. When only 1 algorithm is selected, comparative language is suppressed throughout (title, abstract, benchmark wins, conclusions).

Key constants: `REPORT_CONFIG`, `ALG_NAMES`, `REPORT_REFERENCES`, `ED_DEVELOPMENT_HISTORY`.

## Key Globals in `main.js`

- `benchmarkResults`, `benchmarkWins`, `benchmarkRunIndex`, `benchmarkItersPerRun` — read by `report.js`
- `historyCache.{ag,pso,ed}` — convergence data arrays
- `getEnabledAlgorithms()` → `{ ag: bool, pso: bool, ed: bool }`
- `getEnabledKeys()` → `['ag','pso','ed']` filtered to enabled
- `computeStats(arr)` → `{ mean, std, best, worst, median }`
- `currentExpression`, `currentDimensions`, `currentIteration`

## Commands

```bash
npm test              # Jest — 30 tests in tests/algorithms.test.js
npx serve .           # Local dev server
```

## CI (`.github/workflows/ci.yml`)

- Node 18 + 20 matrix
- `npm test` then `npx acorn --ecma2022` on every JS file under `static/js/`
- **Any new `.js` file must be added to the acorn lint step**
- Use ES2022 syntax max (class fields OK, top-level await NOT OK)

## Testing Conventions

Tests live in `tests/algorithms.test.js`. The test file sets globals to mimic browser script order:
```js
global.OptimizationAlgorithm = OptimizationAlgorithm;
global.ArrayUtils = ArrayUtils;
```
Use `sphereFunction` (sum of squares) as test fitness function. Each algorithm should have: init, step, bounds, snapshot/restore, convergence tests.

## i18n

Manual EN/PT-BR dictionary in `main.js` (`translations` object). HTML elements use `data-i18n="key"` attributes. No i18n framework.

## Styling

Single CSS file `static/css/style.css`. Algorithm cards use theme colors:
- AG: `#2563eb` (blue) | PSO: `#f59e0b` (amber) | ED: `#be123c` (rose)

Grid layout adapts dynamically: 1/2/3 columns based on enabled algorithm count.
