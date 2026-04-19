/**
 * RealmTagStrip — mini colored chips for era · mode · ladder · region.
 *
 * Replaces the single dim "RoTW · SC · Ladder · AM" pill on the Forge tab
 * with four discrete pills, each in a per-axis accent color. Region chip is
 * omitted when null. Colors are intentionally hard-coded here (private to
 * this component) — not promoted to theme tokens unless reused elsewhere.
 */

import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/lib/theme';
import type { Era, Ladder, Mode, Region } from '@/lib/types';

interface TagSpec {
  label: string;
  color: string;
}

const REALM_TAG_COLORS: {
  era: Record<Era, TagSpec>;
  mode: Record<Mode, TagSpec>;
  ladder: Record<Ladder, TagSpec>;
  region: Record<NonNullable<Region>, TagSpec>;
} = {
  era: {
    classic: { label: 'Classic', color: '#9a7a5c' },
    lod: { label: 'LoD', color: '#bfa478' },
    rotw: { label: 'RoTW', color: '#e8b048' },
  },
  mode: {
    softcore: { label: 'SC', color: '#6aa8d9' },
    hardcore: { label: 'HC', color: '#e04040' },
  },
  ladder: {
    ladder: { label: 'Ladder', color: '#ff5020' },
    nonladder: { label: 'Non-Ladder', color: '#9a7a5c' },
  },
  region: {
    americas: { label: 'AMS', color: '#6aae4a' },
    europe: { label: 'EU', color: '#6aa8d9' },
    asia: { label: 'ASIA', color: '#a090c0' },
  },
};

interface Props {
  era: Era;
  mode: Mode;
  ladder: Ladder;
  region: Region;
  size?: 'sm' | 'md';
}

export function RealmTagStrip({ era, mode, ladder, region, size = 'md' }: Props) {
  const tags: TagSpec[] = [
    REALM_TAG_COLORS.era[era],
    REALM_TAG_COLORS.mode[mode],
    REALM_TAG_COLORS.ladder[ladder],
  ];
  if (region) tags.push(REALM_TAG_COLORS.region[region]);

  const fs = size === 'sm' ? 8 : 9;
  const padV = size === 'sm' ? 2 : 3;
  const padH = size === 'sm' ? 5 : 7;

  return (
    <View style={styles.row}>
      {tags.map((t, i) => (
        <View
          key={i}
          style={{
            paddingVertical: padV,
            paddingHorizontal: padH,
            borderWidth: 1,
            borderColor: `${t.color}66`,
            backgroundColor: `${t.color}10`,
          }}
        >
          <Text
            style={[
              styles.text,
              { color: t.color, fontSize: fs },
            ]}
          >
            {t.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  text: {
    fontFamily: typography.monoBold,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
