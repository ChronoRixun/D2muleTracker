/**
 * Horizontal divider with centered twin diamonds and optional mono eyebrow.
 * Used to break long scrolling screens into ritual sections.
 */

import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, typography } from '@/lib/theme';
import { Diamond } from './Diamond';

interface Props {
  label?: string;
  accent?: string;
  style?: ViewStyle;
}

export function Rule({ label, accent = colors.ember, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <LinearGradient
        colors={['transparent', colors.goldDim]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
      <Diamond size="sm" color={accent} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Diamond size="sm" color={accent} />
      <LinearGradient
        colors={[colors.goldDim, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  line: {
    flex: 1,
    height: 1,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
