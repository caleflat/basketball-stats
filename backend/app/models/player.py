from pydantic import BaseModel


class PlayerSummary(BaseModel):
    id: int
    full_name: str
    team_id: int
    team_name: str
    is_active: bool


class PlayerBio(BaseModel):
    id: int
    full_name: str
    position: str
    jersey: str
    team_abbreviation: str
    team_name: str
    height: str
    weight: str
    draft_year: str
    draft_round: str
    draft_number: str


class ShotChartEntry(BaseModel):
    game_id: str
    game_date: str
    action_type: str
    shot_type: str
    shot_zone_basic: str
    shot_zone_area: str
    shot_zone_range: str
    shot_distance: int
    loc_x: int
    loc_y: int
    shot_made: bool


class PlayerSeasonStats(BaseModel):
    season: str
    team: str
    gp: int
    mpg: float
    pts: float
    reb: float
    ast: float
    stl: float
    blk: float
    tov: float
    fg_pct: float
    fg3_pct: float
    ft_pct: float


class StatLeader(BaseModel):
    rank: int
    player_id: int
    player_name: str
    team: str
    gp: int
    mpg: float
    # base per-game stats
    pts: float = 0.0
    reb: float = 0.0
    ast: float = 0.0
    stl: float = 0.0
    blk: float = 0.0
    tov: float = 0.0
    fg_pct: float = 0.0
    fg3_pct: float = 0.0
    ft_pct: float = 0.0
    # advanced stats
    off_rating: float = 0.0
    def_rating: float = 0.0
    net_rating: float = 0.0
    ts_pct: float = 0.0
    efg_pct: float = 0.0
    usg_pct: float = 0.0
    pie: float = 0.0
    ast_pct: float = 0.0


class ZoneStat(BaseModel):
    zone: str
    fga: int
    fgm: int
    fg_pct: float
    lg_fg_pct: float
    diff: float
    frequency: float


class PlayerAward(BaseModel):
    description: str
    all_nba_team_number: str
    season: str
    subtype1: str
    subtype2: str
    subtype3: str


class GameLogEntry(BaseModel):
    game_date: str
    matchup: str
    wl: str
    min: float
    pts: int
    reb: int
    ast: int
    stl: int
    blk: int
    tov: int
    fgm: int
    fga: int
    fg_pct: float
    fg3m: int
    fg3a: int
    fg3_pct: float
    ftm: int
    fta: int
    ft_pct: float
    plus_minus: int


class PercentileStat(BaseModel):
    label: str
    value: str
    percentile: int
    higher_is_better: bool


class PlayerPercentiles(BaseModel):
    season: str
    groups: dict[str, list[PercentileStat]]
