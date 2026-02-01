from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.algorithms.ag import GeneticAlgorithm
from app.algorithms.pso import ParticleSwarmOptimization
from app.algorithms.base import rastrigin, build_expression_function
import json
import os

app = FastAPI()

# serve static files
static_dir = os.path.join(os.getcwd(), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def read_index():
    return FileResponse(os.path.join(os.getcwd(), "templates", "index.html"))


@app.websocket("/ws/simulation")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Simulation Parameters
    pop_size = 50
    dims = 2
    bounds = [[-5.12, 5.12] for _ in range(dims)]
    optimization_mode = "max"
    target_value = 0.0
    function_expr = None
    current_func = rastrigin

    # Initialize Algorithms
    ag = GeneticAlgorithm(
        current_func,
        bounds,
        population_size=pop_size,
        dimensions=dims,
        optimization_mode=optimization_mode,
        target_value=target_value,
    )
    pso = ParticleSwarmOptimization(
        current_func,
        bounds,
        population_size=pop_size,
        dimensions=dims,
        optimization_mode=optimization_mode,
        target_value=target_value,
    )

    try:
        while True:
            # Control simulation speed (wait for client request or auto-step)
            # For this MVP, we'll auto-step with a small delay or wait for a "next" message
            # Let's simple auto-stream for now, maybe listen for a "start" command first.

            try:
                text_data = await websocket.receive_text()
                try:
                    data = json.loads(text_data)
                    action = data.get("action")
                except json.JSONDecodeError:
                    # Fallback for simple strings
                    action = text_data
                    data = {}
            except Exception:
                break  # Disconnected

            if action == "step":
                ag.step()
                pso.step()

                response = {"ag": ag.get_state(), "pso": pso.get_state()}
                await websocket.send_json(response)
            elif action == "seek":
                iteration = int(data.get("iteration", 0) or 0)
                ag_state = ag.get_state_at(iteration)
                pso_state = pso.get_state_at(iteration)

                if ag_state is None or pso_state is None:
                    response = {
                        "error": "Iteration not available.",
                        "ag": ag.get_state(),
                        "pso": pso.get_state(),
                    }
                    await websocket.send_json(response)
                    continue

                # Store max iteration before restoring (for forward navigation)
                ag_max_iter = len(ag.history) - 1
                pso_max_iter = len(pso.history) - 1

                ag.restore_state(ag_state)
                pso.restore_state(pso_state)
                # Don't truncate history - preserve future iterations for navigation

                state_ag = ag.get_state()
                state_pso = pso.get_state()
                state_ag["max_iteration"] = ag_max_iter
                state_pso["max_iteration"] = pso_max_iter
                response = {"ag": state_ag, "pso": state_pso}
                await websocket.send_json(response)
            elif action == "continue":
                # Resume from max computed iteration (for continuing after seek)
                ag_max_iter = len(ag.history) - 1
                pso_max_iter = len(pso.history) - 1
                if ag_max_iter >= 0:
                    ag_state = ag.get_state_at(ag_max_iter)
                    if ag_state:
                        ag.restore_state(ag_state)
                if pso_max_iter >= 0:
                    pso_state = pso.get_state_at(pso_max_iter)
                    if pso_state:
                        pso.restore_state(pso_state)

                response = {"ag": ag.get_state(), "pso": pso.get_state()}
                await websocket.send_json(response)
            elif action == "reset":
                # Extract params or use defaults
                pop_size = data.get("pop_size", 50)
                optimization_mode = data.get("optimization_mode", "max")
                target_value = data.get("target_value", 0.0)
                dims = int(data.get("dimensions", dims) or dims)
                dims = max(2, dims)
                bounds = [[-5.12, 5.12] for _ in range(dims)]
                function_expr = data.get("function_expr")

                # Convergence params
                convergence_enabled = data.get("convergence_enabled", False)
                convergence_threshold = float(data.get("convergence_threshold", 1e-6))
                convergence_window = int(data.get("convergence_window", 20))

                # If disabled, set threshold to 0 (will never converge)
                if not convergence_enabled:
                    convergence_threshold = 0.0

                if function_expr:
                    try:
                        current_func = build_expression_function(function_expr, dims)
                    except ValueError as err:
                        current_func = current_func or rastrigin
                        error_message = str(err)
                    else:
                        error_message = None
                else:
                    current_func = rastrigin
                    error_message = None

                # AG Params
                ag_mut = data.get("ag_mutation", 0.01)
                ag_cross = data.get("ag_crossover", 0.7)

                # PSO Params
                pso_w = data.get("pso_w", 0.5)
                pso_c1 = data.get("pso_c1", 1.5)
                pso_c2 = data.get("pso_c2", 1.5)

                ag = GeneticAlgorithm(
                    current_func,
                    bounds,
                    population_size=pop_size,
                    dimensions=dims,
                    mutation_rate=ag_mut,
                    crossover_rate=ag_cross,
                    optimization_mode=optimization_mode,
                    target_value=target_value,
                    convergence_threshold=convergence_threshold,
                    convergence_window=convergence_window,
                )
                pso = ParticleSwarmOptimization(
                    current_func,
                    bounds,
                    population_size=pop_size,
                    dimensions=dims,
                    w=pso_w,
                    c1=pso_c1,
                    c2=pso_c2,
                    optimization_mode=optimization_mode,
                    target_value=target_value,
                    convergence_threshold=convergence_threshold,
                    convergence_window=convergence_window,
                )
                response = {"ag": ag.get_state(), "pso": pso.get_state()}
                if error_message:
                    response["error"] = error_message
                await websocket.send_json(response)

    except Exception as e:
        print(f"WebSocket disconnected: {e}")
