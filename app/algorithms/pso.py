import numpy as np
from .base import OptimizationAlgorithm


class ParticleSwarmOptimization(OptimizationAlgorithm):
    def __init__(
        self, func, bounds, population_size=50, dimensions=2, w=0.5, c1=1.5, c2=1.5
    ):
        super().__init__(func, bounds, population_size, dimensions)
        self.w = w  # Inertia weight
        self.c1 = c1  # Cognitive (personal best) weight
        self.c2 = c2  # Social (global best) weight

        # Initialize particles
        self.population = np.random.uniform(
            self.bounds[:, 0], self.bounds[:, 1], (self.pop_size, self.dim)
        )
        self.velocities = np.zeros((self.pop_size, self.dim))

        # PBest (Personal Best)
        self.pbest = self.population.copy()
        self.pbest_scores = np.full(self.pop_size, float("inf"))

        self.update_best()

    def update_best(self):
        scores = self.func(self.population)

        # Update Personal Bests
        improved_mask = scores < self.pbest_scores
        self.pbest[improved_mask] = self.population[improved_mask]
        self.pbest_scores[improved_mask] = scores[improved_mask]

        # Update Global Best
        min_idx = np.argmin(scores)
        print(
            f"PSO Debug: Best Score Current={self.best_score}, Min Step Score={scores[min_idx]}"
        )
        if scores[min_idx] < self.best_score:
            self.best_score = scores[min_idx]
            self.best_solution = self.population[min_idx].copy()

    def step(self):
        self.iteration += 1

        # Random coefficients
        r1 = np.random.rand(self.pop_size, self.dim)
        r2 = np.random.rand(self.pop_size, self.dim)

        # Update Velocities
        # v = w*v + c1*r1*(pbest - x) + c2*r2*(gbest - x)
        self.velocities = (
            self.w * self.velocities
            + self.c1 * r1 * (self.pbest - self.population)
            + self.c2 * r2 * (self.best_solution - self.population)
        )

        # Update Positions
        self.population = self.population + self.velocities

        # Boundary handling (clip positions)
        for d in range(self.dim):
            self.population[:, d] = np.clip(
                self.population[:, d], self.bounds[d, 0], self.bounds[d, 1]
            )

        self.update_best()
