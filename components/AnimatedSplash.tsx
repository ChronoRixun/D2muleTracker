/**
 * Animated splash handoff — plays once on cold launch, fades out into the
 * static app UI. The static splash (configured in app.json) shows first,
 * then this component overlays and performs the "ember ignites → wordmark
 * reveals → fade to app" choreography.
 *
 * Honors the user's motion setting:
 *   - "full" Hellforge: 2.4s with particles, flicker, pulsing glow, tagline
 *   - "subtle":          1.65s — simple fades, no particles, no tagline
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

import { Diamond } from '@/components/ember/Diamond';
import { useSettings } from '@/lib/settings';
import { colors, typography } from '@/lib/theme';

interface AnimatedSplashProps {
  onComplete: () => void;
}

export function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const { motion } = useSettings();
  const progress = useSharedValue(0);
  const particles = motion === 'full' ? 16 : 0;

  // Full: 2.4s total. Subtle: 1.65s total.
  const duration = motion === 'full' ? 2400 : 1650;

  useEffect(() => {
    progress.value = withTiming(1, {
      duration,
      easing: Easing.linear,
    });

    const timer = setTimeout(onComplete, duration);
    return () => {
      clearTimeout(timer);
      cancelAnimation(progress);
    };
    // progress/onComplete are stable; run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const sigilStyle = useAnimatedStyle(() => {
    if (motion === 'full') {
      // 0.0-0.6s: ember core ignites
      const emberAlpha = interpolate(progress.value, [0, 0.25], [0, 1]);
      return { opacity: emberAlpha };
    }
    return { opacity: interpolate(progress.value, [0, 0.24], [0, 1]) };
  });

  const wordmarkStyle = useAnimatedStyle(() => {
    if (motion === 'full') {
      // 0.4-1.0s: wordmark fades in, decaying flicker for ~800ms
      const t = progress.value;
      const fadeIn = interpolate(t, [0.17, 0.42], [0, 1]);
      const scaleIn = interpolate(t, [0.17, 0.42], [0.98, 1.0]);

      const flickerPhase = (t - 0.17) * 18;
      const flicker =
        t > 0.17 && t < 0.5
          ? 1 + 0.25 * Math.sin(flickerPhase) * Math.exp(-(t - 0.17) * 2)
          : 1;

      return { opacity: fadeIn, transform: [{ scale: scaleIn * flicker }] };
    }
    return { opacity: interpolate(progress.value, [0.24, 0.48], [0, 1]) };
  });

  const taglineStyle = useAnimatedStyle(() => {
    if (motion === 'full') {
      // 0.8-1.4s: tagline reveal
      const fadeIn = interpolate(progress.value, [0.33, 0.58], [0, 1]);
      return { opacity: fadeIn };
    }
    return { opacity: 0 };
  });

  const containerStyle = useAnimatedStyle(() => {
    if (motion === 'full') {
      // 2.0-2.4s: fade out (0.83-1.0)
      const fadeOut = interpolate(progress.value, [0.83, 1.0], [1, 0]);
      return { opacity: Math.pow(Math.max(fadeOut, 0), 0.6) };
    }
    const fadeOut = interpolate(progress.value, [0.85, 1.0], [1, 0]);
    return { opacity: fadeOut };
  });

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={[colors.bg, colors.void]}
        style={StyleSheet.absoluteFill}
      />

      {motion === 'full' ? (
        <LinearGradient
          colors={['rgba(255,80,32,0.25)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.4 }}
          end={{ x: 0.5, y: 1 }}
        />
      ) : null}

      {particles > 0 ? <ParticleField count={particles} /> : null}

      <Animated.View style={[styles.sigil, sigilStyle]}>
        <Diamond size="xl" color={colors.ember} />
      </Animated.View>

      <Animated.Text style={[styles.wordmark, wordmarkStyle]}>
        HOARD
      </Animated.Text>

      <Animated.Text style={[styles.tagline, taglineStyle]}>
        even in hell, the damned keep ledgers
      </Animated.Text>
    </Animated.View>
  );
}

interface ParticleSpec {
  x: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

function ParticleField({ count }: { count: number }) {
  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: count }).map(() => ({
        x: 10 + Math.random() * 80,
        delay: Math.random() * 2000,
        duration: 4000 + Math.random() * 5000,
        size: 1 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Particle key={i} particle={p} />
      ))}
    </View>
  );
}

function Particle({ particle }: { particle: ParticleSpec }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(1, {
          duration: particle.duration,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -160]);
    const translateX = interpolate(progress.value, [0, 1], [0, particle.drift]);
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

  const px = particle.size * 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: `${particle.x}%`,
          bottom: -20,
          width: px,
          height: px,
          borderRadius: particle.size,
          backgroundColor: colors.emberHi,
          shadowColor: colors.ember,
          shadowOpacity: 0.9,
          shadowRadius: particle.size * 6,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.void,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  sigil: {
    marginBottom: 40,
  },
  wordmark: {
    fontFamily: typography.display,
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: 10,
    color: colors.text,
    textShadowColor: colors.ember,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  tagline: {
    fontFamily: typography.hand,
    fontStyle: 'italic',
    fontSize: 16,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
});
