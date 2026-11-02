/**
 * Image URL Utilities
 * 
 * Handles normalization of image URLs, especially for migrated data
 * that may contain old Supabase project URLs.
 */

// Known old Supabase project URLs that should be handled
const OLD_SUPABASE_HOSTS = [
  'ibplqqfnpouwpvhsrbio.supabase.co',
];

// Current Supabase project URL
const CURRENT_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

/**
 * Default fallback images for different contexts
 */
export const DEFAULT_IMAGES = {
  avatar: '/lovable-uploads/d62fdca3-dd6f-4a37-a819-2f603388f4d5.png',
  banner: '/hero-breathwork.webp',
  offering: '/sessions/breathwork-hero.jpg',
  facilitator: '/facilitators/facilitator-1.jpg',
} as const;

/**
 * Check if a URL points to an old/migrated Supabase project
 */
export function isOldSupabaseUrl(url: string): boolean {
  if (!url) return false;
  return OLD_SUPABASE_HOSTS.some(host => url.includes(host));
}

/**
 * Check if a URL is valid and accessible
 * Note: This is a sync check - for async validation use validateImageUrl
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Check for common invalid patterns
  if (url.startsWith('data:') && url.length < 100) return false; // Empty or malformed data URL
  
  // Check for old Supabase URLs
  if (isOldSupabaseUrl(url)) return false;
  
  return true;
}

/**
 * Get a safe image URL with fallback support
 * 
 * @param url - The original image URL
 * @param fallbackType - Type of fallback to use
 * @returns A valid image URL (original or fallback)
 */
export function getSafeImageUrl(
  url: string | null | undefined,
  fallbackType: keyof typeof DEFAULT_IMAGES = 'avatar'
): string {
  // If no URL provided, return fallback
  if (!url) return DEFAULT_IMAGES[fallbackType];
  
  // If URL is from old Supabase project, use fallback
  if (isOldSupabaseUrl(url)) {
    console.warn(`[imageUrl] Old Supabase URL detected, using fallback: ${url.substring(0, 50)}...`);
    return DEFAULT_IMAGES[fallbackType];
  }
  
  return url;
}

/**
 * Normalize avatar URL with proper fallback
 */
export function getAvatarUrl(url: string | null | undefined): string {
  return getSafeImageUrl(url, 'avatar');
}

/**
 * Normalize banner URL with proper fallback
 */
export function getBannerUrl(url: string | null | undefined): string {
  return getSafeImageUrl(url, 'banner');
}

/**
 * Normalize offering image URL with proper fallback
 */
export function getOfferingImageUrl(url: string | null | undefined): string {
  return getSafeImageUrl(url, 'offering');
}

const TOPIC_POOLS: { test: RegExp; images: string[] }[] = [
  { test: /cacao|kakao/, images: ['/experiences/cacao-ceremony.jpg', '/experiences/tea-ceremony.jpg', '/experiences/moon-ceremony.jpg'] },
  { test: /fire ceremony|feuerzeremonie|sacred fire/, images: ['/experiences/fire-ceremony.jpg', '/experiences/earth-ceremony.jpg'] },
  { test: /sweat lodge|vision quest|schaman/, images: ['/experiences/sweat-lodge.jpg', '/experiences/vision-quest.jpg', '/experiences/shamanic-drumming.jpg', '/experiences/drum-journey.jpg'] },
  { test: /wim hof|ice bath|eisbad|cold plunge|kälte|cryo|ice immersion/, images: ['/experiences/cold-plunge.jpg', '/experiences/wim-hof-workshop.jpg', '/experiences/breathwork-icebath.jpg', '/experiences/wild-swimming.jpg', '/sessions/cliff-jump.jpg'] },
  { test: /gong|sound bath|sound healing|klang|singing bowl|crystal bowl/, images: ['/experiences/sound-bath.jpg', '/experiences/gong-meditation.jpg', '/experiences/vibrational-retreat.jpg', '/sessions/sound-healing.jpg'] },
  { test: /holotropic|pranayama|breathwork|atemarbeit|conscious breath/, images: ['/experiences/holotropic-breathwork.jpg', '/experiences/breathwork-retreat.jpg', '/experiences/breathing-circle.jpg', '/sessions/breathwork-hero.jpg'] },
  { test: /yoga nidra|nidra/, images: ['/experiences/yoga-nidra.jpg', '/experiences/yin-yoga.jpg', '/experiences/forgiveness-meditation.jpg'] },
  { test: /yin yoga/, images: ['/experiences/yin-yoga.jpg', '/experiences/yoga-nidra.jpg', '/experiences/yoga-meditation.jpg'] },
  { test: /kundalini/, images: ['/experiences/kundalini-yoga.jpg', '/experiences/tantric-yoga.jpg', '/experiences/chakra-balancing.jpg'] },
  { test: /acro.?yoga/, images: ['/experiences/acroyoga.jpg', '/experiences/vinyasa-class.jpg'] },
  { test: /qi.?gong|qigong|taichi/, images: ['/experiences/qi-gong.jpg', '/experiences/sunrise-yoga.jpg'] },
  { test: /vinyasa|ashtanga|hatha|yoga/, images: ['/experiences/yoga-retreat.jpg', '/experiences/sunrise-yoga.jpg', '/experiences/vinyasa-class.jpg', '/experiences/yoga-meditation.jpg', '/sessions/private-yoga.jpg'] },
  { test: /silent|vipassana|zazen|stille/, images: ['/experiences/silent-retreat.jpg', '/experiences/walking-meditation.jpg', '/experiences/buddhist-workshop.jpg'] },
  { test: /forest|shinrin|waldbaden|nature immersion/, images: ['/experiences/forest-bathing.jpg', '/experiences/nature-connection.jpg', '/experiences/walking-meditation.jpg'] },
  { test: /meditation|mindfulness|achtsamkeit|präsenz/, images: ['/sessions/meditation-session.jpg', '/experiences/meditation-group.jpg', '/experiences/forgiveness-meditation.jpg', '/experiences/self-awareness.jpg', '/sessions/cave-gathering.jpg'] },
  { test: /ecstatic dance|trance dance|biodanza/, images: ['/experiences/ecstatic-dance.jpg', '/experiences/trance-dance.jpg', '/experiences/biodance.jpg'] },
  { test: /somatic|fascia|myofascial|körperarbeit|bodywork|massage/, images: ['/experiences/somatic-movement.jpg', '/experiences/myofascial-release.jpg', '/experiences/bodywork-intensive.jpg', '/sessions/massage-therapy.jpg', '/experiences/self-massage.jpg'] },
  { test: /dance|bewegung|primal movement/, images: ['/experiences/ecstatic-dance.jpg', '/experiences/movement-expression.jpg', '/experiences/primal-movement.jpg', '/experiences/functional-movement.jpg'] },
  { test: /trauma|shadow|ancestral/, images: ['/experiences/trauma-retreat.jpg', '/sessions/trauma-therapy.jpg', '/experiences/shadow-work.jpg', '/experiences/ancestral-healing.jpg'] },
  { test: /reiki|chakra|energy healing|kristall/, images: ['/sessions/energy-healing.jpg', '/experiences/reiki-circle.jpg', '/experiences/chakra-balancing.jpg', '/experiences/crystal-healing.jpg'] },
  { test: /nervous system|nervensystem|polyvagal|stress/, images: ['/experiences/nervous-system.jpg', '/sessions/stress-release.jpg', '/experiences/emotion-release.jpg'] },
  { test: /women|womb|her space|schwester|weiblich/, images: ['/experiences/womens-circle.jpg', '/experiences/women-leadership.jpg', '/experiences/moon-ceremony.jpg'] },
  { test: /männer|brotherhood|masculine|rewild/, images: ['/experiences/mens-circle.jpg', '/sessions/rewild-men.jpg'] },
  { test: /singing circle|stimme|voice liberation|gesang/, images: ['/experiences/singing-circle.jpg', '/experiences/voice-liberation.jpg'] },
  { test: /leadership|executive|career|purpose|unternehmer/, images: ['/experiences/conscious-leadership.jpg', '/experiences/leadership-workshop.jpg', '/experiences/purpose-leadership.jpg', '/sessions/leadership-coaching.jpg', '/experiences/executive-retreat.jpg'] },
  { test: /coach|mentor|therapie|therapy/, images: ['/sessions/life-coaching.jpg', '/sessions/mentor-journey.jpg', '/sessions/spiritual-guidance.jpg', '/sessions/transformation-program.jpg'] },
  { test: /ayurveda|nutrition|ernährung|kochen/, images: ['/experiences/ayurveda-workshop.jpg', '/experiences/nutrition-workshop.jpg', '/sessions/nutrition-consultation.jpg', '/experiences/mindful-eating.jpg'] },
  { test: /retreat|auszeit|immersion|weekend/, images: ['/experiences/holistic-retreat.jpg', '/experiences/healing-arts-retreat.jpg', '/experiences/wellness-weekend.jpg', '/experiences/yoga-retreat.jpg', '/experiences/digital-detox.jpg'] },
  { test: /ceremony|zeremonie|ritual/, images: ['/experiences/moon-ceremony.jpg', '/experiences/earth-ceremony.jpg', '/experiences/seasonal-celebration.jpg', '/experiences/tea-ceremony.jpg'] },
  { test: /healing|kreis|circle/, images: ['/experiences/healing-circle.jpg', '/experiences/grief-circle.jpg', '/experiences/relationship-healing.jpg'] },
];

const TYPE_POOLS: Record<string, string[]> = {
  individual: ['/sessions/holistic-health.jpg', '/sessions/life-coaching.jpg', '/sessions/spiritual-guidance.jpg', '/sessions/mentor-journey.jpg'],
  group: ['/experiences/healing-circle.jpg', '/experiences/meditation-group.jpg', '/experiences/breathing-circle.jpg'],
  event: ['/experiences/wellness-weekend.jpg', '/experiences/holistic-retreat.jpg', '/experiences/nature-connection.jpg'],
};

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickFrom(pool: string[], seed: string): string {
  return pool[hashSeed(seed) % pool.length];
}

function keywordText(
  tags: string[] | string | null | undefined,
  title: string | null | undefined,
  type: string | null | undefined
): string {
  const tagList = Array.isArray(tags)
    ? tags.map(String).filter(Boolean)
    : typeof tags === 'string'
      ? tags.split(/[,|/]/).map((tag) => tag.trim()).filter(Boolean)
      : [];
  return `${tagList.join(' ')} ${title || ''} ${type || ''}`.toLowerCase();
}

/**
 * Get a contextual image URL based on tags, title, and type.
 */
export function getTopicImageUrl(
  tags: string[] | string | null | undefined,
  title: string | null | undefined,
  type: string | null | undefined
): string {
  const keywordStr = keywordText(tags, title, type);
  const seed = `${title || ''}|${keywordStr}`;

  for (const pool of TOPIC_POOLS) {
    if (pool.test.test(keywordStr)) {
      return pickFrom(pool.images, seed);
    }
  }

  if (type && TYPE_POOLS[type]) return pickFrom(TYPE_POOLS[type], seed);
  return pickFrom([
    '/experiences/holistic-retreat.jpg',
    '/experiences/forest-bathing.jpg',
    '/experiences/wellness-weekend.jpg',
    DEFAULT_IMAGES.offering,
  ], seed);
}

const REJECTED_STOCK = [
  'photo-1517849845537-4d257902454a',
  'photo-1506126613408-eca07ce68773',
  'photo-1534528742522',
];

function isLocalCuratedImage(url: string): boolean {
  return url.startsWith('/experiences/') || url.startsWith('/sessions/');
}

function isTrustedUpload(url: string): boolean {
  if (!CURRENT_SUPABASE_URL) return false;
  try {
    return url.includes(new URL(CURRENT_SUPABASE_URL).host);
  } catch {
    return false;
  }
}

function isPartnerOfferingImage(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('evbuc.com') ||
    lower.includes('eventbrite') ||
    lower.includes('images.unsplash.com') ||
    lower.includes('wimhofmethod.com')
  );
}

export function isRealOfferingImage(url: string | null | undefined): boolean {
  const lower = String(url || '').toLowerCase();
  if (!lower) return false;
  if (lower.startsWith('/experiences/') || lower.startsWith('/sessions/') || lower.startsWith('/facilitators/')) return false;
  if (lower.includes('unsplash.com') || lower.includes('placeholder')) return false;
  return lower.includes('evbuc.com') || lower.includes('eventbrite') || lower.includes('wimhofmethod.com');
}

export function isListableOfferingImage(url: string | null | undefined): boolean {
  const value = String(url || '');
  if (!value) return false;
  if (isRealOfferingImage(value)) return true;
  if (isTrustedUpload(value)) return true;
  return false;
}

const EXTRA_TOPIC_POOLS: { test: RegExp; images: string[] }[] = [
  { test: /cacao|kakao|tea ceremony|teezeremonie/, images: ['/products/cacao-paste-use.jpg', '/products/palo-santo-use.jpg', '/shop/hero-meditation.jpg'] },
  { test: /fire ceremony|feuerzeremonie|sacred fire/, images: ['/products/palo-santo-use.jpg', '/shop/hero-all.jpg'] },
  { test: /gong|sound bath|sound healing|klang|singing bowl|crystal bowl/, images: ['/shop/hero-sound.jpg', '/products/crystal-singing-bowl-use.jpg', '/products/tibetan-singing-bowl-use.jpg'] },
  { test: /wim hof|ice bath|eisbad|cold plunge|kälte|cryo|ice immersion/, images: ['/shop/hero-cold.jpg', '/products/icetubs-icebarrel-use.jpg', '/products/ice-gloves-use.jpg'] },
  { test: /holotropic|pranayama|breathwork|atemarbeit|conscious breath/, images: ['/shop/hero-breathwork.jpg', '/products/breath-trainer-use.jpg', '/products/breathwork-journal-use.jpg'] },
  { test: /yoga nidra|nidra|yin yoga|kundalini|acro.?yoga|vinyasa|ashtanga|hatha|yoga/, images: ['/shop/hero-yoga.jpg', '/products/yoga-mat-use.jpg', '/products/yoga-bolster-use.jpg'] },
  { test: /silent|vipassana|zazen|stille|meditation|mindfulness|achtsamkeit/, images: ['/shop/hero-meditation.jpg', '/products/meditation-cushion-use.jpg', '/products/zabuton-use.jpg'] },
  { test: /somatic|fascia|myofascial|körperarbeit|bodywork|massage/, images: ['/shop/hero-bodywork.jpg', '/products/acupressure-mat-use.jpg', '/products/foam-roller-use.jpg'] },
  { test: /ecstatic dance|trance dance|biodanza|dance|bewegung/, images: ['/shop/hero-all.jpg', '/shop/hero-yoga.jpg'] },
  { test: /reiki|chakra|energy healing|kristall/, images: ['/products/crystal-singing-bowl-use.jpg', '/shop/hero-meditation.jpg'] },
  { test: /women|womb|her space|schwester|männer|brotherhood/, images: ['/hero-woman-ancestor.webp', '/hero-man-elder.webp'] },
  { test: /ayurveda|nutrition|ernährung|kochen/, images: ['/shop/hero-nutrition.jpg', '/products/herbal-tea-use.jpg', '/products/matcha-use.jpg'] },
  { test: /retreat|auszeit|immersion|weekend|forest|ceremony|zeremonie|ritual|healing|kreis|circle/, images: ['/shop/hero-all.jpg', '/hero-woman-ancestor.webp', '/for-facilitators-hero.png'] },
  { test: /coach|mentor|therapie|therapy|leadership/, images: ['/for-facilitators-hero.png', '/shop/hero-books.jpg'] },
];

const EXTRA_TYPE_POOLS: Record<string, string[]> = {
  individual: ['/for-facilitators-hero.png', '/shop/hero-meditation.jpg'],
  group: ['/shop/hero-all.jpg', '/shop/hero-meditation.jpg'],
  event: ['/shop/hero-all.jpg', '/hero-woman-ancestor.webp'],
};

export function getOfferingExtraImages(
  tags: string[] | string | null | undefined,
  title: string | null | undefined,
  type: string | null | undefined,
  originalUrl?: string | null
): [string, string] {
  const keywordStr = keywordText(tags, title, type);
  const seed = `${title || ''}|${keywordStr}|extras`;
  let pool = EXTRA_TYPE_POOLS[type || ''] || EXTRA_TYPE_POOLS.event;
  for (const topic of EXTRA_TOPIC_POOLS) {
    if (topic.test.test(keywordStr) && topic.images.length >= 2) {
      pool = topic.images;
      break;
    }
  }
  const original = String(originalUrl || '');
  const unused = pool.filter((image) => image !== original);
  const first = pickFrom(unused.length ? unused : pool, seed);
  const rest = (unused.length ? unused : pool).filter((image) => image !== first);
  const second = pickFrom(rest.length ? rest : pool, `${seed}|b`);
  return [first, second];
}

export function offeringGalleryOf(item: {
  image_url?: string | null;
  image?: string | null;
  tags?: string[] | string | null;
  title?: string | null;
  type?: string | null;
}): string[] {
  const original = item.image_url || item.image || '';
  const hero = isListableOfferingImage(original)
    ? optimizeOfferingImage(original, 1600)
    : '';
  const extras = getOfferingExtraImages(item.tags, item.title, item.type, original);
  return [hero, extras[0], extras[1]].filter((url, index, list) => url && list.indexOf(url) === index);
}

function isUntrustedOfferingImage(url: string): boolean {
  const lower = url.toLowerCase();
  if (REJECTED_STOCK.some((id) => lower.includes(id))) return true;
  if (lower.includes('source.unsplash.com')) return true;
  if (lower.includes('/facilitators/')) return true;
  if (lower.includes('placeholder') || lower.includes('default-avatar')) return true;
  return false;
}

export function resolveOfferingImage(
  url: string | null | undefined,
  tags: string[] | string | null | undefined,
  title: string | null | undefined,
  type: string | null | undefined
): string {
  const topic = getTopicImageUrl(tags, title, type);
  if (!url || isOldSupabaseUrl(url) || isUntrustedOfferingImage(url)) return topic;
  if (isLocalCuratedImage(url) || isTrustedUpload(url) || isPartnerOfferingImage(url)) return url;
  return topic;
}

export function optimizeOfferingImage(url: string, width = 720): string {
  if (!url || url.startsWith('/') || url.startsWith('data:')) return url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    // Eventbrite CDN signs query params (`s=`). Mutating them 404s and forces a retry.
    if (host.includes('evbuc.com') || host.includes('eventbrite')) {
      if (parsed.searchParams.has('s')) return url;
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('auto', 'format,compress');
      parsed.searchParams.set('q', '65');
      return parsed.toString();
    }
    if (host.includes('images.unsplash.com')) {
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('q', '65');
      return parsed.toString();
    }
  } catch {
    return url;
  }
  return url;
}

/** Responsive srcset for partner / CDN offering images. Local / signed Eventbrite URLs return "". */
export function offeringImageSrcSet(url: string, widths: number[] = [320, 480, 720, 960]): string {
  if (!url || url.startsWith('/') || url.startsWith('data:')) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (host.includes('evbuc.com') || host.includes('eventbrite')) {
      // Signed Eventbrite URLs cannot be resized client-side.
      if (parsed.searchParams.has('s')) return '';
    } else if (!host.includes('images.unsplash.com')) {
      return '';
    }
  } catch {
    return '';
  }
  return widths
    .map((width) => `${optimizeOfferingImage(url, width)} ${width}w`)
    .join(', ');
}

export function offeringCardImageWidth(size: string): number {
  if (size === 'hero' || size === 'featured') return 720;
  if (size === 'wide') return 640;
  if (size === 'tall') return 400;
  return 360;
}


/**
 * Async validation of image URL (checks if actually loads)
 * Useful for pre-validating images before display
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  if (!url || isOldSupabaseUrl(url)) return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
}
