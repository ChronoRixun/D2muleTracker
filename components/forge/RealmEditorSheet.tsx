/**
 * RealmEditorSheet — bottom-sheet "BIND A REALM" / "EDIT REALM" editor.
 *
 * AnvilPanel-shaped sheet with corner ornaments, glow, top-radius, no
 * bottom border. CRUD logic lives in the parent settings screen — this is
 * presentation only.
 */

import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnvilPanel } from '@/components/ember/AnvilPanel';
import { EIcon } from '@/components/ember/EIcon';
import { EmberBtn } from '@/components/ember/EmberBtn';
import { ForgeSeg } from '@/components/ember/ForgeSeg';
import { colors, spacing, typography } from '@/lib/theme';
import type { Era, Ladder, Mode, Realm, Region } from '@/lib/types';

interface Props {
  target: Realm | 'new' | null;
  onClose: () => void;
  onSave: (input: Omit<Realm, 'id' | 'createdAt'>) => void;
  onDelete: () => void;
}

export function RealmEditorSheet({ target, onClose, onSave, onDelete }: Props) {
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
  const canSave = name.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), era, mode, ladder, region });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <SafeAreaView edges={['bottom']}>
          <AnvilPanel glow style={styles.sheet}>
            <View style={styles.header}>
              <EIcon name="fire" size={16} color={colors.ember} />
              <Text style={styles.title}>{isNew ? 'BIND A REALM' : 'EDIT REALM'}</Text>
              <View style={{ flex: 1 }} />
              <Pressable onPress={onClose} hitSlop={10}>
                <EIcon name="x" size={16} color={colors.textDim} />
              </Pressable>
            </View>

            <Field label="NAME">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. RoTW S4 SC Ladder"
                placeholderTextColor={colors.textDim}
                style={styles.input}
              />
            </Field>

            <Field label="ERA">
              <ForgeSeg<Era>
                value={era}
                onChange={setEra}
                options={[
                  { v: 'classic', l: 'Classic' },
                  { v: 'lod', l: 'LoD' },
                  { v: 'rotw', l: 'RoTW' },
                ]}
              />
            </Field>

            <Field label="MODE">
              <ForgeSeg<Mode>
                value={mode}
                onChange={setMode}
                options={[
                  { v: 'softcore', l: 'Softcore' },
                  { v: 'hardcore', l: 'Hardcore' },
                ]}
              />
            </Field>

            <Field label="SEASON">
              <ForgeSeg<Ladder>
                value={ladder}
                onChange={setLadder}
                options={[
                  { v: 'ladder', l: 'Ladder' },
                  { v: 'nonladder', l: 'Non-Ladder' },
                ]}
              />
            </Field>

            <Field label="REGION">
              <ForgeSeg<Region>
                value={region}
                onChange={setRegion}
                small
                options={[
                  { v: null, l: 'None' },
                  { v: 'americas', l: 'AMS' },
                  { v: 'europe', l: 'EU' },
                  { v: 'asia', l: 'ASIA' },
                ]}
              />
            </Field>

            <View style={styles.footer}>
              {!isNew ? (
                <View style={{ flex: 1 }}>
                  <EmberBtn variant="danger" full onPress={onDelete}>
                    Delete
                  </EmberBtn>
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <EmberBtn variant="outline" full onPress={onClose}>
                  Cancel
                </EmberBtn>
              </View>
              <View style={{ flex: 2 }}>
                <EmberBtn
                  variant="primary"
                  full
                  disabled={!canSave}
                  onPress={submit}
                >
                  {isNew ? 'Bind Realm' : 'Save'}
                </EmberBtn>
              </View>
            </View>
          </AnvilPanel>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontFamily: typography.displaySemi,
    fontSize: 16,
    color: colors.gold,
    letterSpacing: 3,
    fontWeight: '600',
  },
  fieldLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textDim,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.borderHi,
    color: colors.text,
    fontSize: 14,
  },
  footer: {
    marginTop: 18,
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
