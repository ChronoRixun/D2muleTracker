/**
 * Hooks for managing item tags. Tags are stored in the item_tags table
 * and queried via db/queries.ts — these hooks wrap those queries with
 * local state and a shared cache of all known tags for autocomplete.
 */

import { useCallback, useEffect, useState } from 'react';

import {
  addTagToItem,
  getAllTags,
  getItemTags,
  removeTagFromItem,
} from '@/db/queries';
import { useDatabase } from './useDatabase';

export function useAllTags(): { tags: string[]; reload: () => Promise<void> } {
  const { db, revision } = useDatabase();
  const [tags, setTags] = useState<string[]>([]);

  const reload = useCallback(async () => {
    const list = await getAllTags(db);
    setTags(list);
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload, revision]);

  return { tags, reload };
}

export function useItemTagsState(itemId: string | null | undefined) {
  const { db, bumpRevision } = useDatabase();
  const [tags, setTags] = useState<string[]>([]);

  const reload = useCallback(async () => {
    if (!itemId) {
      setTags([]);
      return;
    }
    const list = await getItemTags(db, itemId);
    setTags(list);
  }, [db, itemId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (tag: string) => {
      const t = tag.trim();
      if (!t || !itemId) return;
      if (tags.includes(t)) return;
      await addTagToItem(db, itemId, t);
      setTags((prev) => [...prev, t].sort((a, b) => a.localeCompare(b)));
      bumpRevision();
    },
    [db, itemId, tags, bumpRevision],
  );

  const remove = useCallback(
    async (tag: string) => {
      if (!itemId) return;
      await removeTagFromItem(db, itemId, tag);
      setTags((prev) => prev.filter((t) => t !== tag));
      bumpRevision();
    },
    [db, itemId, bumpRevision],
  );

  return { tags, add, remove, reload };
}
