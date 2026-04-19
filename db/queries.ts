import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getItemById, getItemIndex } from '@/lib/itemIndex';
import type {
  CharacterClass,
  Container,
  ContainerType,
  Era,
  ItemEntry,
  ItemLocation,
  ItemRecord,
  Ladder,
  Mode,
  Realm,
  Region,
} from '@/lib/types';

function now(): string {
  return new Date().toISOString();
}

function uuid(): string {
  return Crypto.randomUUID();
}

// ---- Row mappers ----------------------------------------------------------

type RealmRow = {
  id: string;
  name: string;
  era: string;
  mode: string;
  ladder: string;
  region: string | null;
  created_at: string;
};

type ContainerRow = {
  id: string;
  realm_id: string;
  name: string;
  type: string;
  class: string | null;
  level: number | null;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type ItemRow = {
  id: string;
  container_id: string;
  item_index_id: string;
  notes: string | null;
  quantity: number;
  location: string | null;
  sockets: number | null;
  created_at: string;
  updated_at: string;
};

function mapRealm(r: RealmRow): Realm {
  return {
    id: r.id,
    name: r.name,
    era: r.era as Era,
    mode: r.mode as Mode,
    ladder: r.ladder as Ladder,
    region: (r.region ?? null) as Region,
    createdAt: r.created_at,
  };
}

function mapContainer(r: ContainerRow): Container {
  return {
    id: r.id,
    realmId: r.realm_id,
    name: r.name,
    type: r.type as ContainerType,
    class: (r.class as CharacterClass | null) ?? null,
    level: r.level,
    isActive: r.is_active === 1,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapItem(r: ItemRow): ItemRecord {
  return {
    id: r.id,
    containerId: r.container_id,
    itemIndexId: r.item_index_id,
    notes: r.notes,
    quantity: r.quantity,
    location: (r.location ?? null) as ItemLocation,
    sockets: r.sockets ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ---- Realms ---------------------------------------------------------------

export async function listRealms(db: SQLiteDatabase): Promise<Realm[]> {
  const rows = await db.getAllAsync<RealmRow>(
    'SELECT * FROM realms ORDER BY created_at ASC',
  );
  return rows.map(mapRealm);
}

export async function createRealm(
  db: SQLiteDatabase,
  input: Omit<Realm, 'id' | 'createdAt'>,
): Promise<Realm> {
  const realm: Realm = {
    id: uuid(),
    createdAt: now(),
    ...input,
  };
  await db.runAsync(
    `INSERT INTO realms (id, name, era, mode, ladder, region, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      realm.id,
      realm.name,
      realm.era,
      realm.mode,
      realm.ladder,
      realm.region,
      realm.createdAt,
    ],
  );
  return realm;
}

export async function updateRealm(
  db: SQLiteDatabase,
  id: string,
  patch: Partial<Omit<Realm, 'id' | 'createdAt'>>,
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  if (patch.name !== undefined) {
    fields.push('name = ?');
    values.push(patch.name);
  }
  if (patch.era !== undefined) {
    fields.push('era = ?');
    values.push(patch.era);
  }
  if (patch.mode !== undefined) {
    fields.push('mode = ?');
    values.push(patch.mode);
  }
  if (patch.ladder !== undefined) {
    fields.push('ladder = ?');
    values.push(patch.ladder);
  }
  if (patch.region !== undefined) {
    fields.push('region = ?');
    values.push(patch.region);
  }
  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(
    `UPDATE realms SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );
}

export async function deleteRealm(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync('DELETE FROM realms WHERE id = ?', [id]);
}

// ---- Containers -----------------------------------------------------------

export async function listContainers(
  db: SQLiteDatabase,
  realmId?: string,
): Promise<Container[]> {
  const sql = realmId
    ? 'SELECT * FROM containers WHERE is_active = 1 AND realm_id = ? ORDER BY sort_order ASC, name ASC'
    : 'SELECT * FROM containers WHERE is_active = 1 ORDER BY sort_order ASC, name ASC';
  const rows = await db.getAllAsync<ContainerRow>(
    sql,
    realmId ? [realmId] : [],
  );
  return rows.map(mapContainer);
}

export async function getContainer(
  db: SQLiteDatabase,
  id: string,
): Promise<Container | null> {
  const row = await db.getFirstAsync<ContainerRow>(
    'SELECT * FROM containers WHERE id = ?',
    [id],
  );
  return row ? mapContainer(row) : null;
}

export async function createContainer(
  db: SQLiteDatabase,
  input: Omit<Container, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'sortOrder'> & {
    sortOrder?: number;
  },
): Promise<Container> {
  const ts = now();
  const container: Container = {
    id: uuid(),
    realmId: input.realmId,
    name: input.name,
    type: input.type,
    class: input.class,
    level: input.level,
    isActive: true,
    sortOrder: input.sortOrder ?? 0,
    createdAt: ts,
    updatedAt: ts,
  };
  await db.runAsync(
    `INSERT INTO containers
     (id, realm_id, name, type, class, level, is_active, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    [
      container.id,
      container.realmId,
      container.name,
      container.type,
      container.class,
      container.level,
      container.sortOrder,
      container.createdAt,
      container.updatedAt,
    ],
  );
  return container;
}

export async function updateContainer(
  db: SQLiteDatabase,
  id: string,
  patch: Partial<Omit<Container, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  if (patch.name !== undefined) {
    fields.push('name = ?');
    values.push(patch.name);
  }
  if (patch.class !== undefined) {
    fields.push('class = ?');
    values.push(patch.class);
  }
  if (patch.level !== undefined) {
    fields.push('level = ?');
    values.push(patch.level);
  }
  if (patch.type !== undefined) {
    fields.push('type = ?');
    values.push(patch.type);
  }
  if (patch.realmId !== undefined) {
    fields.push('realm_id = ?');
    values.push(patch.realmId);
  }
  if (patch.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(patch.isActive ? 1 : 0);
  }
  if (patch.sortOrder !== undefined) {
    fields.push('sort_order = ?');
    values.push(patch.sortOrder);
  }
  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  values.push(now());
  values.push(id);
  await db.runAsync(
    `UPDATE containers SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );
}

export async function archiveContainer(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync(
    'UPDATE containers SET is_active = 0, updated_at = ? WHERE id = ?',
    [now(), id],
  );
}

export async function deleteContainer(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync('DELETE FROM containers WHERE id = ?', [id]);
}

// ---- Items ----------------------------------------------------------------

export async function listItemsByContainer(
  db: SQLiteDatabase,
  containerId: string,
): Promise<ItemRecord[]> {
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items WHERE container_id = ? ORDER BY created_at DESC',
    [containerId],
  );
  return rows.map(mapItem);
}

export async function countItemsByContainer(
  db: SQLiteDatabase,
): Promise<Record<string, number>> {
  const rows = await db.getAllAsync<{ container_id: string; c: number }>(
    'SELECT container_id, COUNT(*) AS c FROM items GROUP BY container_id',
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.container_id] = r.c;
  return out;
}

export async function createItem(
  db: SQLiteDatabase,
  input: {
    containerId: string;
    itemIndexId: string;
    notes?: string | null;
    quantity?: number;
    location?: ItemLocation;
    sockets?: number | null;
  },
): Promise<ItemRecord> {
  const ts = now();
  const item: ItemRecord = {
    id: uuid(),
    containerId: input.containerId,
    itemIndexId: input.itemIndexId,
    notes: input.notes ?? null,
    quantity: input.quantity ?? 1,
    location: input.location ?? null,
    sockets: input.sockets ?? null,
    createdAt: ts,
    updatedAt: ts,
  };
  await db.runAsync(
    `INSERT INTO items
     (id, container_id, item_index_id, notes, quantity, location, sockets, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.containerId,
      item.itemIndexId,
      item.notes,
      item.quantity,
      item.location,
      item.sockets,
      item.createdAt,
      item.updatedAt,
    ],
  );
  return item;
}

export async function updateItem(
  db: SQLiteDatabase,
  id: string,
  patch: Partial<Pick<ItemRecord, 'notes' | 'quantity' | 'location' | 'containerId' | 'sockets'>>,
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  if (patch.notes !== undefined) {
    fields.push('notes = ?');
    values.push(patch.notes);
  }
  if (patch.quantity !== undefined) {
    fields.push('quantity = ?');
    values.push(patch.quantity);
  }
  if (patch.location !== undefined) {
    fields.push('location = ?');
    values.push(patch.location);
  }
  if (patch.containerId !== undefined) {
    fields.push('container_id = ?');
    values.push(patch.containerId);
  }
  if (patch.sockets !== undefined) {
    fields.push('sockets = ?');
    values.push(patch.sockets);
  }
  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  values.push(now());
  values.push(id);
  await db.runAsync(
    `UPDATE items SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );
}

export async function deleteItem(
  db: SQLiteDatabase,
  id: string,
): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
}

export async function recentItemIndexIds(
  db: SQLiteDatabase,
  limit = 10,
): Promise<string[]> {
  const rows = await db.getAllAsync<{ item_index_id: string }>(
    `SELECT item_index_id, MAX(created_at) AS last_used
     FROM items
     GROUP BY item_index_id
     ORDER BY last_used DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map((r) => r.item_index_id);
}

// ---- Per-realm aggregate counts ------------------------------------------

export async function countMulesByRealm(
  db: SQLiteDatabase,
): Promise<Record<string, number>> {
  const rows = await db.getAllAsync<{ realm_id: string; c: number }>(
    `SELECT realm_id, COUNT(*) AS c
     FROM containers
     WHERE is_active = 1 AND type = 'character'
     GROUP BY realm_id`,
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.realm_id] = r.c;
  return out;
}

export async function countItemsByRealm(
  db: SQLiteDatabase,
): Promise<Record<string, number>> {
  const rows = await db.getAllAsync<{ realm_id: string; c: number }>(
    `SELECT c.realm_id AS realm_id, COUNT(i.id) AS c
     FROM items i
     JOIN containers c ON c.id = i.container_id
     WHERE c.is_active = 1
     GROUP BY c.realm_id`,
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.realm_id] = r.c;
  return out;
}

export async function countRunesByRealm(
  db: SQLiteDatabase,
): Promise<Record<string, number>> {
  // Pull (realm_id, item_index_id, quantity) joined rows and bucket in JS
  // against the in-memory item index — keeps SQL simple, leans on ITEM_MAP.
  const rows = await db.getAllAsync<{
    realm_id: string;
    item_index_id: string;
    quantity: number;
  }>(
    `SELECT c.realm_id AS realm_id,
            i.item_index_id AS item_index_id,
            i.quantity AS quantity
     FROM items i
     JOIN containers c ON c.id = i.container_id
     WHERE c.is_active = 1`,
  );
  const out: Record<string, number> = {};
  for (const r of rows) {
    const entry = getItemById(r.item_index_id);
    if (entry?.category !== 'rune') continue;
    out[r.realm_id] = (out[r.realm_id] ?? 0) + (r.quantity ?? 0);
  }
  return out;
}

// ---- Cross-container search -----------------------------------------------

export async function findItemsByIndexIds(
  db: SQLiteDatabase,
  itemIndexIds: string[],
  realmId?: string,
): Promise<Array<{ item: ItemRecord; container: Container; realm: Realm }>> {
  if (itemIndexIds.length === 0) return [];
  const placeholders = itemIndexIds.map(() => '?').join(',');
  const params: any[] = [...itemIndexIds];
  let sql = `
    SELECT i.*, c.realm_id AS c_realm_id,
           c.id AS c_id, c.name AS c_name, c.type AS c_type, c.class AS c_class,
           c.level AS c_level, c.is_active AS c_is_active,
           c.sort_order AS c_sort_order, c.created_at AS c_created_at,
           c.updated_at AS c_updated_at,
           r.id AS r_id, r.name AS r_name, r.era AS r_era, r.mode AS r_mode,
           r.ladder AS r_ladder, r.region AS r_region, r.created_at AS r_created_at
    FROM items i
    JOIN containers c ON c.id = i.container_id
    JOIN realms     r ON r.id = c.realm_id
    WHERE i.item_index_id IN (${placeholders})
  `;
  if (realmId) {
    sql += ' AND r.id = ?';
    params.push(realmId);
  }
  sql += ' ORDER BY r.name, c.name, i.created_at DESC';

  const rows = await db.getAllAsync<any>(sql, params);
  return rows.map((row) => ({
    item: mapItem({
      id: row.id,
      container_id: row.container_id,
      item_index_id: row.item_index_id,
      notes: row.notes,
      quantity: row.quantity,
      location: row.location,
      sockets: row.sockets,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
    container: mapContainer({
      id: row.c_id,
      realm_id: row.c_realm_id,
      name: row.c_name,
      type: row.c_type,
      class: row.c_class,
      level: row.c_level,
      is_active: row.c_is_active,
      sort_order: row.c_sort_order,
      created_at: row.c_created_at,
      updated_at: row.c_updated_at,
    }),
    realm: mapRealm({
      id: row.r_id,
      name: row.r_name,
      era: row.r_era,
      mode: row.r_mode,
      ladder: row.r_ladder,
      region: row.r_region,
      created_at: row.r_created_at,
    }),
  }));
}

export async function findItemsByTags(
  db: SQLiteDatabase,
  tags: string[],
  realmId?: string,
): Promise<Array<{ item: ItemRecord; container: Container; realm: Realm }>> {
  const normalized = tags.map((t) => t.trim()).filter((t) => t.length > 0);
  if (normalized.length === 0) return [];
  const tagPlaceholders = normalized.map(() => '?').join(',');
  const params: any[] = [...normalized, normalized.length];
  let sql = `
    SELECT i.*, c.realm_id AS c_realm_id,
           c.id AS c_id, c.name AS c_name, c.type AS c_type, c.class AS c_class,
           c.level AS c_level, c.is_active AS c_is_active,
           c.sort_order AS c_sort_order, c.created_at AS c_created_at,
           c.updated_at AS c_updated_at,
           r.id AS r_id, r.name AS r_name, r.era AS r_era, r.mode AS r_mode,
           r.ladder AS r_ladder, r.region AS r_region, r.created_at AS r_created_at
    FROM items i
    JOIN containers c ON c.id = i.container_id
    JOIN realms     r ON r.id = c.realm_id
    WHERE i.id IN (
      SELECT item_id FROM item_tags
      WHERE tag IN (${tagPlaceholders})
      GROUP BY item_id
      HAVING COUNT(DISTINCT tag) = ?
    )
  `;
  if (realmId) {
    sql += ' AND r.id = ?';
    params.push(realmId);
  }
  sql += ' ORDER BY r.name, c.name, i.created_at DESC';

  const rows = await db.getAllAsync<any>(sql, params);
  return rows.map((row) => ({
    item: mapItem({
      id: row.id,
      container_id: row.container_id,
      item_index_id: row.item_index_id,
      notes: row.notes,
      quantity: row.quantity,
      location: row.location,
      sockets: row.sockets,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
    container: mapContainer({
      id: row.c_id,
      realm_id: row.c_realm_id,
      name: row.c_name,
      type: row.c_type,
      class: row.c_class,
      level: row.c_level,
      is_active: row.c_is_active,
      sort_order: row.c_sort_order,
      created_at: row.c_created_at,
      updated_at: row.c_updated_at,
    }),
    realm: mapRealm({
      id: row.r_id,
      name: row.r_name,
      era: row.r_era,
      mode: row.r_mode,
      ladder: row.r_ladder,
      region: row.r_region,
      created_at: row.r_created_at,
    }),
  }));
}

export async function searchNotes(
  db: SQLiteDatabase,
  query: string,
  realmId?: string,
): Promise<Array<{ item: ItemRecord; container: Container; realm: Realm }>> {
  const q = `%${query.toLowerCase()}%`;
  const params: any[] = [q];
  let sql = `
    SELECT i.*, c.realm_id AS c_realm_id,
           c.id AS c_id, c.name AS c_name, c.type AS c_type, c.class AS c_class,
           c.level AS c_level, c.is_active AS c_is_active,
           c.sort_order AS c_sort_order, c.created_at AS c_created_at,
           c.updated_at AS c_updated_at,
           r.id AS r_id, r.name AS r_name, r.era AS r_era, r.mode AS r_mode,
           r.ladder AS r_ladder, r.region AS r_region, r.created_at AS r_created_at
    FROM items i
    JOIN containers c ON c.id = i.container_id
    JOIN realms     r ON r.id = c.realm_id
    WHERE LOWER(i.notes) LIKE ?
  `;
  if (realmId) {
    sql += ' AND r.id = ?';
    params.push(realmId);
  }
  sql += ' ORDER BY r.name, c.name';

  const rows = await db.getAllAsync<any>(sql, params);
  return rows.map((row) => ({
    item: mapItem({
      id: row.id,
      container_id: row.container_id,
      item_index_id: row.item_index_id,
      notes: row.notes,
      quantity: row.quantity,
      location: row.location,
      sockets: row.sockets,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
    container: mapContainer({
      id: row.c_id,
      realm_id: row.c_realm_id,
      name: row.c_name,
      type: row.c_type,
      class: row.c_class,
      level: row.c_level,
      is_active: row.c_is_active,
      sort_order: row.c_sort_order,
      created_at: row.c_created_at,
      updated_at: row.c_updated_at,
    }),
    realm: mapRealm({
      id: row.r_id,
      name: row.r_name,
      era: row.r_era,
      mode: row.r_mode,
      ladder: row.r_ladder,
      region: row.r_region,
      created_at: row.r_created_at,
    }),
  }));
}

// ---- Export / Import ------------------------------------------------------

export interface BackupPayload {
  version: number;
  exportedAt: string;
  realms: Realm[];
  containers: Container[];
  items: ItemRecord[];
}

export async function exportAll(db: SQLiteDatabase): Promise<BackupPayload> {
  const realms = await listRealms(db);
  const containers = (await db.getAllAsync<ContainerRow>(
    'SELECT * FROM containers',
  )).map(mapContainer);
  const items = (await db.getAllAsync<ItemRow>('SELECT * FROM items')).map(
    mapItem,
  );
  return {
    version: 1,
    exportedAt: now(),
    realms,
    containers,
    items,
  };
}

export async function importAll(
  db: SQLiteDatabase,
  payload: BackupPayload,
  mode: 'merge' | 'replace',
): Promise<void> {
  await db.withTransactionAsync(async () => {
    if (mode === 'replace') {
      await db.execAsync('DELETE FROM items; DELETE FROM containers; DELETE FROM realms;');
    }
    for (const r of payload.realms) {
      await db.runAsync(
        `INSERT OR REPLACE INTO realms (id, name, era, mode, ladder, region, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.name, r.era, r.mode, r.ladder, r.region, r.createdAt],
      );
    }
    for (const c of payload.containers) {
      await db.runAsync(
        `INSERT OR REPLACE INTO containers
         (id, realm_id, name, type, class, level, is_active, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.realmId,
          c.name,
          c.type,
          c.class,
          c.level,
          c.isActive ? 1 : 0,
          c.sortOrder,
          c.createdAt,
          c.updatedAt,
        ],
      );
    }
    for (const i of payload.items) {
      await db.runAsync(
        `INSERT OR REPLACE INTO items
         (id, container_id, item_index_id, notes, quantity, location, sockets, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          i.id,
          i.containerId,
          i.itemIndexId,
          i.notes,
          i.quantity,
          i.location,
          i.sockets ?? null,
          i.createdAt,
          i.updatedAt,
        ],
      );
    }
  });
}

// ---- Tags -----------------------------------------------------------------

function normalizeTag(tag: string): string {
  return tag.trim();
}

export async function addTagToItem(
  db: SQLiteDatabase,
  itemId: string,
  tag: string,
): Promise<void> {
  const t = normalizeTag(tag);
  if (!t) return;
  try {
    await db.runAsync(
      `INSERT OR IGNORE INTO item_tags (id, item_id, tag, created_at)
       VALUES (?, ?, ?, ?)`,
      [uuid(), itemId, t, now()],
    );
  } catch (err) {
    console.error('addTagToItem failed', err);
    throw err;
  }
}

export async function removeTagFromItem(
  db: SQLiteDatabase,
  itemId: string,
  tag: string,
): Promise<void> {
  const t = normalizeTag(tag);
  if (!t) return;
  try {
    await db.runAsync(
      'DELETE FROM item_tags WHERE item_id = ? AND tag = ?',
      [itemId, t],
    );
  } catch (err) {
    console.error('removeTagFromItem failed', err);
    throw err;
  }
}

export async function getItemTags(
  db: SQLiteDatabase,
  itemId: string,
): Promise<string[]> {
  try {
    const rows = await db.getAllAsync<{ tag: string }>(
      'SELECT tag FROM item_tags WHERE item_id = ? ORDER BY tag ASC',
      [itemId],
    );
    return rows.map((r) => r.tag);
  } catch (err) {
    console.error('getItemTags failed', err);
    throw err;
  }
}

export async function getAllTags(db: SQLiteDatabase): Promise<string[]> {
  try {
    const rows = await db.getAllAsync<{ tag: string }>(
      'SELECT DISTINCT tag FROM item_tags ORDER BY tag ASC',
    );
    return rows.map((r) => r.tag);
  } catch (err) {
    console.error('getAllTags failed', err);
    throw err;
  }
}

export async function getItemsByTag(
  db: SQLiteDatabase,
  tag: string,
): Promise<ItemRecord[]> {
  const t = normalizeTag(tag);
  if (!t) return [];
  try {
    const rows = await db.getAllAsync<ItemRow>(
      `SELECT i.* FROM items i
       JOIN item_tags t ON t.item_id = i.id
       WHERE t.tag = ?
       ORDER BY i.created_at DESC`,
      [t],
    );
    return rows.map(mapItem);
  } catch (err) {
    console.error('getItemsByTag failed', err);
    throw err;
  }
}

export async function bulkAddTag(
  db: SQLiteDatabase,
  itemIds: string[],
  tag: string,
): Promise<void> {
  const t = normalizeTag(tag);
  if (!t || itemIds.length === 0) return;
  try {
    await db.withTransactionAsync(async () => {
      const ts = now();
      for (const id of itemIds) {
        await db.runAsync(
          `INSERT OR IGNORE INTO item_tags (id, item_id, tag, created_at)
           VALUES (?, ?, ?, ?)`,
          [uuid(), id, t, ts],
        );
      }
    });
  } catch (err) {
    console.error('bulkAddTag failed', err);
    throw err;
  }
}

export async function bulkRemoveTag(
  db: SQLiteDatabase,
  itemIds: string[],
  tag: string,
): Promise<void> {
  const t = normalizeTag(tag);
  if (!t || itemIds.length === 0) return;
  try {
    const placeholders = itemIds.map(() => '?').join(',');
    await db.runAsync(
      `DELETE FROM item_tags WHERE tag = ? AND item_id IN (${placeholders})`,
      [t, ...itemIds],
    );
  } catch (err) {
    console.error('bulkRemoveTag failed', err);
    throw err;
  }
}

// ---- Set progress ---------------------------------------------------------

export interface SetProgress {
  setId: string;
  setName: string;
  totalPieces: number;
  ownedPieces: number;
  ownedItems: ItemRecord[];
  missingPieceNames: string[];
}

export async function getSetProgress(
  db: SQLiteDatabase,
): Promise<SetProgress[]> {
  try {
    const index = getItemIndex();
    const setPieces = new Map<string, ItemEntry[]>();
    for (const entry of index) {
      if (entry.category !== 'set' || !entry.setName) continue;
      const bucket = setPieces.get(entry.setName) ?? [];
      bucket.push(entry);
      setPieces.set(entry.setName, bucket);
    }

    const results: SetProgress[] = [];
    for (const [setName, pieces] of setPieces) {
      const pieceIds = pieces.map((p) => p.id);
      const placeholders = pieceIds.map(() => '?').join(',');
      const ownedRows = await db.getAllAsync<ItemRow>(
        `SELECT * FROM items WHERE item_index_id IN (${placeholders})`,
        pieceIds,
      );
      const ownedItems = ownedRows.map(mapItem);
      const ownedIndexIds = new Set(ownedItems.map((i) => i.itemIndexId));
      const missingPieceNames = pieces
        .filter((p) => !ownedIndexIds.has(p.id))
        .map((p) => p.name);

      results.push({
        setId: setName,
        setName,
        totalPieces: pieces.length,
        ownedPieces: ownedIndexIds.size,
        ownedItems,
        missingPieceNames,
      });
    }

    results.sort((a, b) => {
      const pa = a.totalPieces === 0 ? 0 : a.ownedPieces / a.totalPieces;
      const pb = b.totalPieces === 0 ? 0 : b.ownedPieces / b.totalPieces;
      if (pb !== pa) return pb - pa;
      return a.setName.localeCompare(b.setName);
    });

    return results;
  } catch (err) {
    console.error('getSetProgress failed', err);
    throw err;
  }
}

// ---- Runeword crafting ----------------------------------------------------

export interface RuneInventory {
  runeName: string;
  owned: number;
}

export interface CraftableRuneword {
  runewordName: string;
  recipe: string[];
  canCraft: boolean;
  missingRunes: string[];
}

const KNOWN_RUNES = [
  'El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Thul',
  'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem',
  'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber',
  'Jah', 'Cham', 'Zod',
];

function parseRuneString(runes: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < runes.length) {
    let matched: string | null = null;
    for (const name of KNOWN_RUNES) {
      if (runes.startsWith(name, i) && (matched === null || name.length > matched.length)) {
        matched = name;
      }
    }
    if (!matched) {
      i += 1;
      continue;
    }
    out.push(matched);
    i += matched.length;
  }
  return out;
}

export async function getRuneInventory(
  db: SQLiteDatabase,
): Promise<RuneInventory[]> {
  try {
    const index = getItemIndex();
    const runeEntries = index.filter((e) => e.category === 'rune');
    const byId = new Map(runeEntries.map((e) => [e.id, e]));

    const rows = await db.getAllAsync<{ item_index_id: string; total: number }>(
      `SELECT item_index_id, SUM(quantity) AS total
       FROM items
       WHERE item_index_id IN (${runeEntries.map(() => '?').join(',') || 'NULL'})
       GROUP BY item_index_id`,
      runeEntries.map((e) => e.id),
    );

    const ownedMap = new Map<string, number>();
    for (const r of rows) {
      const entry = byId.get(r.item_index_id);
      if (!entry) continue;
      const runeName = entry.name.replace(/\s*Rune$/i, '');
      ownedMap.set(runeName, (ownedMap.get(runeName) ?? 0) + r.total);
    }

    return runeEntries
      .map((e) => {
        const runeName = e.name.replace(/\s*Rune$/i, '');
        return { runeName, owned: ownedMap.get(runeName) ?? 0 };
      })
      .sort((a, b) => {
        const ia = KNOWN_RUNES.indexOf(a.runeName);
        const ib = KNOWN_RUNES.indexOf(b.runeName);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return a.runeName.localeCompare(b.runeName);
      });
  } catch (err) {
    console.error('getRuneInventory failed', err);
    throw err;
  }
}

export async function getCraftableRunewords(
  db: SQLiteDatabase,
): Promise<CraftableRuneword[]> {
  try {
    const inventory = await getRuneInventory(db);
    const ownedCounts = new Map<string, number>();
    for (const r of inventory) ownedCounts.set(r.runeName, r.owned);

    const index = getItemIndex();
    const runewords = index.filter((e) => e.category === 'runeword' && e.runes);

    const results: CraftableRuneword[] = runewords.map((rw) => {
      const recipe = parseRuneString(rw.runes ?? '');
      const required = new Map<string, number>();
      for (const rune of recipe) {
        required.set(rune, (required.get(rune) ?? 0) + 1);
      }
      const missingRunes: string[] = [];
      for (const [rune, needed] of required) {
        const owned = ownedCounts.get(rune) ?? 0;
        if (owned < needed) {
          for (let i = 0; i < needed - owned; i += 1) missingRunes.push(rune);
        }
      }
      return {
        runewordName: rw.name,
        recipe,
        canCraft: missingRunes.length === 0,
        missingRunes,
      };
    });

    results.sort((a, b) => {
      if (a.canCraft !== b.canCraft) return a.canCraft ? -1 : 1;
      if (a.missingRunes.length !== b.missingRunes.length) {
        return a.missingRunes.length - b.missingRunes.length;
      }
      return a.runewordName.localeCompare(b.runewordName);
    });

    return results;
  } catch (err) {
    console.error('getCraftableRunewords failed', err);
    throw err;
  }
}
