"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { api, LineupEntry } from "@/lib/api";

interface StatConfig {
  key: string;
  label: string;
  col: keyof LineupEntry;
  format?: (v: number) => string;
  extraCols: { label: string; col: keyof LineupEntry; format?: (v: number) => string }[];
}

const STATS: StatConfig[] = [
  {
    key: "net_rating", label: "Net Rtg", col: "net_rating",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "Off Rtg", col: "off_rating" }, { label: "Def Rtg", col: "def_rating" },
    ],
  },
  {
    key: "off_rating", label: "Off Rtg", col: "off_rating",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "Def Rtg", col: "def_rating" }, { label: "Net Rtg", col: "net_rating" },
    ],
  },
  {
    key: "def_rating", label: "Def Rtg", col: "def_rating",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "Off Rtg", col: "off_rating" }, { label: "Net Rtg", col: "net_rating" },
    ],
  },
  {
    key: "pts", label: "PTS", col: "pts",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "FG%", col: "fg_pct", format: (v) => `${v}%` },
      { label: "3P%", col: "fg3_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "reb", label: "REB", col: "reb",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "PTS", col: "pts" }, { label: "AST", col: "ast" },
    ],
  },
  {
    key: "ast", label: "AST", col: "ast",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "PTS", col: "pts" }, { label: "TOV", col: "tov" },
    ],
  },
  {
    key: "ts_pct", label: "TS%", col: "ts_pct",
    format: (v) => `${v}%`,
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "FG%", col: "fg_pct", format: (v) => `${v}%` },
      { label: "3P%", col: "fg3_pct", format: (v) => `${v}%` },
    ],
  },
  {
    key: "pace", label: "Pace", col: "pace",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "Off Rtg", col: "off_rating" }, { label: "Net Rtg", col: "net_rating" },
    ],
  },
];

const GROUPS = [
  { label: "Ratings", keys: ["net_rating", "off_rating", "def_rating", "pace"] },
  { label: "Traditional", keys: ["pts", "reb", "ast", "ts_pct"] },
];

const SIZE_LABELS: Record<number, string> = { 2: "2-Man", 3: "3-Man", 4: "4-Man", 5: "5-Man" };
const MIN_GP: Record<number, number> = { 2: 50, 3: 30, 4: 20, 5: 15 };

function LineupNames({ groupName }: { groupName: string }) {
  const names = groupName.split(" - ");
  return (
    <div className="flex flex-col gap-0.5">
      {names.map((name, i) => (
        <span key={i} className="text-gray-900 leading-tight">{name}</span>
      ))}
    </div>
  );
}

function LineupsContent() {
  const searchParams = useSearchParams();
  const season = searchParams.get("season") ?? "2025-26";

  const [size, setSize] = useState(5);
  const [stat, setStat] = useState("net_rating");
  const [lineups, setLineups] = useState<LineupEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (sz: number, s: string, ss: string) => {
    setLoading(true);
    setError(null);
    try {
      setLineups(await api.getLineups(sz, ss, s));
    } catch {
      setError("Failed to load lineups — try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(size, stat, season); }, [size, stat, season, load]);

  const config = STATS.find((s) => s.key === stat)!;

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Lineups</h1>
          <p className="text-sm text-gray-400">{season} Regular Season · Per game · Min. {MIN_GP[size]} GP</p>
        </div>

        {/* Size selector */}
        <div className="flex gap-2 mb-4">
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                size === n
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {SIZE_LABELS[n]}
            </button>
          ))}
        </div>

        {/* Stat selector */}
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

        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium w-10">#</th>
                <th className="text-left px-4 py-3 font-medium">Lineup</th>
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
                    Loading… (first load may take a few seconds)
                  </td>
                </tr>
              ) : (
                lineups.map((row, i) => (
                  <tr key={row.group_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs align-top">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-xs align-top">
                      <LineupNames groupName={row.group_name} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 align-top">{row.team}</td>
                    {config.extraCols.map((c) => (
                      <td key={c.col} className="px-4 py-3 text-right text-gray-500 align-top">
                        {c.format ? c.format(row[c.col] as number) : row[c.col]}
                      </td>
                    ))}
                    <td className="px-6 py-3 text-right font-bold text-gray-900 align-top">
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

export default function LineupsPage() {
  return (
    <Suspense>
      <LineupsContent />
    </Suspense>
  );
}
