import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orive.co';
  const now = new Date();

  // Static core routes
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
      url: `${baseUrl}/formation`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/invest`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/whatsapp-assistant`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
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
      url: `${baseUrl}/protection`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
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
        offeringRoutes = data.map((item: any) => {
          const type = item.type === 'event' ? 'event' : item.type === 'experience' ? 'experience' : 'session';
          return {
            url: `${baseUrl}/${type}/${encodeURIComponent(item.id)}`,
            lastModified: item.updated_at ? new Date(item.updated_at) : now,
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
