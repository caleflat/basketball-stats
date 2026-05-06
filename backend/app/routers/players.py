from fastapi import APIRouter, Query
from app.models.player import PlayerSummary
from app.services.nba import search_players

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/search", response_model=list[PlayerSummary])
def search(q: str = Query(min_length=2)) -> list[PlayerSummary]:
    return search_players(q)
