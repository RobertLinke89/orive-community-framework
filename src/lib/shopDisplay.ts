import type { ShopifyProduct } from "@/lib/shopify";

export const SHOP_CATEGORIES = [
  { value: "all", labelEn: "All", labelDe: "Alle" },
  { value: "yoga", labelEn: "Yoga", labelDe: "Yoga" },
  { value: "breathwork", labelEn: "Breathwork", labelDe: "Atemarbeit" },
  { value: "cold", labelEn: "Cold", labelDe: "Kälte" },
  { value: "sound", labelEn: "Sound", labelDe: "Klang" },
  { value: "meditation", labelEn: "Meditation", labelDe: "Meditation" },
  { value: "bodywork", labelEn: "Bodywork", labelDe: "Körperarbeit" },
  { value: "nutrition", labelEn: "Nutrition", labelDe: "Ernährung" },
  { value: "books", labelEn: "Books", labelDe: "Bücher" },
] as const;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  books: ["book-", "book:", "paperback"],
  nutrition: ["cacao", "matcha", "adaptogen", "herbal-tea", "tea collection", "collagen", "lions-mane", "reishi"],
  breathwork: ["breathwork", "pranayama", "mouth-tape", "mouth tape", "nose-breathing", "neti", "breath-trainer", "pulse-oximeter"],
  cold: ["ice-bath", "ice bath", "ice-barrel", "ice barrel", "cold-plunge", "cold plunge", "recovery-robe", "recovery-socks", "thermometer", "ice-bath-gloves", "recovery-beanie"],
  sound: ["singing-bowl", "singing bowl", "crystal", "tibetan", "tuning-fork", "koshi", "frame-drum", "tingsha", "rainstick"],
  bodywork: ["foam-roller", "massage", "acupressure", "gua-sha", "grounding", "fascia", "inversion"],
  meditation: ["meditation", "mala", "eye-pillow", "palo-santo", "zafu", "zabuton", "zen-garden", "seiza", "incense-burner"],
  yoga: ["yoga", "bolster", "yoga-strap", "yoga-mat", "yoga-block", "yoga-wheel", "yoga-towel", "yoga-blanket", "yoga-wedge"],
};

export function shopCategoryOf(product: ShopifyProduct): string {
  const hay = `${product.node.handle} ${product.node.title}`.toLowerCase();
  for (const [id, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => hay.includes(kw))) return id;
  }
  return "";
}

export function productMatchesCategory(product: ShopifyProduct, category: string) {
  if (category === "all") return true;
  return shopCategoryOf(product) === category;
}

export function formatShopPrice(amount: string, currency: string, locale = "de-DE") {
  const value = Number.parseFloat(amount);
  if (!Number.isFinite(value)) return "";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "EUR",
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function shopCategoryCounts(products: ShopifyProduct[]) {
  const counts: Record<string, number> = { all: products.length };
  for (const product of products) {
    const id = shopCategoryOf(product);
    if (!id) continue;
    counts[id] = (counts[id] || 0) + 1;
  }
  return counts;
}

export function pickRelatedProducts(all: ShopifyProduct[], current: ShopifyProduct, limit = 4) {
  const category = shopCategoryOf(current);
  const rest = all.filter((item) => item.node.id !== current.node.id);
  const same = category ? rest.filter((item) => shopCategoryOf(item) === category) : [];
  const other = rest.filter((item) => shopCategoryOf(item) !== category);
  return [...same, ...other].slice(0, limit);
}

export function shopCategoryLabel(id: string, isDe: boolean) {
  const match = SHOP_CATEGORIES.find((item) => item.value === id);
  if (!match) return "";
  return isDe ? match.labelDe : match.labelEn;
}

export const SHOP_HEROES: Record<
  string,
  {
    image: string;
    titleDe: string;
    titleEn: string;
    accentDe: string;
    accentEn: string;
    subDe: string;
    subEn: string;
    objectPosition: string;
  }
> = {
  all: {
    image: "/shop/hero-all.jpg?v=life9",
    titleDe: "Für die",
    titleEn: "For the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Matten, Schalen, Kakao und Bücher. Zahlung über Shopify.",
    subEn: "Mats, bowls, cacao and books. Paid on Shopify.",
    objectPosition: "50% 50%",
  },
  yoga: {
    image: "/shop/hero-yoga.jpg?v=life9",
    titleDe: "Yoga für die",
    titleEn: "Yoga for the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Matten, Räder, Gurte und Keile.",
    subEn: "Mats, wheels, straps and wedges.",
    objectPosition: "58% 50%",
  },
  breathwork: {
    image: "/shop/hero-breathwork.jpg?v=life9",
    titleDe: "Atem für die",
    titleEn: "Breath for the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Timer, Neti, Cue-Cards und Oximeter.",
    subEn: "Timers, neti, cue cards and oximeters.",
    objectPosition: "62% 50%",
  },
  cold: {
    image: "/shop/hero-cold.jpg?v=life11",
    titleDe: "Kälte für die",
    titleEn: "Cold for the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Fässer, Thermometer und Recovery.",
    subEn: "Barrels, thermometers and recovery.",
    objectPosition: "72% 50%",
  },
  sound: {
    image: "/shop/hero-sound.jpg?v=life9",
    titleDe: "Klang für die",
    titleEn: "Sound for the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Schalen, Gabeln, Chimes und Trommeln.",
    subEn: "Bowls, forks, chimes and drums.",
    objectPosition: "62% 50%",
  },
  meditation: {
    image: "/shop/hero-meditation.jpg?v=life9",
    titleDe: "Stille für die",
    titleEn: "Stillness for the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Kissen, Bänke, Mala und Räucherwerk.",
    subEn: "Cushions, benches, malas and incense.",
    objectPosition: "60% 50%",
  },
  bodywork: {
    image: "/shop/hero-bodywork.jpg?v=life9",
    titleDe: "Körper für die",
    titleEn: "Body for the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Rollen, Matten und Inversion.",
    subEn: "Rollers, mats and inversion.",
    objectPosition: "62% 50%",
  },
  nutrition: {
    image: "/shop/hero-nutrition.jpg?v=life9",
    titleDe: "Nahrung für die",
    titleEn: "Nourishment for the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Kakao, Matcha und Extrakte.",
    subEn: "Cacao, matcha and extracts.",
    objectPosition: "70% 50%",
  },
  books: {
    image: "/shop/hero-books.jpg?v=life9",
    titleDe: "Lesen für die",
    titleEn: "Reading for the",
    accentDe: "Praxis",
    accentEn: "practice",
    subDe: "Atem, Schlaf, Yoga und Achtsamkeit.",
    subEn: "Breath, sleep, yoga and mindfulness.",
    objectPosition: "55% 50%",
  },
};

export function shopHeroOf(category: string) {
  return SHOP_HEROES[category] || SHOP_HEROES.all;
}

export function productSearchHay(product: ShopifyProduct) {
  return `${product.node.title} ${product.node.description} ${product.node.handle}`.toLowerCase();
}

export function productMatchesQuery(product: ShopifyProduct, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return productSearchHay(product).includes(needle);
}

export function productPriceValue(product: ShopifyProduct) {
  return Number.parseFloat(product.node.priceRange.minVariantPrice.amount) || 0;
}

export function productInStock(product: ShopifyProduct) {
  return product.node.variants.edges[0]?.node.availableForSale !== false;
}

export const SHOP_PRICE_BUCKETS = [
  { value: "0-25", min: 0, max: 25, labelDe: "Unter 25 €", labelEn: "Under €25" },
  { value: "25-50", min: 25, max: 50, labelDe: "25–50 €", labelEn: "€25 to €50" },
  { value: "50-100", min: 50, max: 100, labelDe: "50–100 €", labelEn: "€50 to €100" },
  { value: "100+", min: 100, max: Infinity, labelDe: "100 € und mehr", labelEn: "€100 & above" },
] as const;

export const SHOP_MATERIALS = [
  { value: "cork", keywords: ["cork"], labelDe: "Kork", labelEn: "Cork" },
  { value: "cotton", keywords: ["cotton", "linen"], labelDe: "Baumwolle", labelEn: "Cotton" },
  { value: "wood", keywords: ["bamboo", "wooden", "wood"], labelDe: "Holz", labelEn: "Wood" },
  { value: "metal", keywords: ["brass", "stainless", "aluminium", "aluminum", "steel"], labelDe: "Metall", labelEn: "Metal" },
  { value: "crystal", keywords: ["crystal", "quartz"], labelDe: "Kristall", labelEn: "Crystal" },
  { value: "wool", keywords: ["merino", "wool"], labelDe: "Wolle", labelEn: "Wool" },
] as const;

export function productMatchesPriceBucket(product: ShopifyProduct, bucket: string) {
  if (!bucket) return true;
  const match = SHOP_PRICE_BUCKETS.find((item) => item.value === bucket);
  if (!match) return true;
  const price = productPriceValue(product);
  return price >= match.min && price < match.max;
}

export function productMaterialHay(product: ShopifyProduct) {
  return `${product.node.handle} ${product.node.title} ${product.node.description}`.toLowerCase();
}

export function productMatchesMaterials(product: ShopifyProduct, materials: string[]) {
  if (!materials.length) return true;
  const hay = productMaterialHay(product);
  return materials.some((id) => {
    const match = SHOP_MATERIALS.find((item) => item.value === id);
    return match ? match.keywords.some((kw) => hay.includes(kw)) : false;
  });
}

export function shopPriceBucketCounts(products: ShopifyProduct[]) {
  const counts: Record<string, number> = {};
  for (const bucket of SHOP_PRICE_BUCKETS) {
    counts[bucket.value] = products.filter((item) => productMatchesPriceBucket(item, bucket.value)).length;
  }
  return counts;
}

export function shopMaterialCounts(products: ShopifyProduct[]) {
  const counts: Record<string, number> = {};
  for (const material of SHOP_MATERIALS) {
    counts[material.value] = products.filter((item) => productMatchesMaterials(item, [material.value])).length;
  }
  return counts;
}

export function shopStockCount(products: ShopifyProduct[]) {
  return products.filter(productInStock).length;
}

export function extractShopAbout(description: string): string[] {
  const text = String(description || "").replace(/\s+/g, " ").trim();
  if (!text) return [];
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 18);
  return parts.slice(0, 6);
}

export function extractShopFacts(description: string): string[] {
  const text = String(description || "");
  const facts: string[] = [];
  const dims = text.match(
    /\d+(?:[.,]\d+)?\s*(?:cm|mm)\s*[×x]\s*\d+(?:[.,]\d+)?\s*(?:cm|mm)(?:\s*[×x]\s*\d+(?:[.,]\d+)?\s*(?:cm|mm))?/gi
  );
  if (dims) facts.push(...dims.slice(0, 2));
  const weight = text.match(/\b\d+(?:[.,]\d+)?\s*(?:g|kg|ml)\b/gi);
  if (weight) facts.push(weight[0]);
  const pack = text.match(/\b\d+\s*(?:pcs|St(?:ück)?)\b/gi);
  if (pack) facts.push(pack[0]);
  return [...new Set(facts.map((item) => item.replace(/\s+/g, " ").trim()))].slice(0, 4);
}
