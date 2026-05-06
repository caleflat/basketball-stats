import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import players, shots, stats, bio, percentiles, career, leaders, zones, gamelog, awards

app = FastAPI(title="NBA Savant API", version="0.1.0")

_origins = ["http://localhost:3000"]
if origin := os.getenv("FRONTEND_ORIGIN"):
    _origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(shots.router)
app.include_router(stats.router)
app.include_router(bio.router)
app.include_router(percentiles.router)
app.include_router(career.router)
app.include_router(leaders.router)
app.include_router(zones.router)
app.include_router(gamelog.router)
app.include_router(awards.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
