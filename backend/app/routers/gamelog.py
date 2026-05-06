from fastapi import APIRouter, Path, Query
from app.models.player import GameLogEntry
from app.services.nba import get_game_log

router = APIRouter(prefix="/players", tags=["gamelog"])


@router.get("/{player_id}/gamelog", response_model=list[GameLogEntry])
def game_log(
    player_id: int = Path(gt=0),
    season: str = Query(default="2025-26", pattern=r"^\d{4}-\d{2}$"),
) -> list[GameLogEntry]:
    return get_game_log(player_id, season)
