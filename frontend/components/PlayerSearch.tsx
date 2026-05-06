"use client";

import { useState, useCallback } from "react";
import { api, PlayerSummary } from "@/lib/api";

interface Props {
  onSelect: (player: PlayerSummary) => void;
}

export function PlayerSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await api.searchPlayers(q);
      setResults(data.filter((p) => p.is_active).slice(0, 8));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Search players…"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-gray-400 text-xs">searching…</div>
      )}
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => { onSelect(p); setResults([]); setQuery(p.full_name); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{p.full_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
