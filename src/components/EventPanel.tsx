"use client";

import type { VenueWithEvents } from "@/lib/merge";
import { EventCard } from "./EventCard";

interface EventPanelProps {
  data: VenueWithEvents | null;
  onClose: () => void;
}

const TIER_LABELS: Record<string, string> = {
  amphitheatre: "Amphitheatre",
  arena: "Arena",
  theater: "Theater",
  club: "Club",
  bar: "Bar",
  outdoor: "Outdoor Venue",
};

export function EventPanel({ data, onClose }: EventPanelProps) {
  if (!data) return null;

  const label = data.venue.displayName ?? data.venue.name;
  const isTixr = data.venue.source === "tixr";

  return (
    <div className="pointer-events-auto flex h-full w-full flex-col border-l border-white/10 bg-black/95 backdrop-blur-sm sm:w-[380px]">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-display text-lg font-bold text-white">
              {label}
            </h2>
            {isTixr && (
              <span className="shrink-0 rounded bg-brand/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand">
                BWP
              </span>
            )}
          </div>
          <p className="text-xs text-white/50">
            {data.venue.city}, {data.venue.state}
            {" · "}
            {TIER_LABELS[data.venue.tier] ?? data.venue.tier}
            {data.venue.capacity && ` · ${data.venue.capacity.toLocaleString()} cap`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {data.events.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/30">
            No upcoming shows listed
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {data.venue.website && (
        <div className="border-t border-white/10 px-4 py-3">
          <a
            href={data.venue.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-white/40 transition-colors hover:text-brand-cyan"
          >
            Visit venue website &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
