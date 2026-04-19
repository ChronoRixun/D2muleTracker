/**
 * ChronicleHeading — section header used by the Forge tab:
 *   <Diamond> <LABEL · count?> <fading line>  <right?>
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Diamond } from '@/components/ember/Diamond';
import { colors, typography } from '@/lib/theme';

interface Props {
  label: string;
  color?: string;
  count?: number;
  right?: ReactNode;
}

export function ChronicleHeading({ label, color = colors.gold, count, right }: Props) {
  return (
    <View style={styles.row}>
      <Diamond size={6} color={color} />
      <Text style={[styles.label, { color }]}>
        {label}
        {count != null ? ` · ${count}` : ''}
      </Text>
      <View style={styles.line}>
        <LinearGradient
          colors={[colors.borderHi, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  line: {
    flex: 1,
    height: 1,
  },
});
