import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryColor, colors, fontSize, radius, spacing } from '@/lib/theme';
import type { ItemEntry } from '@/lib/types';

import { CategoryBadge } from './CategoryBadge';
import { ItemTypeIcon } from './ItemTypeIcon';

interface Props {
  entry: ItemEntry;
  notes?: string | null;
  quantity?: number;
  rightHint?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ItemRow({
  entry,
  notes,
  quantity,
  rightHint,
  onPress,
  onLongPress,
}: Props) {
  const color = categoryColor(entry.category);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <View style={styles.iconWrap}>
        <ItemTypeIcon itemType={entry.itemType} size={22} color={color} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color }]} numberOfLines={1}>
            {entry.name}
            {quantity && quantity > 1 ? `  ×${quantity}` : ''}
          </Text>
          <CategoryBadge category={entry.category} />
        </View>
        {entry.baseName && entry.baseName !== entry.name ? (
          <Text style={styles.base} numberOfLines={1}>
            {entry.baseName}
            {entry.reqLevel ? ` · Lv ${entry.reqLevel}` : ''}
            {entry.runes ? ` · ${entry.runes}` : ''}
          </Text>
        ) : null}
        {notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {notes}
          </Text>
        ) : null}
      </View>
      {rightHint ? <Text style={styles.hint}>{rightHint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginHorizontal: spacing.lg,
    marginVertical: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  colorBar: {
    width: 3,
  },
  iconWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  body: {
    flex: 1,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  base: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  notes: {
    color: colors.text,
    fontSize: fontSize.sm,
    marginTop: 6,
    fontStyle: 'italic',
  },
  hint: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    padding: spacing.md,
    alignSelf: 'center',
  },
});
