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
});
