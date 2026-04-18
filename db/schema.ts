/**
 * SQLite schema for D2 Mule Tracker. Applied via migrations.ts.
 */

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS realms (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  era         TEXT NOT NULL,
  mode        TEXT NOT NULL,
  ladder      TEXT NOT NULL,
  region      TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS containers (
  id          TEXT PRIMARY KEY,
  realm_id    TEXT NOT NULL REFERENCES realms(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL,
  class       TEXT,
  level       INTEGER,
  is_active   INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id              TEXT PRIMARY KEY,
  container_id    TEXT NOT NULL REFERENCES containers(id) ON DELETE CASCADE,
  item_index_id   TEXT NOT NULL,
  notes           TEXT,
  quantity        INTEGER NOT NULL DEFAULT 1,
  location        TEXT,
  sockets         INTEGER,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_container   ON items(container_id);
CREATE INDEX IF NOT EXISTS idx_items_item_index  ON items(item_index_id);
CREATE INDEX IF NOT EXISTS idx_containers_realm  ON containers(realm_id);

CREATE TABLE IF NOT EXISTS item_tags (
  id         TEXT PRIMARY KEY,
  item_id    TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(item_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag     ON item_tags(tag);
`;

export const DB_NAME = 'd2muletracker.db';
export const CURRENT_SCHEMA_VERSION = 3;
