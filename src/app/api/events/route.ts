import { NextResponse } from "next/server";
import { SILOS } from "@/lib/tixr/types";
import { listUpcomingForSilo } from "@/lib/tixr/client";
import { fetchAllVenueEvents } from "@/lib/bandsintown/client";
import {
  normalizeTixrEvents,
  normalizeBandsintownEvents,
  buildVenueMap,
  type CalendarEvent,
} from "@/lib/merge";
import { getBandsintownVenues } from "@/data/venue-registry";

export const revalidate = 300;

export async function GET() {
  const allEvents: CalendarEvent[] = [];

  const tixrResults = await Promise.allSettled(
    SILOS.map(async (silo) => {
      const events = await listUpcomingForSilo(silo);
      return normalizeTixrEvents(events, silo.key);
    }),
  );

  for (const result of tixrResults) {
    if (result.status === "fulfilled") {
      allEvents.push(...result.value);
    }
  }

  const bitVenues = getBandsintownVenues().map((v) => ({
    name: v.name,
    city: v.city,
    state: v.state,
    slug: v.slug,
  }));

  try {
    const bitMap = await fetchAllVenueEvents(bitVenues);
    for (const [slug, events] of bitMap) {
      allEvents.push(...normalizeBandsintownEvents(slug, events));
    }
  } catch {
    // Bandsintown down, serve TIXR-only
  }

  const venues = buildVenueMap(allEvents);

  return NextResponse.json({
    generated: Date.now(),
    totalEvents: allEvents.length,
    venues,
  });
}
