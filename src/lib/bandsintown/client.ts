import type { BandsintownEvent } from "./types";

const BIT_BASE = "https://rest.bandsintown.com";
const APP_ID = process.env.BANDSINTOWN_APP_ID ?? "bandwagmag_concert_map";

export async function fetchVenueEvents(
  venueName: string,
  venueCity: string,
  venueState: string,
): Promise<BandsintownEvent[]> {
  const location = `${venueCity}, ${venueState}`;
  const params = new URLSearchParams({
    app_id: APP_ID,
    location: location,
    venue_name: venueName,
    date: "upcoming",
  });

  try {
    const res = await fetch(
      `${BIT_BASE}/v4/venues/search?${params.toString()}`,
      { next: { revalidate: 300 } },
    );

    if (!res.ok) return [];

    const venues = (await res.json()) as { id: number; name: string }[];
    if (!venues.length) return [];

    const venueId = venues[0].id;
    const eventsRes = await fetch(
      `${BIT_BASE}/v4/venues/${venueId}/events?app_id=${APP_ID}&date=upcoming`,
      { next: { revalidate: 300 } },
    );

    if (!eventsRes.ok) return [];
    return (await eventsRes.json()) as BandsintownEvent[];
  } catch {
    return [];
  }
}

export async function fetchAllVenueEvents(
  venues: { name: string; city: string; state: string; slug: string }[],
): Promise<Map<string, BandsintownEvent[]>> {
  const results = new Map<string, BandsintownEvent[]>();

  const settled = await Promise.allSettled(
    venues.map(async (v) => {
      const events = await fetchVenueEvents(v.name, v.city, v.state);
      return { slug: v.slug, events };
    }),
  );

  for (const result of settled) {
    if (result.status === "fulfilled" && result.value.events.length > 0) {
      results.set(result.value.slug, result.value.events);
    }
  }

  return results;
}
