// Ember · Abyssal — design tokens
// Single source of truth for color, type, spacing, motion.

window.EMBER_TOKENS = {
  color: {
    // ground
    void:      '#030201',   // deepest black, behind everything
    bg:        '#070403',   // screen background
    bgSoft:    '#0d0705',   // raised background
    card:      '#130906',   // card / surface
    cardHi:    '#1c0d08',   // hovered / selected card
    // lines
    line:      '#2a1408',
    lineHi:    '#3d1e0c',
    lineGold:  '#5a3a18',
    // ink
    text:      '#f0d8b8',
    textDim:   '#9a7a5c',
    textMute:  '#5a4030',
    textFaint: '#3a2a1f',
    // accents
    gold:      '#e8b048',
    goldDim:   '#8a5018',
    ember:     '#ff5020',
    emberHi:   '#ff8038',
    emberDim:  '#b03810',
    lava:      '#c83018',
    ash:       '#6a5040',
    // rarity (D2 classic — reference only, not lifted assets)
    unique:    '#d4a050',   // gold-amber
    set:       '#6aae4a',   // emerald
    runeword:  '#bfa478',   // bone
    rune:      '#ff6a2a',   // ember
    gem:       '#6aa8d9',   // cold blue
    magic:     '#5a7acc',   // arcane
    rare:      '#e8d048',   // yellow
    base:      '#f0d8b8',   // off-white
    misc:      '#9a7a5c',
    crafted:   '#d48a3a',
    ethereal:  '#a090c0',   // ghostly lavender
    // semantic
    danger:    '#e04040',
    success:   '#6aae4a',
  },
  font: {
    display: '"Cinzel", "Trajan Pro", Georgia, serif',
    body:    '"Inter", -apple-system, system-ui, sans-serif',
    mono:    '"JetBrains Mono", ui-monospace, Menlo, monospace',
    hand:    '"Cormorant Garamond", Georgia, serif',
  },
  size: {
    // spacing
    xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
  },
  motion: {
    subtle:   { ember: 0.4, particles: 0, pulse: false },
    full:     { ember: 1.0, particles: 1, pulse: true  },
  },
};

window.ET = window.EMBER_TOKENS;
window.rarityColor = (c) => window.EMBER_TOKENS.color[c] || window.EMBER_TOKENS.color.text;

// Global keyframes injected once
if (!document.getElementById('ember-keyframes')) {
  const s = document.createElement('style');
  s.id = 'ember-keyframes';
  s.textContent = `
    @keyframes ember-float {
      0%   { transform: translateY(0) translateX(0); opacity: 0; }
      15%  { opacity: 0.9; }
      85%  { opacity: 0.6; }
      100% { transform: translateY(-120px) translateX(var(--drift, 20px)); opacity: 0; }
    }
    @keyframes ember-pulse {
      0%, 100% { opacity: 0.9; filter: brightness(1); }
      50%      { opacity: 1;   filter: brightness(1.3); }
    }
    @keyframes ember-glow-pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(255,80,32,0.35), inset 0 0 12px rgba(255,80,32,0.1); }
      50%      { box-shadow: 0 0 28px rgba(255,80,32,0.55), inset 0 0 18px rgba(255,80,32,0.18); }
    }
    @keyframes ember-lava-flow {
      0%   { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    @keyframes ember-text-flicker {
      0%, 100% { text-shadow: 0 0 12px rgba(255,80,32,0.5); }
      50%      { text-shadow: 0 0 20px rgba(255,80,32,0.75), 0 0 4px rgba(255,120,60,0.4); }
    }
  `;
  document.head.appendChild(s);
}
