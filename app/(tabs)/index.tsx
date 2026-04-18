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
import { Chip } from '@/components/ember/Chip';
import { Diamond } from '@/components/ember/Diamond';
import { EmberBG } from '@/components/ember/EmberBG';
import { EmberBtn } from '@/components/ember/EmberBtn';
import { FAB } from '@/components/ember/FAB';
import { Rule } from '@/components/ember/Rule';
import { SectionHead } from '@/components/ember/SectionHead';
import { StatsRibbon } from '@/components/ember/StatsRibbon';
import { archiveContainer, createContainer, createRealm } from '@/db/queries';
import { useContainers } from '@/hooks/useContainers';
import { useDatabase } from '@/hooks/useDatabase';
import { colors, typography } from '@/lib/theme';
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

  const totals = useMemo(() => {
    const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);
    const mules = containers.filter((c) => c.type === 'character').length;
    return {
      items: totalItems,
      mules,
      realms: realms.length,
      stashes: containers.filter((c) => c.type === 'shared_stash').length,
    };
  }, [counts, containers, realms]);

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
      <View style={styles.root}>
        <EmberBG />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.emptyWrap}>
            <Diamond size="lg" color={colors.ember} />
            <Text style={styles.emptyTitle}>The Hoard Awaits</Text>
            <Text style={styles.emptyBody}>
              Forge a realm to begin cataloging your mules. A realm groups
              characters by era, mode, and ladder.
            </Text>
            <EmberBtn onPress={() => setShowAddRealm(true)} size="lg">
              Forge a Realm
            </EmberBtn>
          </View>
        </SafeAreaView>
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
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <EmberBG />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <SectionHead eyebrow="The Hoard" title="MULES" />

        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <StatsRibbon
            stats={[
              { label: 'Items', value: totals.items, color: colors.gold },
              { label: 'Mules', value: totals.mules, color: colors.ember },
              { label: 'Realms', value: totals.realms, color: colors.gold },
              { label: 'Stashes', value: totals.stashes, color: colors.gold },
            ]}
          />
        </View>

        {sections.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyBody}>
              No containers yet. Forge your first mule or shared stash.
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: 140, paddingTop: 8 }}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={reload}
                tintColor={colors.ember}
                colors={[colors.ember]}
              />
            }
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Rule label={section.realm.name} accent={colors.ember} />
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
      </SafeAreaView>

      <View style={styles.topLeftHint}>
        <EmberBtn
          size="sm"
          variant="ghost"
          onPress={() => setShowAddRealm(true)}
        >
          + Realm
        </EmberBtn>
      </View>

      <FAB onPress={() => setShowAddContainer(true)} icon="plus" />

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
    </View>
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
      <View style={styles.root}>
        <EmberBG />
        <SafeAreaView style={styles.modalWrap} edges={['top', 'left', 'right']}>
          <SectionHead eyebrow="Forge" title="NEW REALM" />
          <ScrollView contentContainerStyle={styles.modalContent}>
            <FieldLabel>Name</FieldLabel>
            <TextInput
              style={styles.input}
              placeholder="e.g. RoTW S13 SC Ladder"
              placeholderTextColor={colors.textDim}
              value={name}
              onChangeText={setName}
            />

            <FieldLabel>Era</FieldLabel>
            <ChipRow
              value={era}
              onChange={setEra}
              options={[
                { value: 'classic', label: 'Classic' },
                { value: 'lod', label: 'LoD' },
                { value: 'rotw', label: 'RoTW' },
              ]}
            />

            <FieldLabel>Mode</FieldLabel>
            <ChipRow
              value={mode}
              onChange={setMode}
              options={[
                { value: 'softcore', label: 'Softcore' },
                { value: 'hardcore', label: 'Hardcore' },
              ]}
            />

            <FieldLabel>Ladder</FieldLabel>
            <ChipRow
              value={ladder}
              onChange={setLadder}
              options={[
                { value: 'ladder', label: 'Ladder' },
                { value: 'nonladder', label: 'Non-ladder' },
              ]}
            />

            <FieldLabel>Region</FieldLabel>
            <View style={styles.chipWrap}>
              {REGION_OPTIONS.map((o) => (
                <Chip
                  key={o.label}
                  label={o.label}
                  active={region === o.value}
                  onPress={() => setRegion(o.value)}
                />
              ))}
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <View style={{ flex: 1 }}>
              <EmberBtn variant="outline" full onPress={onClose}>
                Cancel
              </EmberBtn>
            </View>
            <View style={{ flex: 1 }}>
              <EmberBtn full onPress={submit} disabled={!name.trim()}>
                Forge
              </EmberBtn>
            </View>
          </View>
        </SafeAreaView>
      </View>
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
      <View style={styles.root}>
        <EmberBG />
        <SafeAreaView style={styles.modalWrap} edges={['top', 'left', 'right']}>
          <SectionHead eyebrow="Forge" title="NEW CONTAINER" />
          <ScrollView contentContainerStyle={styles.modalContent}>
            <FieldLabel>Realm</FieldLabel>
            <View style={styles.chipWrap}>
              {realms.map((r) => (
                <Chip
                  key={r.id}
                  label={r.name}
                  active={activeRealmId === r.id}
                  onPress={() => setRealmId(r.id)}
                />
              ))}
            </View>

            <FieldLabel>Type</FieldLabel>
            <ChipRow
              value={type}
              onChange={setType}
              options={[
                { value: 'character', label: 'Character' },
                { value: 'shared_stash', label: 'Shared Stash' },
              ]}
            />

            <FieldLabel>Name</FieldLabel>
            <TextInput
              style={styles.input}
              placeholder={
                type === 'shared_stash'
                  ? 'e.g. Shared Stash T1'
                  : 'e.g. RuneMule01'
              }
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              value={name}
              onChangeText={setName}
            />

            {type === 'character' ? (
              <>
                <FieldLabel>Class</FieldLabel>
                <View style={styles.chipWrap}>
                  {CLASSES.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={charClass === c}
                      onPress={() => setCharClass(c)}
                    />
                  ))}
                </View>

                <FieldLabel>Level (optional)</FieldLabel>
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
            <View style={{ flex: 1 }}>
              <EmberBtn variant="outline" full onPress={onClose}>
                Cancel
              </EmberBtn>
            </View>
            <View style={{ flex: 1 }}>
              <EmberBtn
                full
                onPress={submit}
                disabled={!name.trim() || !activeRealmId}
              >
                Forge
              </EmberBtn>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ---- Small helpers --------------------------------------------------------

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children.toUpperCase()}</Text>;
}

interface ChipRowProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}

function ChipRow<T extends string>({ value, onChange, options }: ChipRowProps<T>) {
  return (
    <View style={styles.chipWrap}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          active={value === o.value}
          onPress={() => onChange(o.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
  },
  emptyWrap: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  emptyTitle: {
    color: colors.gold,
    fontFamily: typography.displaySemi,
    fontSize: 26,
    letterSpacing: 3,
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.textMuted,
    fontFamily: typography.hand,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  topLeftHint: {
    position: 'absolute',
    top: 70,
    right: 20,
  },
  modalWrap: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 2.5,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bgSoft,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
