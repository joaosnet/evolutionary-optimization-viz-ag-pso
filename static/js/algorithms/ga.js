/**
 * Genetic Algorithm - JavaScript Port
 * Tournament selection, single-point crossover, uniform mutation
 */

class GeneticAlgorithm extends OptimizationAlgorithm {
    constructor(func, bounds, populationSize = 50, dimensions = 2, options = {}) {
        super(func, bounds, populationSize, dimensions, options);

        this.mutationRate = parseFloat(options.mutationRate || 0.01);
        this.crossoverRate = parseFloat(options.crossoverRate || 0.7);

        // Initialize population randomly within bounds
        const lowBounds = bounds.map(b => b[0]);
        const highBounds = bounds.map(b => b[1]);
        this.population = ArrayUtils.randomUniform2D(this.popSize, this.dim, lowBounds, highBounds);

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

        return objectiveScores;
    }

    step() {
        this.iteration++;
        const scores = this.updateBest();

        // Selection (Tournament)
        const selected = this.tournamentSelection(scores);

        // Crossover
        const nextPop = [];
        for (let i = 0; i < this.popSize; i += 2) {
            const p1 = selected[i];
            const p2 = i + 1 < this.popSize ? selected[i + 1] : selected[0];

            let c1, c2;
            if (Math.random() < this.crossoverRate) {
                [c1, c2] = this.crossover(p1, p2);
            } else {
                c1 = ArrayUtils.copy1D(p1);
                c2 = ArrayUtils.copy1D(p2);
            }

            nextPop.push(c1, c2);
        }

        this.population = nextPop.slice(0, this.popSize);

        // Mutation
        this.mutation();

        this.updateBest();
        this.checkConvergence();
        this.recordState();
    }

    tournamentSelection(scores, k = 3) {
        const selected = [];
        for (let i = 0; i < this.popSize; i++) {
            const candidatesIdx = ArrayUtils.randIntArray(k, this.popSize);
            const candidateScores = candidatesIdx.map(idx => scores[idx]);
            const bestCandidateLocalIdx = this.bestIndex(candidateScores);
            const bestCandidateIdx = candidatesIdx[bestCandidateLocalIdx];
            selected.push(ArrayUtils.copy1D(this.population[bestCandidateIdx]));
        }
        return selected;
    }

    crossover(p1, p2) {
        // Single point crossover
        const point = this.dim > 1 ? ArrayUtils.randInt(this.dim - 1) + 1 : 1;
        const c1 = [...p1.slice(0, point), ...p2.slice(point)];
        const c2 = [...p2.slice(0, point), ...p1.slice(point)];
        return [c1, c2];
    }

    mutation() {
        // Uniform mutation
        for (let i = 0; i < this.popSize; i++) {
            for (let j = 0; j < this.dim; j++) {
                if (Math.random() < this.mutationRate) {
                    const low = this.bounds[j][0];
                    const high = this.bounds[j][1];
                    this.population[i][j] = low + Math.random() * (high - low);
                }
            }
        }
    }

    snapshotState() {
        return super.snapshotState();
    }

    restoreState(snapshot) {
        super.restoreState(snapshot);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GeneticAlgorithm };
}
