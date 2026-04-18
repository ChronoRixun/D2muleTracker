import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontSize, radius } from '@/lib/theme';
import type { SetProgress } from '@/db/queries';

interface Props {
  set: SetProgress;
  onPress: () => void;
}

export function SetProgressCard({ set, onPress }: Props) {
  const percentage = set.totalPieces === 0 ? 0 : (set.ownedPieces / set.totalPieces) * 100;
  const isComplete = set.ownedPieces === set.totalPieces;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={[styles.setName, isComplete && styles.setNameComplete]}>
          {set.setName}
        </Text>
        <Text style={styles.progress}>{set.ownedPieces}/{set.totalPieces}</Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.dotsRow}>
        {Array.from({ length: set.totalPieces }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < set.ownedPieces && styles.dotFilled]}
          />
        ))}
      </View>

      {!isComplete && set.missingPieceNames.length > 0 && (
        <Text style={styles.missing} numberOfLines={1}>
          Missing: {set.missingPieceNames.join(', ')}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  setName: {
    fontSize: fontSize.md,
    color: colors.set,
    fontWeight: '600',
    flex: 1,
  },
  setNameComplete: {
    color: colors.success,
  },
  progress: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.set,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dotFilled: {
    backgroundColor: colors.set,
    borderColor: colors.set,
  },
  missing: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    marginTop: spacing.xs,
  },
});
