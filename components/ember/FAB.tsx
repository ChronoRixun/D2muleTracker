/**
 * Floating action button — ember radial glow, press animation,
 * optional pulse loop when motion is full.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMotionConfig } from '@/lib/settings';
import { colors } from '@/lib/theme';
import { EIcon, type EIconName } from './EIcon';

interface Props {
  onPress?: () => void;
  icon?: EIconName;
  bottom?: number;
  right?: number;
}

export function FAB({ onPress, icon = 'plus', bottom = 94, right = 20 }: Props) {
  const cfg = useMotionConfig();
  const animated = cfg.itemGlowPulse;
  const pulse = useSharedValue(0.85);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!animated) {
      cancelAnimation(pulse);
      pulse.value = 0.85;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 1400 }), -1, true);
    return () => cancelAnimation(pulse);
  }, [animated, pulse]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => undefined,
        );
        onPress?.();
      }}
      onPressIn={() => {
        scale.value = withTiming(0.94, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      style={[styles.root, { bottom, right }]}
    >
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.View style={[styles.inner, pressStyle]}>
        <LinearGradient
          colors={[colors.emberHi, colors.lava, '#400808']}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <EIcon name={icon} size={22} color="#fff" stroke={1.8} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    shadowColor: colors.ember,
    shadowOpacity: 0.8,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
    backgroundColor: colors.lava,
  },
  inner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
