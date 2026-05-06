"use client";

import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ShotChartEntry } from "@/lib/api";

// NBA court is 500 units wide, 470 deep in the nba_api coordinate system
const COURT_WIDTH = 500;
const COURT_HEIGHT = 470;

interface Props {
  shots: ShotChartEntry[];
}

function CourtBackground() {
  return (
    <svg
      viewBox={`-250 -50 ${COURT_WIDTH} ${COURT_HEIGHT}`}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    >
      {/* Court outline */}
      <rect x={-250} y={-50} width={500} height={470} fill="#f5e6c8" stroke="#c8a96e" strokeWidth={2} />
      {/* Paint */}
      <rect x={-80} y={-50} width={160} height={190} fill="none" stroke="#c8a96e" strokeWidth={2} />
      {/* Free throw circle */}
      <circle cx={0} cy={140} r={60} fill="none" stroke="#c8a96e" strokeWidth={2} />
      {/* Basket */}
      <circle cx={0} cy={0} r={7.5} fill="none" stroke="#c8a96e" strokeWidth={2} />
      {/* Backboard */}
      <line x1={-30} y1={-7} x2={30} y2={-7} stroke="#c8a96e" strokeWidth={2} />
      {/* Restricted area */}
      <path d="M -40 -50 A 40 40 0 0 1 40 -50" fill="none" stroke="#c8a96e" strokeWidth={2} />
      {/* Three-point arc */}
      <path d="M -220 -50 L -220 92 A 237.5 237.5 0 0 0 220 92 L 220 -50" fill="none" stroke="#c8a96e" strokeWidth={2} />
    </svg>
  );
}

const CustomDot = (props: { cx?: number; cy?: number; payload?: ShotChartEntry }) => {
  const { cx = 0, cy = 0, payload } = props;
  const made = payload?.shot_made;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={made ? "#22c55e" : "#ef4444"}
      fillOpacity={0.7}
      stroke={made ? "#16a34a" : "#dc2626"}
      strokeWidth={1}
    />
  );
};

export function ShotChart({ shots }: Props) {
  // shot chart format is different for 2020-21 and 2021-22
  // const normalizedShots = shots.map(shot => {
    // If the absolute value of loc_x is consistently very small (under 30) 
    // while the shot_distance is high, it's likely the "Feet" scale.
    // A simple check for decimals or low magnitude usually works:
  //   const isFeetScale = Math.abs(shot.loc_x) < 30 && shot.shot_distance > 5;

  //   return {
  //     ...shot,
  //     loc_x: isFeetScale ? shot.loc_x * 10 : shot.loc_x,
  //     loc_y: isFeetScale ? shot.loc_y * 10 : shot.loc_y
  //   }
  // });

  const made = shots.filter((s) => s.shot_made).length;
  const pct = shots.length > 0 ? ((made / shots.length) * 100).toFixed(1) : "—";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-6 text-sm text-gray-600">
        <span><span className="font-semibold text-gray-900">{shots.length}</span> FGA</span>
        <span><span className="font-semibold text-gray-900">{made}</span> FGM</span>
        <span><span className="font-semibold text-gray-900">{pct}%</span> FG%</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-500" /> Made</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Missed</span>
      </div>

      <div className="relative w-full" style={{ aspectRatio: "500 / 470" }}>
        <CourtBackground />
        <ResponsiveContainer width="100%" height="100%" className="absolute inset-0">
          <ScatterChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            // need to allow overflow for half-court shots
            <XAxis dataKey="loc_x" type="number" domain={[-250, 250]} allowDataOverflow={true} hide />
            <YAxis dataKey="loc_y" type="number" domain={[-50, 420]} reversed allowDataOverflow={true} hide />
            <ZAxis range={[1, 1]} />
            <Tooltip
              content={({ payload }) => {
                const s = payload?.[0]?.payload as ShotChartEntry | undefined;
                if (!s) return null;
                return (
                  <div className="bg-white border border-gray-200 rounded p-2 text-xs shadow">
                    <p className="font-semibold">{s.action_type}</p>
                    <p>{s.shot_zone_basic} · {s.shot_distance} ft</p>
                    <p className={s.shot_made ? "text-green-600" : "text-red-600"}>
                      {s.shot_made ? "Made" : "Missed"}
                    </p>
                  </div>
                );
              }}
            />
            <Scatter data={shots} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
