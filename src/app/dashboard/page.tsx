"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ScoreGauge } from "@/components/ScoreVisuals";
import { useToast } from "@/components/ToastSystem";
import { api, errorMessage } from "@/lib/api";
import type { DestinationInfo, TripRow } from "@/lib/travelTypes";

export default function DashboardPage() {
  const toast = useToast();
  const [trips, setTrips] = useState<TripRow[] | null>(null);
  const [dests, setDests] = useState<DestinationInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [favs, setFavs] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [armedId, setArmedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const t = await api.listTrips();
      setTrips(t);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
    api.listDestinations().then(setDests).catch(() => undefined);
    try {
      const raw = localStorage.getItem("tv.favs");
      if (raw) setFavs(JSON.parse(raw));
    } catch {
      /* private mode */
    }
  }, [load]);

  const remove = async (id: string) => {
    if (armedId !== id) {
      setArmedId(id);
      window.setTimeout(() => setArmedId((v) => (v === id ? null : v)), 3200);
      return;
    }
    setArmedId(null);
    try {
      await api.deleteTrip(id);
      toast("Trip deleted.", "success");
      await load();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const totalSpend = trips?.reduce((a, t) => a + t.totalBudget, 0) ?? 0;
  const totalDays = trips?.reduce((a, t) => a + t.days, 0) ?? 0;
  const upcoming = trips ?? [];

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="hairline mb-2 text-[11px] font-extrabold text-cyan">Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Your travel HQ</h1>
        </div>
        <Link href="/plan" className="btn-neon rounded-xl px-5 py-2.5 text-sm">+ Plan a new trip</Link>
      </div>

      {error && (
        <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-danger/40 p-5">
          <p className="text-sm text-danger">{error}</p>
          <button onClick={() => void load()} className="btn-ghost rounded-lg px-4 py-2 text-sm font-bold">Retry</button>
        </div>
      )}

      {trips === null && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="shimmer h-40 rounded-2xl" />
          <div className="shimmer h-40 rounded-2xl" />
          <div className="shimmer h-40 rounded-2xl" />
        </div>
      )}

      {trips !== null && (
        <div className="animate-fade-up space-y-6">
          {/* stat row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card glow-ring rounded-2xl p-5">
              <p className="hairline mb-1 text-[10px] font-extrabold text-ink-dim">SAVED TRIPS</p>
              <p className="font-display text-4xl font-bold text-ink">{trips.length}</p>
              <p className="mt-1 text-[11px] text-ink-faint">{upcoming.length} upcoming journey{upcoming.length === 1 ? "" : "s"}</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="hairline mb-1 text-[10px] font-extrabold text-ink-dim">PLANNED BUDGET</p>
              <p className="font-display text-4xl font-bold gradient-text">${(totalSpend / 1000).toFixed(1)}k</p>
              <p className="mt-1 text-[11px] text-ink-faint">estimates only · verify live prices</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="hairline mb-1 text-[10px] font-extrabold text-ink-dim">TRAVEL DAYS</p>
              <p className="font-display text-4xl font-bold text-ink">{totalDays}</p>
              <p className="mt-1 text-[11px] text-ink-faint">across all saved trips</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <p className="hairline mb-1 text-[10px] font-extrabold text-ink-dim">SAVED DESTINATIONS</p>
              <p className="font-display text-4xl font-bold text-ink">{favs.length}</p>
              <p className="mt-1 text-[11px] text-ink-faint">from Explore (this device)</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* trips */}
            <div className="lg:col-span-2">
              <h2 className="hairline mb-4 text-[11px] font-extrabold text-ink-dim">MY TRIPS · TRAVEL HISTORY</h2>
              {trips.length === 0 ? (
                <div className="glass-card flex flex-col items-center rounded-2xl px-6 py-16 text-center">
                  <p className="text-sm text-ink-dim">No trips yet — generate one and it will live here.</p>
                  <Link href="/plan" className="btn-neon mt-5 rounded-xl px-6 py-2.5 text-sm">Plan my first trip</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((t) => (
                    <div key={t.id} className="glass-card rounded-2xl p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="chip-violet mb-1.5 w-fit rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wider">
                            {t.generationMode === "ai" ? "AI" : "DEMO ENGINE"}
                          </p>
                          <h3 className="font-display text-lg font-bold text-ink">{t.title}</h3>
                          <p className="mt-0.5 text-xs text-ink-dim">
                            {t.destinations.join(" → ")} · updated {new Date(t.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xl font-bold text-cyan">${t.totalBudget.toLocaleString()}</span>
                          <button onClick={() => setExpanded(expanded === t.id ? null : t.id)} className="btn-ghost rounded-lg px-3.5 py-2 text-xs font-bold">
                            {expanded === t.id ? "Hide" : "Daily plan"}
                          </button>
                          <button onClick={() => void remove(t.id)} className={`btn-danger rounded-lg px-3 py-2 text-xs font-bold ${armedId === t.id ? "animate-pulse-soft" : ""}`}>
                            {armedId === t.id ? "Confirm?" : "Delete"}
                          </button>
                        </div>
                      </div>

                      {expanded === t.id && (
                        <div className="animate-fade-up mt-4 border-t border-line/60 pt-4">
                          {/* budget mini */}
                          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {Object.entries(t.budgetBreakdown).map(([k, v]) => (
                              <div key={k} className="rounded-lg border border-line/60 bg-bg0/40 px-3 py-2">
                                <p className="text-[10px] font-bold text-ink-faint">{k}</p>
                                <p className="text-sm font-bold text-ink">${v.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                          <ol className="space-y-2.5">
                            {t.itinerary.map((d) => (
                              <li key={d.day} className="rounded-xl border border-line/60 bg-bg0/40 px-4 py-3">
                                <p className="text-xs font-extrabold text-cyan">DAY {d.day} · <span className="text-ink">{d.title}</span></p>
                                <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                                  <span className="font-bold text-ink">AM</span> {d.morning}
                                  {" · "}<span className="font-bold text-ink">PM</span> {d.afternoon}
                                  {" · "}<span className="font-bold text-ink">Eve</span> {d.evening}
                                </p>
                              </li>
                            ))}
                          </ol>
                          <div className="mt-4">
                            <p className="hairline mb-2 text-[10px] font-extrabold text-ink-faint">TRAVEL CHECKLIST</p>
                            <ul className="grid gap-1.5 sm:grid-cols-2">
                              {t.packing.map((p) => (
                                <li key={p} className="flex items-start gap-2 text-xs text-ink-dim">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* side column */}
            <div className="space-y-5">
              <div className="glass-card rounded-2xl p-5">
                <h2 className="hairline mb-3 text-[11px] font-extrabold text-ink-dim">PERSONALIZED FOR YOU</h2>
                {trips.length === 0 ? (
                  <p className="text-sm text-ink-dim">Recommendations appear after your first trip — they learn your style and destinations.</p>
                ) : (
                  <div className="space-y-2.5">
                    {dests
                      .filter((d) => !trips.some((t) => t.destinations.includes(d.name)))
                      .slice(0, 3)
                      .map((d) => (
                        <Link key={d.id} href={`/explore?d=${d.id}`} className="flex items-center gap-3 rounded-xl border border-line/60 bg-bg0/40 p-2.5 transition-colors hover:border-cyan/40">
                          <img src={d.image} alt="" className="h-10 w-14 rounded-lg object-cover" />
                          <span>
                            <span className="block text-sm font-bold text-ink">{d.name}</span>
                            <span className="block text-[11px] text-ink-faint">New for you · ${d.dailyBudgetLow}–${d.dailyBudgetHigh}/day</span>
                          </span>
                        </Link>
                      ))}
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="hairline text-[11px] font-extrabold text-ink-dim">FAVORITE PLACES</h2>
                  <Link href="/explore" className="text-[11px] font-bold text-cyan hover:opacity-80">Manage →</Link>
                </div>
                {favs.length === 0 ? (
                  <p className="text-sm text-ink-dim">Tap the heart on Explore to save destinations here.</p>
                ) : (
                  <ul className="space-y-2">
                    {favs
                      .map((f) => dests.find((d) => d.id === f))
                      .filter((d): d is DestinationInfo => Boolean(d))
                      .map((d) => (
                        <li key={d.id}>
                          <Link href={`/explore?d=${d.id}`} className="flex items-center gap-3 rounded-xl border border-line/60 bg-bg0/40 p-2 transition-colors hover:border-purple/40">
                            <img src={d.image} alt="" className="h-9 w-13 w-14 rounded-lg object-cover" />
                            <span className="text-sm font-bold text-ink">{d.name}</span>
                            <span className="ml-auto text-[10px] font-bold text-purple">{d.bestMonths}</span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5">
                <h2 className="hairline mb-2 text-[11px] font-extrabold text-ink-dim">UP NEXT</h2>
                <p className="text-sm leading-relaxed text-ink-dim">
                  {trips.length
                    ? `Daily ritual: review one day of "${trips[0].title}" and check packing items.`
                    : "Start with a 3-day, 2-person trip — short trips are the fastest way to learn the planner."}
                </p>
                <Link href="/insights" className="chip-cyan mt-3 inline-block rounded-lg px-3.5 py-2 text-xs font-bold hover:-translate-y-0.5 transition-transform">
                  Check weather insights
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
