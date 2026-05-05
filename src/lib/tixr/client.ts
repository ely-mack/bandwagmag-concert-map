import { SILOS, type SiloKey, type TixrEventLean } from "./types";

const STUDIO_BASE = "https://studio.tixr.com/api";
const REVALIDATE_SECONDS = 300;

function authHeader(): string {
  const pub = process.env.TIXR_PUBLIC_KEY;
  const priv = process.env.TIXR_PRIVATE_KEY;
  if (!pub || !priv) {
    throw new Error("TIXR_PUBLIC_KEY and TIXR_PRIVATE_KEY must be set");
  }
  return `Basic ${Buffer.from(`${pub}:${priv}`).toString("base64")}`;
}

async function tixrFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${STUDIO_BASE}${path}`, {
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TIXR ${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export function getSilos() {
  return SILOS;
}

export async function listEvents(groupId: number): Promise<TixrEventLean[]> {
  return tixrFetch<TixrEventLean[]>(`/groups/${groupId}/events?view=lean&limit=500`);
}

export async function listUpcomingForSilo(
  silo: { key: SiloKey; groupId: number },
): Promise<TixrEventLean[]> {
  const now = Date.now();
  const events = await listEvents(silo.groupId);
  return events
    .filter((e) => e.startDate > now && e.status === "PUBLISHED")
    .sort((a, b) => a.startDate - b.startDate);
}
