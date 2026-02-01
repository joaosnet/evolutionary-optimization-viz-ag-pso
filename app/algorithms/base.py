
import numpy as np
import numexpr as ne
import re
from abc import ABC, abstractmethod

def rastrigin(X):
    """
    Rastrigin function.
    Global minimum at (0, 0, ..., 0) with value 0.
    """
    A = 10
    display_X = X  # Assuming X is (pop_size, dim)
    return A * X.shape[1] + np.sum(display_X**2 - A * np.cos(2 * np.pi * display_X), axis=1)

ALLOWED_FUNCTIONS = {
    "sin", "cos", "tan", "asin", "acos", "atan",
    "sinh", "cosh", "tanh", "sqrt", "abs", "exp",
    "log", "log10"
}

def _normalize_expression(expr):
    expr = expr.strip()
    expr = re.sub(r"[\u2217\u22C5\u00D7]", "*", expr)
    expr = re.sub(r"[\u2212\u2012\u2013\u2014]", "-", expr)
    expr = re.sub(r"\bln\b", "log", expr)
    expr = re.sub(r"x_\{?\s*(\d+)\s*\}?", r"x\1", expr)
    expr = expr.replace("^", "**")
    return expr

def build_expression_function(expr, dimensions):
    if not expr or not str(expr).strip():
        raise ValueError("Expression is empty.")
    if not isinstance(dimensions, int) or dimensions < 2:
        raise ValueError("Dimensions must be at least 2.")

    normalized = _normalize_expression(str(expr))
    identifiers = set(re.findall(r"[A-Za-z_]\w*", normalized))
    allowed_vars = {f"x{i}" for i in range(1, dimensions + 1)}
    allowed_consts = {"pi", "e"}
    allowed_symbols = allowed_vars | allowed_consts | ALLOWED_FUNCTIONS
    unknown = sorted(name for name in identifiers if name not in allowed_symbols)

    if unknown:
        raise ValueError(f"Unsupported symbol(s): {', '.join(unknown)}")

    def expression_function(X):
        local_dict = {f"x{i}": X[:, i - 1] for i in range(1, dimensions + 1)}
        local_dict["pi"] = np.pi
        local_dict["e"] = np.e
        return ne.evaluate(normalized, local_dict=local_dict)

    return expression_function

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

    def snapshot_state(self):
        return {
            "iteration": self.iteration,
            "population": self.population.tolist(),
            "best_score": float(self.best_score),
            "best_objective": float(self.best_objective),
            "best_solution": None if self.best_solution is None else self.best_solution.tolist(),
        }

    def restore_state(self, snapshot):
        self.iteration = int(snapshot.get("iteration", 0))
        self.population = np.array(snapshot.get("population", []), dtype=float)
        self.best_score = float(snapshot.get("best_score", self.best_score))
        self.best_objective = float(snapshot.get("best_objective", self.best_objective))
        best_solution = snapshot.get("best_solution")
        self.best_solution = None if best_solution is None else np.array(best_solution, dtype=float)

    def record_state(self):
        if hasattr(self, "population"):
            self.history.append(self.snapshot_state())

    def get_state_at(self, iteration):
        if iteration < 0 or iteration >= len(self.history):
            return None
        return self.history[iteration]

    def get_state(self):
        """Returns the current state for visualization."""
        if hasattr(self, 'population'):
            return {
                "iteration": self.iteration,
                "population": self.population.tolist(),
                "best_score": float(self.best_score),
                "max_iteration": max(len(self.history) - 1, 0)
            }
        return {}
