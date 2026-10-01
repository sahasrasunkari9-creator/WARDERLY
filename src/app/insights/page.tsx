"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { DestinationInfo, WeatherSample } from "@/lib/travelTypes";

const CONDITION_ICONS: Record<WeatherSample["condition"], string> = {
  Sunny: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4|M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  Mild: "M17.5 19a4.5 4.5 0 1 0 0-9h-1.1A7 7 0 1 0 4 14.9|M7 19h.01M11 21h.01M15 19h.01",
  Rainy: "M17.5 15a4.5 4.5 0 1 0 0-9h-1.1A7 7 0 1 0 4 10.9|M7 17v2M11 16v2M15 17v2",
  Snow: "M17.5 15a4.5 4.5 0 1 0 0-9h-1.1A7 7 0 1 0 4 10.9|M7 17h.01M11 17h.01M15 17h.01",
  Humid: "M17.5 19a4.5 4.5 0 1 0 0-9h-1.1A7 7 0 1 0 4 14.9|M12 22a3 3 0 0 0 3-3",
};

export default function InsightsPage() {
  const [dests, setDests] = useState<DestinationInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [weather, setWeather] = useState<WeatherSample | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listDestinations()
      .then((d) => {
        setDests(d);
        if (d[0]) setSelectedId(d[0].id);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setWeather(null);
    api
      .weather(selectedId)
      .then(setWeather)
      .catch((e) => setError(errorMessage(e)));
  }, [selectedId]);

  const selected = dests.find((d) => d.id === selectedId);

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <p className="hairline mb-2 text-[11px] font-extrabold text-cyan">Travel Insights</p>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Weather & best-time guide</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-dim">
          Seasonal planning data for each destination. <span className="chip-violet mx-1 rounded px-1.5 py-0.5 text-[10px] font-extrabold">SAMPLE CLIMATE</span>
          — typical monthly values, not a live forecast.
        </p>
      </div>

      {/* destination tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {dests.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedId(d.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${selectedId === d.id ? "border border-cyan/60 bg-cyan/10 text-cyan" : "chip"}`}
            aria-pressed={selectedId === d.id}
          >
            {d.name}
          </button>
        ))}
      </div>

      {error && <div className="glass-card mb-6 rounded-2xl border-danger/40 p-5 text-sm text-danger">{error}</div>}
      {!weather && !error && <div className="shimmer h-64 rounded-2xl" />}

      {weather && selected && (
        <div className="animate-fade-up grid gap-5 lg:grid-cols-3">
          {/* current card */}
          <div className="glass-card glow-ring rounded-2xl p-6">
            <p className="hairline mb-3 text-[10px] font-extrabold text-ink-faint">{weather.month.toUpperCase()} · TYPICAL CONDITIONS</p>
            <div className="flex items-center gap-5">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {CONDITION_ICONS[weather.condition].split("|").map((p, i) => (
                  <path key={i} d={p} />
                ))}
              </svg>
              <div>
                <p className="font-display text-5xl font-bold text-ink">{weather.tempC}°C</p>
                <p className="mt-1 text-sm font-bold text-ink-dim">{weather.condition} · {weather.rainMm} mm typical rain</p>
              </div>
            </div>
            <div className={`mt-4 rounded-xl border p-3 text-xs font-bold ${weather.bestTime ? "border-ok/40 bg-ok/10 text-ok" : "border-amber-soft/40 bg-amber-soft/10 text-amber-soft"}`}>
              {weather.bestTime
                ? "✓ This month falls in the best visiting window."
                : `Outside the prime window — best time: ${weather.note.split("·")[0].replace("Best time to visit: ", "")}`}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">{weather.note}</p>
          </div>

          {/* monthly strip */}
          <div className="glass-card rounded-2xl p-6 lg:col-span-2">
            <h2 className="hairline mb-4 text-[11px] font-extrabold text-ink-dim">MONTHLY PROFILE — {selected.name.toUpperCase()}</h2>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
              {selected.monthlyTempC.map((t, i) => {
                const rain = selected.monthlyRainMm[i];
                const nowIdx = new Date().getMonth();
                return (
                  <div key={i} className={`rounded-lg border p-2 text-center ${i === nowIdx ? "border-cyan/60 bg-cyan/10" : "border-line/50 bg-bg0/40"}`}>
                    <p className="text-[9px] font-extrabold text-ink-faint">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</p>
                    <p className="mt-1 text-xs font-bold text-ink">{t}°</p>
                    <div className="mx-auto mt-1.5 h-8 w-1.5 overflow-hidden rounded-full bg-line/50">
                      <div
                        className={`w-full rounded-full ${rain > 200 ? "bg-purple" : rain > 90 ? "bg-violet/70" : "bg-cyan/70"}`}
                        style={{ height: `${Math.min(100, (rain / 460) * 100)}%`, marginTop: `${100 - Math.min(100, (rain / 460) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[8px] text-ink-faint">{rain}mm</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[10px] text-ink-faint">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan/70" /> dry</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet/70" /> moderate rain</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple" /> wet season</span>
            </div>
            <p className="mt-4 rounded-xl border border-line/60 bg-bg0/40 p-3 text-xs leading-relaxed text-ink-dim">
              <span className="font-bold text-ink">Seasonal advice:</span> Best time to visit {selected.name} is {selected.bestMonths}.
              Plan flights 3–8 weeks ahead (domestic) or 2–4 months (international) for better fares — estimates, always verify.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
