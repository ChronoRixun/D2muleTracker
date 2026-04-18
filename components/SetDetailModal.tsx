import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, spacing, fontSize, radius } from '@/lib/theme';
import type { SetProgress } from '@/db/queries';
import { getItemIndex } from '@/lib/itemIndex';

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
        <View style={styles.header}>
          <Text style={styles.title}>{set.setName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.list}>
          {allPieces.map((piece) => {
            const isOwned = ownedIndexIds.has(piece.id);
            return (
              <TouchableOpacity
                key={piece.id}
                style={[styles.piece, isOwned && styles.pieceOwned]}
                onPress={() => handlePiecePress(piece.id, isOwned)}
                disabled={!isOwned}
              >
                <View style={styles.pieceLeft}>
                  <Ionicons
                    name={isOwned ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isOwned ? colors.set : colors.textDim}
                  />
                  <Text style={[styles.pieceName, isOwned && styles.pieceNameOwned]}>
                    {piece.name}
                  </Text>
                </View>
                {isOwned && <Text style={styles.viewHint}>View →</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.set,
    fontWeight: '600',
    flex: 1,
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
    gap: spacing.sm,
    flex: 1,
  },
  pieceName: {
    fontSize: fontSize.md,
    color: colors.textDim,
  },
  pieceNameOwned: {
    color: colors.text,
  },
  viewHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
