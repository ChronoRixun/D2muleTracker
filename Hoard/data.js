// Shared sample data for all three designs.
window.SAMPLE_MULES = [
  { realm: 'RoTW S4 SC Ladder', realmShort: 'RoTW · SC · LADDER', region: 'Americas', items: 112, containers: [
    { name: 'RuneMule01',   cls: 'Sorceress',   lvl: 1,  items: 24, type: 'char',  tag: 'Sor' },
    { name: 'GemHoarder',   cls: 'Paladin',     lvl: 8,  items: 31, type: 'char',  tag: 'Pal' },
    { name: 'Shared Stash T1', cls: null,       lvl: null, items: 42, type: 'stash', tag: 'STH' },
    { name: 'UniqueBank',   cls: 'Necromancer', lvl: 3,  items: 15, type: 'char',  tag: 'Nec' },
  ]},
  { realm: 'LoD NL Softcore', realmShort: 'LoD · SC · NON-LADDER', region: 'Europe', items: 48, containers: [
    { name: 'ArchiveOne',   cls: 'Barbarian',   lvl: 1, items: 28, type: 'char',  tag: 'Bar' },
    { name: 'Shared Stash', cls: null,          lvl: null, items: 20, type: 'stash', tag: 'STH' },
  ]},
];

window.SAMPLE_ITEMS = [
  { name: 'Harlequin Crest',        base: 'Shako',             cat: 'unique',   icon: 'helm',    sockets: 3, note: "20/103 life/mana, 2sk" },
  { name: 'Stone of Jordan',        base: 'Ring',              cat: 'unique',   icon: 'ring',    note: '+1 skills, +20 mana' },
  { name: 'Enigma',                 base: "Archon Plate",      cat: 'runeword', icon: 'armor',   runes: 'JahIthBer', note: '774 def · 15MDR' },
  { name: 'Tal Rasha\'s Guardianship', base: "Lacquered Plate", cat: 'set',    icon: 'armor',   note: 'gg roll' },
  { name: 'Heart of the Oak',       base: 'Flail',             cat: 'runeword', icon: 'mace',    runes: 'KoVexPulThul', note: '40 FCR base' },
  { name: 'Ber Rune',               base: '',                  cat: 'rune',     icon: 'rune',    note: '×2' },
  { name: 'Perfect Topaz',          base: '',                  cat: 'gem',      icon: 'gem',     note: '×7' },
  { name: 'Arachnid Mesh',          base: 'Spiderweb Sash',    cat: 'unique',   icon: 'belt',    note: '+1 skills, +20 FCR' },
  { name: 'Call to Arms',           base: 'Crystal Sword',     cat: 'runeword', icon: 'sword',   runes: 'AmnRalMalIstOhm', note: '5 BO' },
  { name: "Mara's Kaleidoscope",    base: 'Amulet',            cat: 'unique',   icon: 'amulet',  note: '29 all res' },
];

window.SAMPLE_HITS = [
  { name: 'Harlequin Crest', base: 'Shako', cat: 'unique', icon: 'helm', container: 'RuneMule01', realm: 'RoTW', note: '20/103 life/mana, 2sk' },
  { name: 'Heart of the Oak', base: 'Flail', cat: 'runeword', icon: 'mace', container: 'GemHoarder', realm: 'RoTW', note: '40 FCR base' },
  { name: 'Shako',           base: 'Harlequin Crest base', cat: 'base', icon: 'helm', container: 'Shared Stash T1', realm: 'RoTW', note: '3os clean' },
];
