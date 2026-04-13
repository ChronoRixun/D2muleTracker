import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/CategoryBadge';
import { ItemAutocomplete } from '@/components/ItemAutocomplete';
import { createItem } from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { categoryColor, colors, fontSize, radius, spacing } from '@/lib/theme';
import type { ItemEntry, ItemLocation } from '@/lib/types';

const LOCATIONS: ItemLocation[] = ['inventory', 'equipped', 'merc', 'stash'];

export default function AddItemModal() {
  const { containerId } = useLocalSearchParams<{ containerId: string }>();
  const router = useRouter();
  const { db, bumpRevision } = useDatabase();

  const [selected, setSelected] = useState<ItemEntry | null>(null);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [location, setLocation] = useState<ItemLocation>(null);

  const save = async () => {
    if (!selected || !containerId) return;
    await createItem(db, {
      containerId,
      itemIndexId: selected.id,
      notes: notes.trim() || null,
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      location,
    });
    bumpRevision();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
    router.back();
  };

  if (!selected) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ title: 'Add Item' }} />
        <ItemAutocomplete onSelect={setSelected} />
      </SafeAreaView>
    );
  }

  const color = categoryColor(selected.category);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Add Item' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.selected, { borderColor: color }]}>
          <View style={styles.selectedHead}>
            <Text style={[styles.selectedName, { color }]}>{selected.name}</Text>
            <CategoryBadge category={selected.category} />
          </View>
          {selected.baseName && selected.baseName !== selected.name ? (
            <Text style={styles.selectedBase}>
              {selected.baseName}
              {selected.reqLevel ? ` · Lv ${selected.reqLevel}` : ''}
              {selected.runes ? ` · ${selected.runes}` : ''}
            </Text>
          ) : null}
          <Pressable
            style={styles.changeBtn}
            onPress={() => setSelected(null)}
          >
            <Text style={styles.changeBtnText}>Change item</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="e.g. 42%MF, Um'd, 358ED/37IAS"
          placeholderTextColor={colors.textDim}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.label}>Location</Text>
        <View style={styles.segmentWrap}>
          <Pressable
            style={[styles.segment, !location && styles.segmentActive]}
            onPress={() => setLocation(null)}
          >
            <Text
              style={[
                styles.segmentText,
                !location && styles.segmentTextActive,
              ]}
            >
              unspecified
            </Text>
          </Pressable>
          {LOCATIONS.map((loc) => (
            <Pressable
              key={loc}
              style={[
                styles.segment,
                location === loc && styles.segmentActive,
              ]}
              onPress={() => setLocation(loc)}
            >
              <Text
                style={[
                  styles.segmentText,
                  location === loc && styles.segmentTextActive,
                ]}
              >
                {loc}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.ghostBtn} onPress={() => router.back()}>
          <Text style={styles.ghostBtnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.primaryBtn} onPress={save}>
          <Text style={styles.primaryBtnText}>Save</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },

  selected: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  selectedHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  selectedName: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  selectedBase: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  changeBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  changeBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  ghostBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  ghostBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: fontSize.md,
  },

  segmentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  segmentTextActive: {
    color: colors.bg,
    fontWeight: '700',
  },
});
