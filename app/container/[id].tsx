import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemRow } from '@/components/ItemRow';
import { Chip } from '@/components/ember/Chip';
import { EmberBG } from '@/components/ember/EmberBG';
import { EmberBtn } from '@/components/ember/EmberBtn';
import { FAB } from '@/components/ember/FAB';
import { RarityDot } from '@/components/ember/RarityDot';
import { SectionHead } from '@/components/ember/SectionHead';
import {
  deleteItem,
  getContainer,
  listContainers,
  listItemsByContainer,
  updateContainer,
  updateItem,
} from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { getItemById } from '@/lib/itemIndex';
import { useSettings } from '@/lib/settings';
import { categoryColor, colors, fontSize, radius, spacing, typography } from '@/lib/theme';
import type {
  CharacterClass,
  Container,
  ContainerType,
  ItemCategory,
  ItemEntry,
  ItemLocation,
  ItemRecord,
} from '@/lib/types';

const CLASSES: CharacterClass[] = [
  'amazon',
  'sorceress',
  'necromancer',
  'paladin',
  'barbarian',
  'druid',
  'assassin',
  'warlock',
];

const LOCATIONS: ItemLocation[] = ['inventory', 'equipped', 'merc', 'stash'];

export default function ContainerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { db, revision, bumpRevision } = useDatabase();
  const { density } = useSettings();

  const [container, setContainer] = useState<Container | null>(null);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [editTarget, setEditTarget] = useState<ItemRecord | null>(null);
  const [moveTarget, setMoveTarget] = useState<ItemRecord | null>(null);
  const [editContainer, setEditContainer] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'category'>('newest');
  const [filterCategory, setFilterCategory] = useState<ItemCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMoveTarget, setBulkMoveTarget] = useState<string[] | null>(null);

  const toggleSelect = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const reload = useCallback(async () => {
    if (!id) return;
    const c = await getContainer(db, id);
    setContainer(c);
    const list = await listItemsByContainer(db, id);
    setItems(list);
  }, [db, id]);

  useEffect(() => {
    reload();
  }, [reload, revision]);

  const itemsWithEntries = useMemo(() => {
    let list = items
      .map((i) => ({ item: i, entry: getItemById(i.itemIndexId) }))
      .filter((x): x is { item: ItemRecord; entry: ItemEntry } => !!x.entry);

    if (filterCategory) {
      list = list.filter((x) => x.entry.category === filterCategory);
    }

    switch (sortBy) {
      case 'name':
        list = [...list].sort((a, b) => a.entry.name.localeCompare(b.entry.name));
        break;
      case 'category':
        list = [...list].sort(
          (a, b) =>
            a.entry.category.localeCompare(b.entry.category) ||
            a.entry.name.localeCompare(b.entry.name),
        );
        break;
      case 'newest':
      default:
        // Already sorted by created_at DESC from the query
        break;
    }

    return list;
  }, [items, sortBy, filterCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<ItemCategory, number>> = {};
    for (const i of items) {
      const entry = getItemById(i.itemIndexId);
      if (entry) counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const activeCategories = useMemo(() => {
    const set = new Set<ItemCategory>();
    for (const i of items) {
      const entry = getItemById(i.itemIndexId);
      if (entry) set.add(entry.category);
    }
    return Array.from(set);
  }, [items]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const handleShare = async () => {
    if (!container) return;
    const lines: string[] = [];
    lines.push(`📦 ${container.name}`);
    lines.push(
      container.type === 'shared_stash'
        ? 'Shared Stash'
        : `${container.class ?? 'Unknown'} · Lv ${container.level ?? '?'}`,
    );
    lines.push(`${items.length} items\n`);

    const groups: Record<string, Array<{ name: string; notes: string | null }>> = {};
    for (const { item, entry } of itemsWithEntries) {
      if (!entry) continue;
      const cat = entry.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ name: entry.name, notes: item.notes });
    }

    const categoryOrder: ItemCategory[] = [
      'unique',
      'set',
      'runeword',
      'base',
      'rune',
      'gem',
      'misc',
    ];
    const categoryLabels: Record<ItemCategory, string> = {
      unique: '⭐ Uniques',
      set: '🟢 Sets',
      runeword: '🔷 Runewords',
      base: '⚪ Bases',
      rune: '🟠 Runes',
      gem: '💎 Gems',
      misc: '📦 Misc',
    };

    for (const cat of categoryOrder) {
      const group = groups[cat];
      if (!group || group.length === 0) continue;
      lines.push(categoryLabels[cat] ?? cat);
      for (const g of group) {
        const note = g.notes ? ` — ${g.notes}` : '';
        lines.push(`  ${g.name}${note}`);
      }
      lines.push('');
    }

    lines.push('—');
    lines.push('Exported from Hoard');

    const text = lines.join('\n');

    try {
      await Share.share({
        title: `${container.name} — Hoard`,
        message: text,
      });
    } catch {
      // User cancelled or share unavailable.
    }
  };

  const handleSwipeDelete = (target: ItemRecord) => {
    Alert.alert('Delete item?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(db, target.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => undefined,
          );
          bumpRevision();
          reload();
        },
      },
    ]);
  };

  if (!container) {
    return (
      <View style={styles.container}>
        <EmberBG />
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Screen options={{ title: 'Loading…' }} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmberBG />
      <SafeAreaView
        style={{ flex: 1 }}
        edges={['left', 'right', 'bottom']}
      >
        <Stack.Screen options={{ title: container.name }} />

        <View style={styles.header}>
          <Text
            style={styles.eyebrow}
            numberOfLines={1}
          >
            {container.type === 'shared_stash'
              ? 'SHARED STASH'
              : `${(container.class ?? 'unknown').toUpperCase()} · LV ${container.level ?? '?'} · ${String(items.length).padStart(2, '0')} ITEMS`}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {container.name}
          </Text>
          {Object.keys(categoryCounts).length > 0 ? (
            <View style={styles.countsRow}>
              {(Object.keys(categoryCounts) as ItemCategory[]).map((cat) => (
                <View key={cat} style={styles.countChip}>
                  <RarityDot rarity={cat} size={7} />
                  <Text
                    style={[
                      styles.countItem,
                      { color: categoryColor(cat) },
                    ]}
                  >
                    {categoryCounts[cat]}
                  </Text>
                  <Text style={styles.countLabel}>
                    {cat.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.headerActions}>
            {items.length > 0 ? (
              <EmberBtn
                size="sm"
                variant={selectMode ? 'primary' : 'ghost'}
                onPress={() => {
                  setSelectMode(!selectMode);
                  setSelectedIds(new Set());
                }}
              >
                {selectMode ? 'Done' : 'Select'}
              </EmberBtn>
            ) : null}
            <EmberBtn size="sm" variant="ghost" onPress={handleShare}>
              Share
            </EmberBtn>
            <EmberBtn
              size="sm"
              variant="outline"
              onPress={() => setEditContainer(true)}
            >
              Edit
            </EmberBtn>
          </View>
        </View>

      {selectMode && itemsWithEntries.length > 0 ? (
        <Pressable
          style={styles.selectAllBtn}
          onPress={() => {
            if (selectedIds.size === itemsWithEntries.length) {
              setSelectedIds(new Set());
            } else {
              setSelectedIds(
                new Set(itemsWithEntries.map((x) => x.item.id)),
              );
            }
          }}
        >
          <Text style={styles.selectAllText}>
            {selectedIds.size === itemsWithEntries.length
              ? 'Deselect All'
              : 'Select All'}
            {selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </Text>
        </Pressable>
      ) : null}

      {items.length > 0 ? (
        <View style={{ flexShrink: 0 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}
            style={{ flexGrow: 0 }}
          >
            {(['newest', 'name', 'category'] as const).map((s) => (
              <Chip
                key={s}
                label={s === 'newest' ? 'Newest' : s === 'name' ? 'Name' : 'Type'}
                active={sortBy === s}
                onPress={() => setSortBy(s)}
              />
            ))}
            {activeCategories.length > 1 ? (
              <>
                <View style={styles.sortDivider} />
                <Chip
                  label="All"
                  active={!filterCategory}
                  onPress={() => setFilterCategory(null)}
                />
                {activeCategories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    rarity={cat}
                    active={filterCategory === cat}
                    onPress={() =>
                      setFilterCategory(filterCategory === cat ? null : cat)
                    }
                  />
                ))}
              </>
            ) : null}
          </ScrollView>
        </View>
      ) : null}

      {itemsWithEntries.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyWrap}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {items.length === 0 ? (
            <>
              <Text style={styles.emptyBody}>No items yet.</Text>
              <Text style={styles.emptyBody}>
                Tap “+ Add Item” below to start cataloging gear on this
                container.
              </Text>
            </>
          ) : (
            <Text style={styles.emptyBody}>
              No items match the current filter.
            </Text>
          )}
        </ScrollView>
      ) : (
        <FlatList
          key={density}
          data={itemsWithEntries}
          keyExtractor={(row) => row.item.id}
          numColumns={density === 'dense' ? 2 : 1}
          columnWrapperStyle={
            density === 'dense'
              ? { paddingHorizontal: spacing.lg, gap: spacing.sm }
              : undefined
          }
          contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item: row }) => {
            const selected = selectedIds.has(row.item.id);
            if (density === 'dense') {
              return (
                <DenseItemCell
                  entry={row.entry}
                  selected={selected}
                  selectMode={selectMode}
                  onPress={() =>
                    selectMode
                      ? toggleSelect(row.item.id)
                      : setEditTarget(row.item)
                  }
                />
              );
            }
            if (selectMode) {
              return (
                <Pressable
                  style={styles.selectRow}
                  onPress={() => toggleSelect(row.item.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selected && styles.checkboxChecked,
                    ]}
                  >
                    {selected ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <ItemRow
                      entry={row.entry}
                      notes={row.item.notes}
                      quantity={row.item.quantity}
                      sockets={row.item.sockets}
                    />
                  </View>
                </Pressable>
              );
            }
            return (
              <SwipeableItemRow
                entry={row.entry}
                item={row.item}
                onPress={() => setEditTarget(row.item)}
                onDelete={() => handleSwipeDelete(row.item)}
              />
            );
          }}
        />
      )}

      {selectMode && selectedIds.size > 0 ? (
        <View style={styles.bulkBar}>
          <Pressable
            style={styles.bulkMoveBtn}
            onPress={() => setBulkMoveTarget([...selectedIds])}
          >
            <Text style={styles.bulkBtnText}>Move {selectedIds.size}</Text>
          </Pressable>
          <Pressable
            style={styles.bulkDeleteBtn}
            onPress={() => {
              Alert.alert(
                `Delete ${selectedIds.size} items?`,
                'This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      for (const itemId of selectedIds) {
                        await deleteItem(db, itemId);
                      }
                      setSelectedIds(new Set());
                      setSelectMode(false);
                      bumpRevision();
                      reload();
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      ).catch(() => undefined);
                    },
                  },
                ],
              );
            }}
          >
            <Text style={styles.bulkDeleteText}>
              Delete {selectedIds.size}
            </Text>
          </Pressable>
        </View>
      ) : selectMode ? null : (
        <FAB
          icon="plus"
          bottom={24}
          right={20}
          onPress={() =>
            router.push({
              pathname: '/modal/add-item',
              params: { containerId: container.id },
            })
          }
        />
      )}

      <EditItemModal
        target={editTarget}
        onClose={() => setEditTarget(null)}
        onMove={(t) => {
          setEditTarget(null);
          setMoveTarget(t);
        }}
        onSave={async (patch) => {
          if (!editTarget) return;
          await updateItem(db, editTarget.id, patch);
          setEditTarget(null);
          bumpRevision();
          reload();
        }}
        onDelete={async () => {
          if (!editTarget) return;
          Alert.alert('Delete item?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                await deleteItem(db, editTarget.id);
                setEditTarget(null);
                bumpRevision();
                reload();
              },
            },
          ]);
        }}
      />

      <MoveItemModal
        target={moveTarget}
        currentRealmId={container.realmId}
        currentContainerId={container.id}
        onClose={() => setMoveTarget(null)}
        onSelect={async (newContainerId) => {
          if (!moveTarget) return;
          await updateItem(db, moveTarget.id, { containerId: newContainerId });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => undefined,
          );
          setMoveTarget(null);
          bumpRevision();
          reload();
        }}
      />

      <BulkMoveModal
        itemIds={bulkMoveTarget}
        currentRealmId={container.realmId}
        currentContainerId={container.id}
        onClose={() => setBulkMoveTarget(null)}
        onSelect={async (newContainerId) => {
          if (!bulkMoveTarget) return;
          for (const itemId of bulkMoveTarget) {
            await updateItem(db, itemId, { containerId: newContainerId });
          }
          setBulkMoveTarget(null);
          setSelectedIds(new Set());
          setSelectMode(false);
          bumpRevision();
          reload();
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => undefined);
        }}
      />

      <EditContainerModal
        visible={editContainer}
        container={container}
        onClose={() => setEditContainer(false)}
        onSave={async (patch) => {
          await updateContainer(db, container.id, patch);
          setEditContainer(false);
          bumpRevision();
          reload();
        }}
        />
      </SafeAreaView>
    </View>
  );
}

// ---- Swipeable item row ---------------------------------------------------

function SwipeableItemRow({
  entry,
  item,
  onPress,
  onDelete,
}: {
  entry: ItemEntry;
  item: ItemRecord;
  onPress: () => void;
  onDelete: () => void;
}) {
  const renderRightActions = () => (
    <Pressable style={styles.swipeDeleteBtn} onPress={onDelete}>
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <ItemRow
        entry={entry}
        notes={item.notes}
        quantity={item.quantity}
        sockets={item.sockets}
        onPress={onPress}
      />
    </ReanimatedSwipeable>
  );
}

// ---- Dense item cell ------------------------------------------------------

function DenseItemCell({
  entry,
  selected,
  selectMode,
  onPress,
}: {
  entry: ItemEntry;
  selected: boolean;
  selectMode: boolean;
  onPress: () => void;
}) {
  const color = categoryColor(entry.category);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.denseCell,
        selectMode && selected && styles.denseCellSelected,
        pressed && styles.pressedDim,
      ]}
    >
      <View style={[styles.denseColorBar, { backgroundColor: color }]} />
      <View style={styles.denseBody}>
        <Text style={[styles.denseName, { color }]} numberOfLines={1}>
          {entry.name}
        </Text>
        {entry.baseName && entry.baseName !== entry.name ? (
          <Text style={styles.denseBase} numberOfLines={1}>
            {entry.baseName}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ---- Edit container modal -------------------------------------------------

interface EditContainerModalProps {
  visible: boolean;
  container: Container;
  onClose: () => void;
  onSave: (patch: {
    name: string;
    type: ContainerType;
    class: CharacterClass | null;
    level: number | null;
  }) => void;
}

function EditContainerModal({
  visible,
  container,
  onClose,
  onSave,
}: EditContainerModalProps) {
  const [name, setName] = useState(container.name);
  const [type, setType] = useState<ContainerType>(container.type);
  const [charClass, setCharClass] = useState<CharacterClass>(
    container.class ?? 'sorceress',
  );
  const [level, setLevel] = useState(
    container.level != null ? String(container.level) : '',
  );

  useEffect(() => {
    if (visible) {
      setName(container.name);
      setType(container.type);
      setCharClass(container.class ?? 'sorceress');
      setLevel(container.level != null ? String(container.level) : '');
    }
  }, [visible, container]);

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      type,
      class: type === 'shared_stash' ? null : charClass,
      level: level ? Math.max(1, parseInt(level, 10) || 1) : null,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.sheetTitle}>Edit Container</Text>

          <Text style={styles.label}>Type</Text>
          <View style={styles.segmentRow}>
            {(['character', 'shared_stash'] as ContainerType[]).map((t) => (
              <Pressable
                key={t}
                style={[styles.segment, type === t && styles.segmentActive]}
                onPress={() => setType(t)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    type === t && styles.segmentTextActive,
                  ]}
                >
                  {t === 'character' ? 'Character' : 'Shared Stash'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
            placeholderTextColor={colors.textDim}
          />

          {type === 'character' ? (
            <>
              <Text style={styles.label}>Class</Text>
              <View style={styles.segmentRow}>
                {CLASSES.map((c) => (
                  <Pressable
                    key={c}
                    style={[
                      styles.segment,
                      charClass === c && styles.segmentActive,
                    ]}
                    onPress={() => setCharClass(c)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        charClass === c && styles.segmentTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Level (optional)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={level}
                onChangeText={setLevel}
                placeholder="e.g. 1"
                placeholderTextColor={colors.textDim}
              />
            </>
          ) : null}

          <View style={styles.sheetRow}>
            <Pressable style={styles.ghostBtn} onPress={onClose}>
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, !name.trim() && styles.disabled]}
              onPress={submit}
              disabled={!name.trim()}
            >
              <Text style={styles.primaryBtnText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---- Edit item modal ------------------------------------------------------

interface EditItemModalProps {
  target: ItemRecord | null;
  onClose: () => void;
  onSave: (patch: {
    notes?: string | null;
    quantity?: number;
    location?: ItemRecord['location'];
    sockets?: number | null;
  }) => void;
  onDelete: () => void;
  onMove: (target: ItemRecord) => void;
}

function EditItemModal({
  target,
  onClose,
  onSave,
  onDelete,
  onMove,
}: EditItemModalProps) {
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [location, setLocation] = useState<ItemLocation>(null);
  const [sockets, setSockets] = useState<number | null>(null);
  const entry = target ? getItemById(target.itemIndexId) : null;

  useEffect(() => {
    if (target) {
      setNotes(target.notes ?? '');
      setQuantity(String(target.quantity ?? 1));
      setLocation(target.location);
      setSockets(target.sockets ?? null);
    }
  }, [target]);

  return (
    <Modal
      visible={!!target}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          {entry ? (
            <Text style={styles.sheetTitle}>{entry.name}</Text>
          ) : null}
          {entry?.baseName && entry.baseName !== entry.name ? (
            <Text style={styles.sheetSub}>{entry.baseName}</Text>
          ) : null}

          {entry?.category === 'base' &&
          entry?.maxSockets &&
          entry.maxSockets > 0 ? (
            <View>
              <Text style={styles.label}>Sockets</Text>
              <View style={styles.socketRow}>
                {Array.from({ length: (entry.maxSockets ?? 0) + 1 }, (_, i) => (
                  <Pressable
                    key={i}
                    style={[
                      styles.socketBtn,
                      sockets === i && styles.socketBtnActive,
                    ]}
                    onPress={() => setSockets(i)}
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

          {entry?.variableStats && entry.variableStats.length > 0 ? (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Variable Rolls</Text>
              {entry.variableStats.map((vs, i) => (
                <View key={i} style={styles.statRow}>
                  <Text style={styles.statName}>{vs.stat}</Text>
                  <Text style={styles.statRange}>
                    {vs.min} – {vs.max}
                  </Text>
                </View>
              ))}
            </View>
          ) : entry &&
            (entry.category === 'unique' || entry.category === 'set') ? (
            <View style={styles.statsCard}>
              <Text style={styles.statsFixed}>
                All stats fixed — nothing to note
              </Text>
            </View>
          ) : null}

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { minHeight: 70 }]}
            placeholder="e.g. 40%FCR, 20%FHR, 2 open sockets"
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
          <View style={styles.segmentRow}>
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

          <View style={styles.sheetRow}>
            <Pressable
              style={styles.ghostBtn}
              onPress={() => target && onMove(target)}
            >
              <Text style={styles.ghostBtnText}>Move</Text>
            </Pressable>
            <Pressable style={styles.dangerBtn} onPress={onDelete}>
              <Text style={styles.dangerBtnText}>Delete</Text>
            </Pressable>
          </View>

          <View style={styles.sheetRow}>
            <Pressable style={styles.ghostBtn} onPress={onClose}>
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.primaryBtn}
              onPress={() =>
                onSave({
                  notes: notes.trim() || null,
                  quantity: Math.max(1, parseInt(quantity, 10) || 1),
                  location,
                  sockets:
                    entry?.category === 'base' &&
                    entry?.maxSockets &&
                    entry.maxSockets > 0
                      ? sockets
                      : null,
                })
              }
            >
              <Text style={styles.primaryBtnText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---- Move item modal ------------------------------------------------------

interface MoveItemModalProps {
  target: ItemRecord | null;
  currentRealmId: string;
  currentContainerId: string;
  onClose: () => void;
  onSelect: (containerId: string) => void;
}

function MoveItemModal({
  target,
  currentRealmId,
  currentContainerId,
  onClose,
  onSelect,
}: MoveItemModalProps) {
  const { db } = useDatabase();
  const [options, setOptions] = useState<Container[]>([]);

  useEffect(() => {
    if (!target) return;
    listContainers(db, currentRealmId).then((list) =>
      setOptions(list.filter((c) => c.id !== currentContainerId)),
    );
  }, [db, target, currentRealmId, currentContainerId]);

  return (
    <Modal
      visible={!!target}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.sheetTitle}>Move to…</Text>
          <Text style={styles.sheetSub}>Same realm only.</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {options.length === 0 ? (
              <Text style={styles.emptyBody}>
                No other containers in this realm yet.
              </Text>
            ) : (
              options.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.moveRow}
                  onPress={() => onSelect(c.id)}
                >
                  <Text style={styles.moveName}>{c.name}</Text>
                  <Text style={styles.moveMeta}>
                    {c.type === 'shared_stash'
                      ? 'Stash'
                      : `${c.class ?? ''} Lv ${c.level ?? '?'}`}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ---- Bulk move modal ------------------------------------------------------

interface BulkMoveModalProps {
  itemIds: string[] | null;
  currentRealmId: string;
  currentContainerId: string;
  onClose: () => void;
  onSelect: (containerId: string) => void;
}

function BulkMoveModal({
  itemIds,
  currentRealmId,
  currentContainerId,
  onClose,
  onSelect,
}: BulkMoveModalProps) {
  const { db } = useDatabase();
  const [options, setOptions] = useState<Container[]>([]);

  useEffect(() => {
    if (!itemIds) return;
    listContainers(db, currentRealmId).then((list) =>
      setOptions(list.filter((c) => c.id !== currentContainerId)),
    );
  }, [db, itemIds, currentRealmId, currentContainerId]);

  const count = itemIds?.length ?? 0;

  return (
    <Modal
      visible={!!itemIds}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <Text style={styles.sheetTitle}>
            Move {count} item{count === 1 ? '' : 's'} to…
          </Text>
          <Text style={styles.sheetSub}>Same realm only.</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {options.length === 0 ? (
              <Text style={styles.emptyBody}>
                No other containers in this realm yet.
              </Text>
            ) : (
              options.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.moveRow}
                  onPress={() => onSelect(c.id)}
                >
                  <Text style={styles.moveName}>{c.name}</Text>
                  <Text style={styles.moveMeta}>
                    {c.type === 'shared_stash'
                      ? 'Stash'
                      : `${c.class ?? ''} Lv ${c.level ?? '?'}`}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderHi,
    gap: 8,
  },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.gold,
    fontFamily: typography.displaySemi,
    fontSize: 24,
    letterSpacing: 2,
    lineHeight: 30,
  },
  sub: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  emptyWrap: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },

  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    elevation: 4,
  },
  fabText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: fontSize.md,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    padding: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.sm,
  },
  sheetTitle: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  sheetSub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  sheetRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: 2,
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
  dangerBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: fontSize.md,
  },

  moveRow: {
    padding: spacing.md,
    marginVertical: 3,
    backgroundColor: colors.card,
    borderRadius: radius.md,
  },
  moveName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  moveMeta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  editBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  editBtnTextActive: {
    color: colors.bg,
  },
  cancelBtn: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.lg,
    marginRight: spacing.xs,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  selectAllBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  selectAllText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  bulkBar: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  bulkMoveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    elevation: 4,
  },
  bulkDeleteBtn: {
    flex: 1,
    backgroundColor: colors.danger,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    elevation: 4,
  },
  bulkBtnText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  bulkDeleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
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
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
  },
  segmentTextActive: {
    color: colors.bg,
    fontWeight: '700',
  },
  disabled: { opacity: 0.4 },

  statsCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
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

  countsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  countItem: {
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  countLabel: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1.5,
  },

  sortRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: 6,
    alignItems: 'center',
  },
  sortDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
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

  swipeDeleteBtn: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: radius.md,
    marginVertical: 3,
    marginRight: spacing.lg,
  },
  swipeDeleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },

  denseCell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 3,
    overflow: 'hidden',
    minHeight: 52,
  },
  denseCellSelected: {
    borderColor: colors.primary,
  },
  denseColorBar: {
    width: 3,
  },
  denseBody: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  denseName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  denseBase: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  pressedDim: {
    opacity: 0.7,
  },
});
