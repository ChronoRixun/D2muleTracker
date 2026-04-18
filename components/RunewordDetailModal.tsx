import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Diamond } from '@/components/ember/Diamond';
import { EIcon } from '@/components/ember/EIcon';
import { EmberBG } from '@/components/ember/EmberBG';
import { Rule } from '@/components/ember/Rule';
import { SectionHead } from '@/components/ember/SectionHead';
import { getItemIndex } from '@/lib/itemIndex';
import { colors, fontSize, radius, spacing, typography } from '@/lib/theme';

interface Props {
  runewordName: string;
  recipe: string[];
  missingRunes: string[];
  visible: boolean;
  onClose: () => void;
}

const TYPE_CODE_NAMES: Record<string, string> = {
  tors: 'Body Armor',
  helm: 'Helms',
  shld: 'Shields',
  ashd: 'Paladin Shields',
  pala: 'Paladin Shields',
  head: 'Headgear',
  swor: 'Swords',
  axe: 'Axes',
  mace: 'Maces',
  hamm: 'Hammers',
  club: 'Clubs',
  scep: 'Scepters',
  wand: 'Wands',
  staf: 'Staves',
  knif: 'Daggers',
  spea: 'Spears',
  pole: 'Polearms',
  miss: 'Missile Weapons',
  h2h: 'Claws',
  weap: 'Weapons',
  mele: 'Melee Weapons',
  grim: 'Grimoires',
};

function formatType(code: string): string {
  return TYPE_CODE_NAMES[code] ?? code;
}

export function RunewordDetailModal({
  runewordName,
  recipe,
  missingRunes,
  visible,
  onClose,
}: Props) {
  const index = getItemIndex();
  const runeword = index.find(
    (e) => e.category === 'runeword' && e.name === runewordName,
  );

  if (!runeword) return null;

  // Track remaining missing runes as we iterate so duplicate runes in a recipe
  // get checked off one at a time (e.g., Enigma needs Jah·Ith·Ber; owning one
  // Ith shouldn't mark every Ith slot as owned).
  const remainingMissing = [...missingRunes];
  const runeSlots = recipe.map((rune) => {
    const idx = remainingMissing.indexOf(rune);
    if (idx >= 0) {
      remainingMissing.splice(idx, 1);
      return { name: rune, owned: false };
    }
    return { name: rune, owned: true };
  });

  const canCraft = missingRunes.length === 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <EmberBG />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <SectionHead eyebrow="Codex" title={runewordName} />
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <EIcon name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
          >
            <View style={styles.section}>
              <Rule
                label={canCraft ? 'Rune Sequence · Complete' : 'Rune Sequence'}
                accent={canCraft ? colors.ember : colors.rune}
              />
              <View style={styles.runeList}>
                {runeSlots.map((rune, idx) => (
                  <View
                    key={`${rune.name}-${idx}`}
                    style={[styles.runeItem, rune.owned && styles.runeItemOwned]}
                  >
                    {rune.owned ? (
                      <EIcon name="check" size={16} color={colors.rune} />
                    ) : (
                      <Diamond
                        size="sm"
                        filled={false}
                        glow={false}
                        color={colors.textDim}
                      />
                    )}
                    <Text
                      style={[
                        styles.runeName,
                        rune.owned && styles.runeNameOwned,
                      ]}
                    >
                      {rune.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {runeword.runewordTypes && runeword.runewordTypes.length > 0 && (
              <View style={styles.section}>
                <Rule label="Works In" accent={colors.textDim} />
                <Text style={styles.baseTypes}>
                  {runeword.runewordTypes.map(formatType).join(', ')}
                </Text>
              </View>
            )}

            {runeword.reqLevel > 0 && (
              <View style={styles.section}>
                <Rule label="Required Level" accent={colors.textDim} />
                <Text style={styles.reqLevel}>{runeword.reqLevel}</Text>
              </View>
            )}

            {(runeword.allProperties ?? runeword.variableStats) &&
              (runeword.allProperties ?? runeword.variableStats)!.length > 0 && (
                <View style={styles.section}>
                  <Rule label="Properties" accent={colors.ember} />
                  {(runeword.allProperties ?? runeword.variableStats)!.map(
                    (stat, idx) => (
                      <View key={idx} style={styles.statRow}>
                        <Text style={styles.statName}>{stat.stat}</Text>
                        <Text style={styles.statRange}>
                          {stat.min === stat.max
                            ? `${stat.max}`
                            : `${stat.min}-${stat.max}`}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  runeList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  runeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  runeItemOwned: {
    borderColor: colors.rune,
  },
  runeName: {
    fontFamily: typography.monoBold,
    fontSize: fontSize.sm,
    color: colors.textDim,
    letterSpacing: 1.2,
  },
  runeNameOwned: {
    color: colors.rune,
  },
  baseTypes: {
    fontFamily: typography.body,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  reqLevel: {
    fontFamily: typography.displaySemi,
    fontSize: 24,
    color: colors.gold,
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderHi,
  },
  statName: {
    fontFamily: typography.mono,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: 1,
    flex: 1,
  },
  statRange: {
    fontFamily: typography.monoBold,
    fontSize: fontSize.sm,
    color: colors.runeword,
    letterSpacing: 1.2,
  },
});
