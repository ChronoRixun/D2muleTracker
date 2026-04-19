// Sample data for the Forge redesigns — matches real settings.tsx state.

window.FORGE_REALMS = [
  { id:'r1', name:'RoTW S4 SC Ladder', era:'rotw', mode:'softcore', ladder:'ladder', region:'americas',
    mules: 12, items: 487, runes: 74 },
  { id:'r2', name:'LoD 1.14d Non-Ladder', era:'lod', mode:'softcore', ladder:'nonladder', region:'europe',
    mules: 4, items: 166, runes: 28 },
  { id:'r3', name:'HC Classic · Old Stash', era:'classic', mode:'hardcore', ladder:'nonladder', region:null,
    mules: 2, items: 41, runes: 3 },
];

window.FORGE_STATS = {
  realms: 3,
  mules: 18,
  items: 694,
  runes: 105,
  backupAgo: '2m ago',
  backupSize: '184 KB',
  appVersion: '1.1.2',
};

// Rarity accents (reused for realm tags)
window.REALM_TAG = {
  era: {
    classic:  { label:'Classic', color:'#9a7a5c' },
    lod:      { label:'LoD',     color:'#bfa478' },
    rotw:     { label:'RoTW',    color:'#e8b048' },
  },
  mode: {
    softcore: { label:'SC',  color:'#6aa8d9' },
    hardcore: { label:'HC',  color:'#e04040' },
  },
  ladder: {
    ladder:    { label:'Ladder',    color:'#ff5020' },
    nonladder: { label:'Non-Ladder', color:'#9a7a5c' },
  },
  region: {
    americas: { label:'AMS', color:'#6aae4a' },
    europe:   { label:'EU',  color:'#6aa8d9' },
    asia:     { label:'ASIA',color:'#a090c0' },
  },
};
