export type MapPlace = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number | null;
  review_highlight?: string;
  category?: string;
};

export type MapSearchResult = {
  reply: string;
  voice_guidance?: string;
  search_area?: string;
  places: MapPlace[];
  center: { lat: number; lng: number };
  place_count: number;
};

import { getBackendUrl } from "./backend-url";

export async function searchMaps(payload: {
  query: string;
  user_lat?: number;
  user_lng?: number;
  drive_mode?: boolean;
}): Promise<MapSearchResult> {
  const res = await fetch(`${getBackendUrl()}/maps/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Map search failed (${res.status})`);
  return res.json();
}
