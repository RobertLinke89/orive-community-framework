import type { PublicOffering } from '@/hooks/usePublicOfferings';
import { catalogKind, interleaveCatalog } from '@/lib/catalogLayout';
import { coordsForLocation, haversineKm, type GeoPoint } from '@/lib/geo';

function tagsOf(item: PublicOffering): string[] {
  if (!Array.isArray(item.tags)) return [];
  return item.tags.map((tag) => String(tag).toLowerCase());
}

function similarity(seed: PublicOffering, item: PublicOffering): number {
  const seedTags = new Set(tagsOf(seed));
  const itemTags = tagsOf(item);
  const overlap = itemTags.filter((tag) => seedTags.has(tag)).length;
  const tagScore = seedTags.size ? overlap / seedTags.size : 0;
  const typeScore = seed.type && item.type && seed.type === item.type ? 0.25 : 0;
  const title = `${item.title} ${itemTags.join(' ')}`.toLowerCase();
  const seedWords = String(seed.title || '')
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 4);
  const wordHit = seedWords.some((word) => title.includes(word)) ? 0.15 : 0;
  return Math.min(1, tagScore * 0.6 + typeScore + wordHit);
}

function proximity(viewer: GeoPoint | null, item: PublicOffering): { score: number; km: number | null } {
  const dest = coordsForLocation(item.location);
  if (!viewer || !dest) return { score: 0.12, km: null };
  const km = haversineKm(viewer, dest);
  const sameCity = viewer.city && dest.city && foldEq(viewer.city, dest.city);
  const sameCountry = viewer.country && dest.country && viewer.country === dest.country;
  const distanceScore = 1 / (1 + km / 70);
  const boost = sameCity ? 0.2 : sameCountry ? 0.08 : 0;
  return { score: Math.min(1, distanceScore + boost), km };
}

function foldEq(a: string, b: string) {
  const fold = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return fold(a) === fold(b);
}

export function rankNearbySimilar(
  pool: PublicOffering[],
  seed: PublicOffering,
  viewer: GeoPoint | null,
  limit = 10
): PublicOffering[] {
  const scored = pool
    .filter((item) => item.id && item.id !== seed.id)
    .map((item) => {
      const near = proximity(viewer, item);
      const alike = similarity(seed, item);
      return {
        item,
        kind: catalogKind(item),
        score: near.score * 0.74 + alike * 0.26,
      };
    })
    .sort((a, b) => b.score - a.score);

  const perKind: Record<string, number> = {
    event: Math.max(4, limit - 4),
    retreat: 3,
    individual: 3,
    group: 2,
    facilitator: 1,
  };
  const picked: PublicOffering[] = [];
  const used = new Set<string>();
  for (const row of scored) {
    const cap = perKind[row.kind] ?? 2;
    const taken = picked.filter((item) => catalogKind(item) === row.kind).length;
    if (taken >= cap) continue;
    used.add(row.item.id);
    picked.push(row.item);
  }
  for (const row of scored) {
    if (picked.length >= Math.max(limit * 2, 16)) break;
    if (used.has(row.item.id)) continue;
    used.add(row.item.id);
    picked.push(row.item);
  }
  return interleaveCatalog(picked, limit);
}
