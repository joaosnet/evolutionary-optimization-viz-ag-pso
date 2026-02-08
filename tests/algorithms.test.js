/**
 * Tests for optimization algorithm implementations
 * Tests GA, PSO, and ED (Differential Evolution)
 */

// Load algorithm source files
const fs = require('fs');
const path = require('path');

// Simple eval-based loader for browser-style scripts
function loadScript(filePath) {
    const code = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
    eval(code);
}

// Load in order (base must come first)
loadScript('../static/js/algorithms/base.js');
loadScript('../static/js/algorithms/ga.js');
loadScript('../static/js/algorithms/pso.js');
loadScript('../static/js/algorithms/ed.js');

// Simple test fitness function: sphere f(x) = sum(x_i^2)
function sphereFunction(population) {
    return population.map(ind => ind.reduce((sum, x) => sum + x * x, 0));
}

const TEST_BOUNDS = [[-5.12, 5.12], [-5.12, 5.12]];
const POP_SIZE = 20;
const DIMS = 2;
const BASE_OPTIONS = { optimizationMode: 'min' };

describe('ArrayUtils', () => {
    test('randomUniform2D creates correct shape', () => {
        const arr = ArrayUtils.randomUniform2D(10, 3, [-1, -1, -1], [1, 1, 1]);
        expect(arr.length).toBe(10);
        expect(arr[0].length).toBe(3);
    });

    test('randomUniform2D values within bounds', () => {
        const arr = ArrayUtils.randomUniform2D(100, 2, [-5, -5], [5, 5]);
        arr.forEach(row => {
            row.forEach(val => {
                expect(val).toBeGreaterThanOrEqual(-5);
                expect(val).toBeLessThanOrEqual(5);
            });
        });
    });

    test('copy2D creates independent copy', () => {
        const original = [[1, 2], [3, 4]];
        const copy = ArrayUtils.copy2D(original);
        copy[0][0] = 999;
        expect(original[0][0]).toBe(1);
    });

    test('argMin finds minimum index', () => {
        expect(ArrayUtils.argMin([5, 3, 7, 1, 9])).toBe(3);
    });

    test('argMax finds maximum index', () => {
        expect(ArrayUtils.argMax([5, 3, 7, 1, 9])).toBe(4);
    });

    test('clip clamps value', () => {
        expect(ArrayUtils.clip(15, 0, 10)).toBe(10);
        expect(ArrayUtils.clip(-5, 0, 10)).toBe(0);
        expect(ArrayUtils.clip(5, 0, 10)).toBe(5);
    });
});

describe('GeneticAlgorithm', () => {
    let ga;

    beforeEach(() => {
        ga = new GeneticAlgorithm(sphereFunction, TEST_BOUNDS, POP_SIZE, DIMS, BASE_OPTIONS);
    });

    test('initializes with correct population size', () => {
        expect(ga.population.length).toBe(POP_SIZE);
        expect(ga.population[0].length).toBe(DIMS);
    });

    test('population within bounds after initialization', () => {
        ga.population.forEach(ind => {
            ind.forEach((val, d) => {
                expect(val).toBeGreaterThanOrEqual(TEST_BOUNDS[d][0]);
                expect(val).toBeLessThanOrEqual(TEST_BOUNDS[d][1]);
            });
        });
    });

    test('step increments iteration', () => {
        expect(ga.iteration).toBe(0);
        ga.step();
        expect(ga.iteration).toBe(1);
    });

    test('bestScore improves or stays same over steps (minimize)', () => {
        const initialBest = ga.bestScore;
        for (let i = 0; i < 50; i++) ga.step();
        expect(ga.bestScore).toBeLessThanOrEqual(initialBest);
    });

    test('history records states', () => {
        for (let i = 0; i < 5; i++) ga.step();
        // Initial state + 5 steps = 6 entries
        expect(ga.history.length).toBe(6);
    });

    test('snapshotState and restoreState work', () => {
        for (let i = 0; i < 10; i++) ga.step();
        const snapshot = ga.snapshotState();
        const savedScore = ga.bestScore;
        const savedIteration = ga.iteration;

        // Run more steps
        for (let i = 0; i < 10; i++) ga.step();
        expect(ga.iteration).toBe(20);

        // Restore
        ga.restoreState(snapshot);
        expect(ga.iteration).toBe(savedIteration);
        expect(ga.bestScore).toBe(savedScore);
    });
});

describe('ParticleSwarmOptimization', () => {
    let pso;

    beforeEach(() => {
        pso = new ParticleSwarmOptimization(sphereFunction, TEST_BOUNDS, POP_SIZE, DIMS, {
            ...BASE_OPTIONS,
            w: 0.5,
            c1: 1.5,
            c2: 1.5
        });
    });

    test('initializes with correct population size', () => {
        expect(pso.population.length).toBe(POP_SIZE);
        expect(pso.velocities.length).toBe(POP_SIZE);
        expect(pso.pbest.length).toBe(POP_SIZE);
    });

    test('step increments iteration', () => {
        pso.step();
        expect(pso.iteration).toBe(1);
    });

    test('bestScore improves or stays same over steps (minimize)', () => {
        const initialBest = pso.bestScore;
        for (let i = 0; i < 50; i++) pso.step();
        expect(pso.bestScore).toBeLessThanOrEqual(initialBest);
    });

    test('snapshotState includes PSO-specific fields', () => {
        pso.step();
        const snapshot = pso.snapshotState();
        expect(snapshot.velocities).toBeDefined();
        expect(snapshot.pbest).toBeDefined();
        expect(snapshot.pbestScores).toBeDefined();
    });

    test('particles stay within bounds', () => {
        for (let i = 0; i < 20; i++) pso.step();
        pso.population.forEach(particle => {
            particle.forEach((val, d) => {
                expect(val).toBeGreaterThanOrEqual(TEST_BOUNDS[d][0]);
                expect(val).toBeLessThanOrEqual(TEST_BOUNDS[d][1]);
            });
        });
    });
});

describe('DifferentialEvolution', () => {
    let ed;

    beforeEach(() => {
        ed = new DifferentialEvolution(sphereFunction, TEST_BOUNDS, POP_SIZE, DIMS, {
            ...BASE_OPTIONS,
            F: 0.8,
            CR: 0.9
        });
    });

    test('initializes with correct population size', () => {
        expect(ed.population.length).toBe(POP_SIZE);
        expect(ed.population[0].length).toBe(DIMS);
    });

    test('initializes fitness arrays', () => {
        expect(ed.fitness.length).toBe(POP_SIZE);
        expect(ed.objectiveFitness.length).toBe(POP_SIZE);
    });

    test('step increments iteration', () => {
        expect(ed.iteration).toBe(0);
        ed.step();
        expect(ed.iteration).toBe(1);
    });

    test('bestScore improves or stays same over steps (minimize)', () => {
        const initialBest = ed.bestScore;
        for (let i = 0; i < 50; i++) ed.step();
        expect(ed.bestScore).toBeLessThanOrEqual(initialBest);
    });

    test('population stays within bounds', () => {
        for (let i = 0; i < 20; i++) ed.step();
        ed.population.forEach(ind => {
            ind.forEach((val, d) => {
                expect(val).toBeGreaterThanOrEqual(TEST_BOUNDS[d][0]);
                expect(val).toBeLessThanOrEqual(TEST_BOUNDS[d][1]);
            });
        });
    });

    test('history records states', () => {
        for (let i = 0; i < 5; i++) ed.step();
        expect(ed.history.length).toBe(6); // initial + 5 steps
    });

    test('snapshotState includes ED-specific fields', () => {
        ed.step();
        const snapshot = ed.snapshotState();
        expect(snapshot.fitness).toBeDefined();
        expect(snapshot.objectiveFitness).toBeDefined();
        expect(snapshot.fitness.length).toBe(POP_SIZE);
    });

    test('restoreState works correctly', () => {
        for (let i = 0; i < 10; i++) ed.step();
        const snapshot = ed.snapshotState();
        const savedScore = ed.bestScore;

        for (let i = 0; i < 10; i++) ed.step();

        ed.restoreState(snapshot);
        expect(ed.bestScore).toBe(savedScore);
        expect(ed.iteration).toBe(10);
    });

    test('_selectIndices returns distinct indices excluding target', () => {
        const indices = ed._selectIndices(0, 3);
        expect(indices.length).toBe(3);
        expect(indices).not.toContain(0);
        // All distinct
        const unique = new Set(indices);
        expect(unique.size).toBe(3);
    });

    test('converges toward minimum on sphere function', () => {
        for (let i = 0; i < 200; i++) ed.step();
        // Sphere minimum is 0 at origin; should get reasonably close
        expect(ed.bestScore).toBeLessThan(1.0);
    });
});

describe('OptimizationAlgorithm base class', () => {
    test('maximize mode works', () => {
        const ga = new GeneticAlgorithm(sphereFunction, TEST_BOUNDS, POP_SIZE, DIMS, {
            optimizationMode: 'max'
        });
        expect(ga.optimizationMode).toBe('max');
        // In max mode, isBetter should return true for larger values
        expect(ga.isBetter(10, 5)).toBe(true);
        expect(ga.isBetter(5, 10)).toBe(false);
    });

    test('target mode works', () => {
        const ga = new GeneticAlgorithm(sphereFunction, TEST_BOUNDS, POP_SIZE, DIMS, {
            optimizationMode: 'target',
            targetValue: 5.0
        });
        expect(ga.optimizationMode).toBe('target');
        const scores = ga.objectiveScores([3, 7, 5]);
        expect(scores).toEqual([2, 2, 0]); // |3-5|, |7-5|, |5-5|
    });

    test('convergence detection fires', () => {
        const ga = new GeneticAlgorithm(sphereFunction, TEST_BOUNDS, POP_SIZE, DIMS, {
            ...BASE_OPTIONS,
            convergenceThreshold: 1e-6,
            convergenceWindow: 5
        });
        // Manually fill scoreHistory with identical values
        ga.scoreHistory = [1.0, 1.0, 1.0, 1.0];
        ga.bestScore = 1.0;
        const result = ga.checkConvergence();
        expect(result).toBe(true);
        expect(ga.converged).toBe(true);
    });
});
