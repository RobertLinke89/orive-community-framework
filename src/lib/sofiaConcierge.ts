import { catalogOfferings } from '@/data/catalogOfferings';
import type { PublicOffering } from '@/hooks/usePublicOfferings';
import { coordsForLocation } from '@/lib/geo';
import { isListableOfferingImage } from '@/lib/imageUrl';
import { extractMediaEmbed, type MediaEmbed } from '@/lib/mediaEmbed';
import { formatOfferingWhenLine, offeringSpan } from '@/lib/offeringSpan';
import { toPublicOffering } from '@/lib/orivePublic';
import { listInventory } from '@/lib/oriveStore';

export type ConciergeHit = {
  id: string;
  title: string;
  location: string | null;
  when: string;
  price: string | null;
  href: string;
  partner: boolean;
  image: string | null;
  facilitatorName: string | null;
  facilitatorAvatar: string | null;
  facilitatorHref: string | null;
  blurb: string | null;
  video: MediaEmbed | null;
};

export type ConciergeReply = {
  reply: string;
  language: 'de' | 'en';
  crisis: boolean;
  city: string | null;
  topic: string | null;
  offerings: ConciergeHit[];
};

const TOPIC_PATTERNS: { id: string; test: RegExp }[] = [
  { id: 'breathwork', test: /breathwork|atemarbeit|atemreise|pranayama|holotropic|conscious breath|wim hof/i },
  { id: 'sound', test: /sound|klang|gong|singing bowl|klangschale|sound bath/i },
  { id: 'yoga', test: /yoga|vinyasa|yin |kundalini|ashtanga|hatha/i },
  { id: 'meditation', test: /meditation|meditat|mindfulness|achtsamkeit|vipassana|silent retreat/i },
  { id: 'cold', test: /ice bath|eisbad|cold plunge|kälte|cryo|wim hof/i },
  { id: 'ceremony', test: /cacao|kakao|ceremony|zeremonie|ritual/i },
  { id: 'retreat', test: /retreat|auszeit|wochenende|weekend/i },
  { id: 'bodywork', test: /bodywork|körperarbeit|somatic|massage|fascia/i },
];

const CRISIS =
  /\b(suicid|suizid|kill myself|mich umbringen|nicht mehr leben|end my life|self[- ]?harm|selbstverletzung)\b/i;

function isGerman(text: string): boolean {
  return /[äöüß]|(\b(ich|und|oder|suche|bitte|diese|woche|in|für|nach|mit)\b)/i.test(text);
}

function detectTopic(text: string): string | null {
  for (const topic of TOPIC_PATTERNS) {
    if (topic.test.test(text)) return topic.id;
  }
  return null;
}

function offeringHref(item: PublicOffering): string {
  return item.type === 'individual' ? `/session/${item.id}` : `/experience/${item.id}`;
}

async function conciergePool(): Promise<PublicOffering[]> {
  const seen = new Set<string>();
  const orive = (await listInventory())
    .filter((item) => item.slots.some((slot) => slot.spots > 0 && new Date(slot.startAt).getTime() > Date.now()))
    .map((item) => toPublicOffering(item.offering, item.slots));
  const out: PublicOffering[] = [];
  for (const item of [...orive, ...catalogOfferings]) {
    if (!item.id || seen.has(item.id)) continue;
    if (!isListableOfferingImage(item.image_url) && !String(item.id).startsWith('orive-')) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function scoreOffering(item: PublicOffering, city: string | null, topic: string | null, query: string): number {
  const hay = `${item.title} ${item.location || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
  let score = 0;
  if (city && (item.location || '').toLowerCase().includes(city.toLowerCase())) score += 4;
  if (topic && hay.includes(topic)) score += 3;
  if (topic === 'breathwork' && /breath|atem/i.test(hay)) score += 2;
  if (topic === 'sound' && /sound|klang|gong/i.test(hay)) score += 2;
  const words = query.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
  for (const word of words) {
    if (hay.includes(word)) score += 0.4;
  }
  return score;
}

export async function answerConcierge(message: string, languageHint?: 'de' | 'en'): Promise<ConciergeReply> {
  const text = String(message || '').trim();
  const language = languageHint || (isGerman(text) ? 'de' : 'en');
  const de = language === 'de';

  if (CRISIS.test(text)) {
    return {
      reply: de
        ? 'Wenn du in akuter Not bist: Telefonseelsorge 0800 111 0 111 (DE, rund um die Uhr). In den USA 988. ORIVE ist kein Notfalldienst.'
        : 'If you are in immediate danger: call 988 (US) or your local emergency number. In Germany: Telefonseelsorge 0800 111 0 111. ORIVE is not an emergency service.',
      language,
      crisis: true,
      city: null,
      topic: null,
      offerings: [],
    };
  }

  if (!text) {
    return {
      reply: de
        ? 'Schreib Stadt und Thema — zum Beispiel „Breathwork Berlin diese Woche“.'
        : 'Write a city and a topic — for example “Breathwork Berlin this week”.',
      language,
      crisis: false,
      city: null,
      topic: null,
      offerings: [],
    };
  }

  const place = coordsForLocation(text);
  const city = place?.city || null;
  const topic = detectTopic(text);
  const pool = await conciergePool();
  const ranked = pool
    .map((item) => ({ item, score: scoreOffering(item, city, topic, text) }))
    .filter((row) => row.score >= (city || topic ? 2 : 1.2))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ item }) => {
      const blurb = item.description
        ? String(item.description).replace(/\s+/g, ' ').trim().slice(0, 160)
        : null;
      return {
        id: item.id,
        title: item.title,
        location: item.location,
        when: formatOfferingWhenLine(offeringSpan(item), de),
        price: item.price,
        href: offeringHref(item),
        partner: item.fulfillment !== 'orive' && Boolean(item.source_url),
        image: item.image_url || null,
        facilitatorName: item.facilitator_name || null,
        facilitatorAvatar: item.facilitator_avatar || null,
        facilitatorHref: item.facilitator_id ? `/facilitator/${item.facilitator_id}` : null,
        blurb: blurb ? `${blurb}${blurb.length >= 160 ? '…' : ''}` : null,
        video: extractMediaEmbed(item.description, item.source_url),
      };
    });

  if (!city && !topic) {
    return {
      reply: de
        ? 'Sag mir Stadt und Praxis — etwa Breathwork, Yoga oder Sound Healing. Dann suche ich passende Termine.'
        : 'Tell me a city and a practice — breathwork, yoga or sound healing. I will look up matching dates.',
      language,
      crisis: false,
      city: null,
      topic: null,
      offerings: [],
    };
  }

  if (ranked.length === 0) {
    return {
      reply: de
        ? `Keine passenden Termine${city ? ` in ${city}` : ''}${topic ? ` für ${topic}` : ''} in der aktuellen Liste. Formuliere es enger — oder schreib uns auf WhatsApp, wenn die Nummer hinterlegt ist.`
        : `No matching dates${city ? ` in ${city}` : ''}${topic ? ` for ${topic}` : ''} in the current list. Narrow the request — or write on WhatsApp if a number is configured.`,
      language,
      crisis: false,
      city,
      topic,
      offerings: [],
    };
  }

  const lines = ranked
    .map((hit, index) => `${index + 1}. ${hit.title}${hit.when ? ` — ${hit.when}` : ''}${hit.location ? ` · ${hit.location}` : ''}`)
    .join('\n');

  return {
    reply: de
      ? `Hier ${ranked.length === 1 ? 'ist ein Termin' : `sind ${ranked.length} Termine`}${city ? ` rund um ${city}` : ''}. Partnerlistings bucht ihr beim Veranstalter, nicht bei ORIVE.\n\n${lines}`
      : `Here ${ranked.length === 1 ? 'is a date' : `are ${ranked.length} dates`}${city ? ` around ${city}` : ''}. Partner listings are booked with the host, not ORIVE.\n\n${lines}`,
    language,
    crisis: false,
    city,
    topic,
    offerings: ranked,
  };
}
