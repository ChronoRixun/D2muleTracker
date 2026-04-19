/**
 * The Forge — settings tab, "Anvil" redesign.
 *
 * Hero AnvilPanel with live aggregate stats up top, promoted REALMS card
 * list, three-tier MotionIntensityPicker inside a RITES card, then density
 * + default-sort segs, backup data rows, and an INSCRIBED about block.
 *
 * RealmEditorSheet / ImportSheet handle the two modal surfaces; CRUD is
 * unchanged from the old settings screen.
 */

import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as StoreReview from 'expo-store-review';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnvilPanel } from '@/components/ember/AnvilPanel';
import { Diamond } from '@/components/ember/Diamond';
import { EIcon } from '@/components/ember/EIcon';
import { EmberBG } from '@/components/ember/EmberBG';
import { EmberBtn } from '@/components/ember/EmberBtn';
import { ForgeSeg } from '@/components/ember/ForgeSeg';
import { MotionIntensityPicker } from '@/components/ember/MotionIntensityPicker';
import { RealmTagStrip } from '@/components/ember/RealmTagStrip';
import { RuneStat } from '@/components/ember/RuneStat';
import { ChronicleHeading } from '@/components/forge/ChronicleHeading';
import { DataRow } from '@/components/forge/DataRow';
import { ImportSheet } from '@/components/forge/ImportSheet';
import { RealmEditorSheet } from '@/components/forge/RealmEditorSheet';
import { RiteRow } from '@/components/forge/RiteRow';
import {
  BackupPayload,
  countItemsByRealm,
  countMulesByRealm,
  countRunesByRealm,
  createRealm,
  deleteRealm,
  exportAll,
  importAll,
  listRealms,
  updateRealm,
} from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { useSettings } from '@/lib/settings';
import { colors, spacing, typography } from '@/lib/theme';
import type { Realm } from '@/lib/types';
import { formatBytes, timeAgo } from '@/lib/timeAgo';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const CREDITS_TEXT =
  'Hoard v' +
  APP_VERSION +
  '\n\n' +
  'Item database — blizzhackers/d2data (MIT license).\n' +
  'github.com/blizzhackers/d2data\n\n' +
  'Item type icons by Lorc, Delapouite, and contributors\n' +
  'from game-icons.net, licensed under CC BY 3.0.\n' +
  'Icons have been recolored to match the app theme.\n\n' +
  'Built with Expo + React Native.';

export default function SettingsScreen() {
  const { db, bumpRevision, revision } = useDatabase();
  const {
    density,
    setDensity,
    defaultSort,
    setDefaultSort,
    setTutorialCompleted,
    lastBackupAt,
    lastBackupSize,
    markBackup,
  } = useSettings();

  const [realms, setRealms] = useState<Realm[]>([]);
  const [muleCounts, setMuleCounts] = useState<Record<string, number>>({});
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [runeCounts, setRuneCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Realm | 'new' | null>(null);
  const [importText, setImportText] = useState('');
  const [importVisible, setImportVisible] = useState(false);

  const reload = useCallback(async () => {
    const [r, m, i, ru] = await Promise.all([
      listRealms(db),
      countMulesByRealm(db),
      countItemsByRealm(db),
      countRunesByRealm(db),
    ]);
    setRealms(r);
    setMuleCounts(m);
    setItemCounts(i);
    setRuneCounts(ru);
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload, revision]);

  const totals = useMemo(() => {
    const sum = (rec: Record<string, number>) =>
      Object.values(rec).reduce((a, b) => a + b, 0);
    return {
      realms: realms.length,
      mules: sum(muleCounts),
      items: sum(itemCounts),
      runes: sum(runeCounts),
    };
  }, [realms, muleCounts, itemCounts, runeCounts]);

  const handleExport = async () => {
    const payload = await exportAll(db);
    const json = JSON.stringify(payload, null, 2);
    markBackup(json.length);
    try {
      await Share.share({ title: 'Hoard Backup', message: json });
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
    markBackup(json.length);
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

  const backupAgo = timeAgo(lastBackupAt);
  const backupSize = formatBytes(lastBackupSize);
  const backupDetail =
    backupAgo === 'never'
      ? 'never'
      : backupSize
        ? `last · ${backupAgo} · ${backupSize}`
        : `last · ${backupAgo}`;

  return (
    <View style={styles.shell}>
      <EmberBG />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.eyebrow}>
          <Diamond size={7} color={colors.ember} />
          <Text style={styles.eyebrowText}>CHRONICLE IV · THE ANVIL</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* HERO */}
          <AnvilPanel glow style={styles.hero}>
            <View style={styles.heroHead}>
              <EIcon name="fire" size={18} color={colors.ember} />
              <Text style={styles.heroTitle}>FORGE</Text>
              <Text style={styles.heroVersion}>v{APP_VERSION}</Text>
            </View>
            <Text style={styles.heroTagline}>the hammer that binds the hoard</Text>
            <View style={styles.heroStats}>
              <RuneStat value={totals.realms} label="Realms" color={colors.gold} />
              <RuneStat value={totals.mules} label="Mules" color={colors.text} />
              <RuneStat value={totals.items} label="Items" color={colors.text} />
              <RuneStat value={totals.runes} label="Runes" color={colors.rune} />
            </View>
            <View style={styles.backupPill}>
              <View style={styles.greenDot} />
              <Text style={styles.backupText} numberOfLines={1}>
                <Text style={{ color: colors.textDim }}>LAST BACKUP · </Text>
                <Text style={{ color: colors.text }}>{backupAgo}</Text>
                {backupSize ? (
                  <>
                    <Text style={{ color: colors.textDim }}> · </Text>
                    <Text style={{ color: colors.textMuted }}>{backupSize}</Text>
                  </>
                ) : null}
              </Text>
              <EIcon name="check" size={12} color={colors.success} />
            </View>
          </AnvilPanel>

          {/* REALMS */}
          <View style={{ marginTop: spacing.lg }}>
            <ChronicleHeading
              label="REALMS"
              count={realms.length}
              color={colors.gold}
              right={
                <Pressable
                  onPress={() => setEditing('new')}
                  style={styles.bindNew}
                  hitSlop={6}
                >
                  <EIcon name="plus" size={11} color={colors.ember} />
                  <Text style={styles.bindNewText}>BIND NEW</Text>
                </Pressable>
              }
            />
          </View>

          {realms.length === 0 ? (
            <Text style={styles.emptyHint}>
              No realms yet. Forge your first one above.
            </Text>
          ) : (
            <View style={{ gap: 6 }}>
              {realms.map((r, idx) => (
                <RealmCard
                  key={r.id}
                  realm={r}
                  highlighted={idx === 0}
                  mules={muleCounts[r.id] ?? 0}
                  items={itemCounts[r.id] ?? 0}
                  runes={runeCounts[r.id] ?? 0}
                  onPress={() => setEditing(r)}
                />
              ))}
            </View>
          )}

          {/* RITES */}
          <View style={{ marginTop: spacing.xl }}>
            <ChronicleHeading label="RITES" color={colors.ember} />
          </View>

          <View style={styles.motionCard}>
            <View style={styles.motionHead}>
              <Text style={styles.motionTitle}>Motion Intensity</Text>
              <Text style={styles.motionScope}>APPLIED APP-WIDE</Text>
            </View>
            <MotionIntensityPicker />
          </View>

          <AnvilPanel style={styles.ritesPanel}>
            <RiteRow
              label="Density"
              hint="rows per screen"
              control={
                <ForgeSeg
                  value={density}
                  onChange={setDensity}
                  options={[
                    { v: 'comfortable', l: 'Comfy' },
                    { v: 'dense', l: 'Dense' },
                  ]}
                />
              }
            />
            <RiteRow
              label="Default sort"
              last
              control={
                <ForgeSeg
                  value={defaultSort}
                  onChange={setDefaultSort}
                  small
                  options={[
                    { v: 'rarity', l: 'Rarity' },
                    { v: 'name', l: 'Name' },
                    { v: 'added', l: 'Added' },
                  ]}
                />
              }
            />
          </AnvilPanel>

          {/* CHRONICLE — backup */}
          <View style={{ marginTop: spacing.xl }}>
            <ChronicleHeading label="CHRONICLE · BACKUP" color={colors.gold} />
          </View>
          <Text style={styles.sectionLead}>
            Everything in the hoard — realms, mules, items, tags, runes — rendered as JSON.
          </Text>
          <View style={{ gap: 6 }}>
            <DataRow
              icon="upload"
              label="Share JSON"
              detail="via system share sheet"
              onPress={handleExport}
            />
            <DataRow
              icon="download"
              label="Save Backup File"
              detail={backupDetail}
              strong
              onPress={handleWriteBackupFile}
            />
            <DataRow
              icon="scroll"
              label="Import from JSON"
              detail="merge or replace"
              onPress={() => setImportVisible(true)}
            />
          </View>

          {/* INSCRIBED */}
          <View style={{ marginTop: spacing.xl }}>
            <ChronicleHeading label="INSCRIBED" color={colors.gold} />
          </View>
          <View style={styles.inscribedCard}>
            <Text style={styles.inscribedTitle}>HOARD · v{APP_VERSION}</Text>
            <Text style={styles.inscribedTagline}>
              &ldquo;even in hell, the damned keep ledgers.&rdquo;
            </Text>
            <Text style={styles.inscribedCredits}>
              <Text>Data · </Text>
              <Text style={{ color: colors.textDim }}>blizzhackers/d2data</Text>
              <Text> · MIT{'\n'}</Text>
              <Text>Icons · </Text>
              <Text style={{ color: colors.textDim }}>game-icons.net</Text>
              <Text> · CC BY 3.0{'\n'}</Text>
              <Text>Built with Expo · React Native</Text>
            </Text>
          </View>
          <View style={styles.inscribedActions}>
            <View style={{ flex: 1 }}>
              <EmberBtn
                variant="outline"
                size="sm"
                full
                onPress={async () => {
                  try {
                    if (await StoreReview.hasAction()) {
                      await StoreReview.requestReview();
                    }
                  } catch {
                    // Ignore: review unavailable.
                  }
                }}
              >
                Rate App
              </EmberBtn>
            </View>
            <View style={{ flex: 1 }}>
              <EmberBtn
                variant="outline"
                size="sm"
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
            <View style={{ flex: 1 }}>
              <EmberBtn
                variant="outline"
                size="sm"
                full
                onPress={() => Alert.alert('Credits', CREDITS_TEXT)}
              >
                Credits
              </EmberBtn>
            </View>
          </View>
        </ScrollView>

        <RealmEditorSheet
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
          onDelete={() => {
            if (editing && editing !== 'new') {
              const r = editing;
              Alert.alert(
                'Delete realm?',
                `"${r.name}" and all its mules, stashes, and items will be permanently removed.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await deleteRealm(db, r.id);
                      setEditing(null);
                      bumpRevision();
                    },
                  },
                ],
              );
            }
          }}
        />

        <ImportSheet
          visible={importVisible}
          importText={importText}
          setImportText={setImportText}
          onClose={() => setImportVisible(false)}
          onPickFile={handlePickFile}
          onImport={handleImport}
        />
      </SafeAreaView>
    </View>
  );
}

interface RealmCardProps {
  realm: Realm;
  highlighted: boolean;
  mules: number;
  items: number;
  runes: number;
  onPress: () => void;
}

function RealmCard({
  realm,
  highlighted,
  mules,
  items,
  runes,
  onPress,
}: RealmCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.realmCard,
        {
          borderColor: highlighted ? colors.borderGold : colors.border,
          borderLeftWidth: 3,
          borderLeftColor: highlighted ? colors.gold : colors.borderGold,
        },
      ]}
    >
      {highlighted ? (
        <LinearGradient
          colors={['rgba(232,176,72,0.08)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.7, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.realmName} numberOfLines={1}>
          {realm.name}
        </Text>
        <View style={{ marginTop: 5 }}>
          <RealmTagStrip
            era={realm.era}
            mode={realm.mode}
            ladder={realm.ladder}
            region={realm.region}
          />
        </View>
        <Text style={styles.realmStats}>
          <Text style={{ color: colors.text }}>{mules}</Text> MULES ·{' '}
          <Text style={{ color: colors.text }}>{items}</Text> ITEMS ·{' '}
          <Text style={{ color: colors.rune }}>{runes}</Text> RUNES
        </Text>
      </View>
      <EIcon name="chevron-right" size={14} color={colors.textDim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 120 },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    paddingBottom: 8,
  },
  eyebrowText: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textDim,
    textTransform: 'uppercase',
  },

  hero: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  heroHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroTitle: {
    flex: 1,
    fontFamily: typography.displaySemi,
    fontSize: 26,
    color: colors.gold,
    letterSpacing: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(255,80,32,0.4)',
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  heroVersion: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  heroTagline: {
    fontFamily: typography.hand,
    fontSize: 13,
    color: colors.textDim,
    marginTop: 2,
    fontStyle: 'italic',
  },
  heroStats: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  backupPill: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  backupText: {
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },

  bindNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  bindNewText: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.ember,
    fontWeight: '700',
  },
  emptyHint: {
    color: colors.textMuted,
    fontFamily: typography.hand,
    fontStyle: 'italic',
    fontSize: 13,
    paddingVertical: 12,
  },

  realmCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  realmName: {
    fontFamily: typography.displaySemi,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  realmStats: {
    marginTop: 6,
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  motionCard: {
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  motionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  motionTitle: {
    fontFamily: typography.displaySemi,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  motionScope: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textDim,
    letterSpacing: 1.5,
  },
  ritesPanel: {
    paddingHorizontal: 14,
    paddingVertical: 4,
  },

  sectionLead: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 18,
  },

  inscribedCard: {
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.borderGold,
    marginBottom: 10,
  },
  inscribedTitle: {
    fontFamily: typography.displaySemi,
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600',
    letterSpacing: 2,
  },
  inscribedTagline: {
    fontFamily: typography.hand,
    fontSize: 13,
    color: colors.textDim,
    marginTop: 6,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  inscribedCredits: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 10,
    letterSpacing: 1,
    lineHeight: 17,
  },
  inscribedActions: {
    flexDirection: 'row',
    gap: 6,
  },
});
