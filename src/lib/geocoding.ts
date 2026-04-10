// Geocoding via Nominatim (OpenStreetMap) — gratuit, pas de clé API

export interface GeoResult {
  lat: number
  lng: number
  displayName: string
}

export async function geocodeAddress(query: string): Promise<GeoResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Maroc')}&limit=1`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SitePilot/1.0' },
  })

  if (!res.ok) return null

  const data = await res.json()
  if (!data.length) return null

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  }
}
