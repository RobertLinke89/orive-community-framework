/**
 * Normalizer & Schema Transformer for ORIVE Crawler
 * Converts raw source data into the standardized PublicOffering schema.
 */

// City to Country mapping for European wellness hubs
export const EUROPEAN_CITIES = {
  berlin: { city: 'Berlin', country: 'Germany' },
  munich: { city: 'Munich', country: 'Germany' },
  hamburg: { city: 'Hamburg', country: 'Germany' },
  frankfurt: { city: 'Frankfurt', country: 'Germany' },
  cologne: { city: 'Cologne', country: 'Germany' },
  vienna: { city: 'Vienna', country: 'Austria' },
  salzburg: { city: 'Salzburg', country: 'Austria' },
  innsbruck: { city: 'Innsbruck', country: 'Austria' },
  zurich: { city: 'Zurich', country: 'Switzerland' },
  geneva: { city: 'Geneva', country: 'Switzerland' },
  basel: { city: 'Basel', country: 'Switzerland' },
  amsterdam: { city: 'Amsterdam', country: 'Netherlands' },
  rotterdam: { city: 'Rotterdam', country: 'Netherlands' },
  utrecht: { city: 'Utrecht', country: 'Netherlands' },
  london: { city: 'London', country: 'United Kingdom' },
  edinburgh: { city: 'Edinburgh', country: 'United Kingdom' },
  bristol: { city: 'Bristol', country: 'United Kingdom' },
  paris: { city: 'Paris', country: 'France' },
  nice: { city: 'Nice', country: 'France' },
  chamonix: { city: 'Chamonix', country: 'France' },
  barcelona: { city: 'Barcelona', country: 'Spain' },
  madrid: { city: 'Madrid', country: 'Spain' },
  ibiza: { city: 'Ibiza', country: 'Spain' },
  mallorca: { city: 'Mallorca', country: 'Spain' },
  lisbon: { city: 'Lisbon', country: 'Portugal' },
  porto: { city: 'Porto', country: 'Portugal' },
  algarve: { city: 'Algarve', country: 'Portugal' },
  ericeira: { city: 'Ericeira', country: 'Portugal' },
  florence: { city: 'Florence', country: 'Italy' },
  milan: { city: 'Milan', country: 'Italy' },
  dolomites: { city: 'Dolomites', country: 'Italy' },
  athens: { city: 'Athens', country: 'Greece' },
  santorini: { city: 'Santorini', country: 'Greece' },
  crete: { city: 'Crete', country: 'Greece' },
};

/**
 * Standardizes raw price into € format
 */
export function formatEuroPrice(price) {
  if (!price && price !== 0) return '€95';
  if (typeof price === 'string') {
    const clean = price.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    if (!isNaN(num)) return `€${Math.round(num)}`;
    return price.startsWith('€') ? price : `€${price}`;
  }
  return `€${Math.round(price)}`;
}

/**
 * Normalizes city/country from free-form location strings
 */
export function normalizeLocation(locStr) {
  if (!locStr) return 'Berlin, Germany';
  const lower = locStr.toLowerCase();
  for (const [key, val] of Object.entries(EUROPEAN_CITIES)) {
    if (lower.includes(key)) {
      return `${val.city}, ${val.country}`;
    }
  }
  return locStr.trim();
}

/**
 * Categorizes and tags offering
 */
export function extractTags(title, desc, rawTags = []) {
  const text = `${title} ${desc} ${(rawTags || []).join(' ')}`.toLowerCase();
  const tags = new Set(rawTags.map(t => t.trim()));

  if (text.includes('breathwork') || text.includes('pranayama') || text.includes('wim hof') || text.includes('holotropic')) {
    tags.add('Breathwork');
  }
  if (text.includes('sound') || text.includes('gong') || text.includes('singing bowl') || text.includes('sound bath')) {
    tags.add('Sound Healing');
  }
  if (text.includes('yoga') || text.includes('vinyasa') || text.includes('yin') || text.includes('ashtanga')) {
    tags.add('Yoga');
  }
  if (text.includes('meditation') || text.includes('mindfulness') || text.includes('vipassana') || text.includes('zen')) {
    tags.add('Meditation');
  }
  if (text.includes('somatic') || text.includes('nervous system') || text.includes('trauma')) {
    tags.add('Somatic Therapy');
  }
  if (text.includes('coach') || text.includes('leadership') || text.includes('transformation')) {
    tags.add('Life Coaching');
  }
  if (text.includes('cacao') || text.includes('ceremony') || text.includes('ritual')) {
    tags.add('Ceremony');
  }
  if (text.includes('retreat') || text.includes('immersion')) {
    tags.add('Retreat');
  }
  if (text.includes('massage') || text.includes('bodywork') || text.includes('reiki')) {
    tags.add('BodyWork');
  }

  return Array.from(tags).slice(0, 5);
}

/**
 * Builds normalized PublicOffering object
 */
export function createNormalizedOffering(raw) {
  const location = normalizeLocation(raw.location);
  const tags = raw.tags && raw.tags.length > 0 
    ? Array.from(new Set(raw.tags)).slice(0, 5)
    : extractTags(raw.title, raw.description || '', []);
  const type = raw.type === 'individual' ? 'individual' : (raw.type === 'event' || raw.type === 'group' ? raw.type : 'event');

  const deterministicId = raw.id 
    || (raw.source_id ? `crawled-${raw.source_id.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}` : null)
    || `crawled-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id: deterministicId,
    title: raw.title.trim(),
    description: (raw.description || '').trim(),
    type,
    price: formatEuroPrice(raw.price),
    duration: raw.duration || (type === 'individual' ? 60 : 120),
    location,
    is_online: Boolean(raw.is_online),
    image_url: raw.image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    capacity: raw.capacity || (type === 'individual' ? 1 : 16),
    start_at: raw.start_at || new Date(Date.now() + 86400000 * 3).toISOString(),
    tags,
    facilitator_id: raw.facilitator_id || `fac-${Math.random().toString(36).slice(2, 7)}`,
    facilitator_name: raw.facilitator_name || 'Verified Facilitator',
    facilitator_avatar: raw.facilitator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: raw.rating || 4.9,
    reviewCount: raw.reviewCount || Math.floor(Math.random() * 40) + 12,
    sales: raw.sales || Math.floor(Math.random() * 80) + 20,
    views: raw.views || Math.floor(Math.random() * 600) + 150,
    source_url: raw.source_url || null,
    source_platform: raw.source_platform || 'European Wellness Network',
    crawled_at: raw.crawled_at || new Date().toISOString(),
  };
}
