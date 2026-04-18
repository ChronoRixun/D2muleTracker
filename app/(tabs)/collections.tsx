import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import { SetDetailModal } from '@/components/SetDetailModal';
import { SetProgressCard } from '@/components/SetProgressCard';
import {
  getCraftableRunewords,
  getSetProgress,
  type CraftableRuneword,
  type SetProgress,
} from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { colors, radius, spacing, typography } from '@/lib/theme';

type TabType = 'sets' | 'runewords';

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
    (s) => s.ownedPieces >= s.totalPieces - 2 && s.ownedPieces < s.totalPieces,
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
  const craftable = runewords.filter((rw) => rw.canCraft);
  const almostReady = runewords.filter(
    (rw) => !rw.canCraft && rw.missingRunes.length <= 2,
  );

  return (
    <FlatList
      data={runewords}
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
              {craftable.map((rw) => (
                <RunewordCard key={`top-${rw.runewordName}`} runeword={rw} />
              ))}
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
              {almostReady.map((rw) => (
                <RunewordCard key={`ar-${rw.runewordName}`} runeword={rw} />
              ))}
            </View>
          )}
        </>
      }
      renderItem={({ item }) => <RunewordCard runeword={item} />}
      contentContainerStyle={rwStyles.list}
    />
  );
}

interface RunewordCardProps {
  runeword: CraftableRuneword;
}

function RunewordCard({ runeword }: RunewordCardProps) {
  const body = (
    <View
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
      <Text style={rwStyles.recipe}>{runeword.recipe.join(' + ')}</Text>
      {runeword.missingRunes.length > 0 && (
        <Text style={rwStyles.missing}>
          Missing: {runeword.missingRunes.join(', ')}
        </Text>
      )}
    </View>
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
  recipe: {
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.rune,
    marginBottom: spacing.xs,
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
