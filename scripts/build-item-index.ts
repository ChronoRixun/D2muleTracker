/**
 * Builds the bundled item-index.json used by the app for autocomplete
 * and display-name lookups. Fetches source JSON from blizzhackers/d2data
 * on GitHub, flattens into a single searchable array and writes to
 * assets/data/item-index.json.
 *
 * Run via: npm run build:item-index
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import type { Era, ItemCategory, ItemEntry } from '../lib/types';

const REPO_RAW = 'https://raw.githubusercontent.com/blizzhackers/d2data/master/json';
const CACHE_DIR = path.join(__dirname, '.cache');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'data');
const OUT_FILE = path.join(OUT_DIR, 'item-index.json');

const SOURCES = [
  'uniqueitems.json',
  'setitems.json',
  'sets.json',
  'runes.json',
  'items.json',
  'armor.json',
  'weapons.json',
  'misc.json',
  'allstrings-eng.json',
] as const;

type SourceName = (typeof SOURCES)[number];

async function fetchJson(name: SourceName): Promise<any> {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cached = path.join(CACHE_DIR, name);
  if (fs.existsSync(cached)) {
    return JSON.parse(fs.readFileSync(cached, 'utf8'));
  }
  const url = `${REPO_RAW}/${name}`;
  console.log(`  fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(cached, text);
  return JSON.parse(text);
}

// ---- Era detection --------------------------------------------------------

// Item base codes that signal RoTW content (grimoires, renewed/latent sunders,
// Colossal Ancient jewels, new weapon bases, etc.). The blizzhackers data
// uses `version: 101` for RoTW additions in most files, but we keep a
// keyword-based fallback for the uniques/setitems whose names are the
// canonical signal.
const ROTW_NAME_KEYWORDS = [
  'grimoire',
  'renewed',
  'latent',
  'colossal ancient',
  'opalvein',
  'sling',
  'hellwarden',
  'dreadfang',
  'wraithstep',
  'warlock',
  'bloodpact',
  'entropy locket',
  "gheed's wager",
  'measured wrath',
  "ars al'",
  "ars tor'",
  "ars dul'",
  "defender's bile",
  "defender's fire",
  "guardian's thunder",
  "guardian's light",
  "protector's frost",
  "protector's stone",
  "warlord's glory",
  "warlord's authority",
  "warlord's conquest",
  "warlord's crushers",
  "warlord's lust",
  "warlord's mantle",
];

const ROTW_RUNEWORD_NAMES = new Set([
  'coven',
  'defile',
  'dominion',
  'entropy',
  'hex',
  'omen',
  'penance',
  'pestilence',
  'reckoning',
  'ritual',
  'scourge',
  'torment',
  'vendetta',
  'woe',
  'wonder',
]);

// Item type codes (from d2data armor/weapons/misc rows) that are RoTW-only.
const ROTW_TYPE_CODES = new Set(['grim']);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Whole-word match: anchors \b only where the keyword itself starts/ends with a
// word character, so keywords containing apostrophes ("ars al'", "gheed's
// wager") still match correctly. Prevents e.g. "sling" from matching inside
// "Doomslinger".
function keywordMatches(keyword: string, text: string): boolean {
  const startAnchor = /^\w/.test(keyword) ? '\\b' : '';
  const endAnchor = /\w$/.test(keyword) ? '\\b' : '';
  const re = new RegExp(`${startAnchor}${escapeRegex(keyword)}${endAnchor}`, 'i');
  return re.test(text);
}

function detectEra(raw: {
  version?: number | string;
  expansion?: number | string;
  name?: string;
  type?: string;
}): Era {
  const version = Number(raw.version ?? 0);
  const expansion = Number(raw.expansion ?? 0);
  const name = raw.name ?? '';
  const typeLc = (raw.type ?? '').toLowerCase();

  if (
    version >= 101 ||
    (typeLc && ROTW_TYPE_CODES.has(typeLc)) ||
    ROTW_NAME_KEYWORDS.some((k) => keywordMatches(k, name))
  ) {
    return 'rotw';
  }
  if (expansion === 1 || version === 100) return 'lod';
  return 'classic';
}

// ---- Display name resolution ---------------------------------------------

interface Strings {
  [key: string]: string;
}

function buildStringLookup(
  allstrings: Array<{ Key: string; enUS?: string; id?: string | number }>,
): Strings {
  // The d2data allstrings file is an array of { Key, enUS, ... }.
  const out: Strings = {};
  for (const row of allstrings) {
    if (row && row.Key && row.enUS) out[row.Key] = row.enUS;
  }
  return out;
}

function resolveName(raw: any, strings: Strings, fallback: string): string {
  const keys = [raw.name, raw.namestr, raw.index, raw.NameStr].filter(Boolean);
  for (const k of keys) {
    if (typeof k === 'string' && strings[k]) return strings[k];
  }
  return raw.name ?? raw.index ?? fallback;
}

// ---- Nickname seed map ----------------------------------------------------

const NICKNAMES: Record<string, string[]> = {
  'Harlequin Crest': ['shako', 'harly'],
  'Skin of the Vipermagi': ['vipermagi', 'vmagi', 'viper'],
  'Herald of Zakarum': ['hoz'],
  "Stone of Jordan": ['soj'],
  "Bul-Kathos' Wedding Band": ['bk', 'bkwb'],
  'Mara\u2019s Kaleidoscope': ['mara', 'maras'],
  "Mara's Kaleidoscope": ['mara', 'maras'],
  'The Stone of Jordan': ['soj'],
  'Arachnid Mesh': ['arach', 'spider'],
  'Enigma': ['enigma'],
  'Infinity': ['inf', 'infinity'],
  'Call to Arms': ['cta'],
  'Heart of the Oak': ['hoto'],
  'Spirit': ['spirit'],
  'Insight': ['insight'],
  'Grief': ['grief'],
  'Breath of the Dying': ['botd'],
  'Death': ['death'],
  'Fortitude': ['fort', 'fortitude'],
  'Chains of Honor': ['coh'],
  'Hellwarden\u2019s Will': ['hellwarden'],
  "Hellwarden's Will": ['hellwarden'],
  'War Traveler': ['wt', 'wtrav'],
  'Gore Rider': ['gores'],
  'Lightsabre': ['lightsabre', 'lsabre'],
  'Titan\u2019s Revenge': ['titans'],
  "Titan's Revenge": ['titans'],
  'Crown of Ages': ['coa'],
  'Shaftstop': ['shaft'],
  'Stormshield': ['ss', 'stormshield'],
  'Griffon\u2019s Eye': ['griffons', 'griffs'],
  "Griffon's Eye": ['griffons', 'griffs'],
  'Sling': ['sling ring'],
  'Annihilus': ['anni'],
  'Hellfire Torch': ['torch'],
  "Gheed's Fortune": ['gheeds'],
  'Gheed\u2019s Fortune': ['gheeds'],
  "Tal Rasha's Guardianship": ['tal armor', 'tals armor'],
  "Tal Rasha's Horadric Crest": ['tal helm', 'tals helm'],
  "Tal Rasha's Lidless Eye": ['tal weapon', 'tals weapon', 'tal swirl'],
  "Tal Rasha's Adjudication": ['tal ammy', 'tals ammy', 'tal amulet'],
  "Tal Rasha's Fine-Spun Cloth": ['tal belt', 'tals belt'],
  'Chance Guards': ['chancies'],
  'Magefist': ['magefist'],
  "Skullder's Ire": ['skulders', 'skullder'],
  'Skullder\u2019s Ire': ['skulders', 'skullder'],
  "Dracul's Grasp": ['dracs'],
  'Dracul\u2019s Grasp': ['dracs'],
  "Verdungo's Hearty Cord": ['verdungos'],
  'Verdungo\u2019s Hearty Cord': ['verdungos'],
  "Guillaume's Face": ['gface', 'guillames'],
  'Guillaume\u2019s Face': ['gface', 'guillames'],
  "Nightwing's Veil": ['nightwings'],
  'Nightwing\u2019s Veil': ['nightwings'],
  "Death's Fathom": ['fathom'],
  'Death\u2019s Fathom': ['fathom'],
  "Ormus' Robes": ['ormus'],
  'Ormus\u2019 Robes': ['ormus'],
  "Eschuta's Temper": ['eschutas'],
  'Eschuta\u2019s Temper': ['eschutas'],
  'Treachery': ['treachery'],
  'Flickering Flame': ['flicker'],
};

// ---- Parsers --------------------------------------------------------------

function parseObjectLike<T>(src: unknown): Array<T & { __key: string }> {
  if (Array.isArray(src)) {
    return src.map((v, i) => ({ ...(v as T), __key: String(i) }));
  }
  if (src && typeof src === 'object') {
    return Object.entries(src as Record<string, T>).map(([k, v]) => ({
      ...(v as T),
      __key: k,
    }));
  }
  return [];
}

function buildSearchTerms(name: string, baseName: string): string[] {
  const terms = new Set<string>();
  terms.add(name.toLowerCase());
  if (baseName) terms.add(baseName.toLowerCase());
  const nicks = NICKNAMES[name] ?? [];
  for (const n of nicks) terms.add(n.toLowerCase());
  // Word-level terms help with "flail" matching "Sacred Flail", etc.
  for (const part of name.toLowerCase().split(/\s+/)) {
    if (part.length >= 3) terms.add(part);
  }
  return Array.from(terms);
}

function buildBaseNameLookup(
  items: any[],
  armor: any[],
  weapons: any[],
): Record<string, string> {
  // Maps internal code (e.g. "uap") to a display base name (e.g. "Sacred Armor").
  const map: Record<string, string> = {};
  const push = (rows: any[]) => {
    for (const r of rows) {
      const code: string | undefined = r.code ?? r.Code ?? r.__key;
      const name: string | undefined = r.name ?? r.namestr ?? r.Name;
      if (code && name) map[code] = name;
    }
  };
  push(items);
  push(armor);
  push(weapons);
  return map;
}

// ---- Category-specific flatteners ----------------------------------------

function flattenUniques(
  src: any,
  strings: Strings,
  baseNames: Record<string, string>,
): ItemEntry[] {
  const rows = parseObjectLike<any>(src);
  const out: ItemEntry[] = [];
  rows.forEach((r, i) => {
    if (!r || r.enabled === 0) return;
    const code: string = r.code ?? '';
    const baseName = baseNames[code] ?? r.type ?? '';
    const name = resolveName(r, strings, `Unique ${i}`);
    const era = detectEra({
      version: r.version,
      expansion: r.expansion,
      name,
      type: r.type,
    });
    out.push({
      id: `unique-${r.__key ?? i}`,
      name,
      baseName,
      category: 'unique',
      itemType: classifyType(code, baseName),
      reqLevel: Number(r['lvl req'] ?? r.lvlReq ?? r.lvl ?? 0),
      code,
      era,
      searchTerms: buildSearchTerms(name, baseName),
    });
  });
  return out;
}

function flattenSetItems(
  src: any,
  sets: any,
  strings: Strings,
  baseNames: Record<string, string>,
): ItemEntry[] {
  const setRows = parseObjectLike<any>(sets);
  const setByIndex: Record<string, any> = {};
  for (const s of setRows) setByIndex[s.index ?? s.__key] = s;

  const rows = parseObjectLike<any>(src);
  const out: ItemEntry[] = [];
  rows.forEach((r, i) => {
    if (!r) return;
    const code: string = r.item ?? r.code ?? '';
    const baseName = baseNames[code] ?? r.type ?? '';
    const name = resolveName(r, strings, `Set Item ${i}`);
    const setKey = r.set ?? r['set name'] ?? '';
    const setInfo = setByIndex[setKey];
    const setName = setInfo
      ? resolveName(setInfo, strings, setKey)
      : typeof setKey === 'string'
        ? setKey
        : '';
    const era = detectEra({
      version: r.version,
      expansion: r.expansion,
      name,
      type: r.type,
    });
    out.push({
      id: `set-${r.__key ?? i}`,
      name,
      baseName,
      category: 'set',
      itemType: classifyType(code, baseName),
      reqLevel: Number(r['lvl req'] ?? r.lvlReq ?? r.lvl ?? 0),
      code,
      setName: setName || undefined,
      era,
      searchTerms: buildSearchTerms(name, baseName),
    });
  });
  return out;
}

function flattenRunewords(src: any, strings: Strings): ItemEntry[] {
  const rows = parseObjectLike<any>(src);
  const out: ItemEntry[] = [];
  rows.forEach((r, i) => {
    if (!r) return;
    if (Number(r.complete ?? 0) !== 1) return;
    // The object key is the display name in d2data (e.g. "Enigma"). The
    // `*Rune Name` field mirrors it; `Name` is the allstrings key ("Runeword33").
    const name: string =
      r['*Rune Name'] ?? (r.__key && r.__key !== r.Name ? r.__key : null) ??
      (strings[r.Name] ?? r.Name ?? `Runeword ${i}`);
    const runes: string = r['*RunesUsed'] ?? '';
    const types: string[] = [];
    for (let n = 1; n <= 6; n++) {
      const t = r[`itype${n}`];
      if (t) types.push(String(t));
    }
    const nameLc = name.toLowerCase();
    const era: Era =
      ROTW_RUNEWORD_NAMES.has(nameLc) ||
      ROTW_NAME_KEYWORDS.some((k) => keywordMatches(k, name))
        ? 'rotw'
        : 'lod';
    out.push({
      id: `runeword-${r.__key ?? i}`,
      name,
      baseName: types.join(', '),
      category: 'runeword',
      itemType: types[0] ?? 'runeword',
      reqLevel: Number(r.levelreq ?? r.LvlReq ?? 0),
      code: name.toLowerCase().replace(/\s+/g, '-'),
      runes,
      runewordTypes: types,
      era,
      searchTerms: buildSearchTerms(name, ''),
    });
  });
  return out;
}

function flattenMisc(src: any, strings: Strings): ItemEntry[] {
  const rows = parseObjectLike<any>(src);
  const out: ItemEntry[] = [];
  rows.forEach((r, i) => {
    if (!r) return;
    const code: string = r.code ?? r.__key;
    const name = resolveName(r, strings, r.name ?? code ?? `Misc ${i}`);
    if (!name) return;
    const type: string = r.type ?? r.code ?? '';
    const category: ItemCategory =
      /rune\d/i.test(code) || type === 'rune'
        ? 'rune'
        : /gem|skull/i.test(code) || /gem|skull/i.test(type)
          ? 'gem'
          : 'misc';
    const era = detectEra({
      version: r.version,
      expansion: r.expansion,
      name,
      type,
    });
    out.push({
      id: `misc-${code || i}`,
      name,
      baseName: name,
      category,
      itemType: classifyType(code, name),
      reqLevel: Number(r['lvl req'] ?? 0),
      code,
      era,
      searchTerms: buildSearchTerms(name, ''),
    });
  });
  return out;
}

function flattenBases(
  armor: any,
  weapons: any,
  strings: Strings,
): ItemEntry[] {
  const out: ItemEntry[] = [];
  const add = (rows: any[], kind: 'armor' | 'weapon') => {
    rows.forEach((r, i) => {
      if (!r) return;
      const code: string = r.code ?? r.Code ?? r.__key;
      if (!code) return;
      const name =
        resolveName(r, strings, r.name ?? r.namestr ?? code ?? `${kind} ${i}`);
      const era = detectEra({
        version: r.version,
        expansion: r.expansion,
        name,
        type: r.type,
      });
      out.push({
        id: `base-${kind}-${code}`,
        name,
        baseName: name,
        category: 'base',
        itemType: classifyType(code, name),
        reqLevel: Number(r.levelreq ?? r['lvl req'] ?? 0),
        code,
        era,
        searchTerms: buildSearchTerms(name, ''),
      });
    });
  };
  add(parseObjectLike<any>(armor), 'armor');
  add(parseObjectLike<any>(weapons), 'weapon');
  return out;
}

function classifyType(code: string, name: string): string {
  const lc = (name + ' ' + code).toLowerCase();
  if (/helm|cap|crown|circlet|mask|shako|tiara|diadem|casque|basinet|armet|bone visage|sallet|hood|coif|skull|bone helm/.test(lc))
    return 'helm';
  if (/ring|rin/.test(lc) && lc.length < 20) return 'ring';
  if (/amu|amulet/.test(lc)) return 'amulet';
  if (/boot|greaves/.test(lc)) return 'boots';
  if (/glove|gauntlet|bracer/.test(lc)) return 'gloves';
  if (/belt|sash|girdle/.test(lc)) return 'belt';
  if (/shield|buckler|aegis|targe|pavise|kite|tower|monarch/.test(lc))
    return 'shield';
  if (/armor|mail|plate|hauberk|cuirass|wyrmhide|archon|dusk shroud|breast/.test(lc))
    return 'armor';
  if (/bow|crossbow|arbalest/.test(lc)) return 'bow';
  if (/staff|wand|orb|sceptre|scepter/.test(lc)) return 'caster';
  if (/axe|hatchet|cleaver|tomahawk/.test(lc)) return 'axe';
  if (/sword|saber|blade|gladius|falchion|scimitar|tulwar|phase|dimensional/.test(lc))
    return 'sword';
  if (/mace|hammer|maul|flail|club|morning star|scourge/.test(lc)) return 'mace';
  if (/spear|lance|pike|glaive|poleaxe|halberd|thresher|cryptic axe/.test(lc))
    return 'polearm';
  if (/dagger|knife|dirk|kris|blade talons/.test(lc)) return 'dagger';
  if (/javelin|harpoon|pilum/.test(lc)) return 'javelin';
  if (/charm/.test(lc)) return 'charm';
  if (/jewel/.test(lc)) return 'jewel';
  if (/rune/.test(lc)) return 'rune';
  if (/gem|skull/.test(lc)) return 'gem';
  if (/potion|elixir|scroll|key/.test(lc)) return 'consumable';
  if (/grimoire/.test(lc)) return 'grimoire';
  return 'other';
}

// ---- Main -----------------------------------------------------------------

async function main() {
  console.log('Fetching d2data sources...');
  const [
    uniques,
    setitems,
    sets,
    runewords,
    items,
    armor,
    weapons,
    misc,
    allstringsRaw,
  ] = await Promise.all(SOURCES.map((s) => fetchJson(s)));

  // allstrings-eng.json is either an array or { [key]: { enUS } }.
  const allstringsArr = Array.isArray(allstringsRaw)
    ? allstringsRaw
    : Object.entries(allstringsRaw).map(([Key, v]: [string, any]) => ({
        Key,
        enUS: v.enUS ?? v,
      }));
  const strings = buildStringLookup(allstringsArr);
  console.log(`  loaded ${Object.keys(strings).length} string keys`);

  const itemRows = parseObjectLike<any>(items);
  const armorRows = parseObjectLike<any>(armor);
  const weaponRows = parseObjectLike<any>(weapons);
  const baseNames = buildBaseNameLookup(itemRows, armorRows, weaponRows);

  const uniqueEntries = flattenUniques(uniques, strings, baseNames);
  const setEntries = flattenSetItems(setitems, sets, strings, baseNames);
  const runewordEntries = flattenRunewords(runewords, strings);
  const miscEntriesRaw = flattenMisc(misc, strings);
  const baseEntries = flattenBases(armor, weapons, strings);

  // Dedup misc entries: drop any whose display name already appears as a
  // unique/set item (e.g. "Defender's Fire" Colossal Ancient jewels that come
  // through both uniqueitems.json and misc.json) or any intra-misc duplicates
  // where different internal codes share a display name (e.g. Healing Potion
  // tiers, generic "Grand Charm" / "Jewel").
  const seenNames = new Set<string>();
  for (const e of uniqueEntries) seenNames.add(e.name.toLowerCase());
  for (const e of setEntries) seenNames.add(e.name.toLowerCase());
  const miscEntries: ItemEntry[] = [];
  for (const e of miscEntriesRaw) {
    const key = e.name.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    miscEntries.push(e);
  }

  const all = [
    ...uniqueEntries,
    ...setEntries,
    ...runewordEntries,
    ...miscEntries,
    ...baseEntries,
  ];

  // Deduplicate by id (last write wins).
  const byId = new Map<string, ItemEntry>();
  for (const e of all) byId.set(e.id, e);
  const out = Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out));
  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(
    `\nWrote ${out.length} entries (${kb} KB) to ${path.relative(process.cwd(), OUT_FILE)}`,
  );
  console.log(`  uniques:   ${uniqueEntries.length}`);
  console.log(`  sets:      ${setEntries.length}`);
  console.log(`  runewords: ${runewordEntries.length}`);
  console.log(`  misc:      ${miscEntries.length}`);
  console.log(`  bases:     ${baseEntries.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
