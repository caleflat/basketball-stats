from fastapi import APIRouter, Path
from app.models.player import PlayerAward
from app.services.nba import get_player_awards

router = APIRouter(prefix="/players", tags=["awards"])


@router.get("/{player_id}/awards", response_model=list[PlayerAward])
def player_awards(player_id: int = Path(gt=0)) -> list[PlayerAward]:
    return get_player_awards(player_id)
