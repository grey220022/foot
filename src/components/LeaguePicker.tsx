"use client";

import { LEAGUE_ORDER, LEAGUES, type LeagueId } from "@/lib/leagues";

interface LeaguePickerProps {
  value: LeagueId;
  onChange: (value: LeagueId) => void;
}

export function LeaguePicker({ value, onChange }: LeaguePickerProps) {
  return (
    <div role="radiogroup" aria-label="比赛类型" className="grid grid-cols-3 gap-2">
      {LEAGUE_ORDER.map((id) => {
        const league = LEAGUES[id];
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`rounded-lg border px-3 py-2.5 text-left transition ${
              active
                ? "border-sky-500 bg-sky-500/10"
                : "border-slate-700 bg-slate-950/40 hover:border-slate-600"
            }`}
          >
            <span className="block text-sm font-medium text-slate-100">{league.localName}</span>
            <span className="block text-xs text-slate-500">{league.name}</span>
          </button>
        );
      })}
    </div>
  );
}
