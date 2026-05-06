"use client";

import Image from "next/image";
import { PlayerBio, PlayerSeasonStats, PlayerAward } from "@/lib/api";

interface Props {
  bio: PlayerBio;
  career: PlayerSeasonStats[];
  activeSeason: string;
  awards: PlayerAward[];
}

const AWARD_PRIORITY = [
  "Most Valuable Player",
  "Finals Most Valuable Player",
  "Defensive Player of the Year",
  "Rookie of the Year",
  "Sixth Man of the Year",
  "Most Improved Player",
  "All-NBA 1st Team",
  "All-NBA 2nd Team",
  "All-NBA 3rd Team",
  "All-Defensive 1st Team",
  "All-Defensive 2nd Team",
  "All-Star",
  "Scoring Champion",
  "All-Rookie 1st Team",
  "All-Rookie 2nd Team",
];

const AWARD_LABELS: Record<string, string> = {
  "Most Valuable Player": "MVP",
  "Finals Most Valuable Player": "Finals MVP",
  "Defensive Player of the Year": "DPOY",
  "Rookie of the Year": "ROY",
  "Sixth Man of the Year": "6MOY",
  "Most Improved Player": "MIP",
  "Scoring Champion": "Scoring Champ",
};

function groupAwards(awards: PlayerAward[]): { label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const a of awards) {
    let key = a.description;
    if (a.description === "All-NBA") {
      const ordinal = ["1st", "2nd", "3rd"][parseInt(a.all_nba_team_number) - 1] ?? a.all_nba_team_number;
      key = `All-NBA ${ordinal} Team`;
    } else if (a.description === "All-Defensive Team") {
      const ordinal = a.subtype1 || (["1st", "2nd"][parseInt(a.all_nba_team_number) - 1] ?? "");
      key = `All-Defensive ${ordinal} Team`;
    } else if (a.description === "All-Rookie Team") {
      key = `All-Rookie ${a.subtype1 || "1st"} Team`;
    }
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      const ai = AWARD_PRIORITY.indexOf(a.label);
      const bi = AWARD_PRIORITY.indexOf(b.label);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
}

function AwardBadge({ label, count }: { label: string; count: number }) {
  const short = AWARD_LABELS[label] ?? label;
  const isMajor = ["MVP", "Finals MVP", "DPOY", "ROY"].includes(short);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
        isMajor
          ? "bg-amber-100 text-amber-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {count > 1 && <span className="opacity-60">{count}×</span>}
      {short}
    </span>
  );
}

function CareerTable({ career, activeSeason }: { career: PlayerSeasonStats[]; activeSeason: string }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wide">
          <th className="text-left py-1 font-medium">Season</th>
          <th className="text-right py-1 font-medium">GP</th>
          <th className="text-right py-1 font-medium">PTS</th>
          <th className="text-right py-1 font-medium">REB</th>
          <th className="text-right py-1 font-medium">AST</th>
          <th className="text-right py-1 font-medium">FG%</th>
          <th className="text-right py-1 font-medium">3P%</th>
        </tr>
      </thead>
      <tbody>
        {career.map((s) => (
          <tr
            key={s.season}
            className={`border-b border-gray-100 ${s.season === activeSeason ? "font-bold text-gray-900 bg-blue-50" : "text-gray-600"}`}
          >
            <td className="py-1.5 font-mono">{s.season}</td>
            <td className="text-right">{s.gp}</td>
            <td className="text-right">{s.pts}</td>
            <td className="text-right">{s.reb}</td>
            <td className="text-right">{s.ast}</td>
            <td className="text-right">{s.fg_pct}</td>
            <td className="text-right">{s.fg3_pct}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PlayerBioCard({ bio, career, activeSeason, awards }: Props) {
  const photoUrl = `https://cdn.nba.com/headshots/nba/latest/1040x760/${bio.id}.png`;
  const draftLine = bio.draft_year && bio.draft_year !== "None"
    ? `Draft: ${bio.draft_year} · Rd. ${bio.draft_round}, No. ${bio.draft_number}`
    : "Undrafted";
  const grouped = groupAwards(awards);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-20 h-20 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden">
          <Image
            src={photoUrl}
            alt={bio.full_name}
            width={260}
            height={190}
            className="w-full h-full object-cover object-top"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            unoptimized
          />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{bio.full_name}</h2>
          <p className="text-sm text-gray-500">
            {bio.position}{bio.position && bio.team_name ? " · " : ""}{bio.team_name}{bio.jersey ? ` #${bio.jersey}` : ""}
          </p>
          <p className="text-xs text-gray-400">{bio.height} · {bio.weight} lbs</p>
          <p className="text-xs text-gray-400">{draftLine}</p>
        </div>
      </div>

      {grouped.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {grouped.map(({ label, count }) => (
            <AwardBadge key={label} label={label} count={count} />
          ))}
        </div>
      )}

      {career.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4 overflow-x-auto">
          <CareerTable career={career} activeSeason={activeSeason} />
        </div>
      )}
    </div>
  );
}
