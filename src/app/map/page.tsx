"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import DestMap from "@/components/DestMap";
import { api } from "@/lib/api";
import type { DestinationInfo } from "@/lib/travelTypes";

function MapInner() {
  const params = useSearchParams();
  const [dests, setDests] = useState<DestinationInfo[]>([]);
  const [routeIds, setRouteIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listDestinations().then((d) => {
      setDests(d);
      const preset = params.get("d");
      if (preset && d.some((x) => x.id === preset)) {
        setRouteIds([preset]);
        setSelectedId(preset);
      } else {
        setRouteIds(d.slice(0, 3).map((x) => x.id));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(
    () => dests.filter((d) => routeIds.includes(d.id)),
    [dests, routeIds]
  );
  const selected = dests.find((d) => d.id === selectedId) ?? null;

  const matches = search.trim()
    ? dests.filter((d) => (d.name + " " + d.country).toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : dests.slice(0, 6);

  const pick = (id: string) => {
    setSelectedId(id);
    if (!routeIds.includes(id)) setRouteIds((r) => [...r, id].slice(-4));
  };

  const totalKm = useMemo(() => {
    // rough haversine between consecutive route stops (illustrative)
    const pts = visible.map((d) => ({ lat: d.lat, lng: d.lng }));
    let km = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dLat = ((pts[i + 1].lat - pts[i].lat * 0) * Math.PI) / 180;
      const a = (pts[i].lat * Math.PI) / 180;
      const b = (pts[i + 1].lat * Math.PI) / 180;
      const dLng = ((pts[i + 1].lng - pts[i].lng) * Math.PI) / 180;
      const h =
        Math.sin(dLat / 2) ** 2 + Math.cos(a) * Math.cos(b) * Math.sin(dLng / 2) ** 2;
      km += 2 * 6371 * Math.asin(Math.sqrt(h));
    }
    return km;
  }, [visible]);

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="hairline mb-2 text-[11px] font-extrabold text-cyan">Travel Map</p>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">See your journey on the map</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-dim">
            Add stops to trace a multi-city route. Markers use approximate city centers; the line is a planning aid,
            not a verified travel path.
          </p>
        </div>
        <span className="chip-violet rounded-full px-3 py-1.5 text-[11px] font-extrabold tracking-wider">
          MAP DATA © OPENSTREETMAP
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* search + route builder */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <label className="hairline mb-2 block text-[11px] font-bold text-ink-dim" htmlFor="map-search">Search destinations</label>
            <input
              id="map-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a destination…"
              className="neon-input w-full rounded-xl px-3.5 py-2.5 text-sm"
            />
            <ul className="mt-2.5 space-y-1">
              {matches.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => pick(d.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${selectedId === d.id ? "bg-cyan/10" : "hover:bg-line/40"}`}
                  >
                    <img src={d.image} alt="" className="h-8 w-12 rounded-md object-cover" />
                    <span>
                      <span className={`block text-sm font-bold ${selectedId === d.id ? "text-cyan" : "text-ink"}`}>{d.name}</span>
                      <span className="block text-[11px] text-ink-faint">{d.country}</span>
                    </span>
                    {routeIds.includes(d.id) && <span className="chip-cyan ml-auto rounded px-1.5 py-0.5 text-[9px] font-extrabold">ON ROUTE</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <h2 className="hairline mb-2 text-[11px] font-extrabold text-ink-dim">Route stops</h2>
            {routeIds.length === 0 ? (
              <p className="text-sm text-ink-dim">Add destinations from the list to build a route.</p>
            ) : (
              <>
                <ol className="space-y-1.5">
                  {routeIds.map((id, i) => {
                    const d = dests.find((x) => x.id === id);
                    if (!d) return null;
                    return (
                      <li key={id} className="flex items-center gap-2.5 rounded-lg border border-line/60 bg-bg0/40 px-3 py-2">
                        <span className="font-display text-sm font-bold text-cyan">{i + 1}</span>
                        <span className="flex-1 text-sm font-bold text-ink">{d.name}</span>
                        <button onClick={() => setRouteIds((r) => r.filter((x) => x !== id))} className="text-xs font-bold text-danger hover:opacity-80" aria-label={`Remove ${d.name} from route`}>
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ol>
                {routeIds.length >= 2 && (
                  <p className="mt-3 text-[11px] font-bold text-ink-dim">
                    Approx. route distance: <span className="text-cyan">{Math.round(totalKm).toLocaleString()} km</span> (straight-line, illustrative)
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* map + info card */}
        <div className="space-y-4">
          <DestMap destinations={visible} selectedId={selectedId} onSelect={setSelectedId} />
          {selected && (
            <div className="glass-card glow-ring animate-fade-up grid gap-4 rounded-2xl p-5 sm:grid-cols-[200px_1fr]">
              <img src={selected.image} alt={`${selected.name}, ${selected.country}`} className="h-36 w-full rounded-xl object-cover" />
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink">{selected.name}, {selected.country}</h2>
                    <p className="text-xs text-ink-dim">{selected.vibe}</p>
                  </div>
                  <span className="chip-cyan shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold">${selected.dailyBudgetLow}–${selected.dailyBudgetHigh}/day</span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-ink-dim sm:grid-cols-2">
                  <p><span className="font-bold text-ink">See:</span> {selected.attractions.slice(0, 3).join(", ")}</p>
                  <p><span className="font-bold text-ink">Eat:</span> {selected.food.slice(0, 2).join(", ")}</p>
                  <p><span className="font-bold text-ink">Stay:</span> {selected.hotelHint}</p>
                  <p><span className="font-bold text-ink">Move:</span> {selected.transportHint}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="shimmer h-10 w-64 rounded-xl" />
          <div className="mt-6 h-96 rounded-2xl shimmer" />
        </div>
      }
    >
      <MapInner />
    </Suspense>
  );
}
