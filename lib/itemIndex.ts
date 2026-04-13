/**
 * Loads the bundled item-index.json once at startup and exposes
 * a scored search function used by autocomplete and the Find Item tab.
 */

import type { ItemEntry } from './types';
// The JSON is bundled as an asset at build time by Metro.
import rawIndex from '@/assets/data/item-index.json';

const ITEM_INDEX: ItemEntry[] = rawIndex as ItemEntry[];
const ITEM_MAP = new Map<string, ItemEntry>(
  ITEM_INDEX.map((e) => [e.id, e]),
);

export function getItemIndex(): ItemEntry[] {
  return ITEM_INDEX;
}

export function getItemById(id: string): ItemEntry | undefined {
  return ITEM_MAP.get(id);
}

export function searchItems(query: string, limit = 20): ItemEntry[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  type Scored = { item: ItemEntry; score: number };
  const scored: Scored[] = [];

  for (const item of ITEM_INDEX) {
    const name = item.name.toLowerCase();
    let score = 0;

    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (item.searchTerms.some((t) => t.startsWith(q))) score = 60;
    else if (name.includes(q)) score = 40;
    else if (item.searchTerms.some((t) => t.includes(q))) score = 20;

    if (score > 0) scored.push({ item, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.item.name.localeCompare(b.item.name);
  });

  return scored.slice(0, limit).map((s) => s.item);
}
