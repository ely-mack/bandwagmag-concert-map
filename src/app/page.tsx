"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MapWrapper } from "@/components/MapWrapper";
import { EventPanel } from "@/components/EventPanel";
import { MapToolbar } from "@/components/MapToolbar";
import type { VenueWithEvents } from "@/lib/merge";
import { ALL_TIERS, type VenueRegion, type VenueTier } from "@/data/venue-registry";

interface ApiResponse {
  generated: number;
  totalEvents: number;
  venues: VenueWithEvents[];
}

export default function ConcertMapPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<VenueRegion | "all">("all");
  const [selectedTiers, setSelectedTiers] = useState<Set<VenueTier>>(
    new Set(ALL_TIERS),
  );

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredVenues = useMemo(() => {
    if (!data) return [];
    return data.venues.filter((v) => {
      if (selectedRegion !== "all" && v.venue.region !== selectedRegion)
        return false;
      if (!selectedTiers.has(v.venue.tier)) return false;
      return true;
    });
  }, [data, selectedRegion, selectedTiers]);

  const selectedVenue = useMemo(() => {
    if (!selectedSlug || !data) return null;
    return data.venues.find((v) => v.venue.slug === selectedSlug) ?? null;
  }, [selectedSlug, data]);

  const totalShows = useMemo(
    () => filteredVenues.reduce((sum, v) => sum + v.count, 0),
    [filteredVenues],
  );

  const activeVenues = useMemo(
    () => filteredVenues.length,
    [filteredVenues],
  );

  const handleTierToggle = useCallback((tier: VenueTier) => {
    setSelectedTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) {
        if (next.size > 1) next.delete(tier);
      } else {
        next.add(tier);
      }
      return next;
    });
  }, []);

  const handleVenueSelect = useCallback((slug: string) => {
    setSelectedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
          <p className="text-sm text-white/40">Loading concert map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <div className="max-w-sm text-center">
          <p className="mb-2 font-display text-lg font-bold text-brand">
            Couldn't load events
          </p>
          <p className="text-sm text-white/50">
            The concert data feed is temporarily unavailable. Try refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-brand px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand/80"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Map */}
      <MapWrapper
        venues={filteredVenues}
        onVenueSelect={handleVenueSelect}
        selectedSlug={selectedSlug}
      />

      {/* Header bar */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] flex items-start justify-between gap-3 p-3">
        {/* Logo / title */}
        <div className="pointer-events-auto rounded-lg border border-white/10 bg-black/90 px-3 py-2 backdrop-blur-sm">
          <h1 className="font-display text-sm font-bold tracking-tight sm:text-base">
            <span className="text-brand">BandWagon</span>{" "}
            <span className="text-white/60">Concert Map</span>
          </h1>
          <p className="hidden text-[10px] text-white/30 sm:block">
            Colorado &amp; Wyoming live music
          </p>
        </div>

        {/* Toolbar */}
        <MapToolbar
          totalShows={totalShows}
          totalVenues={activeVenues}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedTiers={selectedTiers}
          onTierToggle={handleTierToggle}
        />
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000]">
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-white/10 bg-black/90 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="text-[10px] text-white/50">BandWagon venues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-cyan" />
            <span className="text-[10px] text-white/50">Partner &amp; indie venues</span>
          </div>
        </div>
      </div>

      {/* Event panel (slides in from right) */}
      <div
        className={`pointer-events-none absolute bottom-0 right-0 top-0 z-[1001] transition-transform duration-300 ${
          selectedSlug ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <EventPanel data={selectedVenue} onClose={() => setSelectedSlug(null)} />
      </div>

      {/* Mobile: tap a bubble hint */}
      {!selectedSlug && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 sm:hidden">
          <div className="rounded-full border border-white/10 bg-black/80 px-4 py-1.5 text-[11px] text-white/40 backdrop-blur-sm">
            Tap a venue bubble to see upcoming shows
          </div>
        </div>
      )}
    </div>
  );
}
