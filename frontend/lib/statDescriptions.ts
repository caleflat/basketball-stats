export const STAT_DESCRIPTIONS: Record<string, string> = {
  // Traditional
  "Points":           "Points scored per game.",
  "FG%":              "Field goal percentage — made field goals divided by attempts.",
  "3P%":              "Three-point percentage — made threes divided by three-point attempts.",
  "FT%":              "Free throw percentage — made free throws divided by attempts.",
  "Assists":          "Assists per game.",
  "Turnovers":        "Turnovers per game. Lower is better.",
  "Rebounds":         "Total rebounds (offensive + defensive) per game.",
  "Off. Rebounds":    "Offensive rebounds per game — second-chance opportunities created.",
  "Def. Rebounds":    "Defensive rebounds per game.",
  "Steals":           "Steals per game.",
  "Blocks":           "Blocks per game.",

  // Advanced — Impact
  "Off. Rating":      "Points scored by the player's team per 100 possessions while they're on the floor. Higher is better.",
  "Def. Rating":      "Points allowed by the player's team per 100 possessions while they're on the floor. Lower is better.",
  "Net Rating":       "Offensive rating minus defensive rating. Measures overall on-court impact per 100 possessions.",
  "Player Impact (PIE)": "Player Impact Estimate — a player's share of total game activity (points, rebounds, assists, etc.) compared to both teams combined. Correlates closely with wins.",

  // Advanced — Efficiency
  "True Shooting %":  "Shooting efficiency that accounts for two-pointers, three-pointers, and free throws. Formula: PTS / (2 × (FGA + 0.44 × FTA)).",
  "Eff. FG%":         "Effective field goal percentage — adjusts FG% to account for the extra value of made three-pointers.",
  "Usage %":          "Percentage of team plays used by the player (via field goal attempts, free throw attempts, or turnovers) while on the floor.",
  "Assist %":         "Percentage of teammate field goals the player assisted while on the floor.",
};
