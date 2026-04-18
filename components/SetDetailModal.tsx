import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontSize, radius, typography } from '@/lib/theme';
import type { SetProgress } from '@/db/queries';
import { getItemIndex } from '@/lib/itemIndex';
import { Diamond } from '@/components/ember/Diamond';
import { EIcon } from '@/components/ember/EIcon';
import { EmberBG } from '@/components/ember/EmberBG';
import { Rule } from '@/components/ember/Rule';
import { SectionHead } from '@/components/ember/SectionHead';

interface Props {
  set: SetProgress;
  visible: boolean;
  onClose: () => void;
}

export function SetDetailModal({ set, visible, onClose }: Props) {
  const index = getItemIndex();
  const allPieces = index.filter((e) => e.category === 'set' && e.setName === set.setName);
  const ownedIndexIds = new Set(set.ownedItems.map((i) => i.itemIndexId));

  const handlePiecePress = (indexId: string, isOwned: boolean) => {
    if (!isOwned) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);

    const piece = index.find((e) => e.id === indexId);
    if (!piece) return;

    onClose();
    router.push({
      pathname: '/(tabs)/search',
      params: { q: piece.name },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <EmberBG />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <SectionHead eyebrow="Codex" title={set.setName} />
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <EIcon name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.list}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          >
            {allPieces.map((piece) => {
              const isOwned = ownedIndexIds.has(piece.id);
              return (
                <Pressable
                  key={piece.id}
                  style={[styles.piece, isOwned && styles.pieceOwned]}
                  onPress={() => handlePiecePress(piece.id, isOwned)}
                  disabled={!isOwned}
                >
                  <View style={styles.pieceLeft}>
                    {isOwned ? (
                      <EIcon name="check" size={18} color={colors.set} />
                    ) : (
                      <Diamond
                        size="sm"
                        filled={false}
                        glow={false}
                        color={colors.textDim}
                      />
                    )}
                    <Text style={[styles.pieceName, isOwned && styles.pieceNameOwned]}>
                      {piece.name}
                    </Text>
                  </View>
                  {isOwned && <Text style={styles.viewHint}>View →</Text>}
                </Pressable>
              );
            })}

            {allPieces.length > 0 &&
              allPieces[0].setBonuses &&
              allPieces[0].setBonuses.length > 0 && (
                <View style={styles.bonusesSection}>
                  <Rule label="Set Bonuses" accent={colors.ember} />
                  {allPieces[0].setBonuses.map((bonus, idx) => {
                    const isFullSet = bonus.pieceCount === -1;
                    const isActive = isFullSet
                      ? set.ownedPieces === set.totalPieces
                      : set.ownedPieces >= bonus.pieceCount;

                    return (
                      <View
                        key={idx}
                        style={[
                          styles.bonusCard,
                          isActive && styles.bonusCardActive,
                          isFullSet && isActive && styles.bonusCardFullSet,
                        ]}
                      >
                        <Text
                          style={[
                            styles.bonusHeader,
                            isActive && styles.bonusHeaderActive,
                          ]}
                        >
                          {isFullSet
                            ? `Full Set (${set.totalPieces})`
                            : `${bonus.pieceCount} Pieces`}
                        </Text>
                        {bonus.bonuses.map((stat, sidx) => (
                          <Text
                            key={sidx}
                            style={[
                              styles.bonusStat,
                              isActive && styles.bonusStatActive,
                            ]}
                          >
                            {stat.min === stat.max
                              ? `+${stat.max} ${stat.stat}`
                              : `+${stat.min}-${stat.max} ${stat.stat}`}
                          </Text>
                        ))}
                      </View>
                    );
                  })}
                </View>
              )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  list: {
    flex: 1,
    padding: spacing.md,
  },
  piece: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pieceOwned: {
    borderColor: colors.set,
  },
  pieceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  pieceName: {
    fontSize: fontSize.md,
    color: colors.textDim,
    fontFamily: typography.body,
  },
  pieceNameOwned: {
    color: colors.set,
    fontWeight: '600',
  },
  viewHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.mono,
    letterSpacing: 1,
  },
  bonusesSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  bonusCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.5,
  },
  bonusCardActive: {
    opacity: 1,
    borderColor: colors.ember,
  },
  bonusCardFullSet: {
    shadowColor: colors.ember,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  bonusHeader: {
    fontFamily: typography.displaySemi,
    fontSize: 14,
    color: colors.textDim,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  bonusHeaderActive: {
    color: colors.ember,
  },
  bonusStat: {
    fontFamily: typography.hand,
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: 2,
  },
  bonusStatActive: {
    color: colors.set,
  },
});
