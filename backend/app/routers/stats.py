from fastapi import APIRouter, HTTPException, Path, Query
from app.models.player import PlayerSeasonStats
from app.services.nba import get_player_stats

router = APIRouter(prefix="/players", tags=["stats"])


@router.get("/{player_id}/stats", response_model=PlayerSeasonStats)
def player_stats(
    player_id: int = Path(gt=0),
    season: str = Query(default="2025-26", pattern=r"^\d{4}-\d{2}$"),
) -> PlayerSeasonStats:
    stats = get_player_stats(player_id, season)
    if stats is None:
        raise HTTPException(status_code=404, detail="No stats found for this player/season")
    return stats
