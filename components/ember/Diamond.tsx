/**
 * Forged diamond bullet — a rotated square used as a section divider motif,
 * rarity-color indicator, or empty-state emblem.
 */

import { View, type ViewStyle } from 'react-native';
import { colors } from '@/lib/theme';

type Size = 'sm' | 'md' | 'lg' | number;

const SIZE_MAP: Record<Exclude<Size, number>, number> = {
  sm: 6,
  md: 10,
  lg: 14,
};

interface Props {
  size?: Size;
  color?: string;
  filled?: boolean;
  glow?: boolean;
  style?: ViewStyle;
}

export function Diamond({
  size = 'md',
  color = colors.gold,
  filled = true,
  glow = true,
  style,
}: Props) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];
  return (
    <View
      style={[
        {
          width: px,
          height: px,
          transform: [{ rotate: '45deg' }],
          backgroundColor: filled ? color : 'transparent',
          borderWidth: filled ? 0 : 1,
          borderColor: color,
          shadowColor: color,
          shadowOpacity: filled && glow ? 0.55 : 0,
          shadowRadius: filled && glow ? 6 : 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: filled && glow ? 3 : 0,
        },
        style,
      ]}
    />
  );
}
