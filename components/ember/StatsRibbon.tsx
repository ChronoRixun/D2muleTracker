/**
 * Hoard dashboard ribbon — four stats separated by twin-diamond dividers.
 * Appears at the top of the Mules tab.
 */

import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/lib/theme';
import { Diamond } from './Diamond';

interface Stat {
  label: string;
  value: string | number;
  color?: string;
}

interface Props {
  stats: Stat[];
}

export function StatsRibbon({ stats }: Props) {
  return (
    <View style={styles.wrap}>
      {stats.map((s, i) => (
        <View key={s.label} style={styles.cellRow}>
          <View style={styles.cell}>
            <Text style={[styles.value, { color: s.color ?? colors.gold }]}>
              {s.value}
            </Text>
            <Text style={styles.label}>{s.label.toUpperCase()}</Text>
          </View>
          {i < stats.length - 1 ? (
            <Diamond size="sm" color={colors.emberDim} glow={false} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderHi,
    backgroundColor: colors.bgSoft,
    gap: 4,
  },
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  cell: {
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontFamily: typography.displaySemi,
    fontSize: 20,
    letterSpacing: 2,
  },
  label: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 2,
  },
});
