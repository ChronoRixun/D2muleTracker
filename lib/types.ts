/**
 * Shared TypeScript types used across the app and build scripts.
 */

export type ItemCategory =
  | 'unique'
  | 'set'
  | 'runeword'
  | 'base'
  | 'misc'
  | 'gem'
  | 'rune';

export type Era = 'classic' | 'lod' | 'rotw';

export interface ItemEntry {
  id: string;
  name: string;
  baseName: string;
  category: ItemCategory;
  itemType: string;
  reqLevel: number;
  code: string;
  setName?: string;
  runes?: string;
  runewordTypes?: string[];
  era: Era;
  searchTerms: string[];
}

export type CharacterClass =
  | 'amazon'
  | 'sorceress'
  | 'necromancer'
  | 'paladin'
  | 'barbarian'
  | 'druid'
  | 'assassin'
  | 'warlock';

export type ContainerType = 'character' | 'shared_stash';
export type Mode = 'softcore' | 'hardcore';
export type Ladder = 'ladder' | 'nonladder';
export type Region = 'americas' | 'europe' | 'asia' | null;
export type ItemLocation = 'inventory' | 'equipped' | 'merc' | 'stash' | null;

export interface Realm {
  id: string;
  name: string;
  era: Era;
  mode: Mode;
  ladder: Ladder;
  region: Region;
  createdAt: string;
}

export interface Container {
  id: string;
  realmId: string;
  name: string;
  type: ContainerType;
  class: CharacterClass | null;
  level: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemRecord {
  id: string;
  containerId: string;
  itemIndexId: string;
  notes: string | null;
  quantity: number;
  location: ItemLocation;
  createdAt: string;
  updatedAt: string;
}

export interface ItemWithIndex extends ItemRecord {
  entry: ItemEntry;
}

export interface SearchHit {
  item: ItemRecord;
  entry: ItemEntry;
  container: Container;
  realm: Realm;
}
