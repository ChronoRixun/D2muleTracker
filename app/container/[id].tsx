import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemRow } from '@/components/ItemRow';
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
import { colors, fontSize, radius, spacing } from '@/lib/theme';
import type {
  CharacterClass,
  Container,
  ContainerType,
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

export default function ContainerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { db, revision, bumpRevision } = useDatabase();

  const [container, setContainer] = useState<Container | null>(null);
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [editTarget, setEditTarget] = useState<ItemRecord | null>(null);
  const [moveTarget, setMoveTarget] = useState<ItemRecord | null>(null);
  const [editContainer, setEditContainer] = useState(false);

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

  const itemsWithEntries = useMemo(
    () =>
      items
        .map((i) => ({ item: i, entry: getItemById(i.itemIndexId) }))
        .filter((x) => x.entry),
    [items],
  );

  if (!container) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Loading…' }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: container.name }} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{container.name}</Text>
          <Text style={styles.sub}>
            {container.type === 'shared_stash'
              ? 'Shared Stash'
              : `${container.class ?? 'Unknown'} · Lv ${container.level ?? '?'}`}{' '}
            · {items.length} items
          </Text>
        </View>
        <Pressable
          style={styles.editBtn}
          onPress={() => setEditContainer(true)}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
      </View>

      {itemsWithEntries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyBody}>
            No items yet. Use “Add Item” to catalog gear on this container.
          </Text>
        </View>
      ) : (
        <FlatList
          data={itemsWithEntries}
          keyExtractor={(row) => row.item.id}
          contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: 120 }}
          renderItem={({ item: row }) => (
            <ItemRow
              entry={row.entry!}
              notes={row.item.notes}
              quantity={row.item.quantity}
              onPress={() => setEditTarget(row.item)}
            />
          )}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: '/modal/add-item',
            params: { containerId: container.id },
          })
        }
      >
        <Text style={styles.fabText}>+ Add Item</Text>
      </Pressable>

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
          setMoveTarget(null);
          bumpRevision();
          reload();
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
  const entry = target ? getItemById(target.itemIndexId) : null;

  useEffect(() => {
    if (target) {
      setNotes(target.notes ?? '');
      setQuantity(String(target.quantity ?? 1));
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
          <Pressable style={styles.ghostBtn} onPress={onClose}>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  sub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
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
});
