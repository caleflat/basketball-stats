from fastapi import APIRouter, HTTPException, Query
from app.models.player import StatLeader
from app.services.nba import get_stat_leaders, STAT_COLS, ADVANCED_STAT_COLS

router = APIRouter(prefix="/leaders", tags=["leaders"])

_ALL_STATS = {**STAT_COLS, **ADVANCED_STAT_COLS}


@router.get("", response_model=list[StatLeader])
def stat_leaders(
    stat: str = Query(default="pts"),
    season: str = Query(default="2025-26", pattern=r"^\d{4}-\d{2}$"),
    limit: int = Query(default=25, ge=5, le=100),
) -> list[StatLeader]:
    if stat not in _ALL_STATS:
        raise HTTPException(status_code=400, detail=f"Unknown stat '{stat}'. Valid: {list(_ALL_STATS)}")
    return get_stat_leaders(season, stat, limit)
