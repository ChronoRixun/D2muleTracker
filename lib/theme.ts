/**
 * Dark gothic theme inspired by D2's in-game palette.
 */

export const colors = {
  bg: '#0f0f1a',
  bgElevated: '#16213e',
  card: '#1c1c3a',
  border: '#2a2a4a',
  text: '#e0e0e0',
  textMuted: '#8a8aa0',
  textDim: '#5a5a70',

  // Item category colors match D2 in-game text
  unique: '#c9a84c',
  set: '#00b300',
  runeword: '#b0a080',
  base: '#e0e0e0',
  magic: '#6666ff',
  rare: '#ffff00',
  misc: '#b0a080',
  gem: '#9ad',
  rune: '#ff8040',

  // UI accents
  primary: '#c9a84c',
  danger: '#b04040',
  success: '#60a060',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
};

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
