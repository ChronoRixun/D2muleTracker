/**
 * TagInput — autocomplete tag picker.
 *
 * Displays selected tags as dismissable chips, a text input that accepts
 * Enter/comma to commit a tag, and a suggestion list filtered against the
 * provided `knownTags` (e.g. from `useAllTags`).
 */

import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '@/components/ember/Chip';
import { colors, fontSize, radius, spacing, typography } from '@/lib/theme';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  knownTags?: string[];
  placeholder?: string;
}

function normalize(t: string): string {
  return t.trim();
}

export function TagInput({
  value,
  onChange,
  knownTags = [],
  placeholder = 'Add tag…',
}: Props) {
  const [draft, setDraft] = useState('');

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    const have = new Set(value.map((t) => t.toLowerCase()));
    const pool = knownTags.filter((t) => !have.has(t.toLowerCase()));
    if (!q) return pool.slice(0, 6);
    return pool.filter((t) => t.toLowerCase().includes(q)).slice(0, 6);
  }, [draft, knownTags, value]);

  const commit = (raw: string) => {
    const tag = normalize(raw);
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    onChange([...value, tag]);
    setDraft('');
  };

  const remove = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    onChange(value.filter((t) => t !== tag));
  };

  const handleChange = (text: string) => {
    if (text.endsWith(',')) {
      commit(text.slice(0, -1));
      return;
    }
    setDraft(text);
  };

  return (
    <View style={styles.wrap}>
      {value.length > 0 ? (
        <View style={styles.selected}>
          {value.map((t) => (
            <Pressable
              key={t}
              onPress={() => remove(t)}
              accessibilityRole="button"
              accessibilityLabel={`Remove tag ${t}`}
            >
              <View style={styles.tagChip}>
                <Text style={styles.tagText}>{t}</Text>
                <Text style={styles.tagX}>×</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={handleChange}
        onSubmitEditing={() => commit(draft)}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        blurOnSubmit={false}
        accessibilityLabel="Add tag"
        accessibilityHint="Type a tag name and press done"
      />

      {suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.map((t) => (
            <Chip
              key={t}
              label={t}
              size="sm"
              color={colors.gold}
              onPress={() => commit(t)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  selected: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  tagText: {
    color: '#120905',
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tagX: {
    color: '#120905',
    fontFamily: typography.monoBold,
    fontSize: 14,
    lineHeight: 14,
  },
  input: {
    backgroundColor: colors.bgSoft,
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
