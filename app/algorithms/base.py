
import numpy as np
from abc import ABC, abstractmethod

def rastrigin(X):
    """
    Rastrigin function.
    Global minimum at (0, 0, ..., 0) with value 0.
    """
    A = 10
    display_X = X  # Assuming X is (pop_size, dim)
    return A * X.shape[1] + np.sum(display_X**2 - A * np.cos(2 * np.pi * display_X), axis=1)

class OptimizationAlgorithm(ABC):
    def __init__(
        self,
        func,
        bounds,
        population_size,
        dimensions,
        optimization_mode="max",
        target_value=0.0,
    ):
        self.func = func
        self.bounds = np.array(bounds)
        self.pop_size = population_size
        self.dim = dimensions
        self.optimization_mode = self._normalize_mode(optimization_mode)
        self.target_value = float(target_value)
        self.best_solution = None
        self.best_objective = self._initial_best_objective()
        self.best_score = self._initial_best_score()
        self.history = []
        self.iteration = 0

    def _normalize_mode(self, mode):
        if not mode:
            return "min"
        mode = str(mode).lower().strip()
        return mode if mode in {"min", "max", "target"} else "min"

    def _initial_best_objective(self):
        return float("-inf") if self.optimization_mode == "max" else float("inf")

    def _initial_best_score(self):
        return float("-inf") if self.optimization_mode == "max" else float("inf")

    def objective_scores(self, raw_scores):
        if self.optimization_mode == "target":
            return np.abs(raw_scores - self.target_value)
        return raw_scores

    def display_score(self, raw_score, objective_score):
        return objective_score if self.optimization_mode == "target" else raw_score

    def is_better(self, candidate_score, current_score):
        if self.optimization_mode == "max":
            return candidate_score > current_score
        return candidate_score < current_score

    def better_mask(self, candidate_scores, current_scores):
        if self.optimization_mode == "max":
            return candidate_scores > current_scores
        return candidate_scores < current_scores

    def best_index(self, scores):
        return int(np.argmax(scores)) if self.optimization_mode == "max" else int(np.argmin(scores))

    @abstractmethod
    def step(self):
        """Performs one step/generation of the algorithm."""
        pass

    def get_state(self):
        """Returns the current state for visualization."""
        if hasattr(self, 'population'):
            return {
                "iteration": self.iteration,
                "population": self.population.tolist(),
                "best_score": float(self.best_score)
            }
        return {}
