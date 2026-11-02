import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../src/data/crawledOfferings.json');

/**
 * Loads existing crawled offerings from JSON storage
 */
export function loadStoredOfferings() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('[Storage] Error reading storage file:', err.message);
  }
  return [];
}

/**
 * Saves offerings with deduplication
 * @param {Array} newOfferings - Newly normalized offerings
 * @returns {Object} stats - Count of total, added, updated
 */
export function saveOfferings(newOfferings, options = { overwrite: true }) {
  // If overwrite is true, only keep real offerings from verified external platforms
  const existing = options.overwrite ? [] : loadStoredOfferings().filter(item => 
    item.source_platform !== 'Berlin Holistic Collective' && 
    item.source_platform !== 'Wim Hof Instructors Germany' &&
    !item.source_url?.includes('orive.co/events/')
  );
  const map = new Map();

  // Key by source_url or normalized title + location
  const getKey = item => item.source_url || `${item.title.toLowerCase()}::${item.location.toLowerCase()}`;

  for (const item of existing) {
    map.set(getKey(item), item);
  }

  let addedCount = 0;
  let updatedCount = 0;

  for (const item of newOfferings) {
    const key = getKey(item);
    if (map.has(key)) {
      const prev = map.get(key);
      map.set(key, { ...prev, ...item, id: prev.id });
      updatedCount++;
    } else {
      map.set(key, item);
      addedCount++;
    }
  }

  const merged = Array.from(map.values());

  // Ensure directory exists
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`[Storage] Saved ${merged.length} offerings (${addedCount} new, ${updatedCount} updated) to ${DATA_FILE}`);

  return {
    total: merged.length,
    added: addedCount,
    updated: updatedCount,
  };
}
