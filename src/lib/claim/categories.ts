export type CategoryKey =
  | "ice" | "sauna" | "breath" | "yoga" | "meditation" | "mindfulness"
  | "bodywork" | "sound" | "spiritual" | "coaching" | "kambo" | "personal";

export type OfferTemplate = {
  title: string;
  description: string;
  durationMinutes: number;
  format: "in_person" | "online" | "hybrid";
  priceAmount: number | null; // placeholder, always shown as "Beispiel" until confirmed
};

export type Category = {
  key: CategoryKey;
  label: string;
  accent: string;
  accent2: string;
  icon: string; // key in ICONS (thin-line, stroke 1.25, from the mockups)
  celebration: string; // theme name used by Celebration
  offers: [OfferTemplate, OfferTemplate, OfferTemplate];
};

const o = (title: string, description: string, durationMinutes: number, priceAmount: number | null, format: OfferTemplate["format"] = "in_person"): OfferTemplate =>
  ({ title, description, durationMinutes, format, priceAmount });

export const CATEGORIES: Record<CategoryKey, Category> = {
  ice: { key: "ice", label: "Ice Bathing", accent: "#3fb8ff", accent2: "#9be3ff", icon: "snow", celebration: "frost",
    offers: [o("First Plunge", "Geführter Einstieg ins Eisbad", 45, 25), o("Cold Club", "4 Eisbäder im Monat", 60, 80), o("10er-Karte", "Beliebiges Eisbad", 45, 220)] },
  sauna: { key: "sauna", label: "Sauna & Heat", accent: "#ff8a1f", accent2: "#ffc56b", icon: "flame", celebration: "steam",
    offers: [o("Sauna Session", "60 Min. inkl. Abkühlung", 60, 22), o("Aufguss-Abend", "3 geführte Runden", 120, 35), o("Private Sauna", "Bis 6 Personen", 120, 120)] },
  breath: { key: "breath", label: "Breathwork", accent: "#2fbf8f", accent2: "#9be7c9", icon: "wind", celebration: "wind",
    offers: [o("Breathwork Session", "Gruppe, 75 Min.", 75, 25), o("1:1 Breath Journey", "Einzelsession", 60, 80, "hybrid"), o("Online Breath Class", "Live per Video", 45, 15, "online")] },
  yoga: { key: "yoga", label: "Yoga", accent: "#e2537a", accent2: "#ffb3c6", icon: "sun", celebration: "lotus",
    offers: [o("Drop-in Class", "Offene Klasse, alle Level", 75, 18), o("Private Yoga", "1:1, individuell", 60, 70), o("Beginner Course", "6 Wochen Einsteigerkurs", 90, 120)] },
  meditation: { key: "meditation", label: "Meditation", accent: "#6c63ff", accent2: "#b9b4ff", icon: "moon", celebration: "light",
    offers: [o("Guided Meditation", "Gruppe, 45 Min.", 45, 12), o("1:1 Meditation Coaching", "Einzelbegleitung", 60, 60, "hybrid"), o("Online Sit", "Live per Video", 30, 8, "online")] },
  mindfulness: { key: "mindfulness", label: "Mindfulness", accent: "#16a3a3", accent2: "#8ee0d6", icon: "feather", celebration: "leaves",
    offers: [o("MBSR-Kurs (8 Wochen)", "Achtsamkeitskurs", 150, 350), o("Achtsamkeits-Abend", "Drop-in, 90 Min.", 90, 15), o("1:1 Achtsamkeit", "Einzelsession", 60, 65, "hybrid")] },
  bodywork: { key: "bodywork", label: "BodyWork", accent: "#c46a3a", accent2: "#f0b48c", icon: "hand", celebration: "flow",
    offers: [o("Bodywork Treatment", "60 Min. Behandlung", 60, 75), o("Deep Release", "90 Min. Behandlung", 90, 105), o("Intro Session", "30 Min. Kennenlernen", 30, 35)] },
  sound: { key: "sound", label: "Sound Healing", accent: "#a14fd6", accent2: "#e0b0ff", icon: "music", celebration: "ripples",
    offers: [o("Sound Bath", "Gruppe, 75 Min.", 75, 22), o("Private Sound Journey", "1:1, 60 Min.", 60, 70), o("Full Moon Sound Bath", "Monatlich, 90 Min.", 90, 28)] },
  spiritual: { key: "spiritual", label: "Spiritual Growth", accent: "#d4a017", accent2: "#f5d77a", icon: "sparkle", celebration: "stars",
    offers: [o("Circle", "Drop-in, 2 Std.", 120, 15), o("Wochenend-Retreat", "Inkl. Verpflegung", 2880, 390), o("1:1 Begleitung", "60 Min.", 60, 60, "hybrid")] },
  coaching: { key: "coaching", label: "Life Coaching", accent: "#2563eb", accent2: "#93c5fd", icon: "target", celebration: "path",
    offers: [o("Kostenloses Kennenlernen", "15 Min. Video-Call", 15, 0, "online"), o("Coaching Session", "60 Min.", 60, 90, "hybrid"), o("Paket: 6 Sessions", "6 × 60 Min.", 60, 480, "hybrid")] },
  kambo: { key: "kambo", label: "Kambo", accent: "#5f7f3a", accent2: "#b8cf8f", icon: "leaf", celebration: "forest",
    offers: [o("Info-Gespräch", "30 Min., kostenlos, vor jeder Buchung", 30, 0, "online"), o("Zeremonie", "Kleine Gruppe, halber Tag", 240, 120), o("Integrationskreis", "Nachgespräch, 2 Std.", 120, 20)] },
  // Personal Coaching: independent personal trainers / sport & health coaches with recognised qualifications.
  personal: { key: "personal", label: "Personal Coaching", accent: "#65a30d", accent2: "#bef264", icon: "activity", celebration: "pulse",
    offers: [o("Probetraining & Anamnese", "Kennenlernen, Ziele, Bewegungscheck", 60, 70), o("Personal Training 1:1", "60 Min. individuell", 60, 100), o("10er-Block", "10 × 60 Min.", 60, 900)] },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

/** Crawler labels (public.facilitators.categories) -> template key. */
const CRAWLER_MAP: Record<string, CategoryKey> = {
  "ice bathing": "ice", "ice bath": "ice", "cold exposure": "ice",
  sauna: "sauna", "sauna & heat": "sauna",
  breathwork: "breath",
  yoga: "yoga",
  meditation: "meditation",
  mindfulness: "mindfulness",
  bodywork: "bodywork", massage: "bodywork",
  "sound healing": "sound", "sound bath": "sound",
  "spiritual growth": "spiritual", reiki: "spiritual",
  "life coaching": "coaching", coaching: "coaching",
  kambo: "kambo",
  "personal coaching": "personal", "personal training": "personal", "personal trainer": "personal",
};

export function categoryFromCrawler(categories: string[] | null | undefined, kamboFlag?: boolean | null): CategoryKey {
  for (const c of categories || []) {
    const k = CRAWLER_MAP[String(c).trim().toLowerCase()];
    if (k) return k;
  }
  if (kamboFlag) return "kambo";
  return "mindfulness";
}

export function presetOffers(key: CategoryKey): OfferTemplate[] {
  return CATEGORIES[key].offers.map((x) => ({ ...x }));
}
