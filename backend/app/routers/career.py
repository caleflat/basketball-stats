from fastapi import APIRouter, Path, Query
from app.models.player import PlayerSeasonStats
from app.services.nba import get_career_stats, SEASON_TYPES

router = APIRouter(prefix="/players", tags=["career"])


@router.get("/{player_id}/career", response_model=list[PlayerSeasonStats])
def career_stats(
    player_id: int = Path(gt=0),
    season_type: str = Query(default="regular", pattern="^(regular|playoffs)$"),
) -> list[PlayerSeasonStats]:
    return get_career_stats(player_id, SEASON_TYPES[season_type])
