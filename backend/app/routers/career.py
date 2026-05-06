from fastapi import APIRouter, Path
from app.models.player import PlayerSeasonStats
from app.services.nba import get_career_stats

router = APIRouter(prefix="/players", tags=["career"])


@router.get("/{player_id}/career", response_model=list[PlayerSeasonStats])
def career_stats(player_id: int = Path(gt=0)) -> list[PlayerSeasonStats]:
    return get_career_stats(player_id)
