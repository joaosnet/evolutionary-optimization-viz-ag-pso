import numpy as np
from .base import OptimizationAlgorithm


class GeneticAlgorithm(OptimizationAlgorithm):
    def __init__(
        self,
        func,
        bounds,
        population_size=50,
        dimensions=2,
        mutation_rate=0.01,
        crossover_rate=0.7,
    ):
        super().__init__(func, bounds, population_size, dimensions)
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate

        # Initialize population randomly within bounds
        self.population = np.random.uniform(
            self.bounds[:, 0], self.bounds[:, 1], (self.pop_size, self.dim)
        )
        self.update_best()

    def update_best(self):
        scores = self.func(self.population)
        min_idx = np.argmin(scores)
        if scores[min_idx] < self.best_score:
            self.best_score = scores[min_idx]
            self.best_solution = self.population[min_idx].copy()
        return scores

    def step(self):
        self.iteration += 1
        scores = self.update_best()

        # Selection (Tournament)
        selected = self.tournament_selection(scores)

        # Crossover
        next_pop = []
        for i in range(0, self.pop_size, 2):
            p1 = selected[i]
            p2 = selected[i + 1] if i + 1 < self.pop_size else selected[0]

            if np.random.rand() < self.crossover_rate:
                c1, c2 = self.crossover(p1, p2)
            else:
                c1, c2 = p1.copy(), p2.copy()

            next_pop.extend([c1, c2])

        self.population = np.array(next_pop[: self.pop_size])

        # Mutation
        self.mutation()

        self.update_best()

    def tournament_selection(self, scores, k=3):
        selected = []
        for _ in range(self.pop_size):
            candidates_idx = np.random.randint(0, self.pop_size, k)
            best_candidate_idx = candidates_idx[np.argmin(scores[candidates_idx])]
            selected.append(self.population[best_candidate_idx])
        return np.array(selected)

    def crossover(self, p1, p2):
        # Single point crossover
        point = np.random.randint(1, self.dim) if self.dim > 1 else 0
        c1 = np.concatenate([p1[:point], p2[point:]])
        c2 = np.concatenate([p2[:point], p1[point:]])
        return c1, c2

    def mutation(self):
        # Uniform mutation
        mask = np.random.rand(*self.population.shape) < self.mutation_rate
        random_values = np.random.uniform(
            self.bounds[:, 0], self.bounds[:, 1], self.population.shape
        )
        self.population[mask] = random_values[mask]
