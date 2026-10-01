"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ToastSystem";
import { api, errorMessage } from "@/lib/api";
import {
  INTERESTS,
  SEASONS,
  TRAVEL_STYLES,
  type DestinationInfo,
  type GeneratedTrip,
  type Interest,
  type Season,
  type TravelStyle,
} from "@/lib/travelTypes";

function PlanInner() {
  const params = useSearchParams();
  const toast = useToast();
  const [dests, setDests] = useState<DestinationInfo[]>([]);
  const [multi, setMulti] = useState<string[]>([]);
  const [days, setDays] = useState(4);
  const [travelers, setTravelers] = useState(2);
  const [style, setStyle] = useState<TravelStyle>("Adventure");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [season, setSeason] = useState<Season>(SEASONS[4]);
  const [budget, setBudget] = useState(1500);

  const [trip, setTrip] = useState<GeneratedTrip | null>(null);
  const [budgetOverride, setBudgetOverride] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listDestinations().then((d) => {
      setDests(d);
      const preset = params.get("d");
      if (preset && d.some((x) => x.id === preset)) setMulti([preset]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const primary = dests.find((d) => d.id === multi[0]);

  const generate = useCallback(async () => {
    if (!multi.length) {
      toast("Choose at least one destination first.", "error");
      return;
    }
    setGenerating(true);
    setError(null);
    setSavedId(null);
    try {
      const t = await api.generateTrip({
        destination: multi[0],
        destinations: multi,
        days,
        travelers,
        style,
        interests,
        season,
        totalBudget: budget,
      });
      setTrip(t);
      setBudgetOverride(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setGenerating(false);
    }
  }, [multi, days, travelers, style, interests, season, budget, toast]);

  const save = async () => {
    if (!trip) return;
    try {
      const row = await api.saveTrip(trip);
      setSavedId(row.id);
      toast("Trip saved to your dashboard.", "success");
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copied.`, "success");
    } catch {
      toast("Couldn't access the clipboard.", "error");
    }
  };

  const effBudget = budgetOverride ?? trip?.totalBudget ?? 0;
  const scaled =
    trip && budgetOverride !== null && budgetOverride > 0
      ? Object.fromEntries(Object.entries(trip.budgetBreakdown).map(([k, v]) => [k, Math.round((v * budgetOverride) / Math.max(trip.totalBudget, 1))]))
      : trip?.budgetBreakdown ?? {};
  const scaledTotal = Object.values(scaled).reduce((a, b) => a + b, 0);

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-8">
        <p className="hairline mb-2 text-[11px] font-extrabold text-cyan">AI Trip Planner</p>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Build your journey</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-dim">
          Pick up to 3 destinations, set your style and budget — the planner generates a day-by-day itinerary,
          an estimated budget breakdown and a packing list. Demo engine · all prices are estimates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* configurator */}
        <div className="glass-card glow-ring h-fit rounded-2xl p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">1 · Trip settings</h2>

          <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim">Destinations (up to 3)</label>
          <div className="mb-1 grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
            {dests.map((d) => (
              <button
                key={d.id}
                onClick={() =>
                  setMulti((m) => (m.includes(d.id) ? m.filter((x) => x !== d.id) : m.length >= 3 ? m : [...m, d.id]))
                }
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-bold transition-colors ${
                  multi.includes(d.id) ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line text-ink-dim hover:border-line2"
                }`}
                aria-pressed={multi.includes(d.id)}
              >
                <img src={d.image} alt="" className="h-7 w-10 rounded object-cover" />
                {d.name}
              </button>
            ))}
          </div>
          {multi.length > 0 && (
            <p className="mb-3 text-[11px] text-ink-faint">Selected: {multi.map((m) => dests.find((d) => d.id === m)?.name).join(" → ")}</p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="hairline mb-1.5 block text-[11px] font-bold text-ink-dim" htmlFor="p-days">Days</label>
              <input id="p-days" type="range" min={2} max={10} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full" />
              <p className="text-sm font-bold text-ink">{days} days</p>
            </div>
            <div>
              <label className="hairline mb-1.5 block text-[11px] font-bold text-ink-dim" htmlFor="p-trav">Travelers</label>
              <input id="p-trav" type="range" min={1} max={8} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} className="w-full" />
              <p className="text-sm font-bold text-ink">{travelers} {travelers === 1 ? "person" : "people"}</p>
            </div>
          </div>

          <label className="hairline mb-2 mt-4 block text-[11px] font-bold text-ink-dim">Travel style</label>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {TRAVEL_STYLES.map((s) => (
              <button key={s} onClick={() => setStyle(s)} className={`rounded-lg border px-2 py-2 text-xs font-bold ${style === s ? "border-purple/60 bg-purple/10 text-purple" : "border-line text-ink-dim"}`}>
                {s}
              </button>
            ))}
          </div>

          <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim">Interests</label>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {INTERESTS.map((i) => (
              <button
                key={i}
                onClick={() => setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${interests.includes(i) ? "border border-cyan/60 bg-cyan/10 text-cyan" : "chip"}`}
                aria-pressed={interests.includes(i)}
              >
                {i}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="hairline mb-1.5 block text-[11px] font-bold text-ink-dim" htmlFor="p-season">Season</label>
            <select id="p-season" value={season} onChange={(e) => setSeason(e.target.value as Season)} className="neon-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold">
              {SEASONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <label className="hairline mb-1.5 block text-[11px] font-bold text-ink-dim" htmlFor="p-budget">Total budget (USD, est.)</label>
          <input id="p-budget" type="range" min={500} max={10000} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full" />
          <p className="text-sm font-bold text-ink">${budget.toLocaleString()} for {travelers} {travelers === 1 ? "person" : "people"} · {days} days</p>

          <button onClick={() => void generate()} disabled={generating} className="btn-neon mt-5 w-full rounded-xl py-3 text-sm">
            {generating ? (
              <span className="inline-flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" className="spin-fast"><path d="M21 12a9 9 0 1 1-6.2-8.56" /></svg>
                Building your journey…
              </span>
            ) : (
              "Generate My Trip"
            )}
          </button>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </div>

        {/* result */}
        <div>
          {!trip && !generating && (
            <div className="glass-card flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl p-10 text-center">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l3.5 4-2 2-2.5-.5a.5.5 0 0 0-.4.8L5 17l1.4 2.6a.5.5 0 0 0 .8 0l2-2.5 4 3.5a.5.5 0 0 0 .8-.4Z" />
              </svg>
              <h2 className="font-display mt-4 text-2xl font-semibold text-ink">Your journey appears here</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-dim">
                {primary ? `Great choice — ${primary.name}. Set your days and budget, then hit Generate.` : "Pick a destination on the left to begin."}
              </p>
            </div>
          )}

          {generating && (
            <div className="space-y-3">
              <div className="shimmer h-24 rounded-2xl" />
              <div className="shimmer h-64 rounded-2xl" />
              <div className="shimmer h-40 rounded-2xl" />
              <p className="text-center text-sm text-ink-faint">Composing itinerary, budget and packing list…</p>
            </div>
          )}

          {trip && !generating && (
            <div className="animate-fade-up space-y-5">
              {/* header */}
              <div className="glass-card glow-ring flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
                <div>
                  <p className="chip-violet mb-2 w-fit rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider">
                    {trip.mode === "ai" ? "AI-GENERATED" : "DEMO ENGINE"}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-ink">{trip.title}</h2>
                  <p className="mt-1 text-xs text-ink-dim">
                    {trip.destinations.join(" → ")} · {trip.days} days · {trip.travelers} travelers · {trip.style}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => void copyText(trip.itinerary.map((d) => `Day ${d.day} — ${d.title}\nAM: ${d.morning}\nPM: ${d.afternoon}\nEve: ${d.evening}\nTip: ${d.tip}`).join("\n\n"), "Itinerary")} className="btn-ghost rounded-lg px-4 py-2 text-xs font-bold">
                    Copy itinerary
                  </button>
                  <button onClick={() => void save()} disabled={!!savedId} className="btn-neon rounded-lg px-5 py-2 text-xs">
                    {savedId ? "Saved ✓" : "Save to Dashboard"}
                  </button>
                </div>
              </div>

              {/* budget */}
              <div className="glass-card rounded-2xl p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">Estimated budget</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-dim">
                    <span>Adjust:</span>
                    <input
                      type="range"
                      min={500}
                      max={10000}
                      step={100}
                      value={effBudget}
                      onChange={(e) => setBudgetOverride(Number(e.target.value))}
                      className="w-40"
                      aria-label="Adjust total budget"
                    />
                    <span className="font-display text-base font-bold text-cyan">${effBudget.toLocaleString()}</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(scaled).map(([k, v]) => (
                    <div key={k}>
                      <div className="mb-1 flex justify-between text-xs font-bold">
                        <span className="text-ink-dim">{k}</span>
                        <span className="tabular-nums text-ink">${v.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-line/60">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan to-purple transition-all duration-500" style={{ width: `${Math.min(100, (v / Math.max(scaledTotal, 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3 text-xs">
                  <span className="font-bold text-ink">Total: ${scaledTotal.toLocaleString()} <span className="text-ink-faint">(estimates only — verify live prices)</span></span>
                  <span className="font-bold text-cyan">${Math.ceil(scaledTotal / Math.max(trip.days, 1)).toLocaleString()}/day · ${Math.ceil(scaledTotal / Math.max(trip.days * trip.travelers, 1)).toLocaleString()}/day per person</span>
                </div>
              </div>

              {/* itinerary */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display mb-4 text-lg font-semibold text-ink">Day-by-day itinerary</h3>
                <ol className="space-y-4">
                  {trip.itinerary.map((d) => (
                    <li key={d.day} className="relative rounded-xl border border-line/70 bg-bg0/40 p-4">
                      <span className="chip-cyan absolute -left-2 -top-2 rounded-full px-2.5 py-1 text-[10px] font-extrabold">
                        DAY {d.day}
                      </span>
                      <p className="mb-2 pl-6 text-sm font-bold text-ink">{d.title}</p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div>
                          <p className="hairline mb-1 text-[9px] font-extrabold text-ink-faint">MORNING</p>
                          <p className="text-xs leading-relaxed text-ink-dim">{d.morning}</p>
                        </div>
                        <div>
                          <p className="hairline mb-1 text-[9px] font-extrabold text-ink-faint">AFTERNOON</p>
                          <p className="text-xs leading-relaxed text-ink-dim">{d.afternoon}</p>
                        </div>
                        <div>
                          <p className="hairline mb-1 text-[9px] font-extrabold text-ink-faint">EVENING</p>
                          <p className="text-xs leading-relaxed text-ink-dim">{d.evening}</p>
                        </div>
                      </div>
                      <p className="mt-2.5 flex items-start gap-1.5 text-[11px] text-purple">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                        {d.tip}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* packing + tips */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="glass-card rounded-2xl p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-ink">Smart packing list</h3>
                    <button onClick={() => void copyText(trip.packing.map((p) => `• ${p}`).join("\n"), "Packing list")} className="btn-ghost rounded-lg px-3 py-1.5 text-[11px] font-bold">
                      Copy
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {trip.packing.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-ink-dim">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="font-display mb-3 text-lg font-semibold text-ink">Trip tips & notes</h3>
                  <ul className="space-y-2.5">
                    {trip.tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-ink-dim">
                        <span className="font-display shrink-0 font-bold text-sunset">{i + 1}.</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                  {savedId && (
                    <Link href="/dashboard" className="btn-neon mt-5 inline-block rounded-lg px-5 py-2 text-xs">
                      Open in Dashboard →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="shimmer h-10 w-64 rounded-xl" />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="shimmer h-96 rounded-2xl" />
            <div className="shimmer h-96 rounded-2xl" />
          </div>
        </div>
      }
    >
      <PlanInner />
    </Suspense>
  );
}
