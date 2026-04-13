/**
 * Database context + hook. Opens the SQLite database once and runs
 * migrations before rendering children.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { migrate } from '@/db/migrations';
import { DB_NAME } from '@/db/schema';

interface DatabaseContextValue {
  db: SQLiteDatabase;
  revision: number;
  bumpRevision: () => void;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

interface DatabaseProviderProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

export function DatabaseProvider({
  children,
  loadingFallback = null,
}: DatabaseProviderProps) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [revision, setRevision] = useState(0);
  const openedOnce = useRef(false);

  useEffect(() => {
    if (openedOnce.current) return;
    openedOnce.current = true;
    (async () => {
      const instance = await openDatabaseAsync(DB_NAME);
      await migrate(instance);
      setDb(instance);
    })();
  }, []);

  if (!db) return <>{loadingFallback}</>;

  const value: DatabaseContextValue = {
    db,
    revision,
    bumpRevision: () => setRevision((r) => r + 1),
  };

  return (
    <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return ctx;
}
