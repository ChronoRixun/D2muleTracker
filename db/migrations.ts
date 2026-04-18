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

  if (current > 0 && current < 2) {
    await db.execAsync('ALTER TABLE items ADD COLUMN sockets INTEGER;');
  }

  if (current > 0 && current < 3) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS item_tags (
        id         TEXT PRIMARY KEY,
        item_id    TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        tag        TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(item_id, tag)
      );
      CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
      CREATE INDEX IF NOT EXISTS idx_item_tags_tag     ON item_tags(tag);
    `);
  }

  // Future migrations: add `if (current < N)` blocks here.

  if (current !== CURRENT_SCHEMA_VERSION) {
    // user_version only accepts literal values, not parameters.
    await db.execAsync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
  }
}
