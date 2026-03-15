import asyncio
import random
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import datetime
from .cv_engine import OccupancyDetector
from .optimization import EnergyOptimizer
from .analytics import analytics
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Eco Campus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
detector = OccupancyDetector()
optimizer = EnergyOptimizer()

class Classroom(BaseModel):
    id: str
    name: str
    occupancy_status: bool = False
    occupancy_count: int = 0
    energy_consumption: float = 0.0 # in kWh
    hvac_status: str = "OFF"
    lighting_status: str = "OFF"
    hvac_override: bool = False
    lighting_override: bool = False
    occupancy_override: bool = False

class EnergyStats(BaseModel):
    total_consumption: float
    total_savings: float
    timestamp: datetime.datetime

# Mock data
classrooms = [
    Classroom(id="C101", name="Main Lecture Hall"),
    Classroom(id="C102", name="Computer Lab 1"),
    Classroom(id="C103", name="Seminar Room A"),
]

simulation_running = False

total_savings_accumulated = 0.0

async def simulate_occupancy():
    global simulation_running, total_savings_accumulated
    simulation_running = True
    while simulation_running:
        for room in classrooms:
            if not room.occupancy_override:
                # Randomly change occupancy only if not manually overridden
                change = random.choice([-2, -1, 0, 1, 2])
                new_count = max(0, min(50, room.occupancy_count + change))

                room.occupancy_count = new_count
                room.occupancy_status = new_count > 0

                # Use Optimizer only if not overridden
                settings = optimizer.optimize_settings(new_count)
                if not room.hvac_override:
                    room.hvac_status = settings["hvac"]
                if not room.lighting_override:
                    room.lighting_status = settings["lighting"]
                # Calculate consumption based on actual current settings
                room.energy_consumption = optimizer.calculate_expected_usage(room.hvac_status, room.lighting_status)

                # Calculate and accumulate savings
                savings = optimizer.calculate_savings(room.hvac_status, room.lighting_status)
                total_savings_accumulated += savings

                # Log for analytics
                analytics.log_event(room.id, new_count, room.energy_consumption)
            else:
                # For overridden rooms, update energy consumption based on current settings
                room.energy_consumption = optimizer.calculate_expected_usage(room.hvac_status, room.lighting_status)
                savings = optimizer.calculate_savings(room.hvac_status, room.lighting_status)
                total_savings_accumulated += savings
                analytics.log_event(room.id, room.occupancy_count, room.energy_consumption)
        
        await asyncio.sleep(10) # Update every 10 seconds

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_occupancy())

@app.get("/")
async def root():
    return {"message": "Welcome to Eco Campus API", "simulation_running": simulation_running}

@app.get("/classrooms", response_model=List[Classroom])
async def get_classrooms():
    return classrooms

@app.get("/stats", response_model=EnergyStats)
async def get_stats():
    # Calculate real-time stats based on history
    total_cons = sum(room.energy_consumption for room in classrooms)
    return EnergyStats(
        total_consumption=round(total_cons, 2),
        total_savings=round(total_savings_accumulated, 2),
        timestamp=datetime.datetime.now()
    )

@app.post("/occupancy-update/{classroom_id}")
async def update_occupancy(classroom_id: str, count: int):
    for room in classrooms:
        if room.id == classroom_id:
            room.occupancy_count = count
            room.occupancy_status = count > 0
            room.occupancy_override = True

            # Use Optimizer
            settings = optimizer.optimize_settings(count)
            if not room.hvac_override:
                room.hvac_status = settings["hvac"]
            if not room.lighting_override:
                room.lighting_status = settings["lighting"]
            # Calculate consumption based on actual current settings
            room.energy_consumption = optimizer.calculate_expected_usage(room.hvac_status, room.lighting_status)

            # Log for analytics
            analytics.log_event(classroom_id, count, room.energy_consumption)

            return room
    raise HTTPException(status_code=404, detail="Classroom not found")

@app.post("/classroom/{classroom_id}/override")
async def override_settings(classroom_id: str, hvac: Optional[str] = None, lighting: Optional[str] = None):
    for room in classrooms:
        if room.id == classroom_id:
            if hvac is not None:
                room.hvac_status = hvac
                room.hvac_override = True
            if lighting is not None:
                room.lighting_status = lighting
                room.lighting_override = True
            return room
    raise HTTPException(status_code=404, detail="Classroom not found")

@app.get("/alerts")
async def get_alerts():
    return {"alerts": analytics.check_anomalies()}

@app.get("/predictions")
async def get_predictions():
    return {"predicted_next_hour": analytics.predict_next_hour_usage()}

@app.get("/analytics/history")
async def get_analytics_history():
    return {"history": analytics.history[-100:]} # Limit to last 100 entries

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8001, reload=False)
