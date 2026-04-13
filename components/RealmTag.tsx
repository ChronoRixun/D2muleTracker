import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius } from '@/lib/theme';
import type { Realm } from '@/lib/types';

const ERA_LABEL: Record<Realm['era'], string> = {
  classic: 'Classic',
  lod: 'LoD',
  rotw: 'RoTW',
};

const REGION_LABEL: Record<NonNullable<Realm['region']>, string> = {
  americas: 'AM',
  europe: 'EU',
  asia: 'AS',
};

export function RealmTag({ realm, compact = false }: { realm: Realm; compact?: boolean }) {
  const parts = [
    ERA_LABEL[realm.era],
    realm.mode === 'hardcore' ? 'HC' : 'SC',
    realm.ladder === 'ladder' ? 'Ladder' : 'NL',
  ];
  if (realm.region) parts.push(REGION_LABEL[realm.region]);
  return (
    <View style={[styles.tag, compact && styles.compact]}>
      <Text style={styles.text}>{compact ? realm.name : `${realm.name} · ${parts.join(' ')}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
});
