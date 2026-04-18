/**
 * Full-bleed background — charred stone with ember-glow pools.
 *
 * Radial gradients aren't native in RN, so each "pool" is a large absolutely-
 * positioned View tinted with a single linear gradient running from colored
 * center → transparent edges. Close enough to the web reference and cheap.
 *
 * In Full Hellforge motion, a small cloud of Reanimated dots floats upward
 * and fades. In Subtle, static accent dots sit where the motion would.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMotionConfig } from '@/lib/settings';
import { colors } from '@/lib/theme';

interface Spot {
  x: number; // percent from left
  y: number; // percent from top
  size: number;
  dur: number;
}

// Hand-tuned "deterministic-ish" cluster — mirrors ember/atoms.jsx
const SPOTS: Spot[] = [
  { x: 72, y: 18, size: 2, dur: 7000 },
  { x: 18, y: 42, size: 2.5, dur: 11000 },
  { x: 86, y: 66, size: 2, dur: 5000 },
  { x: 40, y: 82, size: 2, dur: 9000 },
  { x: 55, y: 28, size: 2.5, dur: 6000 },
  { x: 28, y: 18, size: 1.6, dur: 8000 },
  { x: 78, y: 48, size: 1.8, dur: 10000 },
  { x: 12, y: 72, size: 2, dur: 7500 },
  { x: 62, y: 62, size: 1.4, dur: 12000 },
];

export function EmberBG() {
  const cfg = useMotionConfig();
  const particles = cfg.legacyFull;
  const intensity = cfg.bgIntensity;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

      {/* Top ember pool */}
      <LinearGradient
        colors={[
          `rgba(255, 80, 32, ${0.22 * intensity})`,
          'rgba(255, 80, 32, 0)',
        ]}
        style={styles.topPool}
        locations={[0, 1]}
      />

      {/* Bottom-left lava pool */}
      <LinearGradient
        colors={[
          `rgba(200, 48, 24, ${0.18 * intensity})`,
          'rgba(200, 48, 24, 0)',
        ]}
        style={styles.bottomLeftPool}
        locations={[0, 1]}
      />

      {/* Bottom-right ember shimmer */}
      <LinearGradient
        colors={[
          `rgba(255, 120, 48, ${0.12 * intensity})`,
          'rgba(255, 120, 48, 0)',
        ]}
        style={styles.bottomRightPool}
        locations={[0, 1]}
      />

      {/* Bottom floor glow */}
      <LinearGradient
        colors={['rgba(255, 80, 32, 0)', `rgba(255, 80, 32, ${0.14 * intensity})`]}
        style={styles.floorGlow}
      />

      {/* Inner vignette */}
      <View pointerEvents="none" style={styles.vignette} />

      {particles
        ? SPOTS.map((spot, i) => <Particle key={i} spot={spot} index={i} />)
        : SPOTS.slice(0, 4).map((spot, i) => (
            <StaticDot key={`s-${i}`} spot={spot} />
          ))}
    </View>
  );
}

function Particle({ spot, index }: { spot: Spot; index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const delay = (index * 700) % spot.dur;
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: spot.dur,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drift = useMemo(
    () => (index % 2 === 0 ? 1 : -1) * (10 + ((index * 3) % 24)),
    [index],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -120]);
    const translateX = interpolate(progress.value, [0, 1], [0, drift]);
    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.85, 1],
      [0, 0.9, 0.6, 0],
    );
    return {
      opacity,
      transform: [{ translateX }, { translateY }],
    };
  });

  const px = spot.size * 3; // ember particles are tiny in the web design
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: `${spot.x}%`,
          top: `${spot.y}%`,
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: colors.emberHi,
          shadowColor: colors.ember,
          shadowOpacity: 0.9,
          shadowRadius: spot.size * 6,
          shadowOffset: { width: 0, height: 0 },
          // Android fallback: elevation tints with gray, so we approximate
          // with a slightly larger soft backdrop below via a parent ring.
          elevation: 6,
        },
        animatedStyle,
      ]}
    />
  );
}

function StaticDot({ spot }: { spot: Spot }) {
  const px = spot.size * 3;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        width: px,
        height: px,
        borderRadius: px / 2,
        backgroundColor: colors.emberHi,
        opacity: 0.5,
        shadowColor: colors.ember,
        shadowOpacity: 0.7,
        shadowRadius: spot.size * 5,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
      }}
    />
  );
}

const styles = StyleSheet.create({
  topPool: {
    position: 'absolute',
    top: -200,
    left: '25%',
    width: 620,
    height: 600,
    borderRadius: 310,
    transform: [{ scaleX: 1 }],
  },
  bottomLeftPool: {
    position: 'absolute',
    bottom: -160,
    left: -120,
    width: 520,
    height: 480,
    borderRadius: 260,
  },
  bottomRightPool: {
    position: 'absolute',
    bottom: -120,
    right: -140,
    width: 560,
    height: 500,
    borderRadius: 280,
  },
  floorGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
});
