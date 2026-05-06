"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const SEASONS = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22", "2020-21"];

interface Props {
  onSeasonChange?: (season: string) => void;
  children?: React.ReactNode;
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="pointer-events-none">
      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="pointer-events-none shrink-0">
      <rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 6h12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 1v3M10 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Header({ onSeasonChange, children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const season = searchParams.get("season") ?? "2025-26";

  function handleChange(s: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", s);
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    onSeasonChange?.(s);
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-0 flex items-stretch gap-6 h-14">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center text-lg font-black tracking-tight text-gray-900 shrink-0 hover:text-blue-600 transition-colors"
      >
        NBA Savant
      </Link>

      {/* Nav */}
      <nav className="flex items-stretch gap-1">
        {[
          { href: "/", label: "Player" },
          { href: "/leaders", label: "Leaders" },
        ].map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Page-specific slot (e.g. search bar) */}
      {children && <div className="flex items-center flex-1">{children}</div>}

      {/* Season selector — always far right */}
      <div className="ml-auto flex items-center">
        <div className="relative flex items-center">
          <div className="absolute left-3 text-gray-400 flex items-center">
            <CalendarIcon />
          </div>
          <select
            value={season}
            onChange={(e) => handleChange(e.target.value)}
            className="appearance-none pl-8 pr-8 py-1.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute right-2.5 text-gray-400 flex items-center">
            <ChevronDown />
          </div>
        </div>
      </div>
    </header>
  );
}
