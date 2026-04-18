import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as StoreReview from 'expo-store-review';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/ember/Chip';
import { EmberBG } from '@/components/ember/EmberBG';
import { EmberBtn } from '@/components/ember/EmberBtn';
import { Rule } from '@/components/ember/Rule';
import { SectionHead } from '@/components/ember/SectionHead';
import { RealmTag } from '@/components/RealmTag';
import {
  BackupPayload,
  createRealm,
  deleteRealm,
  exportAll,
  importAll,
  listRealms,
  updateRealm,
} from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { useSettings } from '@/lib/settings';
import { colors, fontSize, radius, spacing, typography } from '@/lib/theme';
import type { Era, Ladder, Mode, Realm, Region } from '@/lib/types';

const REGION_OPTIONS: Array<{ value: Region; label: string }> = [
  { value: null, label: 'None' },
  { value: 'americas', label: 'Americas' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
];

export default function SettingsScreen() {
  const { db, bumpRevision, revision } = useDatabase();
  const { motion, density, setMotion, setDensity, setTutorialCompleted } =
    useSettings();
  const [realms, setRealms] = useState<Realm[]>([]);
  const [editing, setEditing] = useState<Realm | 'new' | null>(null);
  const [importText, setImportText] = useState('');
  const [importVisible, setImportVisible] = useState(false);

  const reload = useCallback(() => {
    listRealms(db).then(setRealms);
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload, revision]);

  const handleExport = async () => {
    const payload = await exportAll(db);
    const json = JSON.stringify(payload, null, 2);
    try {
      await Share.share({
        title: 'Hoard Backup',
        message: json,
      });
    } catch {
      // Ignore cancel / unsupported.
    }
  };

  const handleWriteBackupFile = async () => {
    const payload = await exportAll(db);
    const json = JSON.stringify(payload, null, 2);
    const file = new File(Paths.document, `hoard-backup-${Date.now()}.json`);
    file.create();
    file.write(json);
    Alert.alert('Backup saved', file.uri);
  };

  const handleImport = async (mode: 'merge' | 'replace') => {
    try {
      const payload: BackupPayload = JSON.parse(importText);
      if (!payload || !Array.isArray(payload.realms)) {
        throw new Error('Missing realms array.');
      }
      await importAll(db, payload, mode);
      setImportText('');
      setImportVisible(false);
      bumpRevision();
      Alert.alert('Import complete');
    } catch (e: any) {
      Alert.alert('Import failed', e.message ?? 'Invalid JSON');
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const contents = await new File(asset.uri).text();
      setImportText(contents);
    } catch (e: any) {
      Alert.alert('Could not read file', e.message ?? 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <EmberBG />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <SectionHead eyebrow="The Anvil" title="FORGE" />
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
        >
          <View style={{ marginBottom: spacing.md }}>
            <Rule label="Motion" accent={colors.ember} />
          </View>
          <View style={styles.chipWrap}>
            <Chip
              label="Subtle"
              active={motion === 'subtle'}
              onPress={() => setMotion('subtle')}
            />
            <Chip
              label="Full Hellforge"
              active={motion === 'full'}
              onPress={() => setMotion('full')}
              color={colors.ember}
            />
          </View>
          <Text style={styles.hintItalic}>
            {motion === 'full'
              ? 'Embers rise. Glyphs pulse. The forge breathes.'
              : 'A still, sleeping ember. Performance first.'}
          </Text>

          <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            <Rule label="Density" accent={colors.ember} />
          </View>
          <View style={styles.chipWrap}>
            <Chip
              label="Comfortable"
              active={density === 'comfortable'}
              onPress={() => setDensity('comfortable')}
            />
            <Chip
              label="Dense"
              active={density === 'dense'}
              onPress={() => setDensity('dense')}
            />
          </View>

          <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            <Rule label="Realms" accent={colors.gold} />
          </View>
          {realms.length === 0 ? (
            <Text style={styles.hint}>No realms yet.</Text>
          ) : (
            realms.map((r) => (
              <Pressable
                key={r.id}
                style={styles.realmRow}
                onPress={() => setEditing(r)}
              >
                <RealmTag realm={r} />
                <Text style={styles.chev}>›</Text>
              </Pressable>
            ))
          )}
          <View style={{ marginTop: spacing.sm }}>
            <EmberBtn variant="ghost" full onPress={() => setEditing('new')}>
              + Add Realm
            </EmberBtn>
          </View>

          <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            <Rule label="Data" accent={colors.gold} />
          </View>
          <View style={{ gap: spacing.sm }}>
            <EmberBtn variant="outline" full onPress={handleExport}>
              Export (Share JSON)
            </EmberBtn>
            <EmberBtn variant="outline" full onPress={handleWriteBackupFile}>
              Save Backup File
            </EmberBtn>
            <EmberBtn
              variant="outline"
              full
              onPress={() => setImportVisible(true)}
            >
              Import JSON…
            </EmberBtn>
          </View>

          <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
            <Rule label="About" accent={colors.gold} />
          </View>
          <Text style={styles.about}>
            Hoard v
            {Constants.expoConfig?.version ?? '1.0.0'}
            {'\n'}
            Offline inventory catalog for Diablo 2 Resurrected.{'\n\n'}
            Item database sourced from blizzhackers/d2data (MIT license).
            {'\n'}
            github.com/blizzhackers/d2data{'\n\n'}
            Item type icons by Lorc, Delapouite, and contributors{'\n'}
            from game-icons.net, licensed under CC BY 3.0.{'\n'}
            Icons have been recolored to match the app theme.{'\n\n'}
            Built with Expo + React Native.
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <EmberBtn
              variant="ghost"
              full
              onPress={async () => {
                try {
                  if (await StoreReview.hasAction()) {
                    await StoreReview.requestReview();
                  }
                } catch {
                  // Ignore: review prompt unavailable on this platform.
                }
              }}
            >
              Rate This App
            </EmberBtn>
          </View>
          <View style={{ marginTop: spacing.sm }}>
            <EmberBtn
              variant="ghost"
              full
              onPress={() => {
                setTutorialCompleted(false);
                Alert.alert(
                  'Tutorial Reset',
                  'The tutorial will show the next time you open the app.',
                );
              }}
            >
              Replay Tutorial
            </EmberBtn>
          </View>
        </ScrollView>

      <RealmEditor
        target={editing}
        onClose={() => setEditing(null)}
        onSave={async (payload) => {
          if (editing === 'new') {
            await createRealm(db, payload);
          } else if (editing) {
            await updateRealm(db, editing.id, payload);
          }
          setEditing(null);
          bumpRevision();
        }}
        onDelete={async () => {
          if (editing && editing !== 'new') {
            Alert.alert(
              'Delete realm?',
              `"${editing.name}" and all its mules, stashes, and items will be permanently removed.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteRealm(db, editing.id);
                    setEditing(null);
                    bumpRevision();
                  },
                },
              ],
            );
          }
        }}
      />

      <Modal
        visible={importVisible}
        animationType="slide"
        onRequestClose={() => setImportVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={{ padding: spacing.lg, flex: 1 }}>
            <Text style={styles.sectionTitle}>Import Backup</Text>
            <Text style={styles.hint}>
              Pick a backup .json file or paste the payload below. Merge keeps
              existing data; Replace wipes the database first.
            </Text>
            <Pressable style={styles.rowBtn} onPress={handlePickFile}>
              <Text style={styles.rowBtnText}>Pick File…</Text>
            </Pressable>
            <TextInput
              style={[styles.input, { flex: 1, textAlignVertical: 'top', marginTop: spacing.sm }]}
              multiline
              value={importText}
              onChangeText={setImportText}
              placeholder="{ ...backup json... }"
              placeholderTextColor={colors.textDim}
            />
          </View>
          <View style={styles.footer}>
            <Pressable
              style={styles.ghostBtn}
              onPress={() => setImportVisible(false)}
            >
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.rowBtn}
              onPress={() => handleImport('merge')}
            >
              <Text style={styles.rowBtnText}>Merge</Text>
            </Pressable>
            <Pressable
              style={styles.dangerBtn}
              onPress={() =>
                Alert.alert(
                  'Replace all data?',
                  'This wipes everything before import.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Replace',
                      style: 'destructive',
                      onPress: () => handleImport('replace'),
                    },
                  ],
                )
              }
            >
              <Text style={styles.dangerBtnText}>Replace</Text>
            </Pressable>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// ---- Realm editor ---------------------------------------------------------

interface RealmEditorProps {
  target: Realm | 'new' | null;
  onClose: () => void;
  onSave: (input: Omit<Realm, 'id' | 'createdAt'>) => void;
  onDelete: () => void;
}

function RealmEditor({ target, onClose, onSave, onDelete }: RealmEditorProps) {
  const [name, setName] = useState('');
  const [era, setEra] = useState<Era>('rotw');
  const [mode, setMode] = useState<Mode>('softcore');
  const [ladder, setLadder] = useState<Ladder>('ladder');
  const [region, setRegion] = useState<Region>(null);

  useEffect(() => {
    if (target && target !== 'new') {
      setName(target.name);
      setEra(target.era);
      setMode(target.mode);
      setLadder(target.ladder);
      setRegion(target.region ?? null);
    } else if (target === 'new') {
      setName('');
      setEra('rotw');
      setMode('softcore');
      setLadder('ladder');
      setRegion(null);
    }
  }, [target]);

  const visible = target !== null;
  const isNew = target === 'new';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>
            {isNew ? 'New Realm' : 'Edit Realm'}
          </Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. RoTW S13 SC Ladder"
            placeholderTextColor={colors.textDim}
          />

          <Text style={styles.label}>Era</Text>
          <Row
            value={era}
            onChange={setEra}
            options={[
              { value: 'classic', label: 'Classic' },
              { value: 'lod', label: 'LoD' },
              { value: 'rotw', label: 'RoTW' },
            ]}
          />

          <Text style={styles.label}>Mode</Text>
          <Row
            value={mode}
            onChange={setMode}
            options={[
              { value: 'softcore', label: 'Softcore' },
              { value: 'hardcore', label: 'Hardcore' },
            ]}
          />

          <Text style={styles.label}>Ladder</Text>
          <Row
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

          <View style={styles.sheetFooter}>
            {!isNew ? (
              <Pressable style={styles.dangerBtn} onPress={onDelete}>
                <Text style={styles.dangerBtnText}>Delete</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.ghostBtn} onPress={onClose}>
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, !name.trim() && styles.disabled]}
              onPress={() => {
                if (!name.trim()) return;
                onSave({
                  name: name.trim(),
                  era,
                  mode,
                  ladder,
                  region,
                });
              }}
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

function Row<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
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
  sectionTitle: {
    color: colors.gold,
    fontFamily: typography.displaySemi,
    fontSize: 18,
    letterSpacing: 2.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  hintItalic: {
    color: colors.textMuted,
    fontFamily: typography.hand,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  about: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    lineHeight: 18,
  },

  realmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginVertical: 3,
    backgroundColor: colors.card,
    borderRadius: radius.md,
  },
  chev: {
    color: colors.textDim,
    fontSize: fontSize.xl,
  },
  rowBtn: {
    padding: spacing.md,
    marginVertical: 3,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rowBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: fontSize.md,
  },

  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.bg,
    padding: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.xs,
  },
  sheetTitle: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.md,
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
  disabled: { opacity: 0.4 },

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

  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
});
