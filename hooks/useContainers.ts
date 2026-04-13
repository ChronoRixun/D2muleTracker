import { useCallback, useEffect, useState } from 'react';

import {
  countItemsByContainer,
  listContainers,
  listRealms,
} from '@/db/queries';
import type { Container, Realm } from '@/lib/types';

import { useDatabase } from './useDatabase';

/** Loads realms, containers, and per-container item counts. */
export function useContainers(realmId?: string) {
  const { db, revision } = useDatabase();
  const [realms, setRealms] = useState<Realm[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [r, c, n] = await Promise.all([
      listRealms(db),
      listContainers(db, realmId),
      countItemsByContainer(db),
    ]);
    setRealms(r);
    setContainers(c);
    setCounts(n);
    setLoading(false);
  }, [db, realmId]);

  useEffect(() => {
    reload();
  }, [reload, revision]);

  return { realms, containers, counts, loading, reload };
}
