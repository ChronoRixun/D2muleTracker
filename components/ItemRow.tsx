import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ember/Chip';
import { categoryColor, colors, fontSize, radius, spacing, typography } from '@/lib/theme';
import type { ItemEntry } from '@/lib/types';

import { CategoryBadge } from './CategoryBadge';
import { ItemTypeIcon } from './ItemTypeIcon';

interface Props {
  entry: ItemEntry;
  notes?: string | null;
  quantity?: number;
  sockets?: number | null;
  tags?: string[];
  activeTags?: string[];
  onTagPress?: (tag: string) => void;
  rightHint?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ItemRow({
  entry,
  notes,
  quantity,
  sockets,
  tags,
  activeTags,
  onTagPress,
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
            {sockets != null ? ` · ${sockets}os` : ''}
            {entry.reqLevel ? ` · Lv ${entry.reqLevel}` : ''}
            {entry.runes ? ` · ${entry.runes}` : ''}
          </Text>
        ) : sockets != null ? (
          <Text style={styles.base}>{sockets}os</Text>
        ) : null}
        {notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {notes}
          </Text>
        ) : null}
        {tags && tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tags.slice(0, 3).map((t) => (
              <Chip
                key={t}
                label={t}
                size="sm"
                color={colors.gold}
                active={activeTags?.includes(t)}
                onPress={onTagPress ? () => onTagPress(t) : undefined}
              />
            ))}
            {tags.length > 3 ? (
              <Text style={styles.tagMore}>+{tags.length - 3} more</Text>
            ) : null}
          </View>
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  tagMore: {
    color: colors.textDim,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginLeft: 2,
  },
});
