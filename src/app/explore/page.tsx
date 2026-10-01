"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ToastSystem";
import { api, errorMessage } from "@/lib/api";
import { INTERESTS, SEASONS, type DestinationInfo, type Interest, type Recommendation, type Season } from "@/lib/travelTypes";

function ExploreInner() {
  const params = useSearchParams();
  const toast = useToast();
  const [dests, setDests] = useState<DestinationInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // finder state
  const [budget, setBudget] = useState("mid");
  const [region, setRegion] = useState("Any");
  const [days, setDays] = useState(4);
  const [season, setSeason] = useState<Season>(SEASONS[4]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [finding, setFinding] = useState(false);

  // favorites (localStorage)
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tv.favs");
      if (raw) setFavs(JSON.parse(raw));
    } catch {
      /* private mode */
    }
  }, []);
  const toggleFav = (id: string) => {
    setFavs((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      try {
        localStorage.setItem("tv.favs", JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });
  };

  const load = useCallback(() => {
    api
      .listDestinations()
      .then((d) => {
        setDests(d);
        setError(null);
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const find = async () => {
    setFinding(true);
    setRecs(null);
    try {
      const r = await api.recommend({ budgetLevel: budget, interests, season, days, region });
      setRecs(r);
      if (!r.length) toast("No strong matches — try widening budget or region.", "info");
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setFinding(false);
    }
  };

  const selected = params.get("d") ? dests.find((d) => d.id === params.get("d")) : null;

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="hairline mb-2 text-[11px] font-extrabold text-cyan">Explore</p>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Destination discovery</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-dim">
            Eight curated destinations with budgets, seasons, food and activities. All prices are planning estimates.
          </p>
        </div>
      </div>

      {error && (
        <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-danger/40 p-5">
          <p className="text-sm text-danger">{error}</p>
          <button onClick={load} className="btn-ghost rounded-lg px-4 py-2 text-sm font-bold">Retry</button>
        </div>
      )}

      {/* Destination finder */}
      <div className="glass-card glow-ring mb-10 rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold text-ink">AI Destination Finder</h2>
        <p className="mt-1 text-sm text-ink-dim">Tell us your constraints — get scored recommendations (demo engine, sample climate).</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim" htmlFor="f-budget">Budget level</label>
            <select id="f-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="neon-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold">
              <option value="budget">Budget (value)</option>
              <option value="mid">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
          <div>
            <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim" htmlFor="f-region">Region</label>
            <select id="f-region" value={region} onChange={(e) => setRegion(e.target.value)} className="neon-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold">
              <option>Any</option>
              <option>India</option>
              <option>International</option>
            </select>
          </div>
          <div>
            <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim" htmlFor="f-days">Trip length (days)</label>
            <input id="f-days" type="range" min={2} max={14} value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-2.5 w-full" />
            <p className="text-sm font-bold text-ink">{days} days</p>
          </div>
          <div>
            <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim" htmlFor="f-season">Preferred season</label>
            <select id="f-season" value={season} onChange={(e) => setSeason(e.target.value as Season)} className="neon-input w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold">
              {SEASONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                onClick={() => setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${interests.includes(i) ? "border border-cyan/60 bg-cyan/10 text-cyan" : "chip"}`}
                aria-pressed={interests.includes(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => void find()} disabled={finding} className="btn-neon mt-5 rounded-xl px-7 py-3 text-sm">
          {finding ? "Matching…" : "Find My Destinations"}
        </button>

        {recs && recs.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((r) => (
              <div key={r.destination.id} className="glass-card animate-fade-up rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/explore?d=${r.destination.id}`} className="font-display text-lg font-semibold text-ink hover:text-cyan">
                    {r.destination.name}
                  </Link>
                  <span className="chip-cyan rounded-full px-2.5 py-1 text-[11px] font-extrabold">{r.matchScore}%</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {r.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug text-ink-dim">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="3" strokeLinecap="round" className="mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* selected destination detail */}
      {selected && (
        <div className="glass-card glow-ring mb-10 animate-fade-up overflow-hidden rounded-2xl">
          <div className="relative h-56 sm:h-72">
            <img src={selected.image} alt={`${selected.name}, ${selected.country}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg0 via-bg0/30" />
            <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-bold text-ink">{selected.name}, {selected.country}</h2>
                <p className="mt-1 text-sm text-ink-dim">{selected.vibe}</p>
              </div>
              <Link href={`/plan?d=${selected.id}`} className="btn-neon rounded-xl px-5 py-2.5 text-sm">
                Plan a trip here
              </Link>
            </div>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="hairline mb-2 text-[10px] font-extrabold text-ink-faint">Daily budget (est.)</h3>
              <p className="font-display text-xl font-bold text-ink">${selected.dailyBudgetLow}–${selected.dailyBudgetHigh}</p>
              <p className="text-[11px] text-ink-faint">per person, local spend · planning estimate</p>
            </div>
            <div>
              <h3 className="hairline mb-2 text-[10px] font-extrabold text-ink-faint">Best time</h3>
              <p className="text-sm font-bold text-ink">{selected.bestMonths}</p>
              <p className="text-[11px] text-ink-faint">check sample climate in Insights</p>
            </div>
            <div>
              <h3 className="hairline mb-2 text-[10px] font-extrabold text-ink-faint">Top attractions</h3>
              <ul className="space-y-1 text-xs text-ink-dim">
                {selected.attractions.slice(0, 4).map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="hairline mb-2 text-[10px] font-extrabold text-ink-faint">Famous food</h3>
              <ul className="space-y-1 text-xs text-ink-dim">
                {selected.food.slice(0, 4).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(error ? [] : dests).map((d, i) => (
          <article key={d.id} className={`glass-card glass-card-hover group overflow-hidden rounded-2xl ${i % 3 === 1 ? "float-slow" : ""}`}>
            <Link href={`/explore?d=${d.id}`} className="relative block h-52 overflow-hidden">
              <img src={d.image} alt={`${d.name}, ${d.country}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg0/95 via-bg0/20" />
              <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-bg0/60 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-cyan backdrop-blur">
                {d.region === "India" ? "INDIA" : "INTERNATIONAL"}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFav(d.id);
                }}
                aria-label={favs.includes(d.id) ? `Remove ${d.name} from favorites` : `Add ${d.name} to favorites`}
                title="Save to favorites"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-bg0/60 backdrop-blur transition-transform hover:scale-110"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={favs.includes(d.id) ? "var(--purple)" : "none"} stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4 1-4.5 2.5C10.9 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7Z" />
                </svg>
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-display text-2xl font-semibold text-ink">{d.name}</h3>
                <p className="text-xs text-ink-dim">{d.country} · {d.vibe}</p>
              </div>
            </Link>
            <div className="p-4">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {d.tags.slice(0, 3).map((t) => (
                  <span key={t} className="chip rounded-full px-2.5 py-0.5 text-[10px] font-bold">{t}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-dim">
                <span className="font-bold text-ink">${d.dailyBudgetLow}–${d.dailyBudgetHigh}/day <span className="font-normal text-ink-faint">est.</span></span>
                <span className="font-bold text-purple">{d.bestMonths}</span>
              </div>
              <div className="mt-3 border-t border-line/60 pt-3 text-xs leading-relaxed text-ink-dim">
                <p><span className="font-bold text-ink">Adventure:</span> {d.activities[0]}</p>
                <p className="mt-1"><span className="font-bold text-ink">Culture:</span> {d.culture[0]}</p>
              </div>
              <div className="mt-3.5 flex gap-2">
                <Link href={`/plan?d=${d.id}`} className="btn-neon flex-1 rounded-lg py-2 text-center text-xs">Plan a trip</Link>
                <Link href={`/map?d=${d.id}`} className="btn-ghost flex-1 rounded-lg py-2 text-center text-xs font-bold">View on map</Link>
              </div>
              <p className="mt-2 text-center text-[9px] text-ink-faint">Photo: {d.imageCredit}</p>
            </div>
          </article>
        ))}
        {!error && dests.length === 0 && (
          <div className="shimmer h-80 rounded-2xl sm:col-span-2 lg:col-span-3" />
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="shimmer h-10 w-64 rounded-xl" />
          <div className="shimmer mt-6 h-96 rounded-2xl" />
        </div>
      }
    >
      <ExploreInner />
    </Suspense>
  );
}
