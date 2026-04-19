/**
 * RiteRow — labelled row inside the RITES anvil panel.
 *
 *   [Label]               [control]
 *   italic hint
 *   ─────────────────────  (omitted on `last`)
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/lib/theme';

interface Props {
  label: string;
  hint?: string;
  control: ReactNode;
  last?: boolean;
}

export function RiteRow({ label, hint, control, last }: Props) {
  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {control}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  hint: {
    fontFamily: typography.hand,
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },
});
