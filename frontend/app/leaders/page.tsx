"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { api, StatLeader } from "@/lib/api";
import { STAT_DESCRIPTIONS } from "@/lib/statDescriptions";

interface StatConfig {
  key: string;
  label: string;
  descriptionKey?: string;
  col: keyof StatLeader;
  format?: (v: number) => string;
  extraCols: { label: string; col: keyof StatLeader; format?: (v: number) => string }[];
}

const STATS: StatConfig[] = [
  {
    key: "pts", label: "Points", col: "pts",
    extraCols: [
      { label: "GP", col: "gp" },
      { label: "MIN", col: "mpg" },
      { label: "FG%", col: "fg_pct", format: (v) => `${v}%` },
      { label: "3P%", col: "fg3_pct", format: (v) => `${v}%` },
      { label: "FT%", col: "ft_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "reb", label: "Rebounds", col: "reb",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "AST", col: "ast" },
    ],
  },
  {
    key: "ast", label: "Assists", col: "ast",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "TOV", col: "tov" },
    ],
  },
  {
    key: "stl", label: "Steals", col: "stl",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "REB", col: "reb" },
    ],
  },
  {
    key: "blk", label: "Blocks", col: "blk",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "REB", col: "reb" },
    ],
  },
  {
    key: "fg_pct", label: "FG%", col: "fg_pct",
    format: (v) => `${v}%`,
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "3P%", col: "fg3_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "fg3_pct", label: "3P%", col: "fg3_pct",
    format: (v) => `${v}%`,
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "FG%", col: "fg_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "ft_pct", label: "FT%", col: "ft_pct",
    format: (v) => `${v}%`,
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "FG%", col: "fg_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "tov", label: "Turnovers", col: "tov",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "AST", col: "ast" },
    ],
  },
  // Advanced
  {
    key: "off_rating", label: "Off. Rating", descriptionKey: "Off. Rating", col: "off_rating",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "Def. Rtg", col: "def_rating" }, { label: "Net Rtg", col: "net_rating" },
    ],
  },
  {
    key: "def_rating", label: "Def. Rating", descriptionKey: "Def. Rating", col: "def_rating",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "Off. Rtg", col: "off_rating" }, { label: "Net Rtg", col: "net_rating" },
    ],
  },
  {
    key: "net_rating", label: "Net Rating", descriptionKey: "Net Rating", col: "net_rating",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "Off. Rtg", col: "off_rating" }, { label: "Def. Rtg", col: "def_rating" },
    ],
  },
  {
    key: "ts_pct", label: "TS%", descriptionKey: "True Shooting %", col: "ts_pct",
    format: (v) => `${v}%`,
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "eFG%", col: "efg_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "usg_pct", label: "Usage %", descriptionKey: "Usage %", col: "usg_pct",
    format: (v) => `${v}%`,
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "PTS", col: "pts" }, { label: "TS%", col: "ts_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "pie", label: "PIE", descriptionKey: "Player Impact (PIE)", col: "pie",
    format: (v) => `${v}%`,
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "Net Rtg", col: "net_rating" }, { label: "TS%", col: "ts_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "ast_pct", label: "AST%", descriptionKey: "Assist %", col: "ast_pct",
    format: (v) => `${v}%`,
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "mpg" },
      { label: "AST", col: "ast" }, { label: "TOV", col: "tov" },
    ],
  },
];

const GROUPS = [
  { label: "Traditional", keys: ["pts","reb","ast","stl","blk","fg_pct","fg3_pct","ft_pct","tov"] },
  { label: "Advanced", keys: ["off_rating","def_rating","net_rating","ts_pct","usg_pct","pie","ast_pct"] },
];

export default function LeadersPage() {
  const searchParams = useSearchParams();
  const season = searchParams.get("season") ?? "2025-26";

  const [stat, setStat] = useState("pts");
  const [leaders, setLeaders] = useState<StatLeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (s: string, ss: string) => {
    setLoading(true);
    setError(null);
    try {
      setLeaders(await api.getStatLeaders(s, ss));
    } catch {
      setError("Failed to load leaders — try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(stat, season); }, [stat, season, load]);

  const config = STATS.find((s) => s.key === stat)!;

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Stat Leaders</h1>
          <p className="text-sm text-gray-400">{season} Regular Season · Per game · Min. 15 GP</p>
        </div>

        {GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {STATS.filter((s) => group.keys.includes(s.key)).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStat(s.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    stat === s.key
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {config.descriptionKey && STAT_DESCRIPTIONS[config.descriptionKey] && (
            <p className="text-sm text-gray-500 mt-2 max-w-xl">
              {STAT_DESCRIPTIONS[config.descriptionKey]}
            </p>
          )}

        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium w-10">#</th>
                <th className="text-left px-4 py-3 font-medium">Player</th>
                <th className="text-left px-4 py-3 font-medium">Team</th>
                {config.extraCols.map((c) => (
                  <th key={c.col} className="text-right px-4 py-3 font-medium">{c.label}</th>
                ))}
                <th className="text-right px-6 py-3 font-medium text-gray-700">{config.label}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4 + config.extraCols.length} className="text-center py-16 text-gray-400 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : (
                leaders.map((row) => (
                  <tr key={row.player_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{row.rank}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <Link href={`/?player_id=${row.player_id}&season=${season}`} className="hover:text-blue-600 transition-colors">
                        {row.player_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.team}</td>
                    {config.extraCols.map((c) => (
                      <td key={c.col} className="px-4 py-3 text-right text-gray-500">
                        {c.format ? c.format(row[c.col] as number) : row[c.col]}
                      </td>
                    ))}
                    <td className="px-6 py-3 text-right font-bold text-gray-900">
                      {config.format ? config.format(row[config.col] as number) : row[config.col]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
