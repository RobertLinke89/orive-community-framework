import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orive.co';
  const now = new Date();

  // Static core routes: only live, indexable pages. Not listed on purpose (noindex or not active yet):
  // /facilitators + directory profiles, /shop, /blog, /formation, /auth, /protection (ORIVE booking/payment not active).
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/datenschutz`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/agb`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/partner-terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Category filter landing URLs
  const categories = [
    'Breathwork',
    'Yoga',
    'Meditation',
    'Sound Healing',
    'Life Coaching',
    'BodyWork',
    'Mindfulness',
    'Spiritual Growth',
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/marketplace?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Dynamic crawled offerings
  let offeringRoutes: MetadataRoute.Sitemap = [];
  try {
    const offeringsPath = path.resolve(process.cwd(), 'src/data/crawledOfferings.json');
    if (fs.existsSync(offeringsPath)) {
      const data = JSON.parse(fs.readFileSync(offeringsPath, 'utf-8'));
      if (Array.isArray(data)) {
        // Only offers with a verifiable public source (Eventbrite / wimhofmethod.com); synthetic demo seeds are skipped.
        const real = (item: any) => /^https?:\/\/([a-z0-9-]+\.)*(eventbrite\.[a-z.]+|wimhofmethod\.com)\//i.test(String(item?.source_url || ''));
        // Past events are dropped: only events whose start date is today or later.
        const today = now.toISOString().slice(0, 10);
        const upcoming = (item: any) => typeof item?.start_at === 'string' && item.start_at.slice(0, 10) >= today;
        offeringRoutes = data.filter((item: any) => real(item) && upcoming(item)).map((item: any) => {
          const type = item.type === 'event' ? 'event' : item.type === 'experience' ? 'experience' : 'session';
          return {
            url: `${baseUrl}/${type}/${encodeURIComponent(item.id)}`,
            lastModified: item.crawled_at ? new Date(item.crawled_at) : now,
            changeFrequency: 'daily',
            priority: 0.8,
          };
        });
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Failed to read crawled offerings:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...offeringRoutes];
}
