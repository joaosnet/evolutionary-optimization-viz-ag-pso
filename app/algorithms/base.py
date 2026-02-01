
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
    def __init__(self, func, bounds, population_size, dimensions):
        self.func = func
        self.bounds = np.array(bounds)
        self.pop_size = population_size
        self.dim = dimensions
        self.best_solution = None
        self.best_score = float('inf')
        self.history = []
        self.iteration = 0

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
