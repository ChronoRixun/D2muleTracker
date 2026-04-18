import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/ember/Chip';
import { EmberBG } from '@/components/ember/EmberBG';
import { EmberGlow } from '@/components/ember/EmberGlow';
import { Rule } from '@/components/ember/Rule';
import { SectionHead } from '@/components/ember/SectionHead';
import { RunewordDetailModal } from '@/components/RunewordDetailModal';
import { SetDetailModal } from '@/components/SetDetailModal';
import { SetProgressCard } from '@/components/SetProgressCard';
import {
  getCraftableRunewords,
  getSetProgress,
  type CraftableRuneword,
  type SetProgress,
} from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { getItemIndex } from '@/lib/itemIndex';
import { colors, spacing, typography } from '@/lib/theme';
import type { ItemEntry } from '@/lib/types';

type TabType = 'sets' | 'runewords';
type RunewordFilter = 'all' | 'weapons' | 'armor' | 'shields' | 'helms';

const RUNEWORD_WEAPON_TYPES = new Set([
  'weap', 'mele', 'swor', 'axe', 'mace', 'hamm', 'club', 'scep', 'wand',
  'staf', 'knif', 'spea', 'pole', 'miss', 'h2h',
]);
const RUNEWORD_ARMOR_TYPES = new Set(['tors']);
const RUNEWORD_SHIELD_TYPES = new Set(['shld', 'ashd', 'pala']);
const RUNEWORD_HELM_TYPES = new Set(['helm', 'head', 'grim']);

const TYPE_LABELS: Record<string, string> = {
  tors: 'Body Armor',
  helm: 'Helm',
  head: 'Helm',
  grim: 'Grimoire',
  shld: 'Shield',
  ashd: 'Paladin Shield',
  pala: 'Paladin Shield',
  swor: 'Sword',
  axe: 'Axe',
  mace: 'Mace',
  hamm: 'Hammer',
  club: 'Club',
  scep: 'Scepter',
  wand: 'Wand',
  staf: 'Staff',
  knif: 'Dagger',
  spea: 'Spear',
  pole: 'Polearm',
  miss: 'Missile Weapon',
  h2h: 'Claw',
  weap: 'Weapon',
  mele: 'Melee Weapon',
};

function runewordMatchesFilter(
  types: string[] | undefined,
  filter: RunewordFilter,
): boolean {
  if (filter === 'all' || !types || types.length === 0) return true;
  const set =
    filter === 'weapons'
      ? RUNEWORD_WEAPON_TYPES
      : filter === 'armor'
        ? RUNEWORD_ARMOR_TYPES
        : filter === 'shields'
          ? RUNEWORD_SHIELD_TYPES
          : RUNEWORD_HELM_TYPES;
  return types.some((t) => set.has(t));
}

function formatBaseRequirement(
  sockets: number,
  types: string[] | undefined,
): string {
  const typeLabel =
    !types || types.length === 0
      ? 'Any Base'
      : types.length === 1
        ? TYPE_LABELS[types[0]] ?? types[0]
        : types.map((t) => TYPE_LABELS[t] ?? t).join(' / ');
  if (!sockets) return typeLabel;
  return `${sockets}os ${typeLabel}`;
}

export default function CollectionsScreen() {
  const { db, revision } = useDatabase();
  const [activeTab, setActiveTab] = useState<TabType>('sets');
  const [sets, setSets] = useState<SetProgress[]>([]);
  const [runewords, setRunewords] = useState<CraftableRuneword[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [setsData, runewordsData] = await Promise.all([
        getSetProgress(db),
        getCraftableRunewords(db),
      ]);
      setSets(setsData);
      setRunewords(runewordsData);
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [db]);

  useEffect(() => {
    loadData();
  }, [loadData, revision]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleTabSwitch = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <EmberBG />
        <SafeAreaView style={[{ flex: 1 }, styles.centered]}>
          <ActivityIndicator size="large" color={colors.ember} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmberBG />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <SectionHead eyebrow="Forgotten Lore" title="CODEX" />

        <View style={styles.segWrap}>
          <Chip
            label="Sets"
            active={activeTab === 'sets'}
            onPress={() => handleTabSwitch('sets')}
          />
          <Chip
            label="Runewords"
            active={activeTab === 'runewords'}
            onPress={() => handleTabSwitch('runewords')}
          />
        </View>

        {activeTab === 'sets' ? (
          <SetsTabContent
            sets={sets}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        ) : (
          <RunewordsTabContent
            runewords={runewords}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

interface SetsTabContentProps {
  sets: SetProgress[];
  onRefresh: () => void;
  refreshing: boolean;
}

function SetsTabContent({ sets, onRefresh, refreshing }: SetsTabContentProps) {
  const [selectedSet, setSelectedSet] = useState<SetProgress | null>(null);

  const almostComplete = sets.filter(
    (s) =>
      s.ownedPieces > 0 &&
      s.ownedPieces >= s.totalPieces - 2 &&
      s.ownedPieces < s.totalPieces,
  );

  const handleSetPress = (set: SetProgress) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    setSelectedSet(set);
  };

  return (
    <>
      <FlatList
        data={sets}
        keyExtractor={(s) => s.setId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.ember}
          />
        }
        ListHeaderComponent={
          almostComplete.length > 0 ? (
            <View style={setsStyles.section}>
              <View style={{ marginHorizontal: spacing.md, marginBottom: 8 }}>
                <Rule
                  label={`Almost Complete · ${almostComplete.length}`}
                  accent={colors.ember}
                />
              </View>
              {almostComplete.map((set) => (
                <SetProgressCard
                  key={set.setId}
                  set={set}
                  onPress={() => handleSetPress(set)}
                />
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <SetProgressCard set={item} onPress={() => handleSetPress(item)} />
        )}
        contentContainerStyle={setsStyles.list}
      />

      {selectedSet && (
        <SetDetailModal
          set={selectedSet}
          visible={selectedSet !== null}
          onClose={() => setSelectedSet(null)}
        />
      )}
    </>
  );
}

const setsStyles = StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.lg,
  },
});

interface RunewordsTabContentProps {
  runewords: CraftableRuneword[];
  onRefresh: () => void;
  refreshing: boolean;
}

function RunewordsTabContent({
  runewords,
  onRefresh,
  refreshing,
}: RunewordsTabContentProps) {
  const [selectedRuneword, setSelectedRuneword] =
    useState<CraftableRuneword | null>(null);
  const [typeFilter, setTypeFilter] = useState<RunewordFilter>('all');

  const runewordEntryMap = useMemo(() => {
    const map = new Map<string, ItemEntry>();
    for (const e of getItemIndex()) {
      if (e.category === 'runeword') map.set(e.name, e);
    }
    return map;
  }, []);

  const filtered = useMemo(
    () =>
      runewords.filter((rw) => {
        const entry = runewordEntryMap.get(rw.runewordName);
        return runewordMatchesFilter(entry?.runewordTypes, typeFilter);
      }),
    [runewords, typeFilter, runewordEntryMap],
  );

  const craftable = filtered.filter((rw) => rw.canCraft);
  const almostReady = filtered.filter(
    (rw) =>
      rw.recipe.length - rw.missingRunes.length > 0 &&
      !rw.canCraft &&
      rw.missingRunes.length <= 2,
  );

  const handleRunewordPress = (rw: CraftableRuneword) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    setSelectedRuneword(rw);
  };

  const renderCard = (rw: CraftableRuneword, keyPrefix: string) => (
    <RunewordCard
      key={`${keyPrefix}-${rw.runewordName}`}
      runeword={rw}
      entry={runewordEntryMap.get(rw.runewordName)}
      onPress={() => handleRunewordPress(rw)}
    />
  );

  return (
    <>
      <View style={{ flexShrink: 0 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={rwStyles.filterRow}
          style={{ flexGrow: 0 }}
        >
          {(
            [
              ['all', 'All'],
              ['weapons', 'Weapons'],
              ['armor', 'Armor'],
              ['shields', 'Shields'],
              ['helms', 'Helms'],
            ] as const
          ).map(([key, label]) => (
            <Chip
              key={key}
              label={label}
              active={typeFilter === key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => undefined,
                );
                setTypeFilter(key);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(rw) => rw.runewordName}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.ember}
          />
        }
        ListHeaderComponent={
          <>
            {craftable.length > 0 && (
              <View style={rwStyles.section}>
                <View style={{ marginHorizontal: spacing.md, marginBottom: 8 }}>
                  <Rule
                    label={`Ready to Forge · ${craftable.length}`}
                    accent={colors.ember}
                  />
                </View>
                {craftable.map((rw) => renderCard(rw, 'top'))}
              </View>
            )}
            {almostReady.length > 0 && (
              <View style={rwStyles.section}>
                <View style={{ marginHorizontal: spacing.md, marginBottom: 8 }}>
                  <Rule
                    label={`Almost Ready · ${almostReady.length}`}
                    accent={colors.gold}
                  />
                </View>
                {almostReady.map((rw) => renderCard(rw, 'ar'))}
              </View>
            )}
          </>
        }
        renderItem={({ item }) => renderCard(item, 'rw')}
        contentContainerStyle={rwStyles.list}
      />

      {selectedRuneword && (
        <RunewordDetailModal
          runewordName={selectedRuneword.runewordName}
          recipe={selectedRuneword.recipe}
          missingRunes={selectedRuneword.missingRunes}
          visible={selectedRuneword !== null}
          onClose={() => setSelectedRuneword(null)}
        />
      )}
    </>
  );
}

interface RunewordCardProps {
  runeword: CraftableRuneword;
  entry?: ItemEntry;
  onPress: () => void;
}

function RunewordCard({ runeword, entry, onPress }: RunewordCardProps) {
  const baseLabel = formatBaseRequirement(
    runeword.recipe.length,
    entry?.runewordTypes,
  );

  // Highlight owned runes in accent color, missing in dim.
  const remaining = [...runeword.missingRunes];
  const runeSlots = runeword.recipe.map((rune) => {
    const idx = remaining.indexOf(rune);
    if (idx >= 0) {
      remaining.splice(idx, 1);
      return { name: rune, owned: false };
    }
    return { name: rune, owned: true };
  });
  const ownedCount = runeSlots.filter((r) => r.owned).length;

  const body = (
    <Pressable
      onPress={onPress}
      style={[
        rwStyles.card,
        runeword.canCraft && {
          borderColor: colors.ember,
        },
      ]}
    >
      <Text
        style={[rwStyles.name, runeword.canCraft && rwStyles.nameCraftable]}
      >
        {runeword.runewordName}
      </Text>
      <Text style={rwStyles.base}>{baseLabel}</Text>
      <View style={rwStyles.recipeRow}>
        <Text style={rwStyles.recipeLabel}>Recipe: </Text>
        {runeSlots.map((slot, idx) => (
          <Text
            key={`${slot.name}-${idx}`}
            style={slot.owned ? rwStyles.runeOwned : rwStyles.runeMissing}
          >
            {slot.name}
            {idx < runeSlots.length - 1 ? ' + ' : ''}
          </Text>
        ))}
      </View>
      {runeword.missingRunes.length > 0 ? (
        <Text style={rwStyles.missing}>
          Missing: {runeword.missingRunes.join(', ')} ({ownedCount}/
          {runeSlots.length} owned)
        </Text>
      ) : null}
    </Pressable>
  );

  if (runeword.canCraft) {
    return (
      <EmberGlow style={{ marginBottom: spacing.sm }} min={0.35} max={0.7}>
        {body}
      </EmberGlow>
    );
  }
  return body;
}

const rwStyles = StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.lg,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderHi,
  },
  name: {
    fontFamily: typography.displaySemi,
    fontSize: 16,
    color: colors.runeword,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  nameCraftable: {
    color: colors.ember,
  },
  base: {
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  recipeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recipeLabel: {
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  runeOwned: {
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.rune,
  },
  runeMissing: {
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.textDim,
  },
  missing: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textDim,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  segWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
});
