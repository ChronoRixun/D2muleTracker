import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/lib/theme';
import type { Container } from '@/lib/types';

const CLASS_GLYPH: Record<string, string> = {
  amazon: 'Ama',
  sorceress: 'Sor',
  necromancer: 'Nec',
  paladin: 'Pal',
  barbarian: 'Bar',
  druid: 'Dru',
  assassin: 'Sin',
  warlock: 'Wlk',
};

interface Props {
  container: Container;
  itemCount: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ContainerCard({
  container,
  itemCount,
  onPress,
  onLongPress,
}: Props) {
  const isStash = container.type === 'shared_stash';
  const badge = isStash
    ? 'STH'
    : container.class
      ? CLASS_GLYPH[container.class] ?? '?'
      : '?';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.glyph}>
        <Text style={styles.glyphText}>{badge}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {container.name}
        </Text>
        <Text style={styles.meta}>
          {isStash
            ? 'Shared Stash'
            : `${container.class ?? 'Unknown'} · Lv ${container.level ?? '?'}`}
        </Text>
      </View>
      <View style={styles.count}>
        <Text style={styles.countNum}>{itemCount}</Text>
        <Text style={styles.countLabel}>items</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  glyph: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  glyphText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  count: {
    alignItems: 'flex-end',
    minWidth: 48,
  },
  countNum: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  countLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
  },
});
