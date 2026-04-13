import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useItemSearch } from '@/hooks/useItemSearch';
import { colors, fontSize, radius, spacing } from '@/lib/theme';
import type { ItemEntry } from '@/lib/types';

import { ItemRow } from './ItemRow';

interface Props {
  onSelect: (entry: ItemEntry) => void;
  autoFocus?: boolean;
  placeholder?: string;
  emptyHint?: string;
}

export function ItemAutocomplete({
  onSelect,
  autoFocus = true,
  placeholder = 'Search items (e.g. shako, enigma, cta)…',
  emptyHint = 'Type at least 2 characters.',
}: Props) {
  const [query, setQuery] = useState('');
  const results = useItemSearch(query);

  const handlePick = (entry: ItemEntry) => {
    Haptics.selectionAsync().catch(() => undefined);
    onSelect(entry);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        value={query}
        onChangeText={setQuery}
      />
      {query.length < 2 ? (
        <Text style={styles.empty}>{emptyHint}</Text>
      ) : results.length === 0 ? (
        <Text style={styles.empty}>No items match “{query}”.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemRow entry={item} onPress={() => handlePick(item)} />
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingVertical: spacing.sm }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  empty: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
