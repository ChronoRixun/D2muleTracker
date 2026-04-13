import type { SQLiteDatabase } from 'expo-sqlite';
import { CURRENT_SCHEMA_VERSION, SCHEMA_SQL } from './schema';

/**
 * Runs DDL to bring the database up to the current schema version.
 * Uses PRAGMA user_version to track migrations.
 */
export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;',
  );
  const current = row?.user_version ?? 0;

  if (current < 1) {
    await db.execAsync(SCHEMA_SQL);
  }

  // Future migrations: add `if (current < N)` blocks here.

  if (current !== CURRENT_SCHEMA_VERSION) {
    // user_version only accepts literal values, not parameters.
    await db.execAsync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
  }
}
