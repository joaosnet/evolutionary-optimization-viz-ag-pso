/**
 * Base Optimization Algorithm - JavaScript Port
 * Provides foundation for GA and PSO implementations
 */

// Helper functions (replaces numpy operations)
const ArrayUtils = {
    // Create 2D array filled with random uniform values between bounds
    randomUniform2D(rows, cols, lowBounds, highBounds) {
        const arr = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                const low = Array.isArray(lowBounds) ? lowBounds[j] : lowBounds;
                const high = Array.isArray(highBounds) ? highBounds[j] : highBounds;
                row.push(low + Math.random() * (high - low));
            }
            arr.push(row);
        }
        return arr;
    },

    // Create 2D array filled with zeros
    zeros2D(rows, cols) {
        return Array.from({ length: rows }, () => Array(cols).fill(0));
    },

    // Create 1D array filled with value
    fill1D(length, value) {
        return Array(length).fill(value);
    },

    // Deep copy 2D array
    copy2D(arr) {
        return arr.map(row => [...row]);
    },

    // Deep copy 1D array
    copy1D(arr) {
        return [...arr];
    },

    // Get column from 2D array
    getColumn(arr, colIndex) {
        return arr.map(row => row[colIndex]);
    },

    // Clip values in array between min and max
    clip(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Find index of max value
    argMax(arr) {
        return arr.reduce((maxIdx, val, idx, array) => val > array[maxIdx] ? idx : maxIdx, 0);
    },

    // Find index of min value
    argMin(arr) {
        return arr.reduce((minIdx, val, idx, array) => val < array[minIdx] ? idx : minIdx, 0);
    },

    // Random integer in range [0, max)
    randInt(max) {
        return Math.floor(Math.random() * max);
    },

    // Array of random integers
    randIntArray(count, max) {
        return Array.from({ length: count }, () => this.randInt(max));
    }
};

/**
 * Rastrigin benchmark function
 * Global minimum at (0, 0, ..., 0) with value 0
 */
function rastrigin(population) {
    const A = 10;
    const dim = population[0].length;
    return population.map(individual => {
        let sum = A * dim;
        for (let i = 0; i < dim; i++) {
            sum += individual[i] ** 2 - A * Math.cos(2 * Math.PI * individual[i]);
        }
        return sum;
    });
}

/**
 * Expression evaluation using math.js
 * Replaces numexpr functionality
 */
class ExpressionEvaluator {
    static ALLOWED_FUNCTIONS = new Set([
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
        'sinh', 'cosh', 'tanh', 'sqrt', 'abs', 'exp',
        'log', 'log10'
    ]);

    static normalizeExpression(expr) {
        if (!expr) return '';
        expr = expr.trim();
        // Replace unicode math symbols
        expr = expr.replace(/[\u2217\u22C5\u00D7]/g, '*');
        expr = expr.replace(/[\u2212\u2012\u2013\u2014]/g, '-');
        // Replace ln with log (natural log in math.js)
        expr = expr.replace(/\bln\b/g, 'log');
        // Replace x_{1} or x_1 with x1
        expr = expr.replace(/x_\{?\s*(\d+)\s*\}?/g, 'x$1');
        // Replace ^ with ** (though math.js handles ^ natively)
        expr = expr.replace(/\^/g, '^');
        return expr;
    }

    static validate(expr, dimensions) {
        if (!expr || !expr.trim()) {
            return { valid: false, error: 'Expression is empty.' };
        }
        if (typeof dimensions !== 'number' || dimensions < 2) {
            return { valid: false, error: 'Dimensions must be at least 2.' };
        }

        const normalized = this.normalizeExpression(expr);

        // Extract identifiers
        const identifiers = new Set(normalized.match(/[A-Za-z_]\w*/g) || []);

        // Build allowed symbols set
        const allowedVars = new Set();
        for (let i = 1; i <= dimensions; i++) {
            allowedVars.add(`x${i}`);
        }
        const allowedConsts = new Set(['pi', 'e', 'PI', 'E']);
        const allowedSymbols = new Set([...allowedVars, ...allowedConsts, ...this.ALLOWED_FUNCTIONS]);

        // Check for unknown symbols
        const unknown = [...identifiers].filter(name => !allowedSymbols.has(name));

        if (unknown.length > 0) {
            return { valid: false, error: `Unsupported symbol(s): ${unknown.join(', ')}` };
        }

        return { valid: true, normalized };
    }

    static buildFunction(expr, dimensions) {
        const validation = this.validate(expr, dimensions);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const normalized = validation.normalized;

        // Compile the expression with math.js
        let compiled;
        try {
            compiled = math.compile(normalized);
        } catch (e) {
            throw new Error(`Invalid expression: ${e.message}`);
        }

        // Return a function that evaluates the population
        return function (population) {
            return population.map(individual => {
                const scope = { pi: Math.PI, e: Math.E, PI: Math.PI, E: Math.E };
                for (let i = 0; i < dimensions; i++) {
                    scope[`x${i + 1}`] = individual[i];
                }
                try {
                    return compiled.evaluate(scope);
                } catch (e) {
                    return NaN;
                }
            });
        };
    }
}

/**
 * Base class for optimization algorithms
 */
class OptimizationAlgorithm {
    constructor(func, bounds, populationSize, dimensions, options = {}) {
        this.func = func;
        this.bounds = bounds; // Array of [min, max] for each dimension
        this.popSize = populationSize;
        this.dim = dimensions;
        this.optimizationMode = this._normalizeMode(options.optimizationMode || 'max');
        this.targetValue = parseFloat(options.targetValue || 0.0);
        this.bestSolution = null;
        this.bestObjective = this._initialBestObjective();
        this.bestScore = this._initialBestScore();
        this.history = [];
        this.iteration = 0;

        // Convergence detection
        this.convergenceThreshold = parseFloat(options.convergenceThreshold || 1e-6);
        this.convergenceWindow = parseInt(options.convergenceWindow || 20);
        this.scoreHistory = [];
        this.converged = false;

        // Population will be set by subclass
        this.population = null;
    }

    _normalizeMode(mode) {
        if (!mode) return 'min';
        mode = String(mode).toLowerCase().trim();
        return ['min', 'max', 'target'].includes(mode) ? mode : 'min';
    }

    _initialBestObjective() {
        return this.optimizationMode === 'max' ? -Infinity : Infinity;
    }

    _initialBestScore() {
        return this.optimizationMode === 'max' ? -Infinity : Infinity;
    }

    objectiveScores(rawScores) {
        if (this.optimizationMode === 'target') {
            return rawScores.map(s => Math.abs(s - this.targetValue));
        }
        return rawScores;
    }

    displayScore(rawScore, objectiveScore) {
        return this.optimizationMode === 'target' ? objectiveScore : rawScore;
    }

    isBetter(candidateScore, currentScore) {
        if (this.optimizationMode === 'max') {
            return candidateScore > currentScore;
        }
        return candidateScore < currentScore;
    }

    betterMask(candidateScores, currentScores) {
        return candidateScores.map((cs, i) =>
            this.optimizationMode === 'max' ? cs > currentScores[i] : cs < currentScores[i]
        );
    }

    bestIndex(scores) {
        return this.optimizationMode === 'max'
            ? ArrayUtils.argMax(scores)
            : ArrayUtils.argMin(scores);
    }

    snapshotState() {
        return {
            iteration: this.iteration,
            population: ArrayUtils.copy2D(this.population),
            bestScore: this.bestScore,
            bestObjective: this.bestObjective,
            bestSolution: this.bestSolution ? ArrayUtils.copy1D(this.bestSolution) : null
        };
    }

    restoreState(snapshot) {
        this.iteration = snapshot.iteration || 0;
        this.population = ArrayUtils.copy2D(snapshot.population || []);
        this.bestScore = snapshot.bestScore ?? this.bestScore;
        this.bestObjective = snapshot.bestObjective ?? this.bestObjective;
        this.bestSolution = snapshot.bestSolution ? ArrayUtils.copy1D(snapshot.bestSolution) : null;
    }

    recordState() {
        if (this.population) {
            this.history.push(this.snapshotState());
        }
    }

    getStateAt(iteration) {
        if (iteration < 0 || iteration >= this.history.length) {
            return null;
        }
        return this.history[iteration];
    }

    checkConvergence() {
        this.scoreHistory.push(this.bestScore);

        // Keep only last N scores
        if (this.scoreHistory.length > this.convergenceWindow) {
            this.scoreHistory = this.scoreHistory.slice(-this.convergenceWindow);
        }

        // Need full window to check convergence
        if (this.scoreHistory.length < this.convergenceWindow) {
            return false;
        }

        // Calculate improvement over window
        const improvement = Math.abs(
            this.scoreHistory[this.scoreHistory.length - 1] - this.scoreHistory[0]
        );

        if (improvement < this.convergenceThreshold) {
            this.converged = true;
            return true;
        }

        return false;
    }

    getState() {
        if (this.population) {
            return {
                iteration: this.iteration,
                population: this.population,
                bestScore: this.bestScore,
                maxIteration: Math.max(this.history.length - 1, 0),
                converged: this.converged
            };
        }
        return {};
    }

    // Abstract method - to be implemented by subclasses
    step() {
        throw new Error('step() must be implemented by subclass');
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OptimizationAlgorithm, ArrayUtils, ExpressionEvaluator, rastrigin };
}
