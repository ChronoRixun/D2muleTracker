import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/lib/theme';
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
      <Text style={styles.text}>
        {compact ? realm.name : `${realm.name} · ${parts.join(' ')}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderHi,
    backgroundColor: colors.bgSoft,
    alignSelf: 'flex-start',
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
