import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Diamond } from '@/components/ember/Diamond';
import { colors, typography } from '@/lib/theme';
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
  const accent = isStash ? colors.gold : colors.ember;
  const meta = isStash
    ? 'SHARED STASH'
    : `${(CLASS_GLYPH[container.class ?? ''] ?? '???').toUpperCase()} · LV ${container.level ?? '?'}`;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    onPress?.();
  };

  const renderRightActions = () => (
    <Pressable
      style={styles.archiveBtn}
      onPress={onArchive}
      accessibilityRole="button"
      accessibilityLabel={`Archive ${container.name}`}
    >
      <Text style={styles.archiveText}>ARCHIVE</Text>
    </Pressable>
  );

  const typeLabel = isStash ? 'shared stash' : 'mule';
  const a11yLabel = isStash
    ? `${container.name}, shared stash, ${itemCount} items`
    : `${container.name}, ${container.class ?? 'unknown'} level ${container.level ?? 'unset'}, ${itemCount} items`;

  const card = (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint={`Open ${typeLabel} detail`}
      accessibilityActions={
        onArchive ? [{ name: 'activate' }, { name: 'longpress' }] : undefined
      }
      onAccessibilityAction={
        onArchive
          ? (event) => {
              if (event.nativeEvent.actionName === 'longpress') onArchive();
            }
          : undefined
      }
      style={({ pressed }) => [
        styles.card,
        { borderColor: isStash ? colors.goldDim : colors.borderHi },
        pressed && styles.pressed,
      ]}
    >
      <Diamond size="md" color={accent} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {container.name}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <View style={styles.count}>
        <Text style={[styles.countNum, { color: accent }]}>
          {String(itemCount).padStart(2, '0')}
        </Text>
        <Text style={styles.countLabel}>ITEMS</Text>
      </View>
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
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginVertical: 4,
    backgroundColor: colors.card,
    borderRadius: 4,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.82,
    backgroundColor: colors.cardHi,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontFamily: typography.displaySemi,
    fontSize: 16,
    letterSpacing: 1.5,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  count: {
    alignItems: 'flex-end',
  },
  countNum: {
    fontFamily: typography.monoBold,
    fontSize: 16,
    letterSpacing: 1,
  },
  countLabel: {
    color: colors.textDim,
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 2,
  },
  archiveBtn: {
    backgroundColor: colors.emberDim,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 4,
    marginVertical: 4,
    marginRight: 20,
  },
  archiveText: {
    color: '#fff',
    fontFamily: typography.monoBold,
    letterSpacing: 2,
    fontSize: 11,
  },
});
