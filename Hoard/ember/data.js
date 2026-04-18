// Extended sample data for the Ember full-app prototype.
// Realistic D2 mule tracker content — realms, mules, items across categories, runes, wishlist, trades.

window.SAMPLE_MULES = [
  { realm: 'RoTW S4 SC Ladder', realmShort: 'RoTW · SC · LADDER', region: 'Americas', items: 112, containers: [
    { id:'m-runemule01', name: 'RuneMule01',   cls: 'Sorceress',   lvl: 1,  items: 24, type: 'char',  tag: 'Sor', lastTouched: 'today' },
    { id:'m-gemhoarder', name: 'GemHoarder',   cls: 'Paladin',     lvl: 8,  items: 31, type: 'char',  tag: 'Pal', lastTouched: '2d ago' },
    { id:'m-stasht1',    name: 'Shared Stash T1', cls: null,       lvl: null, items: 42, type: 'stash', tag: 'STH', lastTouched: 'today' },
    { id:'m-uniquebank', name: 'UniqueBank',   cls: 'Necromancer', lvl: 3,  items: 15, type: 'char',  tag: 'Nec', lastTouched: '1w ago' },
  ]},
  { realm: 'LoD NL Softcore', realmShort: 'LoD · SC · NON-LADDER', region: 'Europe', items: 48, containers: [
    { id:'m-archive1',   name: 'ArchiveOne',   cls: 'Barbarian',   lvl: 1, items: 28, type: 'char',  tag: 'Bar', lastTouched: '3w ago' },
    { id:'m-sharedstash',name: 'Shared Stash', cls: null,          lvl: null, items: 20, type: 'stash', tag: 'STH', lastTouched: '3w ago' },
  ]},
];

window.SAMPLE_ITEMS = [
  { name: 'Harlequin Crest',           base: 'Shako',             cat: 'unique',   icon: 'helm',    sockets: 3, note: "20/103 life/mana, 2sk" },
  { name: 'Stone of Jordan',           base: 'Ring',              cat: 'unique',   icon: 'ring',    note: '+1 skills, +20 mana' },
  { name: 'Enigma',                    base: 'Archon Plate',      cat: 'runeword', icon: 'armor',   runes: 'Jah·Ith·Ber', note: '774 def · 15MDR' },
  { name: "Tal Rasha's Guardianship",  base: 'Lacquered Plate',   cat: 'set',      icon: 'armor',   note: 'gg roll' },
  { name: 'Heart of the Oak',          base: 'Flail',             cat: 'runeword', icon: 'mace',    runes: 'Ko·Vex·Pul·Thul', note: '40 FCR base' },
  { name: 'Ber Rune',                  base: '',                  cat: 'rune',     icon: 'rune',    note: '×2' },
  { name: 'Perfect Topaz',             base: '',                  cat: 'gem',      icon: 'gem',     note: '×7' },
  { name: 'Arachnid Mesh',             base: 'Spiderweb Sash',    cat: 'unique',   icon: 'belt',    note: '+1 skills, +20 FCR' },
  { name: 'Call to Arms',              base: 'Crystal Sword',     cat: 'runeword', icon: 'sword',   runes: 'Amn·Ral·Mal·Ist·Ohm', note: '5 BO' },
  { name: "Mara's Kaleidoscope",       base: 'Amulet',            cat: 'unique',   icon: 'amulet',  note: '29 all res' },
];

window.SAMPLE_HITS = [
  { name: 'Harlequin Crest', base: 'Shako',         cat: 'unique',   icon: 'helm', container: 'RuneMule01',       realm: 'RoTW', note: '20/103 life/mana, 2sk' },
  { name: 'Heart of the Oak', base: 'Flail',         cat: 'runeword', icon: 'mace', container: 'GemHoarder',       realm: 'RoTW', note: '40 FCR base' },
  { name: 'Shako',           base: 'Harlequin Crest base', cat: 'base', icon: 'helm', container: 'Shared Stash T1', realm: 'RoTW', note: '3os clean' },
];

// Runes — counts across all mules. Order is D2 canonical (El → Zod).
window.RUNE_LIST = [
  ['El',1], ['Eld',3], ['Tir',2], ['Nef',4], ['Eth',2],
  ['Ith',5], ['Tal',2], ['Ral',3], ['Ort',4], ['Thul',2],
  ['Amn',2], ['Sol',3], ['Shael',4], ['Dol',1], ['Hel',2],
  ['Io',2], ['Lum',1], ['Ko',2], ['Fal',1], ['Lem',1],
  ['Pul',2], ['Um',1], ['Mal',1], ['Ist',2], ['Gul',1],
  ['Vex',0], ['Ohm',1], ['Lo',0], ['Sur',0], ['Ber',2],
  ['Jah',0], ['Cham',1], ['Zod',0],
];

// Runewords to plan for — base + required runes
window.RUNEWORDS = [
  { name: 'Enigma',          base: '3os body armor',       runes: ['Jah','Ith','Ber'],         have: [false,true,true],   slot: 'Body' },
  { name: 'Call to Arms',    base: '5os weapon',            runes: ['Amn','Ral','Mal','Ist','Ohm'], have: [true,true,true,true,true], slot: 'Weapon' },
  { name: 'Infinity',        base: '4os polearm',           runes: ['Ber','Mal','Ber','Ist'],   have: [true,true,false,true], slot: 'Weapon' },
  { name: 'Spirit',          base: '4os sword / shield',    runes: ['Tal','Thul','Ort','Amn'],  have: [true,true,true,true], slot: 'Weapon' },
  { name: 'Grief',           base: '5os sword / axe',       runes: ['Eth','Tir','Lo','Mal','Ral'], have: [true,true,false,true,true], slot: 'Weapon' },
  { name: 'Fortitude',       base: '4os weapon / armor',    runes: ['El','Sol','Dol','Lo'],     have: [true,true,true,false], slot: 'Body' },
];

// Wishlist
window.WISHLIST = [
  { name: 'Jah Rune',             cat: 'rune',     priority: 'high',   note: 'for Enigma' },
  { name: 'Lo Rune',               cat: 'rune',     priority: 'high',   note: 'for Grief / Fort' },
  { name: 'Vex Rune',             cat: 'rune',     priority: 'med',    note: 'Heart of Oak backup' },
  { name: 'Death\'s Fathom',      cat: 'unique',   priority: 'high',   note: '+3 cold skills' },
  { name: 'Griffon\'s Eye',       cat: 'unique',   priority: 'med',    note: '-lightres / +light skills' },
  { name: 'Crown of Ages',         cat: 'unique',   priority: 'low',    note: 'PDR helm' },
  { name: 'Cham Rune',            cat: 'rune',     priority: 'low',    note: 'CBF source' },
];

// Trade log
window.TRADES = [
  { id:'t1', dir:'in',  partner:'Iceborn#2401',    item:'Ber Rune',             gave:'Ohm + Vex + Um',       when:'2h ago',   realm:'RoTW' },
  { id:'t2', dir:'out', partner:'MrStinky',        item:'Shako (3os)',           gave:'—',                    when:'yesterday', realm:'RoTW', note:'friend, gifted' },
  { id:'t3', dir:'in',  partner:'Necropolis',      item:'Arachnid Mesh',         gave:'Pul + Um',             when:'3d ago',   realm:'RoTW' },
  { id:'t4', dir:'out', partner:'Hex',             item:'Mal Rune',              gave:'got: 2x Ist',          when:'1w ago',   realm:'LoD NL' },
  { id:'t5', dir:'in',  partner:'AuraMancer',      item:"Mara's (29 allres)",    gave:'Ber + Lem',            when:'2w ago',   realm:'RoTW' },
];

// Recent drops (for dashboard)
window.RECENT_DROPS = [
  { name: 'Harlequin Crest', cat: 'unique',   container: 'RuneMule01',  when: '12m ago', note: '20/103 roll' },
  { name: 'Ber Rune',        cat: 'rune',     container: 'RuneMule01',  when: '2h ago' },
  { name: 'Enigma crafted',  cat: 'runeword', container: 'RuneMule01',  when: 'today',   note: 'Archon 774 def' },
  { name: 'Perfect Topaz',   cat: 'gem',      container: 'Shared Stash T1', when: 'today' },
];
