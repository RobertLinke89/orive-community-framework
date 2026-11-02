import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CRAWLED_FILE = path.resolve(process.cwd(), 'src/data/crawledOfferings.json');
const CLAIMED_FILE = path.resolve(process.cwd(), 'src/data/claimedFacilitators.json');

function slugify(text: string) {
  return (text || '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, facilitatorName, facilitatorEmail, category, city } = body;

    if (!facilitatorName) {
      return NextResponse.json(
        { error: 'Name des Facilitators ist erforderlich.' },
        { status: 400 }
      );
    }

    const facSlug = slugify(facilitatorName);
    const facId = `fac-user-${facSlug}`;
    const selectedCategory = category || 'Breathwork';
    const selectedCity = city || 'Berlin, Deutschland';

    let pageTitle = '';
    let pageDescription = '';
    let pageImage = '';

    // If a website/URL was supplied, fetch metadata
    if (url && url.startsWith('http')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const html = await res.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          const imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

          if (titleMatch) pageTitle = titleMatch[1].trim();
          if (descMatch) pageDescription = descMatch[1].trim();
          if (imgMatch) pageImage = imgMatch[1].trim();
        }
      } catch (e: any) {
        console.warn('[Facilitator Import] URL metadata extraction fallback:', e.message);
      }
    }

    // Default high-res aesthetic imagery by category
    const categoryImages: Record<string, string> = {
      'Breathwork': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      'Yoga': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      'Meditation': 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1200&q=80',
      'Sound Healing': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      'Life Coaching': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
      'BodyWork': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
      'Mindfulness': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      'Spiritual Growth': 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80',
    };

    const mainImage = pageImage || categoryImages[selectedCategory] || categoryImages['Breathwork'];
    const avatar = `https://images.unsplash.com/photo-${1544005313 + (Math.abs(facSlug.split('').reduce((a,c) => a + c.charCodeAt(0), 0)) % 1000)}?auto=format&fit=crop&w=300&q=80`;

    // 1. Create a 1:1 Private Session
    const session1 = {
      id: `usr-${facSlug}-session`,
      source_id: `usr-${facSlug}-session`,
      title: pageTitle ? `1:1 ${pageTitle.split(/[-|–]/)[0].trim()}` : `1:1 ${selectedCategory} Intensive & Nervensystem-Regulation`,
      description: pageDescription || `Exklusive 1:1 Einzelsitzung mit ${facilitatorName} in ${selectedCity}. Ganzheitliche Begleitung und individuelle Praxis abgestimmt auf deine persönlichen Bedürfnisse.`,
      type: 'individual',
      price: '€95',
      duration: 60,
      location: selectedCity,
      is_online: true,
      image_url: mainImage,
      capacity: 1,
      start_at: new Date(Date.now() + 86400000 * 2).toISOString(),
      tags: [selectedCategory, 'Mindfulness', 'Personal Transformation'],
      facilitator_id: facId,
      facilitator_name: facilitatorName,
      facilitator_avatar: avatar,
      rating: 5.0,
      reviewCount: 12,
      sales: 8,
      views: 140,
      source_platform: url ? new URL(url).hostname : 'ORIVE Direct Facilitator Network',
      source_url: url || `https://orive.co/facilitator/${facSlug}`,
      crawled_at: new Date().toISOString(),
    };

    // 2. Create an Upcoming Workshop / Group Experience
    const session2 = {
      id: `usr-${facSlug}-workshop`,
      source_id: `usr-${facSlug}-workshop`,
      title: `${selectedCategory} Masterclass & Somatic Journey`,
      description: `Geführter Gruppen-Workshop in ${selectedCity}. Tiefe somatische Selbsterfahrung, regenerative Atem- und Bewegungsmuster sowie geführte Integration in einem geschützten Raum.`,
      type: 'event',
      price: '€45',
      duration: 120,
      location: selectedCity,
      is_online: false,
      image_url: mainImage,
      capacity: 16,
      start_at: new Date(Date.now() + 86400000 * 5).toISOString(),
      tags: [selectedCategory, 'Masterclass', 'Somatic Experience'],
      facilitator_id: facId,
      facilitator_name: facilitatorName,
      facilitator_avatar: avatar,
      rating: 5.0,
      reviewCount: 18,
      sales: 14,
      views: 220,
      source_platform: url ? new URL(url).hostname : 'ORIVE Direct Facilitator Network',
      source_url: url || `https://orive.co/facilitator/${facSlug}`,
      crawled_at: new Date().toISOString(),
    };

    // Save offerings into crawledOfferings.json
    let existingOfferings: any[] = [];
    if (fs.existsSync(CRAWLED_FILE)) {
      try {
        existingOfferings = JSON.parse(fs.readFileSync(CRAWLED_FILE, 'utf-8') || '[]');
      } catch (e) {
        existingOfferings = [];
      }
    }

    // Filter out previous versions of this user's offerings to prevent duplication
    const updatedOfferings = [
      session1,
      session2,
      ...existingOfferings.filter(o => o.facilitator_id !== facId),
    ];

    fs.writeFileSync(CRAWLED_FILE, JSON.stringify(updatedOfferings, null, 2), 'utf-8');

    // Register into claimedFacilitators.json
    let claimed: Record<string, any> = {};
    if (fs.existsSync(CLAIMED_FILE)) {
      try {
        claimed = JSON.parse(fs.readFileSync(CLAIMED_FILE, 'utf-8') || '{}');
      } catch (e) {
        claimed = {};
      }
    }

    claimed[facId] = {
      facilitatorId: facId,
      name: facilitatorName,
      email: facilitatorEmail || `${facSlug}@facilitator.orive.co`,
      claimedAt: new Date().toISOString(),
      calendarActive: true,
      calendarUnlocked: true,
      sourceUrl: url || null,
      city: selectedCity,
      category: selectedCategory,
    };
    fs.writeFileSync(CLAIMED_FILE, JSON.stringify(claimed, null, 2), 'utf-8');

    console.log(`[Facilitator Import] Successfully imported 2 offerings for ${facilitatorName} (${facId}) from ${url || 'direct registration'}`);

    return NextResponse.json({
      success: true,
      message: `2 Angebote für ${facilitatorName} erfolgreich auf dem Marktplatz freigeschaltet!`,
      facilitatorId: facId,
      offerings: [session1, session2],
      marketplaceUrl: `/marketplace?search=${encodeURIComponent(facilitatorName)}`,
    });
  } catch (error: any) {
    console.error('[Facilitator Import Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
