import fsaData from '../data/ontario_fsa.json';

interface GeocodingResult {
  lat: number;
  lon: number;
}

const fsaLookup = fsaData as unknown as Record<string, [number, number]>;

export function geocodePostalCode(postalCode: string): GeocodingResult | null {
  const code = postalCode.replace(/\s/g, '').toUpperCase();
  const fsa = code.slice(0, 3);

  const coords = fsaLookup[fsa];
  if (!coords) return null;

  return { lat: coords[0], lon: coords[1] };
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;
    if (addr) {
      const city = addr.city || addr.town || addr.village || addr.hamlet || addr.municipality || '';
      const province = addr.state || '';
      return [city, province].filter(Boolean).join(', ');
    }
    return data.display_name?.split(',').slice(0, 2).join(',').trim() || '';
  } catch {
    return '';
  }
}
