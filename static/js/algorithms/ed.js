/**
 * Differential Evolution (ED / DE) - JavaScript Implementation
 * DE/rand/1/bin strategy with F (scaling factor) and CR (crossover rate)
 */

class DifferentialEvolution extends OptimizationAlgorithm {
    constructor(func, bounds, populationSize = 50, dimensions = 2, options = {}) {
        super(func, bounds, populationSize, dimensions, options);

        this.F = parseFloat(options.F || 0.8);    // Scaling factor (differential weight)
        this.CR = parseFloat(options.CR || 0.9);   // Crossover rate

        // Initialize population randomly within bounds
        const lowBounds = bounds.map(b => b[0]);
        const highBounds = bounds.map(b => b[1]);
        this.population = ArrayUtils.randomUniform2D(this.popSize, this.dim, lowBounds, highBounds);

        // Evaluate initial fitness
        this.fitness = this.func(this.population);
        this.objectiveFitness = this.objectiveScores(this.fitness);

        this.updateBest();
        this.recordState();
    }

    updateBest() {
        const rawScores = this.func(this.population);
        const objectiveScores = this.objectiveScores(rawScores);

        const bestIdx = this.bestIndex(objectiveScores);

        if (this.isBetter(objectiveScores[bestIdx], this.bestObjective)) {
            this.bestObjective = objectiveScores[bestIdx];
            this.bestScore = this.displayScore(rawScores[bestIdx], objectiveScores[bestIdx]);
            this.bestSolution = ArrayUtils.copy1D(this.population[bestIdx]);
        }

        this.fitness = rawScores;
        this.objectiveFitness = objectiveScores;
    }

    step() {
        this.iteration++;

        const newPopulation = ArrayUtils.copy2D(this.population);

        for (let i = 0; i < this.popSize; i++) {
            // Select three distinct random indices different from i
            const indices = this._selectIndices(i, 3);
            const [a, b, c] = indices;

            // Mutation: donor vector = x_a + F * (x_b - x_c)
            const donor = new Array(this.dim);
            for (let d = 0; d < this.dim; d++) {
                donor[d] = this.population[a][d] + this.F * (this.population[b][d] - this.population[c][d]);
                // Clip to bounds
                donor[d] = ArrayUtils.clip(donor[d], this.bounds[d][0], this.bounds[d][1]);
            }

            // Crossover: binomial crossover
            const trial = new Array(this.dim);
            const jRand = ArrayUtils.randInt(this.dim); // Ensure at least one dimension from donor

            for (let d = 0; d < this.dim; d++) {
                if (Math.random() < this.CR || d === jRand) {
                    trial[d] = donor[d];
                } else {
                    trial[d] = this.population[i][d];
                }
            }

            // Selection: keep trial if it's better or equal
            const trialRaw = this.func([trial])[0];
            const trialObjective = this.objectiveScores([trialRaw])[0];
            const currentObjective = this.objectiveFitness[i];

            if (this.isBetter(trialObjective, currentObjective) || trialObjective === currentObjective) {
                newPopulation[i] = trial;
            }
        }

        this.population = newPopulation;
        this.updateBest();
        this.checkConvergence();
        this.recordState();
    }

    /**
     * Select `count` distinct random indices from [0, popSize), excluding `excludeIdx`
     */
    _selectIndices(excludeIdx, count) {
        const indices = [];
        while (indices.length < count) {
            const r = ArrayUtils.randInt(this.popSize);
            if (r !== excludeIdx && !indices.includes(r)) {
                indices.push(r);
            }
        }
        return indices;
    }

    snapshotState() {
        const state = super.snapshotState();
        state.fitness = ArrayUtils.copy1D(this.fitness);
        state.objectiveFitness = ArrayUtils.copy1D(this.objectiveFitness);
        return state;
    }

    restoreState(snapshot) {
        super.restoreState(snapshot);
        this.fitness = ArrayUtils.copy1D(snapshot.fitness || []);
        this.objectiveFitness = ArrayUtils.copy1D(snapshot.objectiveFitness || []);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DifferentialEvolution };
}
