"use client";

import type { CalendarEvent } from "@/lib/merge";
import { formatShowDateShort, formatShowTime } from "@/lib/format";

export function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <a
      href={event.ticketUrl ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
    >
      {event.flyerUrl && (
        <img
          src={event.flyerUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-white">
          {event.artistName}
        </p>
        {event.title !== event.artistName && (
          <p className="truncate text-xs text-white/50">{event.title}</p>
        )}
        <p className="mt-0.5 text-xs text-white/40">
          {formatShowDateShort(event.startDate)} · {formatShowTime(event.startDate)}
        </p>
        {event.lineup && event.lineup.length > 1 && (
          <p className="mt-0.5 truncate text-xs text-white/30">
            w/ {event.lineup.slice(1).join(", ")}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center">
        {event.ticketUrl && (
          <span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand transition-colors group-hover:bg-brand/20">
            Tickets
          </span>
        )}
      </div>
    </a>
  );
}
