/**
 * External retailer offers for shop products.
 * URLs are clean today; append affiliate params via withAffiliateParams() once programs are live.
 */

export type ShopExternalOffer = {
  retailer: string;
  retailerKey: "amazon" | "thomann" | "decathlon" | "manduka" | "brand" | "other";
  url: string;
  noteDe?: string;
  noteEn?: string;
};

function amazon(query: string): string {
  return `https://www.amazon.de/s?k=${encodeURIComponent(query)}`;
}

function amazonDp(asin: string): string {
  return `https://www.amazon.de/dp/${asin}`;
}

/** Optional associate tag — set NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG when ready. */
export function withAffiliateParams(url: string, retailerKey: string): string {
  try {
    const parsed = new URL(url);
    if (retailerKey === "amazon") {
      const tag =
        typeof process !== "undefined"
          ? process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG
          : undefined;
      if (tag && !parsed.searchParams.has("tag")) {
        parsed.searchParams.set("tag", tag);
      }
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export const shopExternalOffers: Record<string, ShopExternalOffer[]> = {
  "premium-yoga-mat": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Kork Yoga Matte Naturkautschuk 183cm") },
    { retailer: "Manduka", retailerKey: "manduka", url: "https://eu.manduka.com/collections/yoga-mats" },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/browse/c0-sportarten/c1-yoga-pilates/c2-yogamatten/_/N-1d8xq7n" },
  ],
  "yoga-block-set": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Bambus Yoga Block Set 2 Stück") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=yoga%20block" },
  ],
  "yoga-strap-organic": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Yoga Gurt Bio Baumwolle D-Ring 250cm") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=yoga%20gurt" },
  ],
  "meditation-cushion-zafu": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Zafu Meditationskissen Buchweizen") },
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Meditation cushion buckwheat zafu"), noteDe: "EN-Suche", noteEn: "EN search" },
  ],
  "yoga-bolster-round": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Yoga Bolster rund Baumwolle") },
    { retailer: "Manduka", retailerKey: "manduka", url: "https://eu.manduka.com/collections/yoga-bolsters-blankets" },
  ],
  "breathwork-journal": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Breathwork Journal Tagebuch") },
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("breathwork practice journal") },
  ],
  "nose-breathing-tape": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Mouth Tape Sleep Strips nasal breathing") },
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Mundtape Schlafen Atem") },
  ],
  "pranayama-timer": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Meditation Timer Holz Glocke") },
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Mindfulness bell timer wood") },
  ],
  "portable-ice-bath": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Portable Ice Bath Tub foldable insulated") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=eisbad%20wanne" },
  ],
  "cold-plunge-thermometer": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Digitales Wasserthermometer wasserdicht") },
  ],
  "recovery-robe": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Changing Robe Surf Quick Dry Hooded") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=changing%20robe" },
  ],
  "crystal-singing-bowl": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Kristall Klangschale Quarz 432Hz 25cm") },
    { retailer: "Thomann", retailerKey: "thomann", url: "https://www.thomann.de/de/search_dir.html?sw=crystal+singing+bowl" },
  ],
  "tibetan-singing-bowl": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Tibetische Klangschale handgeschlagen Nepal 15cm") },
    { retailer: "Thomann", retailerKey: "thomann", url: "https://www.thomann.de/de/search_dir.html?sw=klangschale+tibet" },
  ],
  "tuning-fork-set": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Stimmgabel Set Therapie 128 256 512 Hz") },
    { retailer: "Thomann", retailerKey: "thomann", url: "https://www.thomann.de/de/search_dir.html?sw=stimmgabel" },
  ],
  "mala-beads-108": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Sandalholz Mala 108 Perlen") },
  ],
  "meditation-eye-pillow": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Augenkissen Lavendel Seide Meditation") },
  ],
  "incense-set-palo-santo": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Palo Santo und weißer Salbei Set") },
  ],
  "singing-bowl-mini-travel": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Mini Klangschale Reise 8cm") },
    { retailer: "Thomann", retailerKey: "thomann", url: "https://www.thomann.de/de/search_dir.html?sw=mini+klangschale" },
  ],
  "foam-roller-textured": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Faszienrolle strukturiert 45cm") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=faszienrolle" },
  ],
  "massage-ball-set": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Massageball Set Lacrosse Triggerpunkt") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=massageball" },
  ],
  "acupressure-mat": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Akupressurmatte Set mit Kissen") },
  ],
  "gua-sha-rose-quartz": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Gua Sha Rosenquarz Gesicht") },
  ],
  "ceremonial-cacao-paste": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Zeremonieller Kakao Paste Criollo 500g") },
    {
      retailer: "Forever Cacao",
      retailerKey: "brand",
      url: "https://www.forevercacao.co.uk/",
      noteDe: "Spezialist für Ritualkakao",
      noteEn: "Ceremonial cacao specialist",
    },
  ],
  "matcha-ceremonial-grade": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Matcha zeremonielle Qualität Uji 30g") },
    {
      retailer: "Matcha Karu",
      retailerKey: "brand",
      url: "https://www.matcha-karu.com/",
      noteDe: "Japanischer Matcha-Händler",
      noteEn: "Japanese matcha specialist",
    },
  ],
  "adaptogen-blend": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Adaptogen Pulver Ashwagandha Reishi Lions Mane") },
  ],
  "herbal-tea-collection": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Kräutertee Set Bio Lose Tee Wellness") },
  ],
  "book-body-keeps-score": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazonDp("0143127748"), noteDe: "The Body Keeps the Score", noteEn: "Paperback" },
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("The Body Keeps the Score van der Kolk") },
  ],
  "book-breath-james-nestor": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazonDp("0241289114"), noteDe: "Breath – James Nestor", noteEn: "Paperback" },
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Breath James Nestor") },
  ],
  "book-wim-hof-method": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazonDp("1846046295"), noteDe: "The Wim Hof Method", noteEn: "Paperback" },
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Wim Hof Method Buch") },
  ],
  "book-yoga-sutras": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Yoga Sutras of Patanjali Satchidananda") },
  ],
  "cork-yoga-wheel": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Yoga Wheel Kork Dharma Wheel") },
  ],
  "yoga-towel-organic": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Yoga Handtuch rutschfest Hot Yoga") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=yoga%20handtuch" },
  ],
  "yoga-blanket-cotton": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Mexican Yoga Blanket Baumwolle") },
  ],
  "yoga-wedge-cork": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Yoga Keil Kork Handgelenk") },
  ],
  "neti-pot-stainless": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Neti Pot Edelstahl Nasenspülung") },
  ],
  "breath-trainer-resist": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Atemtrainer Widerstand Lungentrainer") },
  ],
  "breathwork-cards": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Breathwork cards deck breathing exercises") },
  ],
  "pulse-oximeter": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Pulsoximeter Finger OLED") },
  ],
  "ice-barrel-home": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Ice Barrel Cold Plunge upright") },
    {
      retailer: "Ice Barrel",
      retailerKey: "brand",
      url: "https://icebarrel.com/",
      noteDe: "Hersteller",
      noteEn: "Brand site",
    },
  ],
  "merino-recovery-socks": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Merino Recovery Socks Mid Calf") },
  ],
  "ice-bath-gloves": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Neopren Handschuhe Eisbaden 3mm") },
  ],
  "wool-recovery-beanie": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Merino Beanie Mütze") },
  ],
  "koshi-chime-terra": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Koshi Chime Terra") },
    { retailer: "Thomann", retailerKey: "thomann", url: "https://www.thomann.de/de/search_dir.html?sw=koshi+chime" },
  ],
  "frame-drum-30": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Rahmentrommel 30cm Ziegenfell") },
    { retailer: "Thomann", retailerKey: "thomann", url: "https://www.thomann.de/de/search_dir.html?sw=rahmentrommel+30" },
  ],
  "tingsha-cymbals": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Tingsha Zimbeln Tibet 7cm") },
    { retailer: "Thomann", retailerKey: "thomann", url: "https://www.thomann.de/de/search_dir.html?sw=tingsha" },
  ],
  "rainstick-wood": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Regenmacher Holz 60cm") },
    { retailer: "Thomann", retailerKey: "thomann", url: "https://www.thomann.de/de/search_dir.html?sw=regenmacher" },
  ],
  "zen-garden-mini": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Mini Zen Garten Sand Rechen") },
  ],
  "seiza-meditation-bench": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Seiza Bank Meditation klappbar Holz") },
  ],
  "brass-incense-burner": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Räuchergefäß Messing mit Deckel") },
  ],
  "zabuton-floor-cushion": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Zabuton Meditationsmatte Baumwolle") },
  ],
  "grounding-desk-mat": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Earthing Grounding Desk Mat") },
  ],
  "fascia-massage-stick": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Faszien Stick Massage Roller") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=faszien%20stick" },
  ],
  "inversion-table": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Inversion Table Schwerkrafttrainer") },
    { retailer: "Decathlon", retailerKey: "decathlon", url: "https://www.decathlon.de/search?Ntt=inversionsbank" },
  ],
  "marine-collagen-300": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Marine Collagen Pulver 300g") },
  ],
  "lions-mane-powder": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Lion's Mane Powder Hericium 100g") },
  ],
  "reishi-extract": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Reishi Extrakt Pulver") },
  ],
  "book-why-we-sleep": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazonDp("0141983760"), noteDe: "Why We Sleep – Matthew Walker", noteEn: "Paperback" },
  ],
  "book-light-on-yoga": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Light on Yoga Iyengar") },
  ],
  "book-heart-of-yoga": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("The Heart of Yoga Desikachar") },
  ],
  "book-wherever-you-go": [
    { retailer: "Amazon", retailerKey: "amazon", url: amazon("Wherever You Go There You Are Kabat-Zinn") },
  ],
};

export function offersForHandle(handle: string): ShopExternalOffer[] {
  return shopExternalOffers[handle] || [];
}

export function primaryOffer(handle: string): ShopExternalOffer | null {
  return offersForHandle(handle)[0] || null;
}
