from fastapi import APIRouter, HTTPException, Path, Query
from app.models.player import PlayerPercentiles
from app.services.nba import get_player_percentiles

router = APIRouter(prefix="/players", tags=["percentiles"])


@router.get("/{player_id}/percentiles", response_model=PlayerPercentiles)
def player_percentiles(
    player_id: int = Path(gt=0),
    season: str = Query(default="2025-26", pattern=r"^\d{4}-\d{2}$"),
) -> PlayerPercentiles:
    result = get_player_percentiles(player_id, season)
    if result is None:
        raise HTTPException(status_code=404, detail="No percentile data found for this player/season")
    return result
