"use client";

import { PlayerPercentiles, PercentileStat } from "@/lib/api";
import { STAT_DESCRIPTIONS } from "@/lib/statDescriptions";

interface Props {
  data: PlayerPercentiles;
  playerName: string;
}

function pctColor(pct: number): string {
  if (pct >= 67) return "#c0392b";
  if (pct <= 33) return "#2471a3";
  return "#808b96";
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="relative group flex items-center">
      <svg
        width="11" height="11" viewBox="0 0 11 11" fill="none"
        className="text-gray-300 group-hover:text-gray-500 transition-colors cursor-default shrink-0"
      >
        <circle cx="5.5" cy="5.5" r="5" stroke="currentColor" strokeWidth="1" />
        <path d="M5.5 5v3M5.5 3.5v.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
      <div className="absolute bottom-full right-0 mb-2 w-52 bg-gray-900 text-white text-[11px] leading-relaxed rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30 shadow-lg">
        {text}
        <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

function PercentileBar({ stat }: { stat: PercentileStat }) {
  const pct = Math.max(1, Math.min(99, stat.percentile));
  const color = pctColor(pct);
  const description = STAT_DESCRIPTIONS[stat.label];

  return (
    <div className="grid items-center gap-2" style={{ gridTemplateColumns: "130px 1fr 52px" }}>
      <div className="flex items-center justify-end gap-1 pr-2 min-w-0">
        {description && <InfoTooltip text={description} />}
        <span className="text-xs text-gray-600 truncate">{stat.label}</span>
      </div>

      <div className="relative h-5 bg-gray-100 rounded-full overflow-visible">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.25 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10"
          style={{ left: `${pct}%`, backgroundColor: color }}
        >
          {pct}
        </div>
      </div>

      <span className="text-xs font-semibold text-gray-700 text-right">{stat.value}</span>
    </div>
  );
}

function GroupHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-2">
      <span className="text-sm font-bold text-gray-800">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export function PercentileRankings({ data, playerName }: Props) {
  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <p className="section-label">{data.season} NBA Percentile Rankings</p>
        <p className="section-title mt-0.5">{playerName}</p>
      </div>

      <div className="grid gap-2 mb-1" style={{ gridTemplateColumns: "130px 1fr 52px" }}>
        <div />
        <div className="flex justify-between px-1 text-[9px] font-semibold uppercase tracking-wider">
          <span className="text-[#2471a3]">Poor</span>
          <span className="text-gray-400">Average</span>
          <span className="text-[#c0392b]">Great</span>
        </div>
        <div />
      </div>

      {Object.entries(data.groups).map(([group, stats]) => (
        <div key={group}>
          <GroupHeader label={group} />
          <div className="flex flex-col gap-3">
            {stats.map((s) => (
              <PercentileBar key={s.label} stat={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
