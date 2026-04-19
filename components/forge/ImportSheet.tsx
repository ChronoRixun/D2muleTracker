/**
 * ImportSheet — full-screen Import JSON modal. Lightly reskinned: display
 * font header + EmberBtn footer. Logic (file pick / JSON parse / merge or
 * replace) lives in the parent settings screen.
 */

import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EIcon } from '@/components/ember/EIcon';
import { EmberBtn } from '@/components/ember/EmberBtn';
import { colors, spacing, typography } from '@/lib/theme';

interface Props {
  visible: boolean;
  importText: string;
  setImportText: (s: string) => void;
  onClose: () => void;
  onPickFile: () => void;
  onImport: (mode: 'merge' | 'replace') => void;
}

export function ImportSheet({
  visible,
  importText,
  setImportText,
  onClose,
  onPickFile,
  onImport,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.shell}>
        <View style={styles.body}>
          <View style={styles.header}>
            <EIcon name="scroll" size={18} color={colors.ember} />
            <Text style={styles.title}>BIND FROM SCROLL</Text>
          </View>
          <Text style={styles.hint}>
            Pick a backup .json file or paste the payload below. Merge keeps
            existing data; Replace wipes the database first.
          </Text>
          <View style={{ marginBottom: spacing.sm }}>
            <EmberBtn variant="outline" full onPress={onPickFile}>
              Pick File…
            </EmberBtn>
          </View>
          <TextInput
            style={styles.input}
            multiline
            value={importText}
            onChangeText={setImportText}
            placeholder="{ ...backup json... }"
            placeholderTextColor={colors.textDim}
            accessibilityLabel="Paste backup JSON"
          />
        </View>
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <EmberBtn variant="outline" full onPress={onClose}>
              Cancel
            </EmberBtn>
          </View>
          <View style={{ flex: 1 }}>
            <EmberBtn variant="primary" full onPress={() => onImport('merge')}>
              Merge
            </EmberBtn>
          </View>
          <View style={{ flex: 1 }}>
            <EmberBtn
              variant="danger"
              full
              onPress={() =>
                Alert.alert(
                  'Replace all data?',
                  'This wipes everything before import.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Replace',
                      style: 'destructive',
                      onPress: () => onImport('replace'),
                    },
                  ],
                )
              }
            >
              Replace
            </EmberBtn>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.displaySemi,
    fontSize: 18,
    color: colors.gold,
    letterSpacing: 3,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 13,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'top',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
});
