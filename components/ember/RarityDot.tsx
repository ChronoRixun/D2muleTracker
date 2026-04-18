/**
 * Rarity dot — tiny glowing circle. Drives the "color-as-language" metric
 * used in rarity-count strips and row bullets.
 */

import { View } from 'react-native';
import { rarityColor } from '@/lib/theme';

interface Props {
  rarity: string;
  size?: number;
}

export function RarityDot({ rarity, size = 8 }: Props) {
  const c = rarityColor(rarity);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c,
        shadowColor: c,
        shadowOpacity: 0.9,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
      }}
    />
  );
}
