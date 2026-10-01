"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DestinationInfo } from "@/lib/travelTypes";

const FEATURES = [
  { title: "AI Trip Generator", desc: "Day-by-day itineraries tailored to your style, interests, group size and season.", href: "/plan" },
  { title: "Destination Finder", desc: "Scored recommendations by budget, interests, region and the season right now.", href: "/explore" },
  { title: "Budget Planner", desc: "Instant estimates for stay, flights, food, activities and shopping — clearly labeled estimates.", href: "/plan" },
  { title: "Interactive Map", desc: "Real OpenStreetMap with destination markers, search and multi-city route lines.", href: "/map" },
  { title: "Smart Packing Lists", desc: "Checklists generated from destination climate, season and trip length.", href: "/plan" },
  { title: "AI Travel Assistant", desc: "A friendly demo assistant for tips, budgets, best times and packing — right in the corner.", href: "/" },
];

const STEPS = [
  { n: "01", label: "Pick or find", desc: "Search destinations or let the finder match your budget and interests." },
  { n: "02", label: "Generate", desc: "Days, travelers, style and budget — the AI builds the full plan." },
  { n: "03", label: "Refine", desc: "Tweak the budget, swap days, copy the packing list." },
  { n: "04", label: "Go", desc: "Your trip lives in the dashboard until you fly." },
];

export default function LandingPage() {
  const [dests, setDests] = useState<DestinationInfo[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.listDestinations().then(setDests).catch(() => setDests([]));
  }, []);

  const matches = query.trim()
    ? dests.filter((d) => (d.name + " " + d.country).toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <main className="relative z-10">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.16em] text-cyan">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cyan" />
            AI TRAVEL PLANNER
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.08] text-ink sm:text-6xl">
            Explore the World, <span className="gradient-text">Plan Smarter</span> with AI.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-dim">
            Your personal AI travel companion for unforgettable journeys, personalized itineraries, and
            smarter travel decisions.
          </p>

          {/* destination search */}
          <div className="relative mx-auto mt-9 max-w-xl">
            <div className="glass-card glow-ring flex items-center gap-2 rounded-2xl p-2 pl-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations — try Bali, Paris, Jaipur…"
                aria-label="Search destinations"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <Link href={matches.length ? `/explore?d=${matches[0].id}` : "/explore"} className="btn-neon shrink-0 rounded-xl px-4 py-2.5 text-sm">
                Explore
              </Link>
            </div>
            {matches.length > 0 && (
              <ul className="glass-card absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl p-1.5">
                {matches.map((d) => (
                  <li key={d.id}>
                    <Link href={`/explore?d=${d.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-line/40">
                      <img src={d.image} alt="" className="h-9 w-14 rounded-md object-cover" />
                      <span>
                        <span className="block text-sm font-bold text-ink">{d.name}</span>
                        <span className="block text-[11px] text-ink-faint">{d.country} · ${d.dailyBudgetLow}–${d.dailyBudgetHigh}/day est.</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/plan" className="btn-neon inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l3.5 4-2 2-2.5-.5a.5.5 0 0 0-.4.8L5 17l1.4 2.6a.5.5 0 0 0 .8 0l2-2.5 4 3.5a.5.5 0 0 0 .8-.4Z" />
              </svg>
              Plan My Trip
            </Link>
            <Link href="/dashboard" className="btn-ghost inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold">
              My Dashboard
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-ink-faint">
            8 curated destinations · itineraries & budgets generated on demand · all prices are estimates
          </p>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="hairline mb-2 text-[11px] font-extrabold text-cyan">Popular destinations</p>
            <h2 className="font-display text-3xl font-bold text-ink">Where to this season?</h2>
          </div>
          <Link href="/explore" className="text-sm font-bold text-cyan hover:opacity-80">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dests.slice(0, 4).map((d, i) => (
            <Link key={d.id} href={`/explore?d=${d.id}`} className={`glass-card glass-card-hover group overflow-hidden rounded-2xl ${i % 2 ? "float-slower" : "float-slow"}`}>
              <div className="relative h-44 overflow-hidden">
                <img src={d.image} alt={`${d.name}, ${d.country}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg0/90 via-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-bg0/60 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-cyan backdrop-blur">
                  {d.region === "India" ? "INDIA" : "INTL"}
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display text-xl font-semibold text-ink">{d.name}</h3>
                  <p className="text-xs text-ink-dim">{d.country}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-bold text-ink-dim">${d.dailyBudgetLow}–${d.dailyBudgetHigh}/day <span className="text-ink-faint">est.</span></span>
                <span className="text-[11px] font-bold text-purple">{d.bestMonths}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-bg0/40 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="hairline mb-3 text-[11px] font-extrabold text-purple">The platform</p>
            <h2 className="font-display text-3xl font-bold text-ink">Everything between “where should I go?” and “we're boarding.”</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Link key={f.title} href={f.href} className="glass-card glass-card-hover group rounded-2xl p-5" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="mb-3 inline-flex rounded-xl border border-violet/30 bg-violet/10 p-2.5 transition-colors group-hover:border-cyan/50 group-hover:bg-cyan/10">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors group-hover:stroke-cyan">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18" />
                    <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="hairline mb-3 text-[11px] font-extrabold text-sunset">How it works</p>
          <h2 className="font-display text-3xl font-bold text-ink">From daydream to boarding pass in four steps</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="glass-card relative rounded-2xl p-4">
              <span className="font-display text-3xl font-bold gradient-text">{s.n}</span>
              <h3 className="mt-2 text-sm font-bold text-ink">{s.label}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-dim">{s.desc}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link href="/plan" className="btn-neon inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base">
            Start planning — it's free
          </Link>
        </div>
      </section>
    </main>
  );
}
