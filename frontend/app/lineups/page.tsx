"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { api, LineupEntry, PlayerSummary } from "@/lib/api";

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
  {
    key: "plus_minus", label: "+/-", col: "plus_minus",
    extraCols: [
      { label: "GP", col: "gp" }, { label: "MIN", col: "min" },
      { label: "Off Rtg", col: "off_rating" }, { label: "Net Rtg", col: "net_rating" },
    ],
  },
];

const GROUPS = [
  { label: "Ratings", keys: ["net_rating", "off_rating", "def_rating", "pace", "plus_minus"] },
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

function LineupStatsCard({ entry }: { entry: LineupEntry }) {
  const stats = [
    { label: "GP", value: entry.gp },
    { label: "MIN", value: entry.min },
    { label: "PTS", value: entry.pts },
    { label: "REB", value: entry.reb },
    { label: "AST", value: entry.ast },
    { label: "TOV", value: entry.tov },
    { label: "FG%", value: `${entry.fg_pct}%` },
    { label: "3P%", value: `${entry.fg3_pct}%` },
    { label: "TS%", value: `${entry.ts_pct}%` },
    { label: "+/-", value: entry.plus_minus },
    { label: "Off Rtg", value: entry.off_rating },
    { label: "Def Rtg", value: entry.def_rating },
    { label: "Net Rtg", value: entry.net_rating },
    { label: "Pace", value: entry.pace },
  ];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{entry.team} · {entry.gp} GP</p>
        <LineupNames groupName={entry.group_name} />
      </div>
      <div className="grid grid-cols-4 gap-3 mt-4">
        {stats.slice(2).map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center bg-gray-50 rounded-lg py-3 px-2">
            <span className="text-lg font-bold text-gray-900">{value}</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerChip({ player, onRemove }: { player: PlayerSummary; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium">
      {player.full_name}
      <button onClick={onRemove} className="text-gray-400 hover:text-white transition-colors leading-none">✕</button>
    </span>
  );
}

function PlayerSearchInput({
  onSelect,
  excludeIds,
}: {
  onSelect: (p: PlayerSummary) => void;
  excludeIds: Set<number>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await api.searchPlayers(q);
      setResults(data.filter((p) => p.is_active && !excludeIds.has(p.id)).slice(0, 8));
    } finally {
      setLoading(false);
    }
  }, [excludeIds]);

  function handleSelect(p: PlayerSummary) {
    onSelect(p);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Add a player…"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && <div className="absolute right-3 top-2.5 text-gray-400 text-xs">searching…</div>}
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => handleSelect(p)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                {p.full_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BuildTab({ season }: { season: string }) {
  const [selected, setSelected] = useState<PlayerSummary[]>([]);
  const [result, setResult] = useState<LineupEntry | null | "not_found">(null);
  const [loading, setLoading] = useState(false);

  const excludeIds = new Set(selected.map((p) => p.id));

  function addPlayer(p: PlayerSummary) {
    if (selected.length >= 5) return;
    setSelected((prev) => [...prev, p]);
    setResult(null);
  }

  function removePlayer(id: number) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
    setResult(null);
  }

  async function handleLookup() {
    setLoading(true);
    setResult(null);
    try {
      const data = await api.lookupLineup(selected.map((p) => p.id), season);
      setResult(data ?? "not_found");
    } catch {
      setResult("not_found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Select 2–5 players</p>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selected.map((p) => (
              <PlayerChip key={p.id} player={p} onRemove={() => removePlayer(p.id)} />
            ))}
          </div>
        )}

        {selected.length < 5 && (
          <PlayerSearchInput onSelect={addPlayer} excludeIds={excludeIds} />
        )}

        {selected.length >= 2 && (
          <button
            onClick={handleLookup}
            disabled={loading}
            className="mt-4 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Looking up…" : "Find lineup"}
          </button>
        )}
      </div>

      {result === "not_found" && (
        <p className="text-sm text-gray-400 text-center py-6">
          No data — these players may not have played together this season.
        </p>
      )}

      {result && result !== "not_found" && (
        <LineupStatsCard entry={result} />
      )}
    </div>
  );
}

function LineupsContent() {
  const searchParams = useSearchParams();
  const season = searchParams.get("season") ?? "2025-26";

  const [mode, setMode] = useState<"browse" | "build">("browse");
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

  useEffect(() => {
    if (mode === "browse") load(size, stat, season);
  }, [size, stat, season, mode, load]);

  const config = STATS.find((s) => s.key === stat)!;

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Lineups</h1>
            <p className="text-sm text-gray-400">
              {season} Regular Season
              {mode === "browse" ? ` · Per game · Min. ${MIN_GP[size]} GP` : ""}
            </p>
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {(["browse", "build"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  mode === m ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {mode === "build" ? (
          <BuildTab season={season} />
        ) : (
          <>
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
          </>
        )}
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
