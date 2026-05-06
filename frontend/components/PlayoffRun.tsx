"use client";

import { GameLogEntry } from "@/lib/api";

interface Props {
  gamelog: GameLogEntry[];
  playerName: string;
  season: string;
}

const ROUND_NAMES = ["First Round", "Conference Semifinals", "Conference Finals", "NBA Finals"];

interface Series {
  opponent: string;
  wins: number;
  losses: number;
  gp: number;
  pts: number;
  reb: number;
  ast: number;
}

function deriveSeries(gamelog: GameLogEntry[]): Series[] {
  const chronological = [...gamelog].reverse();
  const series: Series[] = [];
  let current: Series | null = null;

  for (const game of chronological) {
    const opponent = game.matchup.split(" ").pop()!;
    if (!current || current.opponent !== opponent) {
      current = { opponent, wins: 0, losses: 0, gp: 0, pts: 0, reb: 0, ast: 0 };
      series.push(current);
    }
    if (game.wl === "W") current.wins++;
    else current.losses++;
    current.gp++;
    current.pts += game.pts;
    current.reb += game.reb;
    current.ast += game.ast;
  }

  return series;
}

export function PlayoffRun({ gamelog, playerName, season }: Props) {
  if (gamelog.length === 0) {
    return (
      <div>
        <p className="section-label">Playoff Run</p>
        <p className="section-title">{season} Playoffs</p>
        <p className="text-sm text-gray-400 mt-4">No playoff appearances.</p>
      </div>
    );
  }

  const series = deriveSeries(gamelog);
  const isChampion = series.length === 4 && series[3].wins === 4;

  return (
    <div>
      <p className="section-label">Playoff Run</p>
      <p className="section-title">{season} Playoffs</p>

      <div className="mt-4 flex flex-col gap-3">
        {series.map((s, i) => {
          const won = s.wins > s.losses;
          const ppg = (s.pts / s.gp).toFixed(1);
          const rpg = (s.reb / s.gp).toFixed(1);
          const apg = (s.ast / s.gp).toFixed(1);

          return (
            <div key={i} className={`rounded-lg p-3 border ${won ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {ROUND_NAMES[i] ?? `Round ${i + 1}`}
                  </p>
                  <p className="font-bold text-sm text-gray-900">vs. {s.opponent}</p>
                </div>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                  won ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}>
                  {won ? "W" : "L"} {s.wins}–{s.losses}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span><span className="font-semibold text-gray-700">{ppg}</span> PPG</span>
                <span><span className="font-semibold text-gray-700">{rpg}</span> RPG</span>
                <span><span className="font-semibold text-gray-700">{apg}</span> APG</span>
                <span className="text-gray-400">{s.gp}G</span>
              </div>
            </div>
          );
        })}

        {isChampion && (
          <div className="rounded-lg p-3 bg-amber-50 border border-amber-200 text-center">
            <span className="text-sm font-bold text-amber-700">NBA Champions</span>
          </div>
        )}
      </div>
    </div>
  );
}
