import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContainerCard } from '@/components/ContainerCard';
import { RealmTag } from '@/components/RealmTag';
import {
  archiveContainer,
  createContainer,
  createRealm,
} from '@/db/queries';
import { useContainers } from '@/hooks/useContainers';
import { useDatabase } from '@/hooks/useDatabase';
import { colors, fontSize, radius, spacing } from '@/lib/theme';
import type {
  CharacterClass,
  Container,
  ContainerType,
  Era,
  Ladder,
  Mode,
  Realm,
  Region,
} from '@/lib/types';

const REGION_OPTIONS: Array<{ value: Region; label: string }> = [
  { value: null, label: 'None' },
  { value: 'americas', label: 'Americas' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
];

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

export default function MulesScreen() {
  const router = useRouter();
  const { db, bumpRevision } = useDatabase();
  const { realms, containers, counts, loading, reload } = useContainers();
  const [showAddContainer, setShowAddContainer] = useState(false);
  const [showAddRealm, setShowAddRealm] = useState(false);

  const sections = useMemo(() => {
    const grouped: Record<string, Container[]> = {};
    for (const c of containers) {
      (grouped[c.realmId] ||= []).push(c);
    }
    return realms
      .map((r) => ({ realm: r, data: grouped[r.id] ?? [] }))
      .filter((s) => s.data.length > 0);
  }, [realms, containers]);

  const handleArchive = (c: Container) => {
    Alert.alert('Archive container?', `Hide "${c.name}" from the list.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          await archiveContainer(db, c.id);
          bumpRevision();
          reload();
        },
      },
    ]);
  };

  if (realms.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Welcome</Text>
          <Text style={styles.emptyBody}>
            Create a realm to start cataloging your mules. A realm groups
            characters by era (Classic / LoD / RoTW), mode, and ladder.
          </Text>
          <Pressable
            style={styles.standaloneBtn}
            onPress={() => setShowAddRealm(true)}
          >
            <Text style={styles.primaryBtnText}>Create a Realm</Text>
          </Pressable>
        </View>
        <AddRealmModal
          visible={showAddRealm}
          onClose={() => setShowAddRealm(false)}
          onCreate={async (r) => {
            await createRealm(db, r);
            bumpRevision();
            reload();
            setShowAddRealm(false);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {sections.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyBody}>
            No containers yet. Add your first mule or shared stash.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={reload}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <RealmTag realm={section.realm} />
            </View>
          )}
          renderItem={({ item }) => (
            <ContainerCard
              container={item}
              itemCount={counts[item.id] ?? 0}
              onPress={() => router.push(`/container/${item.id}`)}
              onLongPress={() => handleArchive(item)}
              onArchive={() => handleArchive(item)}
            />
          )}
        />
      )}

      <View style={styles.fabRow}>
        <Pressable
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => setShowAddRealm(true)}
        >
          <Text style={styles.fabSecondaryText}>+ Realm</Text>
        </Pressable>
        <Pressable style={styles.fab} onPress={() => setShowAddContainer(true)}>
          <Text style={styles.fabText}>+ Mule</Text>
        </Pressable>
      </View>

      <AddRealmModal
        visible={showAddRealm}
        onClose={() => setShowAddRealm(false)}
        onCreate={async (r) => {
          await createRealm(db, r);
          bumpRevision();
          reload();
          setShowAddRealm(false);
        }}
      />
      <AddContainerModal
        visible={showAddContainer}
        realms={realms}
        onClose={() => setShowAddContainer(false)}
        onCreate={async (c) => {
          await createContainer(db, c);
          bumpRevision();
          reload();
          setShowAddContainer(false);
        }}
      />
    </SafeAreaView>
  );
}

// ---- Add Realm modal ------------------------------------------------------

interface AddRealmModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: Omit<Realm, 'id' | 'createdAt'>) => void | Promise<void>;
}

function AddRealmModal({ visible, onClose, onCreate }: AddRealmModalProps) {
  const [name, setName] = useState('');
  const [era, setEra] = useState<Era>('rotw');
  const [mode, setMode] = useState<Mode>('softcore');
  const [ladder, setLadder] = useState<Ladder>('ladder');
  const [region, setRegion] = useState<Region>(null);

  const submit = async () => {
    if (!name.trim()) return;
    await onCreate({
      name: name.trim(),
      era,
      mode,
      ladder,
      region,
    });
    setName('');
    setRegion(null);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>New Realm</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. RoTW S13 SC Ladder"
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Era</Text>
          <SegmentedRow
            value={era}
            onChange={setEra}
            options={[
              { value: 'classic', label: 'Classic' },
              { value: 'lod', label: 'LoD' },
              { value: 'rotw', label: 'RoTW' },
            ]}
          />

          <Text style={styles.label}>Mode</Text>
          <SegmentedRow
            value={mode}
            onChange={setMode}
            options={[
              { value: 'softcore', label: 'Softcore' },
              { value: 'hardcore', label: 'Hardcore' },
            ]}
          />

          <Text style={styles.label}>Ladder</Text>
          <SegmentedRow
            value={ladder}
            onChange={setLadder}
            options={[
              { value: 'ladder', label: 'Ladder' },
              { value: 'nonladder', label: 'Non-ladder' },
            ]}
          />

          <Text style={styles.label}>Region</Text>
          <View style={styles.segmentWrap}>
            {REGION_OPTIONS.map((o) => (
              <Pressable
                key={o.label}
                style={[
                  styles.segment,
                  region === o.value && styles.segmentActive,
                ]}
                onPress={() => setRegion(o.value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    region === o.value && styles.segmentTextActive,
                  ]}
                >
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <View style={styles.modalFooter}>
          <Pressable style={styles.ghostBtn} onPress={onClose}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryBtn, !name.trim() && styles.disabled]}
            onPress={submit}
            disabled={!name.trim()}
          >
            <Text style={styles.primaryBtnText}>Create</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ---- Add Container modal --------------------------------------------------

interface AddContainerModalProps {
  visible: boolean;
  realms: Realm[];
  onClose: () => void;
  onCreate: (input: {
    realmId: string;
    name: string;
    type: ContainerType;
    class: CharacterClass | null;
    level: number | null;
  }) => void | Promise<void>;
}

function AddContainerModal({
  visible,
  realms,
  onClose,
  onCreate,
}: AddContainerModalProps) {
  const [realmId, setRealmId] = useState<string>('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ContainerType>('character');
  const [charClass, setCharClass] = useState<CharacterClass>('sorceress');
  const [level, setLevel] = useState('');

  const activeRealmId = realmId || realms[0]?.id || '';

  const submit = async () => {
    if (!name.trim() || !activeRealmId) return;
    await onCreate({
      realmId: activeRealmId,
      name: name.trim(),
      type,
      class: type === 'shared_stash' ? null : charClass,
      level: level ? Math.max(1, parseInt(level, 10) || 1) : null,
    });
    setName('');
    setLevel('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>New Container</Text>

          <Text style={styles.label}>Realm</Text>
          <View style={styles.segmentWrap}>
            {realms.map((r) => (
              <Pressable
                key={r.id}
                style={[
                  styles.segment,
                  activeRealmId === r.id && styles.segmentActive,
                ]}
                onPress={() => setRealmId(r.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeRealmId === r.id && styles.segmentTextActive,
                  ]}
                >
                  {r.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Type</Text>
          <SegmentedRow
            value={type}
            onChange={setType}
            options={[
              { value: 'character', label: 'Character' },
              { value: 'shared_stash', label: 'Shared Stash' },
            ]}
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder={type === 'shared_stash' ? 'e.g. Shared Stash T1' : 'e.g. RuneMule01'}
            placeholderTextColor={colors.textDim}
            autoCapitalize="none"
            value={name}
            onChangeText={setName}
          />

          {type === 'character' ? (
            <>
              <Text style={styles.label}>Class</Text>
              <View style={styles.segmentWrap}>
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
                placeholder="e.g. 1"
                placeholderTextColor={colors.textDim}
                keyboardType="number-pad"
                value={level}
                onChangeText={setLevel}
              />
            </>
          ) : null}
        </ScrollView>
        <View style={styles.modalFooter}>
          <Pressable style={styles.ghostBtn} onPress={onClose}>
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.primaryBtn,
              (!name.trim() || !activeRealmId) && styles.disabled,
            ]}
            onPress={submit}
            disabled={!name.trim() || !activeRealmId}
          >
            <Text style={styles.primaryBtnText}>Create</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ---- Segmented control ----------------------------------------------------

interface SegmentedRowProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}

function SegmentedRow<T extends string>({
  value,
  onChange,
  options,
}: SegmentedRowProps<T>) {
  return (
    <View style={styles.segmentWrap}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          style={[styles.segment, value === o.value && styles.segmentActive]}
          onPress={() => onChange(o.value)}
        >
          <Text
            style={[
              styles.segmentText,
              value === o.value && styles.segmentTextActive,
            ]}
          >
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  emptyWrap: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },

  fabRow: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fab: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  fabSecondary: {
    backgroundColor: colors.bgElevated,
  },
  fabSecondaryText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fontSize.md,
  },

  // Modal
  modalContainer: { flex: 1, backgroundColor: colors.bg },
  modalContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  modalTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
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
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  standaloneBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    alignSelf: 'center',
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
  disabled: {
    opacity: 0.4,
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
    textTransform: 'capitalize',
    fontSize: fontSize.sm,
  },
  segmentTextActive: {
    color: colors.bg,
    fontWeight: '700',
  },
});
