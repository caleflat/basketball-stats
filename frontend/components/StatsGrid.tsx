"use client";

import { PlayerSeasonStats } from "@/lib/api";

interface Props {
  stats: PlayerSeasonStats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 gap-1">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function StatsGrid({ stats }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="font-medium text-gray-700">{stats.team}</span>
        <span>·</span>
        <span>{stats.gp} GP</span>
        <span>·</span>
        <span>{stats.mpg} MPG</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="PTS" value={stats.pts} />
        <StatCard label="REB" value={stats.reb} />
        <StatCard label="AST" value={stats.ast} />
        <StatCard label="TOV" value={stats.tov} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="FG%" value={`${stats.fg_pct}%`} />
        <StatCard label="3P%" value={`${stats.fg3_pct}%`} />
        <StatCard label="FT%" value={`${stats.ft_pct}%`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="STL" value={stats.stl} />
        <StatCard label="BLK" value={stats.blk} />
      </div>
    </div>
  );
}
