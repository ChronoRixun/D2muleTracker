/**
 * Motion Intensity picker — three-card chooser dropped into the Codex.
 *
 * Each card shows 1/2/3 lit flame glyphs (Subtle/Nightmare/Hellforge), the
 * tier name in Cinzel, and the "Normal Difficulty / Dark · Ominous /
 * Maximum Intensity" sub-label. The active card glows in its tier accent.
 *
 * Below the cards: the active tier's italic Cormorant quote, then a
 * compact bullet list of what each tier actually does. Inactive tiers are
 * dimmed so the active one reads as the source of truth.
 *
 * If the OS reduced-motion setting is on, an "override" pill appears and
 * the picker stays interactive (so the user can still set their preference)
 * — but the rest of the app honours `effectiveMotion`, which is forced to
 * 'subtle'.
 */

import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  MOTION_TIERS,
  useSettings,
  type Motion,
  type MotionTierConfig,
} from '@/lib/settings';
import { colors, typography } from '@/lib/theme';

const TIER_ORDER: Motion[] = ['subtle', 'nightmare', 'hellforge'];

function accentFor(tier: Motion): string {
  if (tier === 'subtle') return colors.gold;
  if (tier === 'nightmare') return colors.ember;
  return colors.emberHi;
}

function tintFor(tier: Motion): string {
  if (tier === 'hellforge') return 'rgba(255,80,32,0.18)';
  if (tier === 'nightmare') return 'rgba(255,80,32,0.10)';
  return 'rgba(255,176,72,0.06)';
}

export function MotionIntensityPicker() {
  const { motion, setMotion, effectiveMotion, reducedMotion } = useSettings();
  const cfg = MOTION_TIERS[effectiveMotion];

  const handlePick = (next: Motion) => {
    if (next === motion) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    setMotion(next);
  };

  return (
    <View>
      <View style={styles.row}>
        {TIER_ORDER.map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            active={motion === tier}
            onPress={() => handlePick(tier)}
          />
        ))}
      </View>

      <View style={styles.quoteWrap}>
        <Text style={styles.quote}>&ldquo;{cfg.desc}&rdquo;</Text>
      </View>

      {reducedMotion ? (
        <View style={styles.reducedPill}>
          <Text style={styles.reducedText}>
            ◆ System reduced-motion active — running as Subtle regardless
          </Text>
        </View>
      ) : null}

      <Text style={styles.scopeNote}>
        Applied across Mules · Seek · Codex · Container detail · Modals
      </Text>

      <View style={styles.detailList}>
        {TIER_ORDER.map((tier) => (
          <TierDetail
            key={tier}
            cfg={MOTION_TIERS[tier]}
            tier={tier}
            active={effectiveMotion === tier}
          />
        ))}
      </View>
    </View>
  );
}

interface TierCardProps {
  tier: Motion;
  active: boolean;
  onPress: () => void;
}

function TierCard({ tier, active, onPress }: TierCardProps) {
  const cfg = MOTION_TIERS[tier];
  const accent = accentFor(tier);
  const litCount = tier === 'subtle' ? 1 : tier === 'nightmare' ? 2 : 3;

  return (
    <Pressable onPress={onPress} style={styles.cardPress}>
      <View
        style={[
          styles.card,
          {
            borderColor: active ? accent : colors.border,
            backgroundColor: active ? tintFor(tier) : colors.card,
            shadowColor: accent,
            shadowOpacity: active ? 0.6 : 0,
            shadowRadius: active ? 14 : 0,
            shadowOffset: { width: 0, height: 0 },
            elevation: active ? 6 : 0,
          },
        ]}
      >
        <View style={styles.flameStrip}>
          {[0, 1, 2].map((i) => {
            const lit = i < litCount;
            return (
              <Flame
                key={i}
                lit={lit}
                color={lit ? accent : colors.textFaint}
                glow={active && lit}
              />
            );
          })}
        </View>
        <Text
          style={[
            styles.cardLabel,
            {
              color: active ? accent : colors.text,
              textShadowColor: accent,
              textShadowRadius: active ? 8 : 0,
              textShadowOffset: { width: 0, height: 0 },
            },
          ]}
        >
          {cfg.label}
        </Text>
        <Text
          style={[
            styles.cardSub,
            { color: active ? colors.gold : colors.textDim },
          ]}
        >
          {cfg.sub}
        </Text>
      </View>
    </Pressable>
  );
}

function Flame({
  lit,
  color,
  glow,
}: {
  lit: boolean;
  color: string;
  glow: boolean;
}) {
  return (
    <View
      style={{
        width: 6,
        height: 11,
        backgroundColor: color,
        opacity: lit ? 1 : 0.35,
        // Diamond/teardrop silhouette — a poor-man's flame in pure View.
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderBottomLeftRadius: 1,
        borderBottomRightRadius: 1,
        shadowColor: color,
        shadowOpacity: glow ? 0.9 : 0,
        shadowRadius: glow ? 6 : 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: glow ? 4 : 0,
      }}
    />
  );
}

interface TierDetailProps {
  cfg: MotionTierConfig;
  tier: Motion;
  active: boolean;
}

const TIER_BULLETS: Record<Motion, string[]> = {
  subtle: [
    'Gentle 300 ms fade-ins',
    'Native scroll physics',
    'Accent dots pulse 90 → 100%',
    'No particles',
  ],
  nightmare: [
    'Heat shimmer on titles',
    '5–8 drifting embers',
    'Items glow on reveal',
    'Modal spring · edge flash on push',
  ],
  hellforge: [
    '20–30 embers + cinders pool',
    'Flames lick the bottom edge',
    'Molten glow titles · 0.8 s pulse',
    'Forge spark bursts every 2–4 s',
    'Firelight flicker on stat values',
  ],
};

function TierDetail({ cfg, tier, active }: TierDetailProps) {
  const bullets = TIER_BULLETS[tier];
  return (
    <View style={[styles.detailRow, { opacity: active ? 1 : 0.45 }]}>
      <Text
        style={[
          styles.detailLabel,
          {
            color: active ? colors.ember : colors.textDim,
            textShadowColor: colors.ember,
            textShadowRadius: active ? 6 : 0,
            textShadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {cfg.label}
      </Text>
      <View style={styles.detailItems}>
        {bullets.map((b, i) => (
          <View key={i} style={styles.bulletRow}>
            <View
              style={[
                styles.bulletDot,
                {
                  backgroundColor: active ? colors.ember : colors.textFaint,
                  shadowColor: colors.ember,
                  shadowOpacity: active ? 0.9 : 0,
                  shadowRadius: active ? 4 : 0,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: active ? 2 : 0,
                },
              ]}
            />
            <Text
              style={[
                styles.bulletText,
                { color: active ? colors.text : colors.textMuted },
              ]}
            >
              {b}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  cardPress: {
    flex: 1,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  flameStrip: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
    height: 12,
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: typography.displaySemi,
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardSub: {
    fontFamily: typography.mono,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  quoteWrap: {
    marginTop: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.ember,
  },
  quote: {
    fontFamily: typography.hand,
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  reducedPill: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,176,72,0.33)',
    backgroundColor: 'rgba(232,176,72,0.06)',
  },
  reducedText: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.gold,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  scopeNote: {
    marginTop: 14,
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 2.5,
    color: colors.textDim,
    textTransform: 'uppercase',
  },
  detailList: {
    marginTop: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    width: 76,
    fontFamily: typography.displaySemi,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
    paddingTop: 2,
    textTransform: 'uppercase',
  },
  detailItems: {
    flex: 1,
    gap: 3,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  bulletText: {
    fontFamily: typography.body,
    fontSize: 11,
    flex: 1,
  },
});
