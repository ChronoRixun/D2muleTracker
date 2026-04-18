import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { SetProgressCard } from '@/components/SetProgressCard';
import { SetDetailModal } from '@/components/SetDetailModal';
import {
  getSetProgress,
  getCraftableRunewords,
  type SetProgress,
  type CraftableRuneword,
} from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { colors, spacing, fontSize, radius } from '@/lib/theme';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sets' && styles.tabActive]}
          onPress={() => handleTabSwitch('sets')}
        >
          <Text style={[styles.tabText, activeTab === 'sets' && styles.tabTextActive]}>
            Sets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'runewords' && styles.tabActive]}
          onPress={() => handleTabSwitch('runewords')}
        >
          <Text style={[styles.tabText, activeTab === 'runewords' && styles.tabTextActive]}>
            Runewords
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'sets' ? (
        <SetsTabContent sets={sets} onRefresh={onRefresh} refreshing={refreshing} />
      ) : (
        <RunewordsTabContent runewords={runewords} onRefresh={onRefresh} refreshing={refreshing} />
      )}
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
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
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          almostComplete.length > 0 ? (
            <View style={setsStyles.section}>
              <Text style={setsStyles.sectionTitle}>
                ALMOST COMPLETE ({almostComplete.length})
              </Text>
              {almostComplete.map((set) => (
                <SetProgressCard key={set.setId} set={set} onPress={() => handleSetPress(set)} />
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
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
});

interface RunewordsTabContentProps {
  runewords: CraftableRuneword[];
  onRefresh: () => void;
  refreshing: boolean;
}

function RunewordsTabContent({ runewords, onRefresh, refreshing }: RunewordsTabContentProps) {
  const craftable = runewords.filter((rw) => rw.canCraft);
  const almostReady = runewords.filter((rw) => !rw.canCraft && rw.missingRunes.length <= 2);

  return (
    <FlatList
      data={runewords}
      keyExtractor={(rw) => rw.runewordName}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        <>
          {craftable.length > 0 && (
            <View style={rwStyles.section}>
              <Text style={rwStyles.sectionTitle}>YOU CAN MAKE ({craftable.length})</Text>
              {craftable.map((rw) => (
                <RunewordCard key={`top-${rw.runewordName}`} runeword={rw} />
              ))}
            </View>
          )}
          {almostReady.length > 0 && (
            <View style={rwStyles.section}>
              <Text style={rwStyles.sectionTitle}>ALMOST READY ({almostReady.length})</Text>
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
  return (
    <View style={rwStyles.card}>
      <Text style={[rwStyles.name, runeword.canCraft && rwStyles.nameCraftable]}>
        {runeword.runewordName}
      </Text>
      <Text style={rwStyles.recipe}>{runeword.recipe.join(' + ')}</Text>
      {runeword.missingRunes.length > 0 && (
        <Text style={rwStyles.missing}>Missing: {runeword.missingRunes.join(', ')}</Text>
      )}
    </View>
  );
}

const rwStyles = StyleSheet.create({
  list: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontSize: fontSize.md,
    color: colors.runeword,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  nameCraftable: {
    color: colors.success,
  },
  recipe: {
    fontSize: fontSize.sm,
    color: colors.rune,
    marginBottom: spacing.xs,
  },
  missing: {
    fontSize: fontSize.xs,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
  },
});
