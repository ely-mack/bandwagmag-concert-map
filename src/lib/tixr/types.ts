export type SiloKey = "BWP" | "CEG" | "GBJ";

export const SILOS: { key: SiloKey; groupId: number; name: string }[] = [
  { key: "BWP", groupId: 1532, name: "BandWagon Presents" },
  { key: "CEG", groupId: 2202, name: "Casper Entertainment Group" },
  { key: "GBJ", groupId: 1503, name: "Greeley Blues Jam" },
];

export interface TixrEventLean {
  id: number;
  name: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | string;
  startDate: number;
  endDate: number;
  venue?: { id: number; name: string };
  sales?: TixrSaleLean[];
}

export interface TixrSaleLean {
  id: number;
  name: string;
  type: string;
  category: string;
  startDate: number;
  endDate: number;
}

export interface TixrEventDetail {
  id: number;
  groupId: number;
  status: string;
  name: string;
  shortName?: string;
  startDate: number;
  endDate: number;
  description?: string;
  shortBlurb?: string;
  flyerUrl?: string;
  backgroundUrl?: string;
  url?: string;
  shortUrl?: string;
  venue?: TixrVenue;
  sales?: TixrSale[];
  lineups?: TixrLineup[];
}

export interface TixrSale {
  id: number;
  name: string;
  type: string;
  category: string;
  flatPrice?: number;
  price?: number;
  quantity?: number | null;
  startDate?: number;
  endDate?: number;
}

export interface TixrLineup {
  id: number;
  name?: string;
  acts?: TixrAct[];
}

export interface TixrAct {
  id: number;
  type?: string;
  artistId: number;
  rank?: number;
}

export interface TixrVenue {
  id: number;
  name: string;
  displayName?: string;
  address?: { city?: string; state?: string };
  latitude?: number;
  longitude?: number;
  capacity?: number;
}

export interface TixrFixture {
  generatedAt: number;
  silos: Record<SiloKey, { groupId: number; events: TixrEventDetail[] }>;
  artists: { id: number; name: string; imageUrl?: string }[];
}
