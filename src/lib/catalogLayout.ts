import type { PublicOffering } from '@/hooks/usePublicOfferings';

export type TetrisSize = 'hero' | 'wide' | 'tall' | 'compact';
export type CatalogCardSize = TetrisSize | 'featured' | 'default';

export const TETRIS_SPANS: Record<TetrisSize, { w: number; h: number }> = {
  hero: { w: 2, h: 2 },
  wide: { w: 2, h: 1 },
  tall: { w: 1, h: 2 },
  compact: { w: 1, h: 1 },
};

export type TetrisPlacement = {
  item: PublicOffering;
  size: TetrisSize;
  categoryId: string;
  categoryLabel: string;
  categoryIndex: number;
  indexInCategory: number;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

function tagsOf(item: PublicOffering): string[] {
  if (Array.isArray(item.tags)) return item.tags.map(String);
  if (typeof item.tags === 'string') {
    return String(item.tags).split(/[,|/]/).map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

export function isRetreat(item: PublicOffering): boolean {
  const text = `${item.title} ${tagsOf(item).join(' ')} ${item.location || ''}`.toLowerCase();
  return /retreat|auszeit|immersion|tages[- ]?retreat/.test(text);
}

export function catalogKind(
  item: PublicOffering
): 'facilitator' | 'retreat' | 'event' | 'group' | 'individual' {
  if (String(item.id || '').startsWith('fac-card-')) return 'facilitator';
  if (isRetreat(item)) return 'retreat';
  if (item.type === 'event') return 'event';
  if (item.type === 'group') return 'group';
  return 'individual';
}

export function matchesMarketplaceTab(item: PublicOffering, tab: string): boolean {
  if (!tab || tab === 'all') return true;
  const kind = catalogKind(item);
  if (tab === 'sessions') return kind === 'individual';
  if (tab === 'events') return kind === 'event' || kind === 'group' || kind === 'retreat';
  if (tab === 'facilitators') return kind === 'facilitator';
  return true;
}

export function interleaveCatalog(items: PublicOffering[], limit = 48): PublicOffering[] {
  const buckets: Record<string, PublicOffering[]> = {
    individual: [],
    group: [],
    event: [],
    retreat: [],
    facilitator: [],
  };
  for (const item of items) {
    buckets[catalogKind(item)].push(item);
  }

  const order = [
    'retreat',
    'individual',
    'event',
    'group',
    'individual',
    'facilitator',
  ] as const;

  const out: PublicOffering[] = [];
  let i = 0;
  const max = Math.max(limit * 6, 120);
  while (out.length < limit && i < max) {
    const next = buckets[order[i % order.length]].shift();
    if (next) out.push(next);
    i += 1;
  }
  return out;
}

export function assignCatalogSizes(
  items: PublicOffering[]
): { item: PublicOffering; size: CatalogCardSize }[] {
  let lastWasFeatured = false;
  return items.map((item) => {
    const kind = catalogKind(item);
    const preferFeatured = kind === 'retreat' || kind === 'event';
    const size: CatalogCardSize =
      preferFeatured && !lastWasFeatured
        ? 'featured'
        : kind === 'group' || kind === 'facilitator'
          ? 'default'
          : 'compact';
    lastWasFeatured = size === 'featured';
    return { item, size };
  });
}

export function assignTetrisSize(item: PublicOffering, index: number): TetrisSize {
  const kind = catalogKind(item);
  if (kind === 'retreat') return index % 3 === 0 ? 'hero' : 'wide';
  if (kind === 'event') return index % 2 === 0 ? 'wide' : 'tall';
  if (kind === 'group') return index % 3 === 0 ? 'tall' : 'wide';
  const cycle: TetrisSize[] = ['compact', 'tall', 'compact', 'wide'];
  return cycle[index % cycle.length];
}

function canPlace(grid: boolean[][], row: number, col: number, w: number, h: number, cols: number): boolean {
  if (col + w > cols) return false;
  for (let r = row; r < row + h; r += 1) {
    if (!grid[r]) continue;
    for (let c = col; c < col + w; c += 1) {
      if (grid[r][c]) return false;
    }
  }
  return true;
}

function occupy(grid: boolean[][], row: number, col: number, w: number, h: number, cols: number) {
  for (let r = row; r < row + h; r += 1) {
    if (!grid[r]) grid[r] = Array.from({ length: cols }, () => false);
    for (let c = col; c < col + w; c += 1) {
      grid[r][c] = true;
    }
  }
}

/** First empty cell in row-major order. Always fill this before placing further down. */
function findFirstEmpty(grid: boolean[][], cols: number): { row: number; col: number } {
  const maxRows = Math.max(grid.length, 1) + 2;
  for (let row = 0; row < maxRows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!grid[row]?.[col]) return { row, col };
    }
  }
  return { row: grid.length, col: 0 };
}

function sizeOrder(preferred: TetrisSize): TetrisSize[] {
  const rest = (['hero', 'wide', 'tall', 'compact'] as TetrisSize[]).filter((size) => size !== preferred);
  return [preferred, ...rest];
}

export function packTetrisCatalog(
  groups: { id: string; label: string; offerings: PublicOffering[] }[],
  cols: number
): TetrisPlacement[] {
  const grid: boolean[][] = [];
  const placed: TetrisPlacement[] = [];
  const seen = new Set<string>();

  groups.forEach((group, categoryIndex) => {
    let indexInCategory = 0;
    for (const item of group.offerings) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);

      const preferred = assignTetrisSize(item, indexInCategory);
      const hole = findFirstEmpty(grid, cols);
      let chosen: TetrisSize | null = null;

      // Prefer the largest preferred shape that still fits in the open hole.
      // Compact (1×1) always fits, so middle gaps never remain.
      for (const size of sizeOrder(preferred)) {
        const span = TETRIS_SPANS[size];
        if (canPlace(grid, hole.row, hole.col, span.w, span.h, cols)) {
          chosen = size;
          break;
        }
      }

      if (!chosen) continue;
      const span = TETRIS_SPANS[chosen];
      occupy(grid, hole.row, hole.col, span.w, span.h, cols);
      placed.push({
        item,
        size: chosen,
        categoryId: group.id,
        categoryLabel: group.label,
        categoryIndex,
        indexInCategory,
        col: hole.col + 1,
        row: hole.row + 1,
        colSpan: span.w,
        rowSpan: span.h,
      });
      indexInCategory += 1;
    }
  });

  return placed;
}
