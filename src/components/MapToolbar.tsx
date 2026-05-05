"use client";

import { ALL_REGIONS, ALL_TIERS, type VenueRegion, type VenueTier } from "@/data/venue-registry";

const TIER_LABELS: Record<VenueTier, string> = {
  amphitheatre: "Amphitheatre",
  arena: "Arena",
  theater: "Theater",
  club: "Club",
  bar: "Bar",
  outdoor: "Outdoor",
};

interface MapToolbarProps {
  totalShows: number;
  totalVenues: number;
  selectedRegion: VenueRegion | "all";
  onRegionChange: (r: VenueRegion | "all") => void;
  selectedTiers: Set<VenueTier>;
  onTierToggle: (t: VenueTier) => void;
}

export function MapToolbar({
  totalShows,
  totalVenues,
  selectedRegion,
  onRegionChange,
  selectedTiers,
  onTierToggle,
}: MapToolbarProps) {
  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/90 px-3 py-2 backdrop-blur-sm">
      {/* Stats */}
      <div className="mr-2 hidden text-xs text-white/50 sm:block">
        <span className="font-bold text-white">{totalShows}</span> shows at{" "}
        <span className="font-bold text-white">{totalVenues}</span> venues
      </div>

      {/* Divider */}
      <div className="mr-1 hidden h-4 w-px bg-white/10 sm:block" />

      {/* Region filter */}
      <select
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value as VenueRegion | "all")}
        className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none transition-colors hover:border-white/20 focus:border-brand"
      >
        <option value="all">All regions</option>
        {ALL_REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {/* Tier chips */}
      <div className="flex flex-wrap gap-1">
        {ALL_TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => onTierToggle(tier)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              selectedTiers.has(tier)
                ? "bg-white/15 text-white"
                : "bg-white/5 text-white/30 hover:text-white/50"
            }`}
          >
            {TIER_LABELS[tier]}
          </button>
        ))}
      </div>
    </div>
  );
}
