/**
 * Particle Swarm Optimization - JavaScript Port
 * Velocity/position updates with personal and global best tracking
 */

class ParticleSwarmOptimization extends OptimizationAlgorithm {
    constructor(func, bounds, populationSize = 50, dimensions = 2, options = {}) {
        super(func, bounds, populationSize, dimensions, options);

        this.w = parseFloat(options.w || 0.5);   // Inertia weight
        this.c1 = parseFloat(options.c1 || 1.5); // Cognitive (personal best) weight
        this.c2 = parseFloat(options.c2 || 1.5); // Social (global best) weight

        // Initialize particles
        const lowBounds = bounds.map(b => b[0]);
        const highBounds = bounds.map(b => b[1]);
        this.population = ArrayUtils.randomUniform2D(this.popSize, this.dim, lowBounds, highBounds);
        this.velocities = ArrayUtils.zeros2D(this.popSize, this.dim);

        // Personal Best
        this.pbest = ArrayUtils.copy2D(this.population);
        this.pbestScores = ArrayUtils.fill1D(this.popSize, this._initialBestObjective());

        this.updateBest();
        this.recordState();
    }

    snapshotState() {
        const state = super.snapshotState();
        state.velocities = ArrayUtils.copy2D(this.velocities);
        state.pbest = ArrayUtils.copy2D(this.pbest);
        state.pbestScores = ArrayUtils.copy1D(this.pbestScores);
        return state;
    }

    restoreState(snapshot) {
        super.restoreState(snapshot);
        this.velocities = ArrayUtils.copy2D(snapshot.velocities || []);
        this.pbest = ArrayUtils.copy2D(snapshot.pbest || []);
        this.pbestScores = ArrayUtils.copy1D(snapshot.pbestScores || []);
    }

    updateBest() {
        const rawScores = this.func(this.population);
        const objectiveScores = this.objectiveScores(rawScores);

        // Update Personal Bests
        const improvedMask = this.betterMask(objectiveScores, this.pbestScores);
        for (let i = 0; i < this.popSize; i++) {
            if (improvedMask[i]) {
                this.pbest[i] = ArrayUtils.copy1D(this.population[i]);
                this.pbestScores[i] = objectiveScores[i];
            }
        }

        // Update Global Best
        const bestIdx = this.bestIndex(objectiveScores);
        if (this.isBetter(objectiveScores[bestIdx], this.bestObjective)) {
            this.bestObjective = objectiveScores[bestIdx];
            this.bestScore = this.displayScore(rawScores[bestIdx], objectiveScores[bestIdx]);
            this.bestSolution = ArrayUtils.copy1D(this.population[bestIdx]);
        }
    }

    step() {
        this.iteration++;

        // Update velocities and positions
        for (let i = 0; i < this.popSize; i++) {
            for (let d = 0; d < this.dim; d++) {
                const r1 = Math.random();
                const r2 = Math.random();

                // v = w*v + c1*r1*(pbest - x) + c2*r2*(gbest - x)
                this.velocities[i][d] =
                    this.w * this.velocities[i][d] +
                    this.c1 * r1 * (this.pbest[i][d] - this.population[i][d]) +
                    this.c2 * r2 * (this.bestSolution[d] - this.population[i][d]);

                // Update position
                this.population[i][d] += this.velocities[i][d];

                // Boundary handling (clip positions)
                this.population[i][d] = ArrayUtils.clip(
                    this.population[i][d],
                    this.bounds[d][0],
                    this.bounds[d][1]
                );
            }
        }

        this.updateBest();
        this.checkConvergence();
        this.recordState();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSwarmOptimization };
}
