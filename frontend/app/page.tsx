"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { PlayerSearch } from "@/components/PlayerSearch";
import { ShotChart } from "@/components/ShotChart";
import { PlayerBioCard } from "@/components/PlayerBioCard";
import { PercentileRankings } from "@/components/PercentileRankings";
import { GameLog } from "@/components/GameLog";
import {
  api,
  PlayerSummary,
  PlayerBio,
  PlayerSeasonStats,
  PlayerPercentiles,
  ShotChartEntry,
  GameLogEntry,
  PlayerAward,
} from "@/lib/api";

function bioToSummary(bio: PlayerBio): PlayerSummary {
  return { id: bio.id, full_name: bio.full_name, team_id: 0, team_name: bio.team_name, is_active: true };
}

interface PlayerData {
  bio: PlayerBio;
  career: PlayerSeasonStats[];
  percentiles: PlayerPercentiles | null;
  shots: ShotChartEntry[];
  gamelog: GameLogEntry[];
  awards: PlayerAward[];
}

export default function Home() {
  const searchParams = useSearchParams();
  const season = searchParams.get("season") ?? "2025-26";

  const [player, setPlayer] = useState<PlayerSummary | null>(null);
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount: restore player from URL
  useEffect(() => {
    const playerId = searchParams.get("player_id");
    if (!playerId) return;
    api.getPlayerBio(Number(playerId))
      .then((bio) => {
        const p = bioToSummary(bio);
        setPlayer(p);
        loadData(p, season);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (player) loadData(player, season);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season]);

  async function loadData(p: PlayerSummary, s: string) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const [bio, career, percentiles, shots, gamelog, awardsRes] = await Promise.allSettled([
        api.getPlayerBio(p.id),
        api.getCareerStats(p.id),
        api.getPlayerPercentiles(p.id, s),
        api.getShotChart(p.id, s),
        api.getGameLog(p.id, s),
        api.getPlayerAwards(p.id),
      ]);
      setData({
        bio: bio.status === "fulfilled" ? bio.value : {
          id: p.id, full_name: p.full_name, position: "", jersey: "",
          team_abbreviation: "", team_name: "", height: "", weight: "",
          draft_year: "", draft_round: "", draft_number: "",
        },
        career: career.status === "fulfilled" ? career.value : [],
        percentiles: percentiles.status === "fulfilled" ? percentiles.value : null,
        shots: shots.status === "fulfilled" ? shots.value : [],
        gamelog: gamelog.status === "fulfilled" ? gamelog.value : [],
        awards: awardsRes.status === "fulfilled" ? awardsRes.value : [],
      });
    } catch {
      setError("Failed to load data — try again.");
    } finally {
      setLoading(false);
    }
  }

  function handlePlayerSelect(p: PlayerSummary) {
    setPlayer(p);
    const params = new URLSearchParams(searchParams.toString());
    params.set("player_id", String(p.id));
    window.history.replaceState(null, "", `/?${params.toString()}`);
    loadData(p, season);
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <Header onSeasonChange={() => {}}>
        <div className="flex-1 max-w-sm">
          <PlayerSearch onSelect={handlePlayerSelect} />
        </div>
      </Header>

      <div className="max-w-screen-2xl mx-auto px-8 py-8">
        {!player && (
          <div className="flex flex-col items-center justify-center pt-32 gap-3 text-center">
            <p className="text-2xl font-bold text-gray-200">Search for a player</p>
            <p className="text-sm text-gray-400">Percentile rankings, shot charts, and per-game stats</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center pt-32">
            <p className="text-sm text-gray-400">Loading… (first load may take a few seconds)</p>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 text-center pt-16">{error}</div>
        )}

        {data && !loading && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div className="card">
                <PlayerBioCard bio={data.bio} career={data.career} activeSeason={season} awards={data.awards} />
              </div>

              <div className="card">
                {data.percentiles ? (
                  <PercentileRankings data={data.percentiles} playerName={data.bio.full_name} />
                ) : (
                  <p className="text-sm text-gray-400">No percentile data for {season}.</p>
                )}
              </div>

              <div className="card">
                <div className="mb-4">
                  <p className="section-label">Shot Chart</p>
                  <p className="section-title">{season} Regular Season</p>
                </div>
                {data.shots.length > 0 ? (
                  <ShotChart shots={data.shots} />
                ) : (
                  <p className="text-sm text-gray-400">No shot data available.</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="mb-4">
                <p className="section-label">Game Log</p>
                <p className="section-title">{season} Regular Season</p>
              </div>
              <GameLog entries={data.gamelog} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
