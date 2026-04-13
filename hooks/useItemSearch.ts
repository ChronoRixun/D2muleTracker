import { useEffect, useMemo, useState } from 'react';

import { searchItems } from '@/lib/itemIndex';
import type { ItemEntry } from '@/lib/types';

/**
 * Debounced item-index autocomplete. Returns up to `limit` entries.
 */
export function useItemSearch(query: string, limit = 20): ItemEntry[] {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const h = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(h);
  }, [query]);

  return useMemo(() => searchItems(debounced, limit), [debounced, limit]);
}
