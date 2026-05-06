from fastapi import APIRouter, Path, Query
from app.models.player import ZoneStat
from app.services.nba import get_shot_zones, SEASON_TYPES

router = APIRouter(prefix="/players", tags=["zones"])


@router.get("/{player_id}/zones", response_model=list[ZoneStat])
def shot_zones(
    player_id: int = Path(gt=0),
    season: str = Query(default="2025-26", pattern=r"^\d{4}-\d{2}$"),
    season_type: str = Query(default="regular", pattern="^(regular|playoffs)$"),
) -> list[ZoneStat]:
    return get_shot_zones(player_id, season, SEASON_TYPES[season_type])
