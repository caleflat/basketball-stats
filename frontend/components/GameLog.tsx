"use client";

import { GameLogEntry } from "@/lib/api";

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function parseMatchup(matchup: string) {
  if (matchup.includes(" @ ")) {
    return `@ ${matchup.split(" @ ")[1]}`;
  }
  return `vs ${matchup.split(" vs. ")[1]}`;
}

function pct(made: number, att: number, val: number) {
  if (att === 0) return "—";
  return `${val.toFixed(1)}%`;
}

interface Props {
  entries: GameLogEntry[];
}

const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th
    className={`py-2 px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${right ? "text-right" : "text-left"}`}
  >
    {children}
  </th>
);

const TD = ({ children, right, className = "" }: { children: React.ReactNode; right?: boolean; className?: string }) => (
  <td className={`py-1.5 px-2 text-sm whitespace-nowrap ${right ? "text-right" : "text-left"} ${className}`}>
    {children}
  </td>
);

export function GameLog({ entries }: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">No game log data available.</p>;
  }

  return (
    <div className="overflow-auto" style={{ maxHeight: 420 }}>
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-gray-100">
            <TH>Date</TH>
            <TH>Opponent</TH>
            <TH>W/L</TH>
            <TH right>MIN</TH>
            <TH right>PTS</TH>
            <TH right>REB</TH>
            <TH right>AST</TH>
            <TH right>STL</TH>
            <TH right>BLK</TH>
            <TH right>TOV</TH>
            <TH right>FG</TH>
            <TH right>3P</TH>
            <TH right>FT</TH>
            <TH right>+/-</TH>
          </tr>
        </thead>
        <tbody>
          {entries.map((g, i) => {
            const pm = g.plus_minus;
            return (
              <tr
                key={i}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <TD>{formatDate(g.game_date)}</TD>
                <TD>
                  <span className="text-gray-500 text-xs mr-1">
                    {g.matchup.includes(" @ ") ? "away" : "home"}
                  </span>
                  {parseMatchup(g.matchup)}
                </TD>
                <TD>
                  <span
                    className={`text-xs font-bold ${
                      g.wl === "W" ? "text-green-600" : g.wl === "L" ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {g.wl || "—"}
                  </span>
                </TD>
                <TD right>{Math.round(g.min)}</TD>
                <TD right className="font-semibold">{g.pts}</TD>
                <TD right>{g.reb}</TD>
                <TD right>{g.ast}</TD>
                <TD right>{g.stl}</TD>
                <TD right>{g.blk}</TD>
                <TD right>{g.tov}</TD>
                <TD right>
                  <span className="text-gray-800">{g.fgm}/{g.fga}</span>
                  <span className="text-gray-400 text-xs ml-1">{pct(g.fgm, g.fga, g.fg_pct)}</span>
                </TD>
                <TD right>
                  <span className="text-gray-800">{g.fg3m}/{g.fg3a}</span>
                  <span className="text-gray-400 text-xs ml-1">{pct(g.fg3m, g.fg3a, g.fg3_pct)}</span>
                </TD>
                <TD right>
                  <span className="text-gray-800">{g.ftm}/{g.fta}</span>
                  <span className="text-gray-400 text-xs ml-1">{pct(g.ftm, g.fta, g.ft_pct)}</span>
                </TD>
                <TD
                  right
                  className={`font-medium ${pm > 0 ? "text-green-600" : pm < 0 ? "text-red-500" : "text-gray-400"}`}
                >
                  {pm > 0 ? `+${pm}` : pm}
                </TD>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
