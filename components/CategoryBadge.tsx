import { StyleSheet, Text, View } from 'react-native';

import { categoryColor, colors, fontSize, radius } from '@/lib/theme';
import type { ItemCategory } from '@/lib/types';

const LABELS: Record<ItemCategory, string> = {
  unique: 'Unique',
  set: 'Set',
  runeword: 'Runeword',
  base: 'Base',
  misc: 'Misc',
  gem: 'Gem',
  rune: 'Rune',
};

export function CategoryBadge({ category }: { category: ItemCategory }) {
  const c = categoryColor(category);
  return (
    <View style={[styles.badge, { borderColor: c }]}>
      <Text style={[styles.text, { color: c }]}>{LABELS[category]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.bg,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
