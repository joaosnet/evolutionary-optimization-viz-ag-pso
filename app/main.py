from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.algorithms.ag import GeneticAlgorithm
from app.algorithms.pso import ParticleSwarmOptimization
from app.algorithms.base import rastrigin
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
    bounds = [[-5.12, 5.12], [-5.12, 5.12]]  # Rastrigin bounds
    pop_size = 50
    dims = 2

    # Initialize Algorithms
    ag = GeneticAlgorithm(rastrigin, bounds, population_size=pop_size, dimensions=dims)
    pso = ParticleSwarmOptimization(
        rastrigin, bounds, population_size=pop_size, dimensions=dims
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
            elif action == "reset":
                # Extract params or use defaults
                pop_size = data.get("pop_size", 50)

                # AG Params
                ag_mut = data.get("ag_mutation", 0.01)
                ag_cross = data.get("ag_crossover", 0.7)

                # PSO Params
                pso_w = data.get("pso_w", 0.5)
                pso_c1 = data.get("pso_c1", 1.5)
                pso_c2 = data.get("pso_c2", 1.5)

                ag = GeneticAlgorithm(
                    rastrigin,
                    bounds,
                    population_size=pop_size,
                    dimensions=dims,
                    mutation_rate=ag_mut,
                    crossover_rate=ag_cross,
                )
                pso = ParticleSwarmOptimization(
                    rastrigin,
                    bounds,
                    population_size=pop_size,
                    dimensions=dims,
                    w=pso_w,
                    c1=pso_c1,
                    c2=pso_c2,
                )
                response = {"ag": ag.get_state(), "pso": pso.get_state()}
                await websocket.send_json(response)

    except Exception as e:
        print(f"WebSocket disconnected: {e}")
