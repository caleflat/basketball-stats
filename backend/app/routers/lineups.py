from fastapi import APIRouter, HTTPException, Query
from app.models.player import LineupEntry
from app.services.nba import get_lineups, lookup_lineup, _LINEUP_SORT

router = APIRouter(prefix="/lineups", tags=["lineups"])


@router.get("", response_model=list[LineupEntry])
def lineups(
    season: str = Query(default="2025-26", pattern=r"^\d{4}-\d{2}$"),
    group_quantity: int = Query(default=5, ge=2, le=5),
    sort_by: str = Query(default="net_rating"),
    limit: int = Query(default=25, ge=5, le=100),
) -> list[LineupEntry]:
    if sort_by not in _LINEUP_SORT:
        raise HTTPException(status_code=400, detail=f"Unknown sort_by '{sort_by}'. Valid: {list(_LINEUP_SORT)}")
    return get_lineups(season, group_quantity, sort_by, limit)


@router.get("/lookup", response_model=LineupEntry | None)
def lineup_lookup(
    player_ids: str = Query(description="Comma-separated player IDs, 2–5 players"),
    season: str = Query(default="2025-26", pattern=r"^\d{4}-\d{2}$"),
) -> LineupEntry | None:
    ids = [int(x.strip()) for x in player_ids.split(",") if x.strip()]
    if not (2 <= len(ids) <= 5):
        raise HTTPException(status_code=400, detail="Provide 2–5 player IDs")
    return lookup_lineup(season, ids)
