/**
 * Ember · Abyssal theme — D2 canonical rarity colors over a charred hellforge palette.
 * Source of truth: Hoard/ember/tokens.jsx
 */

export const colors = {
  // ground
  void: '#030201',
  bg: '#070403',
  bgSoft: '#0d0705',
  bgElevated: '#0d0705',
  card: '#130906',
  cardHi: '#1c0d08',

  // lines
  border: '#2a1408',
  borderHi: '#3d1e0c',
  borderGold: '#5a3a18',

  // ink
  text: '#f0d8b8',
  textSecondary: '#9a7a5c',
  textMuted: '#9a7a5c',
  textDim: '#5a4030',
  textFaint: '#3a2a1f',

  // accents
  primary: '#e8b048', // gold
  primaryDim: '#8a5018',
  gold: '#e8b048',
  goldDim: '#8a5018',
  ember: '#ff5020',
  emberHi: '#ff8038',
  emberDim: '#b03810',
  lava: '#c83018',
  ash: '#6a5040',

  // rarity (D2 canonical)
  unique: '#d4a050',
  set: '#6aae4a',
  runeword: '#bfa478',
  rune: '#ff6a2a',
  gem: '#6aa8d9',
  magic: '#5a7acc',
  rare: '#e8d048',
  base: '#f0d8b8',
  misc: '#9a7a5c',
  crafted: '#d48a3a',
  ethereal: '#a090c0',

  // semantic
  danger: '#e04040',
  success: '#6aae4a',
} as const;

export const typography = {
  display: 'Cinzel-Bold',
  displaySemi: 'Cinzel-SemiBold',
  hand: 'CormorantGaramond-Italic',
  mono: 'JetBrainsMono-Regular',
  monoBold: 'JetBrainsMono-Bold',
  body: undefined as string | undefined, // falls back to system font
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
} as const;

export function rarityColor(rarity: string): string {
  return (colors as Record<string, string>)[rarity] ?? colors.text;
}

export function categoryColor(category: string): string {
  switch (category) {
    case 'unique':
      return colors.unique;
    case 'set':
      return colors.set;
    case 'runeword':
      return colors.runeword;
    case 'rune':
      return colors.rune;
    case 'gem':
      return colors.gem;
    case 'misc':
      return colors.misc;
    case 'base':
    default:
      return colors.base;
  }
}
