/**
 * Benchmark Functions for Optimization
 * Collection of standard test functions used in IEEE CEC competitions
 * Reference: CEC 2017 Problem Definitions and Evaluation Criteria
 */

const BENCHMARKS = {
    // ── Unimodal Functions ──────────────────────────────────────────────────
    sphere: {
        name: "Sphere",
        expression: "x1^2 + x2^2",
        dimensions: 2,
        domain: [-10, 10],
        globalMin: 0,
        globalMinPosition: [0, 0],
        category: "unimodal",
        type: "min"
    },
    zakharov: {
        name: "Zakharov",
        expression: "(x1^2 + x2^2) + (0.5*x1 + 1*x2)^2 + (0.5*x1 + 1*x2)^4",
        dimensions: 2,
        domain: [-5, 10],
        globalMin: 0,
        globalMinPosition: [0, 0],
        category: "unimodal",
        type: "min"
    },

    // ── Multimodal Functions ────────────────────────────────────────────────
    rastrigin: {
        name: "Rastrigin",
        expression: "10 * 2 + (x1^2 - 10 * cos(2 * pi * x1)) + (x2^2 - 10 * cos(2 * pi * x2))",
        dimensions: 2,
        domain: [-5.12, 5.12],
        globalMin: 0,
        globalMinPosition: [0, 0],
        category: "multimodal",
        type: "min"
    },
    rosenbrock: {
        name: "Rosenbrock (Banana)",
        expression: "100 * (x2 - x1^2)^2 + (1 - x1)^2",
        dimensions: 2,
        domain: [-5, 10],
        globalMin: 0,
        globalMinPosition: [1, 1],
        category: "multimodal",
        type: "min"
    },
    ackley: {
        name: "Ackley",
        expression: "-20 * exp(-0.2 * sqrt(0.5 * (x1^2 + x2^2))) - exp(0.5 * (cos(2 * pi * x1) + cos(2 * pi * x2))) + e + 20",
        dimensions: 2,
        domain: [-5, 5],
        globalMin: 0,
        globalMinPosition: [0, 0],
        category: "multimodal",
        type: "min"
    },
    griewank: {
        name: "Griewank",
        expression: "x1^2/4000 + x2^2/4000 - cos(x1) * cos(x2/sqrt(2)) + 1",
        dimensions: 2,
        domain: [-600, 600],
        globalMin: 0,
        globalMinPosition: [0, 0],
        category: "multimodal",
        type: "min"
    },
    schwefel: {
        name: "Schwefel",
        expression: "418.9829 * 2 - x1 * sin(sqrt(abs(x1))) - x2 * sin(sqrt(abs(x2)))",
        dimensions: 2,
        domain: [-500, 500],
        globalMin: 0,
        globalMinPosition: [420.9687, 420.9687],
        category: "multimodal",
        type: "min"
    },
    levy: {
        name: "Lévy",
        expression: "sin(pi*(1+(x1-1)/4))^2 + ((1+(x1-1)/4)-1)^2*(1+10*sin(pi*(1+(x1-1)/4)+1)^2) + ((1+(x2-1)/4)-1)^2*(1+sin(2*pi*(1+(x2-1)/4))^2)",
        dimensions: 2,
        domain: [-10, 10],
        globalMin: 0,
        globalMinPosition: [1, 1],
        category: "multimodal",
        type: "min"
    },
    schaffer_n2: {
        name: "Schaffer N.2",
        expression: "0.5 + (sin(x1^2 + x2^2)^2 - 0.5) / (1 + 0.001*(x1^2 + x2^2))^2",
        dimensions: 2,
        domain: [-100, 100],
        globalMin: 0,
        globalMinPosition: [0, 0],
        category: "multimodal",
        type: "min"
    },
    styblinski_tang: {
        name: "Styblinski-Tang",
        expression: "(x1^4 - 16*x1^2 + 5*x1 + x2^4 - 16*x2^2 + 5*x2) / 2",
        dimensions: 2,
        domain: [-5, 5],
        globalMin: -78.33234,
        globalMinPosition: [-2.903534, -2.903534],
        category: "multimodal",
        type: "min"
    },

    // ── Classic Test Functions ───────────────────────────────────────────────
    himmelblau: {
        name: "Himmelblau",
        expression: "(x1^2 + x2 - 11)^2 + (x1 + x2^2 - 7)^2",
        dimensions: 2,
        domain: [-5, 5],
        globalMin: 0,
        globalMinPosition: [3, 2],
        category: "multimodal",
        type: "min"
    },
    beale: {
        name: "Beale",
        expression: "(1.5 - x1 + x1*x2)^2 + (2.25 - x1 + x1*x2^2)^2 + (2.625 - x1 + x1*x2^3)^2",
        dimensions: 2,
        domain: [-4.5, 4.5],
        globalMin: 0,
        globalMinPosition: [3, 0.5],
        category: "multimodal",
        type: "min"
    },
    booth: {
        name: "Booth",
        expression: "(x1 + 2*x2 - 7)^2 + (2*x1 + x2 - 5)^2",
        dimensions: 2,
        domain: [-10, 10],
        globalMin: 0,
        globalMinPosition: [1, 3],
        category: "multimodal",
        type: "min"
    },
    matyas: {
        name: "Matyas",
        expression: "0.26*(x1^2 + x2^2) - 0.48*x1*x2",
        dimensions: 2,
        domain: [-10, 10],
        globalMin: 0,
        globalMinPosition: [0, 0],
        category: "unimodal",
        type: "min"
    }
};

if (typeof window !== 'undefined') {
    window.BENCHMARKS = BENCHMARKS;
}
