const cache = new Map<string, string>();

type NominatimResponse = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    borough?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

function pickTitle(r: NominatimResponse): string | null {
  const a = r.address;
  const locality =
    a?.city || a?.town || a?.village || a?.borough || a?.suburb || a?.county;
  if (locality) return locality;
  if (r.display_name) return r.display_name.split(",").slice(0, 2).join(",").trim();
  return null;
}

export async function reverseGeocodeTitle(lat: number, lon: number) {
  const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  // OpenStreetMap Nominatim (no key). Best effort only.
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    String(lat),
  )}&lon=${encodeURIComponent(String(lon))}&zoom=14&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      // Nominatim requires a valid UA
      "user-agent": "kids-diary/1.0 (reverse geocoding)",
      "accept-language": "ko,en;q=0.8",
    },
    // avoid caching issues across serverless
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = (await res.json()) as NominatimResponse;
  const title = pickTitle(json);
  if (!title) return null;

  cache.set(key, title);
  return title;
}

