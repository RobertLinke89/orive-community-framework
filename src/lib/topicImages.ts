// Curated, self-hosted topic images for offer cards that have no own photo.
// Assignment: keyword topic from title/description/category, then a deterministic
// hash of the offer id. When a list is known (homepage feed), neighbour de-duplication
// avoids the same file on adjacent / same-row cards and prefers no repeats in the first 30.
import manifest from "@/data/topicImages.json";

export const TOPIC_IDS = [
  "ice", "breathwork", "yoga", "sound", "meditation", "bodywork",
  "coaching", "mindfulness", "spiritual", "sauna", "kambo", "retreat", "dance", "wellness",
] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

export type TopicImage = {
  id: string;
  topic: TopicId;
  src: string;          // default 960w webp
  srcSet: string;       // 640/960/1280
  sizes?: Record<string, string>;
  photographer: string;
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  isTopicImage: true;
};

type ManifestEntry = {
  id: string;
  topic: string;
  files: Record<string, string>;
  src: string;
  photographer?: string;
  source?: string;
  source_url?: string;
  license?: string;
  license_url?: string;
};

type Manifest = { license_note?: string; topics: Record<string, ManifestEntry[]> };

const DATA = manifest as Manifest;

const TOPIC_TESTS: { id: TopicId; test: RegExp }[] = [
  { id: "ice", test: /\b(eisbaden|eisbad|eistauchen|eisschwimmen|ice\s*bath|icebath|ice-bath|ice\s*immers|cold\s*plunge|cold\s*expos|kaltwasser|kältetrain|kaeltetrain|kältetherapie|kaeltetherapie|kaltbad|winterschwimm|wim\s*hof|wimhof|cryo|ijsbad|bain de glace|ledena)\b/i },
  { id: "sauna", test: /\b(sauna|aufguss|schwitzhütte|schwitzhuette|sweat lodge|dampfbad|hammam|banya|banja|infrarot|infrared sauna)\b/i },
  { id: "sound", test: /\b(klangheilung|klangbad|klangschale|klangmassage|klangreise|klangtherapie|\bklang\b|sound healing|soundhealing|sound bath|soundbath|singing bowl|gongbad|gong bath|\bgong\b|crystal bowl|bain sonore)\b/i },
  { id: "yoga", test: /\b(yoga|vinyasa|ashtanga|hatha|yin yoga|kundalini|asana|yogini|yogalehrer|joga)\b/i },
  { id: "breathwork", test: /\b(breathwork|breath work|atemarbeit|atemtherapie|atemreise|atemkurs|pranayama|holotrop|rebirthing|conscious breath|transformational breath)\b/i },
  { id: "meditation", test: /\b(meditation|meditieren|meditatie|vipassana|zazen|\bzen\b|silent retreat|stille)\b/i },
  { id: "bodywork", test: /\b(körperarbeit|koerperarbeit|bodywork|body work|massage|shiatsu|thai massage|osteopathie|craniosacral|kraniosakral|rolfing|faszien|fascia|feldenkrais|lomi|tuina|reflexzonen|abhyanga)\b/i },
  { id: "coaching", test: /\b(coaching|coach|mentoring|life coach|personal coach|business coach)\b/i },
  { id: "mindfulness", test: /\b(mindfulness|achtsamkeit|mbsr|achtsam|shinrin|waldbaden|forest bath)\b/i },
  { id: "kambo", test: /\b(kambo|kambô|sapo|frog medicine|froschgift)\b/i },
  { id: "dance", test: /\b(tanz|dance|ecstatic|biodanza|5 rhythms|five rhythms|bewegungspraxis|trance dance)\b/i },
  { id: "spiritual", test: /\b(spiritual|zeremonie|ceremony|ritual|schaman|shaman|cacao|kakao|chakra|reiki|energieheil|altar|sacred)\b/i },
  { id: "retreat", test: /\b(retreat|auszeit|immersion|tagesretreat|wochenendretreat)\b/i },
];

export function isTopicImageSrc(url: string | null | undefined): boolean {
  return String(url || "").startsWith("/topic-images/");
}

export function detectTopic(text: string): TopicId {
  const t = String(text || "");
  for (const row of TOPIC_TESTS) {
    if (row.test.test(t)) return row.id;
  }
  return "wellness";
}

function pool(topic: TopicId): ManifestEntry[] {
  const own = DATA.topics?.[topic] || [];
  if (own.length) return own;
  return DATA.topics?.wellness || [];
}

function hash(s: string): number {
  let x = 2166136261;
  for (let i = 0; i < s.length; i++) {
    x ^= s.charCodeAt(i);
    x = Math.imul(x, 16777619);
  }
  return x >>> 0;
}

function toImage(entry: ManifestEntry, topic: TopicId): TopicImage {
  const files = entry.files || {};
  const src = entry.src || (files["960"] ? `/topic-images/${files["960"]}` : `/topic-images/${topic}/${entry.id}-960.webp`);
  const parts: string[] = [];
  for (const w of ["640", "960", "1280"]) {
    const rel = files[w];
    if (rel) parts.push(`/topic-images/${rel} ${w}w`);
  }
  return {
    id: entry.id,
    topic,
    src,
    srcSet: parts.join(", "),
    sizes: Object.fromEntries(Object.entries(files).map(([w, rel]) => [w, `/topic-images/${rel}`])),
    photographer: entry.photographer || "",
    source: entry.source || "",
    sourceUrl: entry.source_url || "",
    license: entry.license || "",
    licenseUrl: entry.license_url || "",
    isTopicImage: true,
  };
}

export function topicImageFor(id: string, text: string): TopicImage | null {
  const topic = detectTopic(text);
  const items = pool(topic);
  if (!items.length) return null;
  const entry = items[hash(String(id || text)) % items.length];
  return toImage(entry, topic);
}

/** Assign topic images to a list of offers, avoiding neighbours and early repeats. */
export function assignTopicImages<T extends { id: string; text: string }>(
  items: T[],
  neighbourWindow = 6,
  noRepeatFirst = 30,
): TopicImage[] {
  const usedEarly = new Set<string>();
  const recent: string[] = [];
  const out: TopicImage[] = [];
  for (const item of items) {
    const topic = detectTopic(item.text);
    const itemsPool = pool(topic);
    if (!itemsPool.length) {
      const fallback = topicImageFor(item.id, item.text);
      if (fallback) out.push(fallback);
      continue;
    }
    const start = hash(String(item.id || item.text)) % itemsPool.length;
    let picked: ManifestEntry | null = null;
    for (let step = 0; step < itemsPool.length; step++) {
      const cand = itemsPool[(start + step) % itemsPool.length];
      const inRecent = recent.includes(cand.id);
      const earlyRepeat = out.length < noRepeatFirst && usedEarly.has(cand.id);
      if (inRecent || earlyRepeat) continue;
      picked = cand;
      break;
    }
    if (!picked) picked = itemsPool[start];
    const img = toImage(picked, topic);
    out.push(img);
    usedEarly.add(picked.id);
    recent.push(picked.id);
    if (recent.length > neighbourWindow) recent.shift();
  }
  return out;
}

export function topicCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of TOPIC_IDS) out[id] = (DATA.topics?.[id] || []).length;
  return out;
}
