import numpy as np
from .base import OptimizationAlgorithm


class ParticleSwarmOptimization(OptimizationAlgorithm):
    def __init__(
        self,
        func,
        bounds,
        population_size=50,
        dimensions=2,
        w=0.5,
        c1=1.5,
        c2=1.5,
        optimization_mode="max",
        target_value=0.0,
    ):
        super().__init__(
            func,
            bounds,
            population_size,
            dimensions,
            optimization_mode=optimization_mode,
            target_value=target_value,
        )
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
        self.pbest_scores = np.full(self.pop_size, self._initial_best_objective())

        self.update_best()
        self.record_state()

    def snapshot_state(self):
        state = super().snapshot_state()
        state.update({
            "velocities": self.velocities.tolist(),
            "pbest": self.pbest.tolist(),
            "pbest_scores": self.pbest_scores.tolist(),
        })
        return state

    def restore_state(self, snapshot):
        super().restore_state(snapshot)
        self.velocities = np.array(snapshot.get("velocities", []), dtype=float)
        self.pbest = np.array(snapshot.get("pbest", []), dtype=float)
        self.pbest_scores = np.array(snapshot.get("pbest_scores", []), dtype=float)

    def update_best(self):
        raw_scores = self.func(self.population)
        objective_scores = self.objective_scores(raw_scores)

        # Update Personal Bests
        improved_mask = self.better_mask(objective_scores, self.pbest_scores)
        self.pbest[improved_mask] = self.population[improved_mask]
        self.pbest_scores[improved_mask] = objective_scores[improved_mask]

        # Update Global Best
        best_idx = self.best_index(objective_scores)
        if self.is_better(objective_scores[best_idx], self.best_objective):
            self.best_objective = objective_scores[best_idx]
            self.best_score = self.display_score(
                raw_scores[best_idx], objective_scores[best_idx]
            )
            self.best_solution = self.population[best_idx].copy()

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
        self.record_state()
