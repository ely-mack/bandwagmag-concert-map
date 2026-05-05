import type { TixrEventLean } from "./tixr/types";
import type { BandsintownEvent } from "./bandsintown/types";
import { VENUE_REGISTRY, type VenueEntry } from "@/data/venue-registry";

export interface CalendarEvent {
  id: string;
  source: "tixr" | "bandsintown";
  title: string;
  artistName: string;
  venueSlug: string;
  startDate: number;
  endDate?: number;
  flyerUrl?: string;
  ticketUrl?: string;
  priceFrom?: number;
  lineup?: string[];
}

export interface VenueWithEvents {
  venue: VenueEntry;
  events: CalendarEvent[];
  count: number;
}

function matchTixrVenue(tixrVenueName: string): VenueEntry | undefined {
  const lower = tixrVenueName.toLowerCase();
  return VENUE_REGISTRY.find((v) => {
    if (v.source !== "tixr") return false;
    return (
      v.name.toLowerCase() === lower ||
      v.slug === lower.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    );
  });
}

export function normalizeTixrEvents(
  events: TixrEventLean[],
  silo: string,
): CalendarEvent[] {
  return events
    .filter((e) => e.venue)
    .map((e) => {
      const venue = matchTixrVenue(e.venue!.name);
      return {
        id: `tixr-${e.id}`,
        source: "tixr" as const,
        title: e.name,
        artistName: e.name,
        venueSlug: venue?.slug ?? "",
        startDate: e.startDate,
        endDate: e.endDate,
        ticketUrl: `https://www.tixr.com/groups/${silo === "CEG" ? "2202" : silo === "GBJ" ? "1503" : "1532"}/events/${e.id}`,
      };
    })
    .filter((e) => e.venueSlug);
}

export function normalizeBandsintownEvents(
  slug: string,
  events: BandsintownEvent[],
): CalendarEvent[] {
  return events.map((e) => {
    const ticketOffer = e.offers?.find((o) => o.type === "Tickets" && o.url);
    return {
      id: `bit-${e.id}`,
      source: "bandsintown" as const,
      title: e.title || e.artist?.name || "TBA",
      artistName: e.artist?.name || e.lineup?.[0] || "TBA",
      venueSlug: slug,
      startDate: new Date(e.datetime).getTime(),
      ticketUrl: ticketOffer?.url || e.url,
      flyerUrl: e.artist?.image_url || undefined,
      lineup: e.lineup,
    };
  });
}

export function buildVenueMap(events: CalendarEvent[]): VenueWithEvents[] {
  const byVenue = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const existing = byVenue.get(event.venueSlug) ?? [];
    existing.push(event);
    byVenue.set(event.venueSlug, existing);
  }

  const result: VenueWithEvents[] = [];

  for (const venue of VENUE_REGISTRY) {
    const venueEvents = byVenue.get(venue.slug) ?? [];
    result.push({
      venue,
      events: venueEvents.sort((a, b) => a.startDate - b.startDate),
      count: venueEvents.length,
    });
  }

  return result;
}
