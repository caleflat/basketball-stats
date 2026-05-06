from fastapi import APIRouter, Path, Query
from app.models.player import ShotChartEntry
from app.services.nba import get_shot_chart, SEASON_TYPES

router = APIRouter(prefix="/players", tags=["shots"])


@router.get("/{player_id}/shots", response_model=list[ShotChartEntry])
def shot_chart(
    player_id: int = Path(gt=0),
    season: str = Query(default="2025-26", pattern=r"^\d{4}-\d{2}$"),
    season_type: str = Query(default="regular", pattern="^(regular|playoffs)$"),
) -> list[ShotChartEntry]:
    return get_shot_chart(player_id, season, SEASON_TYPES[season_type])
