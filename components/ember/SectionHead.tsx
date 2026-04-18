/**
 * SectionHead — the Ember-era screen title block. Eyebrow (small mono caps
 * + diamond), then a big Cinzel title. When motion is full, the title
 * emits an ember text-shadow flicker driven by Reanimated.
 */

import { useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useSettings } from '@/lib/settings';
import { colors, typography } from '@/lib/theme';
import { Diamond } from './Diamond';

interface Props {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
  style?: ViewStyle;
}

export function SectionHead({ eyebrow, title, right, style }: Props) {
  const { motion } = useSettings();
  const flicker = useSharedValue(0.4);

  useEffect(() => {
    if (motion !== 'full') {
      cancelAnimation(flicker);
      flicker.value = 0.4;
      return;
    }
    flicker.value = withRepeat(
      withTiming(1, { duration: 1600 }),
      -1,
      true,
    );
    return () => cancelAnimation(flicker);
  }, [motion, flicker]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: flicker.value,
  }));

  return (
    <View style={[styles.wrap, style]}>
      {eyebrow ? (
        <View style={styles.eyebrowRow}>
          <Diamond size="sm" color={colors.ember} />
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>
      ) : null}
      <View style={styles.titleRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {/* Ember glow overlay — same text, ember color, animated opacity */}
          <Animated.Text
            pointerEvents="none"
            style={[styles.titleGlow, glowStyle]}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 28,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  eyebrow: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    position: 'relative',
  },
  title: {
    fontFamily: typography.displaySemi,
    fontSize: 32,
    color: colors.gold,
    letterSpacing: 4,
    lineHeight: 34,
  },
  titleGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    fontFamily: typography.displaySemi,
    fontSize: 32,
    color: colors.ember,
    letterSpacing: 4,
    lineHeight: 34,
    textShadowColor: colors.ember,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
});
