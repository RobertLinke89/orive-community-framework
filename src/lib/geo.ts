export type GeoPoint = { lat: number; lng: number; city?: string; country?: string };

const CITY_COORDS: Record<string, GeoPoint> = {
  berlin: { lat: 52.52, lng: 13.405, city: 'Berlin', country: 'DE' },
  munich: { lat: 48.137, lng: 11.576, city: 'Munich', country: 'DE' },
  münchen: { lat: 48.137, lng: 11.576, city: 'Munich', country: 'DE' },
  hamburg: { lat: 53.551, lng: 9.993, city: 'Hamburg', country: 'DE' },
  cologne: { lat: 50.938, lng: 6.96, city: 'Cologne', country: 'DE' },
  köln: { lat: 50.938, lng: 6.96, city: 'Cologne', country: 'DE' },
  frankfurt: { lat: 50.11, lng: 8.682, city: 'Frankfurt', country: 'DE' },
  stuttgart: { lat: 48.775, lng: 9.177, city: 'Stuttgart', country: 'DE' },
  düsseldorf: { lat: 51.227, lng: 6.773, city: 'Düsseldorf', country: 'DE' },
  potsdam: { lat: 52.391, lng: 13.064, city: 'Potsdam', country: 'DE' },
  leipzig: { lat: 51.339, lng: 12.373, city: 'Leipzig', country: 'DE' },
  dortmund: { lat: 51.514, lng: 7.465, city: 'Dortmund', country: 'DE' },
  'bad krozingen': { lat: 47.92, lng: 7.702, city: 'Bad Krozingen', country: 'DE' },
  heppenheim: { lat: 49.641, lng: 8.637, city: 'Heppenheim', country: 'DE' },
  schlangenbad: { lat: 50.093, lng: 8.103, city: 'Schlangenbad', country: 'DE' },
  wülfrath: { lat: 51.282, lng: 7.038, city: 'Wülfrath', country: 'DE' },
  wulfrath: { lat: 51.282, lng: 7.038, city: 'Wülfrath', country: 'DE' },
  ruhpolding: { lat: 47.765, lng: 12.647, city: 'Ruhpolding', country: 'DE' },
  'sankt blasien': { lat: 47.763, lng: 8.128, city: 'Sankt Blasien', country: 'DE' },
  'st. blasien': { lat: 47.763, lng: 8.128, city: 'Sankt Blasien', country: 'DE' },
  dresden: { lat: 51.05, lng: 13.738, city: 'Dresden', country: 'DE' },
  nuremberg: { lat: 49.452, lng: 11.077, city: 'Nuremberg', country: 'DE' },
  nürnberg: { lat: 49.452, lng: 11.077, city: 'Nuremberg', country: 'DE' },
  hannover: { lat: 52.375, lng: 9.732, city: 'Hannover', country: 'DE' },
  bremen: { lat: 53.079, lng: 8.801, city: 'Bremen', country: 'DE' },
  rosenheim: { lat: 47.856, lng: 12.129, city: 'Rosenheim', country: 'DE' },
  konstanz: { lat: 47.66, lng: 9.175, city: 'Konstanz', country: 'DE' },
  wolnzach: { lat: 48.606, lng: 11.627, city: 'Wolnzach', country: 'DE' },
  vienna: { lat: 48.208, lng: 16.373, city: 'Vienna', country: 'AT' },
  wien: { lat: 48.208, lng: 16.373, city: 'Vienna', country: 'AT' },
  graz: { lat: 47.07, lng: 15.439, city: 'Graz', country: 'AT' },
  salzburg: { lat: 47.809, lng: 13.055, city: 'Salzburg', country: 'AT' },
  zurich: { lat: 47.376, lng: 8.541, city: 'Zurich', country: 'CH' },
  zürich: { lat: 47.376, lng: 8.541, city: 'Zurich', country: 'CH' },
  gais: { lat: 47.361, lng: 9.451, city: 'Gais', country: 'CH' },
  'kappel am albis': { lat: 47.229, lng: 8.529, city: 'Kappel am Albis', country: 'CH' },
  millstatt: { lat: 46.804, lng: 13.571, city: 'Millstatt', country: 'AT' },
  obermillstatt: { lat: 46.804, lng: 13.571, city: 'Millstatt', country: 'AT' },
  'zell am moos': { lat: 47.9, lng: 13.32, city: 'Zell am Moos', country: 'AT' },
  basel: { lat: 47.56, lng: 7.589, city: 'Basel', country: 'CH' },
  geneva: { lat: 46.204, lng: 6.143, city: 'Geneva', country: 'CH' },
  genf: { lat: 46.204, lng: 6.143, city: 'Geneva', country: 'CH' },
  bern: { lat: 46.948, lng: 7.447, city: 'Bern', country: 'CH' },
  amsterdam: { lat: 52.367, lng: 4.904, city: 'Amsterdam', country: 'NL' },
  rotterdam: { lat: 51.922, lng: 4.479, city: 'Rotterdam', country: 'NL' },
  utrecht: { lat: 52.09, lng: 5.122, city: 'Utrecht', country: 'NL' },
  'den haag': { lat: 52.07, lng: 4.3, city: 'The Hague', country: 'NL' },
  hague: { lat: 52.07, lng: 4.3, city: 'The Hague', country: 'NL' },
  hilversum: { lat: 52.223, lng: 5.176, city: 'Hilversum', country: 'NL' },
  london: { lat: 51.507, lng: -0.128, city: 'London', country: 'GB' },
  paris: { lat: 48.857, lng: 2.352, city: 'Paris', country: 'FR' },
  barcelona: { lat: 41.387, lng: 2.168, city: 'Barcelona', country: 'ES' },
  madrid: { lat: 40.417, lng: -3.704, city: 'Madrid', country: 'ES' },
  mallorca: { lat: 39.57, lng: 2.65, city: 'Mallorca', country: 'ES' },
  ibiza: { lat: 38.907, lng: 1.42, city: 'Ibiza', country: 'ES' },
  lisbon: { lat: 38.722, lng: -9.139, city: 'Lisbon', country: 'PT' },
  lisboa: { lat: 38.722, lng: -9.139, city: 'Lisbon', country: 'PT' },
  rome: { lat: 41.903, lng: 12.496, city: 'Rome', country: 'IT' },
  rom: { lat: 41.903, lng: 12.496, city: 'Rome', country: 'IT' },
  milan: { lat: 45.464, lng: 9.19, city: 'Milan', country: 'IT' },
  mailand: { lat: 45.464, lng: 9.19, city: 'Milan', country: 'IT' },
  copenhagen: { lat: 55.676, lng: 12.568, city: 'Copenhagen', country: 'DK' },
  brussels: { lat: 50.85, lng: 4.351, city: 'Brussels', country: 'BE' },
  brüssel: { lat: 50.85, lng: 4.351, city: 'Brussels', country: 'BE' },
  prague: { lat: 50.075, lng: 14.438, city: 'Prague', country: 'CZ' },
  prag: { lat: 50.075, lng: 14.438, city: 'Prague', country: 'CZ' },
  stockholm: { lat: 59.33, lng: 18.068, city: 'Stockholm', country: 'SE' },
  dublin: { lat: 53.35, lng: -6.26, city: 'Dublin', country: 'IE' },
  warsaw: { lat: 52.23, lng: 21.012, city: 'Warsaw', country: 'PL' },
  warschau: { lat: 52.23, lng: 21.012, city: 'Warsaw', country: 'PL' },
  budapest: { lat: 47.498, lng: 19.04, city: 'Budapest', country: 'HU' },
  athens: { lat: 37.984, lng: 23.728, city: 'Athens', country: 'GR' },
  athen: { lat: 37.984, lng: 23.728, city: 'Athens', country: 'GR' },
  oslo: { lat: 59.913, lng: 10.752, city: 'Oslo', country: 'NO' },
  helsinki: { lat: 60.17, lng: 24.938, city: 'Helsinki', country: 'FI' },
  edinburgh: { lat: 55.953, lng: -3.189, city: 'Edinburgh', country: 'GB' },
};

const COUNTRY_COORDS: Record<string, GeoPoint> = {
  DE: { lat: 51.165, lng: 10.451, country: 'DE' },
  AT: { lat: 47.516, lng: 14.55, country: 'AT' },
  CH: { lat: 46.818, lng: 8.227, country: 'CH' },
  NL: { lat: 52.132, lng: 5.291, country: 'NL' },
  GB: { lat: 54.0, lng: -2.0, country: 'GB' },
  FR: { lat: 46.227, lng: 2.213, country: 'FR' },
  ES: { lat: 40.463, lng: -3.749, country: 'ES' },
  PT: { lat: 39.4, lng: -8.224, country: 'PT' },
  IT: { lat: 41.871, lng: 12.567, country: 'IT' },
  DK: { lat: 56.264, lng: 9.502, country: 'DK' },
  BE: { lat: 50.504, lng: 4.47, country: 'BE' },
  CZ: { lat: 49.817, lng: 15.473, country: 'CZ' },
};

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function coordsForLocation(location: string | null | undefined): GeoPoint | null {
  if (!location?.trim()) return null;
  const raw = fold(location);
  let best: { key: string; point: GeoPoint } | null = null;
  for (const [key, point] of Object.entries(CITY_COORDS)) {
    if (raw.includes(fold(key)) && (!best || key.length > best.key.length)) {
      best = { key, point };
    }
  }
  if (best) return best.point;
  const countryMatch = raw.match(/\b(germany|deutschland|austria|osterreich|switzerland|schweiz|netherlands|niederlande|united kingdom|uk|france|spanien|spain|portugal|italy|italien)\b/);
  const countryMap: Record<string, string> = {
    germany: 'DE',
    deutschland: 'DE',
    austria: 'AT',
    osterreich: 'AT',
    switzerland: 'CH',
    schweiz: 'CH',
    netherlands: 'NL',
    niederlande: 'NL',
    'united kingdom': 'GB',
    uk: 'GB',
    france: 'FR',
    spanien: 'ES',
    spain: 'ES',
    portugal: 'PT',
    italy: 'IT',
    italien: 'IT',
  };
  if (countryMatch) {
    const code = countryMap[countryMatch[1]];
    return COUNTRY_COORDS[code] || null;
  }
  return null;
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function normalizeIp(ip: string): string {
  return ip.replace(/^::ffff:/i, '');
}

function isPrivateIp(ip: string): boolean {
  const value = normalizeIp(ip);
  return (
    ip === '::1' ||
    value === '::1' ||
    value.startsWith('127.') ||
    value.startsWith('10.') ||
    value.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value)
  );
}

function decodeHeader(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function requestClientIp(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const real = req.headers.get('x-real-ip')?.trim();
  const ip = forwarded || real || null;
  if (!ip || isPrivateIp(ip)) return null;
  return ip;
}

export function viewerFromHeaders(req: Request): GeoPoint | null {
  const latRaw = req.headers.get('x-vercel-ip-latitude') || req.headers.get('cf-iplatitude');
  const lngRaw = req.headers.get('x-vercel-ip-longitude') || req.headers.get('cf-iplongitude');
  const lat = latRaw == null || latRaw === '' ? NaN : Number(latRaw);
  const lng = lngRaw == null || lngRaw === '' ? NaN : Number(lngRaw);
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return {
      lat,
      lng,
      city: decodeHeader(req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity')),
      country: req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || undefined,
    };
  }
  const city = decodeHeader(req.headers.get('x-vercel-ip-city') || req.headers.get('cf-ipcity'));
  if (city) return coordsForLocation(city);
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
  if (country && COUNTRY_COORDS[country.toUpperCase()]) return COUNTRY_COORDS[country.toUpperCase()];
  return null;
}

const ipCache = new Map<string, { point: GeoPoint | null; exp: number }>();

export async function lookupIpGeo(ip: string | null): Promise<GeoPoint | null> {
  const key = `geo:${ip || 'auto'}`;
  const cached = ipCache.get(key);
  if (cached && cached.exp > Date.now()) return cached.point;
  try {
    const url = ip ? `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,lat,lon,city,countryCode` : 'http://ip-api.com/json/?fields=status,lat,lon,city,countryCode';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const point =
      data?.status === 'success' && Number.isFinite(data.lat) && Number.isFinite(data.lon)
        ? { lat: Number(data.lat), lng: Number(data.lon), city: data.city, country: data.countryCode }
        : null;
    ipCache.set(key, { point, exp: Date.now() + (point ? 60 * 60 * 1000 : 20 * 1000) });
    return point;
  } catch {
    return null;
  }
}

export async function resolveViewer(req: Request): Promise<GeoPoint | null> {
  return viewerFromHeaders(req) || lookupIpGeo(requestClientIp(req));
}
