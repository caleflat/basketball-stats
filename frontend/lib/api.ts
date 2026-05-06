const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface PlayerSummary {
  id: number;
  full_name: string;
  team_id: number;
  team_name: string;
  is_active: boolean;
}

export interface PlayerBio {
  id: number;
  full_name: string;
  position: string;
  jersey: string;
  team_abbreviation: string;
  team_name: string;
  height: string;
  weight: string;
  draft_year: string;
  draft_round: string;
  draft_number: string;
}

export interface PlayerSeasonStats {
  season: string;
  team: string;
  gp: number;
  mpg: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
}

export interface PercentileStat {
  label: string;
  value: string;
  percentile: number;
  higher_is_better: boolean;
}

export interface PlayerPercentiles {
  season: string;
  groups: Record<string, PercentileStat[]>;
}

export interface StatLeader {
  rank: number;
  player_id: number;
  player_name: string;
  team: string;
  gp: number;
  mpg: number;
  // base
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  // advanced
  off_rating: number;
  def_rating: number;
  net_rating: number;
  ts_pct: number;
  efg_pct: number;
  usg_pct: number;
  pie: number;
  ast_pct: number;
}

export interface ZoneStat {
  zone: string;
  fga: number;
  fgm: number;
  fg_pct: number;
  lg_fg_pct: number;
  diff: number;
  frequency: number;
}

export interface PlayerAward {
  description: string;
  all_nba_team_number: string;
  season: string;
  subtype1: string;
  subtype2: string;
  subtype3: string;
}

export interface GameLogEntry {
  game_date: string;
  matchup: string;
  wl: string;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fgm: number;
  fga: number;
  fg_pct: number;
  fg3m: number;
  fg3a: number;
  fg3_pct: number;
  ftm: number;
  fta: number;
  ft_pct: number;
  plus_minus: number;
}

export interface LineupEntry {
  group_id: string;
  group_name: string;
  team: string;
  gp: number;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  tov: number;
  fg_pct: number;
  fg3_pct: number;
  plus_minus: number;
  off_rating: number;
  def_rating: number;
  net_rating: number;
  pace: number;
  ts_pct: number;
}

export interface ShotChartEntry {
  game_id: string;
  game_date: string;
  action_type: string;
  shot_type: string;
  shot_zone_basic: string;
  shot_zone_area: string;
  shot_zone_range: string;
  shot_distance: number;
  loc_x: number;
  loc_y: number;
  shot_made: boolean;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  searchPlayers: (q: string) =>
    get<PlayerSummary[]>(`/players/search?q=${encodeURIComponent(q)}`),

  getPlayerBio: (playerId: number) =>
    get<PlayerBio>(`/players/${playerId}/bio`),

  getPlayerStats: (playerId: number, season: string) =>
    get<PlayerSeasonStats>(`/players/${playerId}/stats?season=${season}`),

  getCareerStats: (playerId: number) =>
    get<PlayerSeasonStats[]>(`/players/${playerId}/career`),

  getPlayerPercentiles: (playerId: number, season: string) =>
    get<PlayerPercentiles>(`/players/${playerId}/percentiles?season=${season}`),

  getShotChart: (playerId: number, season: string) =>
    get<ShotChartEntry[]>(`/players/${playerId}/shots?season=${season}`),

  getZones: (playerId: number, season: string) =>
    get<ZoneStat[]>(`/players/${playerId}/zones?season=${season}`),

  getStatLeaders: (stat: string, season: string, limit = 25) =>
    get<StatLeader[]>(`/leaders?stat=${stat}&season=${season}&limit=${limit}`),

  getGameLog: (playerId: number, season: string) =>
    get<GameLogEntry[]>(`/players/${playerId}/gamelog?season=${season}`),

  getPlayerAwards: (playerId: number) =>
    get<PlayerAward[]>(`/players/${playerId}/awards`),

  getLineups: (groupQuantity: number, season: string, sortBy = "net_rating", limit = 25) =>
    get<LineupEntry[]>(`/lineups?group_quantity=${groupQuantity}&season=${season}&sort_by=${sortBy}&limit=${limit}`),

  lookupLineup: (playerIds: number[], season: string) =>
    get<LineupEntry | null>(`/lineups/lookup?player_ids=${playerIds.join(",")}&season=${season}`),
};
