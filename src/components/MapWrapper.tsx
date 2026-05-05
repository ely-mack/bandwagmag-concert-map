"use client";

import dynamic from "next/dynamic";
import type { VenueWithEvents } from "@/lib/merge";

const ConcertMap = dynamic(
  () => import("./ConcertMap").then((m) => m.ConcertMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-zinc-950" /> },
);

interface MapWrapperProps {
  venues: VenueWithEvents[];
  onVenueSelect: (slug: string) => void;
  selectedSlug?: string | null;
}

export function MapWrapper(props: MapWrapperProps) {
  return <ConcertMap {...props} />;
}
