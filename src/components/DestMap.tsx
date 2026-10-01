"use client";

import { useEffect, useRef, useState } from "react";
import type * as LNS from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DestinationInfo } from "@/lib/travelTypes";

/**
 * Interactive OpenStreetMap with destination markers + route visualization.
 * Leaflet is imported lazily inside an effect so server prerendering never
 * touches window.
 */

let leafletPromise: Promise<typeof LNS> | null = null;
function loadLeaflet() {
  leafletPromise ??= import("leaflet");
  return leafletPromise;
}

interface Props {
  destinations: DestinationInfo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function DestMap({ destinations, selectedId, onSelect }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LNS.Map | null>(null);
  const markersRef = useRef<Record<string, LNS.Marker>>({});
  const routeRef = useRef<LNS.Polyline | null>(null);
  const [ready, setReady] = useState(false);

  /* init map once (client only) */
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !divRef.current || mapRef.current) return;
      const map = L.map(divRef.current, {
        center: [22, 55],
        zoom: 2,
        minZoom: 2,
        maxZoom: 14,
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);
      mapRef.current = map;
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  /* markers + route */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    void loadLeaflet().then((L) => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      routeRef.current?.remove();
      routeRef.current = null;

      const iconFor = (selected: boolean) =>
        L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:${selected ? 30 : 22}px;height:${selected ? 30 : 22}px;border-radius:999px;background:linear-gradient(135deg,#22d3ee,#a855f7);border:2px solid rgba(255,255,255,.85);box-shadow:0 0 ${selected ? 22 : 12}px rgba(139,92,246,.8);">
            <span style="width:8px;height:8px;border-radius:999px;background:white;"></span>
          </div>`,
          iconSize: [selected ? 30 : 22, selected ? 30 : 22],
          iconAnchor: [selected ? 15 : 11, selected ? 15 : 11],
        });

      destinations.forEach((d) => {
        const marker = L.marker([d.lat, d.lng], { icon: iconFor(d.id === selectedId), title: d.name, riseOnHover: true })
          .addTo(map)
          .bindTooltip(`<strong>${d.name}</strong>, ${d.country}`, { direction: "top", offset: [0, -12] });
        marker.on("click", () => onSelect(d.id));
        markersRef.current[d.id] = marker;
      });

      if (destinations.length >= 2) {
        const latlngs = destinations.map((d) => [d.lat, d.lng] as [number, number]);
        routeRef.current = L.polyline(latlngs, {
          color: "#a855f7",
          weight: 3,
          opacity: 0.75,
          dashArray: "8 8",
          lineCap: "round",
        }).addTo(map);
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds.pad(0.35), { maxZoom: 6 });
      } else if (destinations.length === 1) {
        map.setView([destinations[0].lat, destinations[0].lng], 5);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinations, selectedId, ready]);

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div ref={divRef} className="h-[420px] w-full sm:h-[480px]" role="application" aria-label="Interactive destination map" />
      <p className="border-t border-line/60 px-4 py-2 text-[11px] text-ink-faint">
        Map data © OpenStreetMap contributors. Markers show destination locations (approximate city centers);
        the dashed line is a planning route, not a verified flight or travel path.
      </p>
    </div>
  );
}
