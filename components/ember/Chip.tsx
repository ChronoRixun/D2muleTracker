/**
 * Chip — pill-shaped toggle/badge. Active = filled with color + dark text;
 * inactive = transparent with colored outline + colored mono text.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, rarityColor, typography } from '@/lib/theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
  rarity?: string;
  size?: 'sm' | 'md';
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'radio' | 'checkbox';
}

export function Chip({
  label,
  active,
  onPress,
  color,
  rarity,
  size = 'md',
  accessibilityLabel,
  accessibilityRole = 'button',
}: Props) {
  const c = color ?? (rarity ? rarityColor(rarity) : colors.gold);
  const pad = size === 'sm'
    ? { paddingHorizontal: 9, paddingVertical: 3, fontSize: 9, letterSpacing: 1.2 }
    : { paddingHorizontal: 12, paddingVertical: 5, fontSize: 10, letterSpacing: 1.5 };

  const body = (
    <View
      style={[
        styles.base,
        {
          paddingHorizontal: pad.paddingHorizontal,
          paddingVertical: pad.paddingVertical,
          backgroundColor: active ? c : 'transparent',
          borderColor: active ? c : `${c}99`,
          shadowColor: c,
          shadowOpacity: active ? 0.4 : 0,
          shadowRadius: active ? 10 : 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: active ? 4 : 0,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: typography.monoBold,
          fontSize: pad.fontSize,
          letterSpacing: pad.letterSpacing,
          textTransform: 'uppercase',
          color: active ? '#120905' : c,
        }}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? `Filter by ${label}`}
      accessibilityState={{ selected: !!active }}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
