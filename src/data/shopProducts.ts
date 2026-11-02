import { ShopifyProduct } from "@/lib/shopify";

/**
 * 60 curated practice products as local fallbacks.
 * These render when Shopify is unreachable or has no catalogue.
 */
function galleryEdges(image: string, title: string) {
  const stem = image.replace(/\.(png|jpe?g|webp)$/i, "");
  return [image, `${stem}-detail.jpg`, `${stem}-use.jpg`].map((url) => ({
    node: { url: `${url}?v=gal1`, altText: title },
  }));
}

function p(
  id: string,
  handle: string,
  title: string,
  description: string,
  price: string,
  image: string,
  category: string
): ShopifyProduct {
  return {
    node: {
      id: `gid://fallback/Product/${id}`,
      title,
      description,
      handle,
      priceRange: { minVariantPrice: { amount: price, currencyCode: "EUR" } },
      images: { edges: galleryEdges(image, title) },
      variants: {
        edges: [
          {
            node: {
              id: `gid://fallback/ProductVariant/${id}`,
              title: "Default",
              price: { amount: price, currencyCode: "EUR" },
              availableForSale: true,
              selectedOptions: [{ name: "Title", value: "Default" }],
            },
          },
        ],
      },
      options: [{ name: "Title", values: ["Default"] }],
    },
  };
}

export const fallbackShopProducts: ShopifyProduct[] = [
  // ── Yoga & Movement ──
  p("1", "premium-yoga-mat", "Premium Cork Yoga Mat", "Eco-friendly cork surface with natural rubber base. Non-slip, antimicrobial, and beautifully crafted for daily practice. 183 cm × 66 cm × 5 mm.", "89.00", "/products/yoga-mat.png", "yoga"),
  p("2", "yoga-block-set", "Bamboo Yoga Block Set (2 pcs)", "Sustainably harvested bamboo blocks that provide solid support for all levels. Rounded edges for comfort. Ideal for deepening stretches and alignment.", "34.00", "/products/yoga-blocks.png", "yoga"),
  p("3", "yoga-strap-organic", "Organic Cotton Yoga Strap", "Hand-woven 250 cm strap with D-ring buckle. Helps achieve deeper poses safely. GOTS-certified organic cotton.", "18.00", "/products/yoga-strap.png", "yoga"),
  p("4", "meditation-cushion-zafu", "Zafu Meditation Cushion", "Traditional round buckwheat-filled cushion with removable organic cotton cover. 15 cm height for optimal spine alignment during seated meditation.", "49.00", "/products/meditation-cushion.png", "meditation"),
  p("5", "yoga-bolster-round", "Round Yoga Bolster", "Firm yet yielding support for restorative poses and Yin yoga. Organic cotton cover filled with recycled fibre. 65 cm × 25 cm.", "55.00", "/products/yoga-bolster.png", "yoga"),

  // ── Breathwork & Pranayama ──
  p("6", "breathwork-journal", "Breathwork Practice Journal", "Guided journal with 90 days of breath-tracking templates, reflection prompts, and technique guides. Lay-flat binding.", "24.00", "/products/breathwork-journal.png", "breathwork"),
  p("7", "nose-breathing-tape", "Mouth-Tape Sleep Strips (90 pcs)", "Medical-grade hypoallergenic strips to encourage nasal breathing during sleep. BPA-free adhesive. Promotes deeper, restorative rest.", "16.00", "/products/mouth-tape.jpg", "breathwork"),
  p("8", "pranayama-timer", "Pranayama Timer & Bell", "Minimalist wooden timer with soft chime intervals. Designed for box-breathing, Wim Hof, and coherent breathing sessions.", "42.00", "/products/pranayama-timer.jpg", "breathwork"),

  // ── Cold Exposure ──
  p("9", "portable-ice-bath", "Portable Ice Bath Tub", "Insulated, foldable cold-plunge tub for home use. Triple-layer thermal insulation keeps water cold for hours. Fits up to 190 cm.", "199.00", "/products/icetubs-icebath.png", "cold"),
  p("10", "cold-plunge-thermometer", "Digital Water Thermometer", "Instant-read waterproof thermometer for precise cold-plunge temperature monitoring. Large backlit display.", "19.00", "/products/thermometer.jpg", "cold"),
  p("11", "recovery-robe", "Quick-Dry Recovery Robe", "Ultra-absorbent microfibre robe for post-plunge warming. Hooded design with deep pockets. One size fits all.", "65.00", "/products/recovery-robe.jpg", "cold"),

  // ── Sound Healing ──
  p("12", "crystal-singing-bowl", "Frosted Crystal Singing Bowl – Note C", "432 Hz tuned quartz crystal bowl (25 cm) with padded mallet and O-ring. Root chakra, grounding tone.", "145.00", "/products/crystal-singing-bowl.jpg", "sound"),
  p("13", "tibetan-singing-bowl", "Hand-Hammered Tibetan Singing Bowl", "Artisan-crafted seven-metal alloy bowl from Nepal. 15 cm diameter, rich harmonic overtones. Includes cushion and striker.", "79.00", "/products/tibetan-singing-bowl.png", "sound"),
  p("14", "tuning-fork-set", "Biofield Tuning Fork Set (5 pcs)", "Medical-grade aluminium forks covering 128 Hz, 256 Hz, 512 Hz, 4096 Hz, and the weighted Otto fork. Velvet pouch included.", "89.00", "/products/tuning-forks.jpg", "sound"),

  // ── Meditation & Mindfulness ──
  p("15", "mala-beads-108", "Sandalwood Mala Beads – 108 Beads", "Hand-knotted genuine Indian sandalwood with tiger-eye guru bead. Natural calming scent. Perfect for Japa meditation.", "38.00", "/products/mala-beads.jpg", "meditation"),
  p("16", "meditation-eye-pillow", "Lavender Silk Eye Pillow", "Organic flaxseed and French lavender filled silk pillow. Gentle pressure soothes eyes during Savasana and meditation.", "22.00", "/products/eye-pillow.jpg", "meditation"),
  p("17", "incense-set-palo-santo", "Palo Santo & Sage Ritual Set", "Ethically sourced Palo Santo sticks (6 pcs) paired with white sage smudge bundle. Ceramic dish included.", "28.00", "/products/palo-santo.jpg", "ritual"),
  p("18", "singing-bowl-mini-travel", "Mini Travel Singing Bowl", "Pocket-sized 8 cm brass bowl with felt-wrapped striker. Carry your grounding practice anywhere.", "29.00", "/products/mini-singing-bowl.jpg", "meditation"),

  // ── Bodywork & Recovery ──
  p("19", "foam-roller-textured", "Textured Foam Roller – 45 cm", "High-density EVA foam with multi-zone surface patterns for targeted myofascial release. Helps reduce soreness after workouts.", "32.00", "/products/foam-roller.jpg", "bodywork"),
  p("20", "massage-ball-set", "Lacrosse Massage Ball Set (3 pcs)", "Three densities for trigger-point therapy: soft, medium, and firm. Ideal for glutes, shoulders, and feet.", "18.00", "/products/massage-balls.jpg", "bodywork"),
  p("21", "acupressure-mat", "Acupressure Mat & Pillow Set", "10,000+ acupressure points stimulate blood circulation and endorphin release. Organic linen cover, coconut fibre filling.", "45.00", "/products/acupressure-mat.jpg", "bodywork"),
  p("22", "gua-sha-rose-quartz", "Rose Quartz Gua Sha Stone", "Hand-carved Brazilian rose quartz facial tool. Smooths fascia, reduces puffiness, promotes lymphatic drainage.", "26.00", "/products/gua-sha.jpg", "bodywork"),

  // ── Nutrition & Herbs ──
  p("23", "ceremonial-cacao-paste", "Ceremonial Cacao Paste – 500 g", "100% pure Criollo cacao from Guatemala. Stone-ground and minimally processed. For heart-opening cacao ceremonies and daily elixirs.", "34.00", "/products/cacao-paste.jpg", "nutrition"),
  p("24", "matcha-ceremonial-grade", "Ceremonial Grade Matcha – 30 g", "First-harvest shade-grown matcha from Uji, Japan. Vibrant umami flavour, whisks to a smooth jade froth.", "29.00", "/products/matcha.jpg", "nutrition"),
  p("25", "adaptogen-blend", "Adaptogen Super Blend", "Ashwagandha, Reishi, Lion's Mane, and Rhodiola in a fine powder. 60 servings. Supports stress resilience and focus.", "38.00", "/products/adaptogen-blend.jpg", "nutrition"),
  p("26", "herbal-tea-collection", "Herbal Wellness Tea Collection", "Six artisan loose-leaf blends: Sleep, Focus, Calm, Digest, Vital, and Glow. Organic, hand-blended. 6 × 30 g tins.", "42.00", "/products/herbal-tea.jpg", "nutrition"),

  // ── Books & Education ──
  p("27", "book-body-keeps-score", "The Body Keeps the Score – Bessel van der Kolk", "Groundbreaking exploration of how trauma reshapes body and brain, and innovative treatments for recovery. Paperback edition.", "16.00", "/products/book-body-score.jpg", "books"),
  p("28", "book-breath-james-nestor", "Breath: The New Science – James Nestor", "The bestselling investigation into the lost art and science of breathing. A must-read for every breathwork practitioner.", "14.00", "/products/book-breath.jpg", "books"),
  p("29", "book-wim-hof-method", "The Wim Hof Method – Wim Hof", "Activate your full human potential through cold exposure, breathing exercises, and mindset. Illustrated guide.", "18.00", "/products/book-wim-hof.jpg", "books"),
  p("30", "book-yoga-sutras", "The Yoga Sutras of Patanjali – Translation & Commentary", "Sri Swami Satchidananda's definitive translation with practical commentary. The philosophical foundation of all yoga.", "15.00", "/products/book-yoga-sutras.jpg", "books"),

  p("31", "cork-yoga-wheel", "Cork Yoga Wheel", "Solid cork Dharma wheel for backbends and shoulder opening. 33 cm diameter × 13 cm width. Holds up to 150 kg.", "32.00", "/products/yoga-wheel.jpg", "yoga"),
  p("32", "yoga-towel-organic", "Organic Yoga Towel", "Non-slip microfibre towel for hot practice. Silicone dots on the underside. 183 cm × 61 cm.", "28.00", "/products/yoga-towel.jpg", "yoga"),
  p("33", "yoga-blanket-cotton", "Mexican Cotton Yoga Blanket", "Tightly woven cotton throw for restorative poses and savasana. 150 cm × 200 cm. Machine washable.", "42.00", "/products/yoga-blanket.jpg", "yoga"),
  p("34", "yoga-wedge-cork", "Cork Yoga Wedge", "Angled cork wedge for wrists, knees and seated folds. 30 cm × 15 cm × 7 cm.", "24.00", "/products/yoga-wedge.jpg", "yoga"),

  p("35", "neti-pot-stainless", "Stainless Neti Pot", "Food-grade stainless pot for nasal rinse. 250 ml. Includes measuring spoon.", "19.00", "/products/neti-pot.jpg", "breathwork"),
  p("36", "breath-trainer-resist", "Breath Resistance Trainer", "Adjustable inhale/exhale trainer for lung capacity work. Food-grade silicone mouthpiece.", "36.00", "/products/breath-trainer.jpg", "breathwork"),
  p("37", "breathwork-cards", "Breathwork Cue Cards (52 pcs)", "Pocket deck with box-breath, 4-7-8, coherent breathing and hold protocols. Recycled card stock.", "18.00", "/products/breathwork-cards.jpg", "breathwork"),
  p("38", "pulse-oximeter", "Finger Pulse Oximeter", "Clip-on SpO2 and pulse readout for timed holds. OLED display. Two AAA batteries included.", "22.00", "/products/pulse-oximeter.jpg", "breathwork"),

  p("39", "ice-barrel-home", "Home Ice Barrel", "Upright insulated barrel for seated cold plunges. 80 cm height. Drain plug at the base.", "249.00", "/products/icetubs-icebarrel.png", "cold"),
  p("40", "merino-recovery-socks", "Merino Recovery Socks", "Mid-calf merino pair for post-plunge warming. Size 38–45. 70% merino.", "21.00", "/products/recovery-socks.jpg", "cold"),
  p("41", "ice-bath-gloves", "Neoprene Ice Bath Gloves", "3 mm neoprene gloves with grip palms for long holds. One size.", "16.00", "/products/ice-gloves.jpg", "cold"),
  p("42", "wool-recovery-beanie", "Wool Recovery Beanie", "Unstructured merino beanie for after cold exposure. One size.", "24.00", "/products/recovery-beanie.jpg", "cold"),

  p("43", "koshi-chime-terra", "Koshi Chime – Terra", "Hand-tuned bamboo chime in the Terra scale. 35 cm. Includes hemp hanger.", "48.00", "/products/koshi-chime.jpg", "sound"),
  p("44", "frame-drum-30", "Frame Drum – 30 cm", "Goatskin hoop drum with hardwood rim. Includes felt mallet.", "55.00", "/products/frame-drum.jpg", "sound"),
  p("45", "tingsha-cymbals", "Tibetan Tingsha Cymbals", "Pair of 7 cm bronze cymbals on a leather strap. Clear high overtone.", "32.00", "/products/tingsha.jpg", "sound"),
  p("46", "rainstick-wood", "Wooden Rainstick – 60 cm", "Cactus rainstick with seed fill. Soft descending wash for openings and closings.", "29.00", "/products/rainstick.jpg", "sound"),

  p("47", "zen-garden-mini", "Mini Zen Garden", "Desktop sand garden with rake, four stones and a wooden tray. 22 cm diameter.", "26.00", "/products/zen-garden.png", "meditation"),
  p("48", "seiza-meditation-bench", "Seiza Meditation Bench", "Folding hardwood bench for kneeling sits. 20 cm seat height. Beech.", "58.00", "/products/meditation-bench.jpg", "meditation"),
  p("49", "brass-incense-burner", "Brass Incense Burner", "Lidded brass censer with sand cup. 8 cm diameter. For sticks and resin.", "22.00", "/products/incense-burner.jpg", "meditation"),
  p("50", "zabuton-floor-cushion", "Zabuton Floor Cushion", "Cotton floor mat for seated practice. 70 cm × 80 cm × 8 cm. Removable cover.", "62.00", "/products/zabuton.jpg", "meditation"),

  p("51", "grounding-desk-mat", "Grounding Desk Mat", "Conductive PU desk mat with 2 m earth cord. 30 cm × 20 cm.", "45.00", "/products/grounding-mat.png", "bodywork"),
  p("52", "fascia-massage-stick", "Fascia Massage Stick", "Textured rolling stick for calves and quads. 45 cm. Hardwood handles.", "27.00", "/products/fascia-stick.jpg", "bodywork"),
  p("53", "inversion-table", "Inversion Table", "Folding inversion bench with ankle lock and angle pin. Steel frame. User height 150–190 cm.", "189.00", "/products/inversion-table.png", "bodywork"),

  p("54", "marine-collagen-300", "Marine Collagen Powder – 300 g", "Unflavoured fish collagen peptides. 30 servings. Neutral taste in water or cacao.", "39.00", "/products/collagen.jpg", "nutrition"),
  p("55", "lions-mane-powder", "Lion's Mane Powder – 100 g", "Fruiting-body powder. Dual extract. 50 servings at 2 g.", "32.00", "/products/lions-mane.jpg", "nutrition"),
  p("56", "reishi-extract", "Reishi Extract – 60 g", "Hot-water extract of red reishi. 60 servings at 1 g.", "36.00", "/products/reishi.jpg", "nutrition"),

  p("57", "book-why-we-sleep", "Why We Sleep – Matthew Walker", "Paperback on sleep architecture, recovery and attention. English edition.", "15.00", "/products/book-why-we-sleep.jpg", "books"),
  p("58", "book-light-on-yoga", "Light on Yoga – B.K.S. Iyengar", "Paperback asana reference with plates and sequencing notes. English edition.", "22.00", "/products/book-light-on-yoga.jpg", "books"),
  p("59", "book-heart-of-yoga", "The Heart of Yoga – T.K.V. Desikachar", "Paperback on adapting practice to the person. Includes Yoga Sutra commentary.", "18.00", "/products/book-heart-of-yoga.jpg", "books"),
  p("60", "book-wherever-you-go", "Wherever You Go, There You Are – Jon Kabat-Zinn", "Paperback introduction to everyday mindfulness. English edition.", "14.00", "/products/book-wherever-you-go.jpg", "books"),
];

export function shopImagesOf(product: ShopifyProduct) {
  const seen = new Set<string>();
  const images: Array<{ url: string; altText: string | null }> = [];
  const add = (url: string, altText: string | null) => {
    const key = url.replace(/\?.*$/, "");
    if (!url || seen.has(key)) return;
    seen.add(key);
    images.push({ url, altText });
  };
  for (const edge of product.node.images.edges) add(edge.node.url, edge.node.altText);
  const local = fallbackShopProducts.find((item) => item.node.handle === product.node.handle);
  if (local) {
    for (const edge of local.node.images.edges) add(edge.node.url, edge.node.altText);
  }
  return images;
}
