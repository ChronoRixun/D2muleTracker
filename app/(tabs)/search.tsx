import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
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
import { EIcon } from '@/components/ember/EIcon';
import { EmberBG } from '@/components/ember/EmberBG';
import { SectionHead } from '@/components/ember/SectionHead';
import { ItemTypeIcon } from '@/components/ItemTypeIcon';
import { RealmTag } from '@/components/RealmTag';
import { findItemsByIndexIds, listRealms, searchNotes } from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { getItemById, searchItems } from '@/lib/itemIndex';
import { categoryColor, colors, fontSize, radius, spacing, typography } from '@/lib/theme';
import type { ItemCategory, ItemEntry, Realm, SearchHit } from '@/lib/types';

const CATEGORY_OPTIONS: ItemCategory[] = [
  'unique',
  'set',
  'runeword',
  'base',
  'rune',
  'gem',
  'misc',
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const { db, revision } = useDatabase();
  const [query, setQuery] = useState(params.q ?? '');
  const [debounced, setDebounced] = useState('');
  const [realms, setRealms] = useState<Realm[]>([]);
  const [realmFilter, setRealmFilter] = useState<string | 'all'>('all');

  const [matchingEntries, setMatchingEntries] = useState<ItemEntry[]>([]);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [noteHits, setNoteHits] = useState<SearchHit[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<Set<ItemCategory>>(
    new Set(),
  );

  const toggleCategory = (cat: ItemCategory) => {
    setCategoryFilter((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  useEffect(() => {
    listRealms(db).then(setRealms);
  }, [db, revision]);

  useEffect(() => {
    const h = setTimeout(() => setDebounced(query.trim()), 150);
    return () => clearTimeout(h);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) {
      setMatchingEntries([]);
      setHits([]);
      setNoteHits([]);
      return;
    }
    const entries = searchItems(debounced, 30);
    setMatchingEntries(entries);
    const realmArg = realmFilter === 'all' ? undefined : realmFilter;
    (async () => {
      const ids = entries.map((e) => e.id);
      const [byIndex, byNotes] = await Promise.all([
        findItemsByIndexIds(db, ids, realmArg),
        searchNotes(db, debounced, realmArg),
      ]);
      const entryMap = new Map(entries.map((e) => [e.id, e] as const));
      setHits(
        byIndex.map((row) => ({
          item: row.item,
          container: row.container,
          realm: row.realm,
          entry: entryMap.get(row.item.itemIndexId)!,
        })).filter((h) => h.entry),
      );
      // Notes hits need entries too; look them up synchronously
      // via the bundled item-index.
      const noteEntries = byNotes.map((row) => {
        const e = entries.find((x) => x.id === row.item.itemIndexId);
        return e
          ? ({
              item: row.item,
              container: row.container,
              realm: row.realm,
              entry: e,
            } as SearchHit)
          : null;
      });
      // Fallback: load entries from full index for notes hits whose items
      // aren't in the current autocomplete result.
      const needsLookup = byNotes.filter(
        (row) => !entries.some((x) => x.id === row.item.itemIndexId),
      );
      for (const row of needsLookup) {
        const e = getItemById(row.item.itemIndexId);
        if (e) {
          noteEntries.push({
            item: row.item,
            container: row.container,
            realm: row.realm,
            entry: e,
          });
        }
      }
      setNoteHits(noteEntries.filter((x): x is SearchHit => !!x));
    })();
  }, [db, debounced, realmFilter, revision]);

  const combined = useMemo(() => {
    // De-duplicate by item id; prefer index match first.
    const seen = new Set<string>();
    const out: SearchHit[] = [];
    for (const h of hits) {
      if (!seen.has(h.item.id)) {
        seen.add(h.item.id);
        out.push(h);
      }
    }
    for (const h of noteHits) {
      if (!seen.has(h.item.id)) {
        seen.add(h.item.id);
        out.push(h);
      }
    }
    if (categoryFilter.size === 0) return out;
    return out.filter((h) => categoryFilter.has(h.entry.category));
  }, [hits, noteHits, categoryFilter]);

  return (
    <View style={styles.container}>
      <EmberBG />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <SectionHead eyebrow="Divine Gaze" title="SEEK" />
        <View style={styles.searchWrap}>
          <View style={styles.searchIcon}>
            <EIcon name="eye" size={18} color={colors.ember} stroke={1.4} />
          </View>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Shako, enigma, 40FCR…"
            placeholderTextColor={colors.textDim}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={{ flexShrink: 0 }}>
          {realms.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              style={{ flexGrow: 0 }}
            >
              <Chip
                label="All realms"
                active={realmFilter === 'all'}
                onPress={() => setRealmFilter('all')}
              />
              {realms.map((r) => (
                <Chip
                  key={r.id}
                  label={r.name}
                  active={realmFilter === r.id}
                  onPress={() => setRealmFilter(r.id)}
                />
              ))}
            </ScrollView>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={{ flexGrow: 0 }}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                rarity={cat}
                active={categoryFilter.has(cat)}
                onPress={() => toggleCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

      {debounced.length < 2 ? (
        <View style={styles.hintWrap}>
          <Text style={styles.hint}>
            Search across every mule and stash. Use item names (shako, enigma,
            hoto) or roll notes (40FCR, um'd, 358ED).
          </Text>
        </View>
      ) : combined.length === 0 ? (
        <View style={styles.hintWrap}>
          <Text style={styles.hint}>
            No matches for “{debounced}” on your mules yet.
            {matchingEntries.length > 0
              ? `\n(${matchingEntries.length} item type${matchingEntries.length === 1 ? '' : 's'} match in the database — add items to containers to find them here.)`
              : ''}
          </Text>
        </View>
      ) : (
        <FlatList
          data={combined}
          keyExtractor={(h) => h.item.id}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          renderItem={({ item: hit }) => (
            <Pressable
              style={styles.hit}
              onPress={() => router.push(`/container/${hit.container.id}`)}
            >
              <View
                style={[
                  styles.colorBar,
                  { backgroundColor: categoryColor(hit.entry.category) },
                ]}
              />
              <View style={styles.iconWrap}>
                <ItemTypeIcon
                  itemType={hit.entry.itemType}
                  size={22}
                  color={categoryColor(hit.entry.category)}
                />
              </View>
              <View style={styles.hitBody}>
                <View style={styles.hitHead}>
                  <Text
                    style={[
                      styles.hitName,
                      { color: categoryColor(hit.entry.category) },
                    ]}
                    numberOfLines={1}
                  >
                    {hit.entry.name}
                    {hit.item.quantity > 1 ? `  ×${hit.item.quantity}` : ''}
                    {hit.item.sockets != null ? `  · ${hit.item.sockets}os` : ''}
                  </Text>
                  <CategoryBadge category={hit.entry.category} />
                </View>
                <View style={styles.hitLoc}>
                  <Text style={styles.hitContainer} numberOfLines={1}>
                    {hit.container.name}
                  </Text>
                  <RealmTag realm={hit.realm} compact />
                </View>
                {hit.item.notes ? (
                  <Text style={styles.hitNotes} numberOfLines={2}>
                    {hit.item.notes}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgSoft,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderHi,
    paddingHorizontal: spacing.md,
    shadowColor: colors.ember,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: fontSize.md,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 6,
  },

  hintWrap: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.hand,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },

  hit: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: 3,
    backgroundColor: colors.card,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderHi,
  },
  colorBar: { width: 3 },
  iconWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  hitBody: { flex: 1, padding: spacing.md },
  hitHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hitName: {
    flex: 1,
    fontFamily: typography.displaySemi,
    fontSize: fontSize.md,
    letterSpacing: 1,
  },
  hitLoc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  hitContainer: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  hitNotes: {
    color: colors.textMuted,
    fontFamily: typography.hand,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
