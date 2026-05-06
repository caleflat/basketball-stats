from fastapi import APIRouter, HTTPException, Path
from app.models.player import PlayerBio
from app.services.nba import get_player_bio

router = APIRouter(prefix="/players", tags=["bio"])


@router.get("/{player_id}/bio", response_model=PlayerBio)
def player_bio(player_id: int = Path(gt=0)) -> PlayerBio:
    bio = get_player_bio(player_id)
    if bio is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return bio
