import numpy as np
from nba_api.stats.library.http import NBAStatsHTTP
from nba_api.stats.static import players as static_players
from nba_api.stats.endpoints import (
    shotchartdetail,
    playercareerstats,
    playergamelog,
    playerawards,
    leaguedashplayerstats,
    commonplayerinfo,
)
from app.cache import cached

NBAStatsHTTP.HEADERS = {
    "Host": "stats.nba.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.nba.com/",
    "Origin": "https://www.nba.com",
    "Connection": "keep-alive",
    "x-nba-stats-origin": "stats",
    "x-nba-stats-token": "true",
}
from app.models.player import (
    PlayerSummary,
    PlayerBio,
    ShotChartEntry,
    PlayerSeasonStats,
    StatLeader,
    ZoneStat,
    GameLogEntry,
    PlayerAward,
    PercentileStat,
    PlayerPercentiles,
)


def search_players(query: str) -> list[PlayerSummary]:
    matches = static_players.find_players_by_full_name(query)
    return [
        PlayerSummary(id=p["id"], full_name=p["full_name"], team_id=0, team_name="", is_active=p["is_active"])
        for p in matches
    ]


@cached()
def get_player_bio(player_id: int) -> PlayerBio | None:
    response = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    df = response.get_data_frames()[0]
    if df.empty:
        return None
    r = df.iloc[0]
    return PlayerBio(
        id=player_id,
        full_name=r["DISPLAY_FIRST_LAST"],
        position=r["POSITION"],
        jersey=r["JERSEY"],
        team_abbreviation=r["TEAM_ABBREVIATION"],
        team_name=r["TEAM_NAME"],
        height=r["HEIGHT"],
        weight=r["WEIGHT"],
        draft_year=str(r["DRAFT_YEAR"]),
        draft_round=str(r["DRAFT_ROUND"]),
        draft_number=str(r["DRAFT_NUMBER"]),
    )


_SKIP_AWARDS = {"Player of the Week", "Player of the Month"}


@cached()
def get_player_awards(player_id: int) -> list[PlayerAward]:
    df = playerawards.PlayerAwards(player_id=player_id).get_data_frames()[0]
    result = []
    for _, row in df.iterrows():
        desc = str(row["DESCRIPTION"]).strip()
        if not desc or desc in _SKIP_AWARDS or "of the Week" in desc or "of the Month" in desc:
            continue
        result.append(PlayerAward(
            description=desc,
            all_nba_team_number=str(row["ALL_NBA_TEAM_NUMBER"] or ""),
            season=str(row["SEASON"] or ""),
            subtype1=str(row["SUBTYPE1"] or ""),
            subtype2=str(row["SUBTYPE2"] or ""),
            subtype3=str(row["SUBTYPE3"] or ""),
        ))
    return result


def _row_to_season_stats(r) -> PlayerSeasonStats:
    gp = int(r["GP"]) or 1
    return PlayerSeasonStats(
        season=r["SEASON_ID"],
        team=r["TEAM_ABBREVIATION"],
        gp=gp,
        mpg=round(r["MIN"] / gp, 1),
        pts=round(r["PTS"] / gp, 1),
        reb=round(r["REB"] / gp, 1),
        ast=round(r["AST"] / gp, 1),
        stl=round(r["STL"] / gp, 1),
        blk=round(r["BLK"] / gp, 1),
        tov=round(r["TOV"] / gp, 1),
        fg_pct=round(r["FG_PCT"] * 100, 1),
        fg3_pct=round(r["FG3_PCT"] * 100, 1),
        ft_pct=round(r["FT_PCT"] * 100, 1),
    )


@cached()
def get_career_stats(player_id: int) -> list[PlayerSeasonStats]:
    response = playercareerstats.PlayerCareerStats(player_id=player_id)
    df = response.get_data_frames()[0]
    # Drop duplicate seasons (traded players have multiple rows per season; keep highest GP)
    df = df.sort_values("GP", ascending=False).drop_duplicates("SEASON_ID").sort_values("SEASON_ID", ascending=False)
    return [_row_to_season_stats(row) for _, row in df.iterrows()]


@cached()
def get_player_stats(player_id: int, season: str) -> PlayerSeasonStats | None:
    seasons = get_career_stats(player_id)
    match = [s for s in seasons if s.season == season]
    return match[0] if match else None


@cached()
def _league_per_game(season: str):
    """Per-game base stats for qualified players (GP >= 15). Cached per season."""
    response = leaguedashplayerstats.LeagueDashPlayerStats(
        season=season,
        per_mode_detailed="PerGame",
        season_type_all_star="Regular Season",
    )
    df = response.get_data_frames()[0]
    return df[df["GP"] >= 15].reset_index(drop=True)


@cached()
def _league_advanced(season: str):
    """Advanced stats for qualified players (GP >= 15). Cached per season."""
    response = leaguedashplayerstats.LeagueDashPlayerStats(
        season=season,
        per_mode_detailed="PerGame",
        measure_type_detailed_defense="Advanced",
        season_type_all_star="Regular Season",
    )
    df = response.get_data_frames()[0]
    return df[df["GP"] >= 15].reset_index(drop=True)


# (col_name, ascending) — ascending=True means lower is better
STAT_COLS = {
    "pts":      ("PTS",     False),
    "reb":      ("REB",     False),
    "ast":      ("AST",     False),
    "stl":      ("STL",     False),
    "blk":      ("BLK",     False),
    "tov":      ("TOV",     True),
    "fg_pct":   ("FG_PCT",  False),
    "fg3_pct":  ("FG3_PCT", False),
    "ft_pct":   ("FT_PCT",  False),
    "mpg":      ("MIN",     False),
}

ADVANCED_STAT_COLS = {
    "off_rating": ("OFF_RATING", False),
    "def_rating": ("DEF_RATING", True),
    "net_rating": ("NET_RATING", False),
    "ts_pct":     ("TS_PCT",     False),
    "efg_pct":    ("EFG_PCT",    False),
    "usg_pct":    ("USG_PCT",    False),
    "pie":        ("PIE",        False),
    "ast_pct":    ("AST_PCT",    False),
}

_PCT_MINIMUMS = {"FG_PCT": 3.0, "FG3_PCT": 1.5, "FT_PCT": 1.5}


def _build_base_leader(rank: int, row) -> StatLeader:
    return StatLeader(
        rank=rank,
        player_id=int(row["PLAYER_ID"]),
        player_name=row["PLAYER_NAME"],
        team=row["TEAM_ABBREVIATION"],
        gp=int(row["GP"]),
        mpg=round(float(row["MIN"]), 1),
        pts=round(float(row["PTS"]), 1),
        reb=round(float(row["REB"]), 1),
        ast=round(float(row["AST"]), 1),
        stl=round(float(row["STL"]), 1),
        blk=round(float(row["BLK"]), 1),
        tov=round(float(row["TOV"]), 1),
        fg_pct=round(float(row["FG_PCT"]) * 100, 1),
        fg3_pct=round(float(row["FG3_PCT"]) * 100, 1),
        ft_pct=round(float(row["FT_PCT"]) * 100, 1),
    )


def _build_advanced_leader(rank: int, row) -> StatLeader:
    return StatLeader(
        rank=rank,
        player_id=int(row["PLAYER_ID"]),
        player_name=row["PLAYER_NAME"],
        team=row["TEAM_ABBREVIATION"],
        gp=int(row["GP"]),
        mpg=round(float(row["MIN"]), 1),
        off_rating=round(float(row["OFF_RATING"]), 1),
        def_rating=round(float(row["DEF_RATING"]), 1),
        net_rating=round(float(row["NET_RATING"]), 1),
        ts_pct=round(float(row["TS_PCT"]) * 100, 1),
        efg_pct=round(float(row["EFG_PCT"]) * 100, 1),
        usg_pct=round(float(row["USG_PCT"]) * 100, 1),
        pie=round(float(row["PIE"]) * 100, 1),
        ast_pct=round(float(row["AST_PCT"]) * 100, 1),
    )


@cached()
def get_stat_leaders(season: str, stat: str, limit: int) -> list[StatLeader]:
    if stat in ADVANCED_STAT_COLS:
        col, ascending = ADVANCED_STAT_COLS[stat]
        df = _league_advanced(season).copy()
        df = df.sort_values(col, ascending=ascending).head(limit).reset_index(drop=True)
        return [_build_advanced_leader(int(i) + 1, row) for i, row in df.iterrows()]

    col, ascending = STAT_COLS[stat]
    df = _league_per_game(season).copy()
    df[["FG_PCT", "FG3_PCT", "FT_PCT"]] = df[["FG_PCT", "FG3_PCT", "FT_PCT"]].fillna(0)
    if col in _PCT_MINIMUMS:
        att_col = {"FG_PCT": "FGA", "FG3_PCT": "FG3A", "FT_PCT": "FTA"}[col]
        df = df[df[att_col] >= _PCT_MINIMUMS[col]]
    df = df.sort_values(col, ascending=ascending).head(limit).reset_index(drop=True)
    return [_build_base_leader(int(i) + 1, row) for i, row in df.iterrows()]


def _pct_of_score(arr: np.ndarray, value: float) -> int:
    """Percentile of value relative to arr (what % of players score <= value)."""
    return int(np.mean(arr <= value) * 100)


@cached()
def get_player_percentiles(player_id: int, season: str) -> PlayerPercentiles | None:
    base_df = _league_per_game(season)
    adv_df = _league_advanced(season)

    base_row = base_df[base_df["PLAYER_ID"] == player_id]
    if base_row.empty:
        return None
    p = base_row.iloc[0]
    adv_row = adv_df[adv_df["PLAYER_ID"] == player_id]
    pa = adv_row.iloc[0] if not adv_row.empty else None

    def stat(col: str, label: str, higher_is_better: bool, is_pct: bool = False) -> PercentileStat:
        arr = base_df[col].dropna().values.astype(float)
        value = float(p[col])
        raw_pct = _pct_of_score(arr, value)
        percentile = raw_pct if higher_is_better else 100 - raw_pct
        formatted = f"{value * 100:.1f}%" if is_pct else f"{value:.1f}"
        return PercentileStat(label=label, value=formatted, percentile=percentile, higher_is_better=higher_is_better)

    def adv_stat(col: str, label: str, higher_is_better: bool, is_pct: bool = False) -> PercentileStat | None:
        if pa is None:
            return None
        arr = adv_df[col].dropna().values.astype(float)
        value = float(pa[col])
        raw_pct = _pct_of_score(arr, value)
        percentile = raw_pct if higher_is_better else 100 - raw_pct
        formatted = f"{value * 100:.1f}%" if is_pct else f"{value:.1f}"
        return PercentileStat(label=label, value=formatted, percentile=percentile, higher_is_better=higher_is_better)

    groups: dict[str, list[PercentileStat]] = {
        "Scoring": [
            stat("PTS", "Points", True),
            stat("FG_PCT", "FG%", True, is_pct=True),
            stat("FG3_PCT", "3P%", True, is_pct=True),
            stat("FT_PCT", "FT%", True, is_pct=True),
        ],
        "Playmaking": [
            stat("AST", "Assists", True),
            stat("TOV", "Turnovers", False),
        ],
        "Rebounding": [
            stat("REB", "Rebounds", True),
            stat("OREB", "Off. Rebounds", True),
            stat("DREB", "Def. Rebounds", True),
        ],
        "Defense": [
            stat("STL", "Steals", True),
            stat("BLK", "Blocks", True),
        ],
    }

    if pa is not None:
        impact = [
            adv_stat("OFF_RATING", "Off. Rating", True),
            adv_stat("DEF_RATING", "Def. Rating", False),
            adv_stat("NET_RATING", "Net Rating", True),
            adv_stat("PIE", "Player Impact (PIE)", True, is_pct=True),
        ]
        efficiency = [
            adv_stat("TS_PCT", "True Shooting %", True, is_pct=True),
            adv_stat("EFG_PCT", "Eff. FG%", True, is_pct=True),
            adv_stat("USG_PCT", "Usage %", True, is_pct=True),
            adv_stat("AST_PCT", "Assist %", True, is_pct=True),
        ]
        groups["Impact"] = [s for s in impact if s is not None]
        groups["Efficiency"] = [s for s in efficiency if s is not None]

    return PlayerPercentiles(season=season, groups=groups)


# League-average FG% per zone (2024-25 NBA, approximate)
_LG_AVG: dict[str, float] = {
    "Restricted Area":  0.647,
    "Paint (Non-RA)":   0.408,
    "Mid-Range Left":   0.398,
    "Mid-Range Center": 0.412,
    "Mid-Range Right":  0.398,
    "Left Corner 3":    0.381,
    "Right Corner 3":   0.381,
    "Above the Break 3": 0.362,
}

def _classify_zone(basic: str, area: str) -> str | None:
    if basic == "Restricted Area":
        return "Restricted Area"
    if basic == "In The Paint (Non-RA)":
        return "Paint (Non-RA)"
    if basic == "Left Corner 3":
        return "Left Corner 3"
    if basic == "Right Corner 3":
        return "Right Corner 3"
    if basic == "Above the Break 3":
        return "Above the Break 3"
    if basic == "Mid-Range":
        if area in ("Left Side(L)", "Left Side Center(LC)"):
            return "Mid-Range Left"
        if area in ("Right Side(R)", "Right Side Center(RC)"):
            return "Mid-Range Right"
        return "Mid-Range Center"
    return None


@cached()
def get_shot_zones(player_id: int, season: str) -> list[ZoneStat]:
    shots = get_shot_chart(player_id, season)
    if not shots:
        return []

    totals: dict[str, dict] = {}
    for shot in shots:
        zone = _classify_zone(shot.shot_zone_basic, shot.shot_zone_area)
        if zone is None:
            continue
        if zone not in totals:
            totals[zone] = {"fga": 0, "fgm": 0}
        totals[zone]["fga"] += 1
        if shot.shot_made:
            totals[zone]["fgm"] += 1

    total_fga = sum(v["fga"] for v in totals.values()) or 1
    result = []
    for zone, data in totals.items():
        fga, fgm = data["fga"], data["fgm"]
        fg_pct = fgm / fga if fga > 0 else 0
        lg = _LG_AVG.get(zone, 0.40)
        result.append(ZoneStat(
            zone=zone,
            fga=fga,
            fgm=fgm,
            fg_pct=round(fg_pct * 100, 1),
            lg_fg_pct=round(lg * 100, 1),
            diff=round((fg_pct - lg) * 100, 1),
            frequency=round(fga / total_fga * 100, 1),
        ))
    return result


def _parse_min(val) -> float:
    """Handle MIN as either 'MM:SS' string or numeric float."""
    try:
        if isinstance(val, str) and ":" in val:
            m, s = val.split(":")
            return round(int(m) + int(s) / 60, 1)
        return round(float(val or 0), 1)
    except (ValueError, TypeError):
        return 0.0


@cached()
def get_game_log(player_id: int, season: str) -> list[GameLogEntry]:
    response = playergamelog.PlayerGameLog(
        player_id=player_id,
        season=season,
        season_type_all_star="Regular Season",
    )
    df = response.get_data_frames()[0]
    result = []
    for _, row in df.iterrows():
        fga = int(row["FGA"])
        fg3a = int(row["FG3A"])
        fta = int(row["FTA"])
        result.append(GameLogEntry(
            game_date=str(row["GAME_DATE"]),
            matchup=str(row["MATCHUP"]),
            wl=str(row["WL"]) if row["WL"] else "",
            min=_parse_min(row["MIN"]),
            pts=int(row["PTS"]),
            reb=int(row["REB"]),
            ast=int(row["AST"]),
            stl=int(row["STL"]),
            blk=int(row["BLK"]),
            tov=int(row["TOV"]),
            fgm=int(row["FGM"]),
            fga=fga,
            fg_pct=round(float(row["FG_PCT"]) * 100, 1) if fga > 0 else 0.0,
            fg3m=int(row["FG3M"]),
            fg3a=fg3a,
            fg3_pct=round(float(row["FG3_PCT"]) * 100, 1) if fg3a > 0 else 0.0,
            ftm=int(row["FTM"]),
            fta=fta,
            ft_pct=round(float(row["FT_PCT"]) * 100, 1) if fta > 0 else 0.0,
            plus_minus=int(row["PLUS_MINUS"]),
        ))
    return result


@cached()
def get_shot_chart(player_id: int, season: str) -> list[ShotChartEntry]:
    response = shotchartdetail.ShotChartDetail(
        team_id=0,
        player_id=player_id,
        season_nullable=season,
        season_type_all_star="Regular Season",
        context_measure_simple="FGA",
    )
    df = response.get_data_frames()[0]

    shots = []
    for _, row in df.iterrows():
        shots.append(
            ShotChartEntry(
                game_id=row["GAME_ID"],
                game_date=row["GAME_DATE"],
                action_type=row["ACTION_TYPE"],
                shot_type=row["SHOT_TYPE"],
                shot_zone_basic=row["SHOT_ZONE_BASIC"],
                shot_zone_area=row["SHOT_ZONE_AREA"],
                shot_zone_range=row["SHOT_ZONE_RANGE"],
                shot_distance=int(row["SHOT_DISTANCE"]),
                loc_x=int(row["LOC_X"]),
                loc_y=int(row["LOC_Y"]),
                shot_made=bool(row["SHOT_MADE_FLAG"]),
            )
        )

    return shots
