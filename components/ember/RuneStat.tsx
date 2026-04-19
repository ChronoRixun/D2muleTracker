/**
 * RuneStat — big colored number with a small mono uppercase label.
 *
 * Used in the Forge hero panel grid: REALMS · MULES · ITEMS · RUNES.
 * The number glows in its color via text-shadow.
 */

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, typography } from '@/lib/theme';

interface Props {
  value: number | string;
  label: string;
  color?: string;
  big?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function RuneStat({ value, label, color, big, style }: Props) {
  const c = color ?? colors.gold;
  return (
    <View style={style}>
      <Text
        style={[
          styles.value,
          {
            fontSize: big ? 32 : 22,
            color: c,
            textShadowColor: `${c}66`,
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    fontFamily: typography.displaySemi,
    fontWeight: '700',
    lineHeight: 32,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 8,
    letterSpacing: 2,
    color: colors.textDim,
    marginTop: 4,
    textTransform: 'uppercase',
  },
});
