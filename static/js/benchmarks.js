/**
 * Benchmark Functions for Optimization
 * Collection of standard test functions for evaluating algorithms
 */

const BENCHMARKS = {
    rastrigin: {
        name: "Rastrigin",
        expression: "10 * 2 + (x1^2 - 10 * cos(2 * pi * x1)) + (x2^2 - 10 * cos(2 * pi * x2))",
        dimensions: 2,
        domain: [-5.12, 5.12],
        globalMin: 0,
        type: "min"
    },
    sphere: {
        name: "Sphere",
        expression: "x1^2 + x2^2",
        dimensions: 2,
        domain: [-10, 10],
        globalMin: 0,
        type: "min"
    },
    rosenbrock: {
        name: "Rosenbrock (Banana)",
        expression: "100 * (x2 - x1^2)^2 + (1 - x1)^2",
        dimensions: 2,
        domain: [-5, 10],
        globalMin: 0,
        type: "min"
    },
    ackley: {
        name: "Ackley",
        expression: "-20 * exp(-0.2 * sqrt(0.5 * (x1^2 + x2^2))) - exp(0.5 * (cos(2 * pi * x1) + cos(2 * pi * x2))) + e + 20",
        dimensions: 2,
        domain: [-5, 5],
        globalMin: 0,
        type: "min"
    },
    himmelblau: {
        name: "Himmelblau",
        expression: "(x1^2 + x2 - 11)^2 + (x1 + x2^2 - 7)^2",
        dimensions: 2,
        domain: [-5, 5],
        globalMin: 0,
        type: "min"
    },
    beale: {
        name: "Beale",
        expression: "(1.5 - x1 + x1*x2)^2 + (2.25 - x1 + x1*x2^2)^2 + (2.625 - x1 + x1*x2^3)^2",
        dimensions: 2,
        domain: [-4.5, 4.5],
        globalMin: 0,
        type: "min"
    },
    booth: {
        name: "Booth",
        expression: "(x1 + 2*x2 - 7)^2 + (2*x1 + x2 - 5)^2",
        dimensions: 2,
        domain: [-10, 10],
        globalMin: 0,
        type: "min"
    },
    matyas: {
        name: "Matyas",
        expression: "0.26*(x1^2 + x2^2) - 0.48*x1*x2",
        dimensions: 2,
        domain: [-10, 10],
        globalMin: 0,
        type: "min"
    }
};

if (typeof window !== 'undefined') {
    window.BENCHMARKS = BENCHMARKS;
}
