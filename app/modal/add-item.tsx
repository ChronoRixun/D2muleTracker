import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/CategoryBadge';
import { Chip } from '@/components/ember/Chip';
import { EmberBG } from '@/components/ember/EmberBG';
import { EmberBtn } from '@/components/ember/EmberBtn';
import { ItemAutocomplete } from '@/components/ItemAutocomplete';
import { TagInput } from '@/components/TagInput';
import { addTagToItem, createItem, listItemsByContainer } from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { useAllTags } from '@/hooks/useTags';
import { getItemById } from '@/lib/itemIndex';
import { categoryColor, colors, fontSize, radius, spacing, typography } from '@/lib/theme';
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
  const [sockets, setSockets] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const { tags: knownTags } = useAllTags();

  const resetForm = () => {
    setSelected(null);
    setNotes('');
    setQuantity('1');
    setLocation(null);
    setSockets(null);
    setTags([]);
  };

  const persist = async () => {
    if (!selected || !containerId) return;
    const item = await createItem(db, {
      containerId,
      itemIndexId: selected.id,
      notes: notes.trim() || null,
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      location,
      sockets: selected.category === 'base' ? sockets : null,
    });
    for (const tag of tags) {
      await addTagToItem(db, item.id, tag);
    }
    bumpRevision();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
  };

  const checkDuplicate = async (): Promise<boolean> => {
    if (!selected || !containerId) return true;
    const existing = await listItemsByContainer(db, containerId);
    const dup = existing.find((i) => i.itemIndexId === selected.id);
    if (!dup) return true;
    const entry = getItemById(dup.itemIndexId);
    const name = entry?.name ?? 'this item';
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Already added',
        `This mule or stash already has ${name}. Add another?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Add Another', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
  };

  const save = async () => {
    if (!selected || !containerId) return;
    const proceed = await checkDuplicate();
    if (!proceed) return;
    await persist();
    router.back();
  };

  const saveAndAddAnother = async () => {
    if (!selected || !containerId) return;
    const proceed = await checkDuplicate();
    if (!proceed) return;
    await persist();
    resetForm();
  };

  if (!selected) {
    return (
      <View style={styles.container}>
        <EmberBG />
        <SafeAreaView
          style={{ flex: 1 }}
          edges={['left', 'right', 'bottom']}
        >
          <Stack.Screen options={{ title: 'Add Item' }} />
          <ItemAutocomplete onSelect={setSelected} />
        </SafeAreaView>
      </View>
    );
  }

  const color = categoryColor(selected.category);

  return (
    <View style={styles.container}>
      <EmberBG />
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
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
          {selected.maxSockets ? (
            <Text style={styles.selectedBase}>
              Max Sockets: {selected.maxSockets}
            </Text>
          ) : null}
          <Pressable
            style={styles.changeBtn}
            onPress={() => setSelected(null)}
            accessibilityRole="button"
            accessibilityLabel="Change item"
          >
            <Text style={styles.changeBtnText}>Change item</Text>
          </Pressable>
        </View>

        {selected.category === 'base' && selected.maxSockets && selected.maxSockets > 0 ? (
          <View>
            <Text style={styles.label}>Sockets</Text>
            <View style={styles.socketRow}>
              {Array.from({ length: (selected.maxSockets ?? 0) + 1 }, (_, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.socketBtn,
                    sockets === i && styles.socketBtnActive,
                  ]}
                  onPress={() => setSockets(i)}
                  accessibilityRole="radio"
                  accessibilityLabel={`${i} sockets`}
                  accessibilityState={{ selected: sockets === i }}
                >
                  <Text
                    style={[
                      styles.socketBtnText,
                      sockets === i && styles.socketBtnTextActive,
                    ]}
                  >
                    {i === 0 ? '0os' : `${i}os`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {selected.variableStats && selected.variableStats.length > 0 ? (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Variable Rolls</Text>
            {selected.variableStats.map((vs, i) => (
              <View key={i} style={styles.statRow}>
                <Text style={styles.statName}>{vs.stat}</Text>
                <Text style={styles.statRange}>
                  {vs.min} – {vs.max}
                </Text>
              </View>
            ))}
          </View>
        ) : selected.category === 'unique' || selected.category === 'set' ? (
          <View style={styles.statsCard}>
            <Text style={styles.statsFixed}>
              All stats fixed — nothing to note
            </Text>
          </View>
        ) : null}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="e.g. 42%MF, Um'd, 358ED/37IAS"
          placeholderTextColor={colors.textDim}
          value={notes}
          onChangeText={setNotes}
          multiline
          accessibilityLabel="Item notes"
        />

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={quantity}
          onChangeText={setQuantity}
          accessibilityLabel="Item quantity"
        />

          <Text style={styles.label}>Location</Text>
          <View style={styles.segmentWrap}>
            <Chip
              label="unspecified"
              active={!location}
              onPress={() => setLocation(null)}
            />
            {LOCATIONS.map((loc) => (
              <Chip
                key={loc}
                label={String(loc)}
                active={location === loc}
                onPress={() => setLocation(loc)}
              />
            ))}
          </View>

          <Text style={styles.label}>Tags</Text>
          <TagInput
            value={tags}
            onChange={setTags}
            knownTags={knownTags}
            placeholder="e.g. For Trade, God Roll"
          />
        </ScrollView>

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <EmberBtn
              variant="outline"
              size="sm"
              full
              onPress={() => router.back()}
            >
              Cancel
            </EmberBtn>
          </View>
          <View style={{ flex: 1 }}>
            <EmberBtn
              variant="ghost"
              size="sm"
              full
              onPress={saveAndAddAnother}
            >
              + More
            </EmberBtn>
          </View>
          <View style={{ flex: 1 }}>
            <EmberBtn size="sm" full onPress={save}>
              Save
            </EmberBtn>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },

  selected: {
    backgroundColor: colors.cardHi,
    padding: spacing.md,
    borderRadius: 4,
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
    fontFamily: typography.displaySemi,
    fontSize: 18,
    letterSpacing: 2,
  },
  selectedBase: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 4,
  },
  changeBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  changeBtnText: {
    color: colors.ember,
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  label: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgSoft,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.md,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statsCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  statName: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  statRange: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsFixed: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
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
  secondaryBtn: {
    flex: 1.4,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fontSize.sm,
    textAlign: 'center',
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

  socketRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  socketBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 44,
    alignItems: 'center',
  },
  socketBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  socketBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  socketBtnTextActive: {
    color: colors.bg,
    fontWeight: '700',
  },
});
