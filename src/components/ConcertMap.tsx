"use client";

import { useEffect, useRef, useCallback } from "react";
import type { VenueWithEvents } from "@/lib/merge";
import { relax, markerSize, markerInitials, type PlacedNode } from "@/lib/force-layout";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface ConcertMapProps {
  venues: VenueWithEvents[];
  onVenueSelect: (slug: string) => void;
  selectedSlug?: string | null;
}

export function ConcertMap({
  venues,
  onVenueSelect,
  selectedSlug,
}: ConcertMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const cssLoadedRef = useRef(false);
  const markersRef = useRef<Map<string, unknown>>(new Map());

  const handleVenueSelect = useCallback(
    (slug: string) => onVenueSelect(slug),
    [onVenueSelect],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const visible = venues.filter(
      (v) => v.venue.latitude && v.venue.longitude,
    );
    if (visible.length === 0) return;

    if (!cssLoadedRef.current) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity =
        "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
      cssLoadedRef.current = true;
    }

    const activeCounts = visible.filter((v) => v.count > 0).map((v) => v.count);
    const min = activeCounts.length ? Math.min(...activeCounts) : 0;
    const max = activeCounts.length ? Math.max(...activeCounts) : 1;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 18,
        subdomains: "abcd",
      }).addTo(map);

      const bounds = L.latLngBounds(
        visible.map(
          (v) =>
            [v.venue.latitude, v.venue.longitude] as [number, number],
        ),
      );
      map.fitBounds(bounds.pad(0.25));

      type Entry = {
        data: VenueWithEvents;
        size: number;
        anchorLatLng: [number, number];
        anchorMarker: ReturnType<typeof L.circleMarker>;
        bubbleMarker: ReturnType<typeof L.marker>;
        connector: ReturnType<typeof L.polyline>;
      };

      const entries: Entry[] = visible.map((v) => {
        const size = v.count > 0 ? markerSize(v.count, min, max) : 36;
        const anchorLatLng: [number, number] = [
          v.venue.latitude,
          v.venue.longitude,
        ];
        const isTixr = v.venue.source === "tixr";
        const color = isTixr ? "#e4414a" : "#3fc9e6";

        const anchorMarker = L.circleMarker(anchorLatLng, {
          radius: 3,
          color,
          fillColor: color,
          fillOpacity: 1,
          weight: 2,
          opacity: 0.9,
          interactive: false,
        }).addTo(map);

        const label =
          v.venue.displayName ?? v.venue.name;
        const initials = markerInitials(label);
        const hasLogo = v.venue.hasLogo;
        const logoPath = hasLogo ? `/venues/${v.venue.slug}.png` : null;
        const pinClass = `bwp-venue-pin${logoPath ? " bwp-venue-pin--logo" : ""}${isTixr ? "" : " bwp-venue-pin--external"}`;

        const inner = logoPath
          ? `<img src="${logoPath}" alt="" class="bwp-venue-pin__logo" />`
          : `<span class="bwp-venue-pin__initials" style="font-size:${Math.round(size * 0.3)}px;">${initials}</span>`;

        const countBadge =
          v.count > 0
            ? `<span class="bwp-venue-pin__count" style="font-size:${Math.max(9, Math.round(size * 0.18))}px;">${v.count}</span>`
            : "";

        const html = `
          <div class="${pinClass}" style="width:${size}px;height:${size}px;${v.count === 0 ? "opacity:0.5;" : ""}">
            ${inner}
            ${countBadge}
          </div>
        `;

        const icon = L.divIcon({
          className: "bwp-venue-icon",
          html,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const tierLabel =
          v.venue.tier === "amphitheatre"
            ? "Amphitheatre"
            : v.venue.tier === "arena"
              ? "Arena"
              : v.venue.tier === "outdoor"
                ? "Outdoor"
                : v.venue.tier === "theater"
                  ? "Theater"
                  : v.venue.tier === "club"
                    ? "Club"
                    : "Bar";

        const bubbleMarker = L.marker(anchorLatLng, {
          icon,
          draggable: true,
          autoPan: false,
        });

        const showLine =
          v.count > 0
            ? `<br>${v.count} upcoming ${v.count === 1 ? "show" : "shows"}`
            : `<br><span style="opacity:.6">No shows listed yet</span>`;

        bubbleMarker.bindTooltip(
          `<strong>${label}</strong><br>${v.venue.city}, ${v.venue.state} · ${tierLabel}` +
            showLine +
            `<br><span style="opacity:.5">click to view · drag to move</span>`,
          {
            direction: "top",
            className: "bwp-venue-tooltip",
            offset: [0, -size / 2],
          },
        );

        let dragHappened = false;
        bubbleMarker.on("dragstart", () => {
          dragHappened = true;
        });
        bubbleMarker.on("drag", () => {
          const c = bubbleMarker.getLatLng();
          connector.setLatLngs([anchorLatLng, [c.lat, c.lng]]);
        });
        bubbleMarker.on("dragend", () => {
          setTimeout(() => {
            dragHappened = false;
          }, 50);
        });
        bubbleMarker.on("click", () => {
          if (dragHappened) return;
          handleVenueSelect(v.venue.slug);
        });
        bubbleMarker.addTo(map);

        markersRef.current.set(v.venue.slug, bubbleMarker);

        const connector = L.polyline([anchorLatLng, anchorLatLng], {
          color,
          weight: 1,
          opacity: 0.45,
          dashArray: "4 4",
          interactive: false,
        }).addTo(map);

        return {
          data: v,
          size,
          anchorLatLng,
          anchorMarker,
          bubbleMarker,
          connector,
        };
      });

      const runLayout = () => {
        const nodes: PlacedNode[] = entries.map((e) => {
          const px = (map as L.Map).latLngToContainerPoint(e.anchorLatLng);
          return {
            x: px.x,
            y: px.y,
            anchorX: px.x,
            anchorY: px.y,
            radius: e.size / 2,
          };
        });
        relax(nodes);
        entries.forEach((e, i) => {
          const newLatLng = (map as L.Map).containerPointToLatLng([
            nodes[i].x,
            nodes[i].y,
          ]);
          e.bubbleMarker.setLatLng(newLatLng);
          e.connector.setLatLngs([
            e.anchorLatLng,
            [newLatLng.lat, newLatLng.lng],
          ]);
        });
      };
      runLayout();

      map.on("zoomend", runLayout);
    })();

    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      if (m && typeof m.remove === "function") m.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [venues, handleVenueSelect]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
