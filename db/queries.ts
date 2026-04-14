import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  CharacterClass,
  Container,
  ContainerType,
  Era,
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
