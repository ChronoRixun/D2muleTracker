import { useRouter } from 'expo-router';
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
import { ItemTypeIcon } from '@/components/ItemTypeIcon';
import { RealmTag } from '@/components/RealmTag';
import { findItemsByIndexIds, listRealms, searchNotes } from '@/db/queries';
import { useDatabase } from '@/hooks/useDatabase';
import { getItemById, searchItems } from '@/lib/itemIndex';
import { categoryColor, colors, fontSize, radius, spacing } from '@/lib/theme';
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
  const { db, revision } = useDatabase();
  const [query, setQuery] = useState('');
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
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TextInput
        style={styles.input}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Search items or notes (e.g. shako, enigma, 40FCR)…"
        placeholderTextColor={colors.textDim}
        value={query}
        onChangeText={setQuery}
      />

      <View style={{ flexShrink: 0 }}>
        {realms.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={{ flexGrow: 0 }}
          >
            <FilterChip
              label="All realms"
              active={realmFilter === 'all'}
              onPress={() => setRealmFilter('all')}
            />
            {realms.map((r) => (
              <FilterChip
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
          {CATEGORY_OPTIONS.map((cat) => {
            const active = categoryFilter.has(cat);
            const color = categoryColor(cat);
            return (
              <Pressable
                key={cat}
                onPress={() => toggleCategory(cat)}
                style={[
                  styles.catChip,
                  { borderColor: color },
                  active && { backgroundColor: color },
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: active ? colors.bg : color },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
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
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  input: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: fontSize.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  chipTextActive: {
    color: colors.bg,
    fontWeight: '700',
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  catChipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  hintWrap: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  hit: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: 3,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: fontSize.md,
    fontWeight: '600',
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
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  hitNotes: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
