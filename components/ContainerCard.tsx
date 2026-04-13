import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

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
  onArchive?: () => void;
}

export function ContainerCard({
  container,
  itemCount,
  onPress,
  onLongPress,
  onArchive,
}: Props) {
  const isStash = container.type === 'shared_stash';
  const badge = isStash
    ? 'STH'
    : container.class
      ? CLASS_GLYPH[container.class] ?? '?'
      : '?';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    onPress?.();
  };

  const renderRightActions = () => (
    <Pressable style={styles.archiveBtn} onPress={onArchive}>
      <Text style={styles.archiveText}>Archive</Text>
    </Pressable>
  );

  const card = (
    <Pressable
      onPress={handlePress}
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
      <Text style={styles.moreHint}>⋯</Text>
    </Pressable>
  );

  if (onArchive) {
    return (
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        overshootRight={false}
      >
        {card}
      </ReanimatedSwipeable>
    );
  }

  return card;
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
  moreHint: {
    color: colors.textDim,
    fontSize: fontSize.md,
    marginLeft: spacing.xs,
  },
  archiveBtn: {
    backgroundColor: '#b07d20',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
    marginRight: spacing.lg,
  },
  archiveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
});
