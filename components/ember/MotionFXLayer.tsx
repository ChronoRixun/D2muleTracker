/**
 * Motion FX overlay layer — drops in above the app, below the status bar.
 *
 * Renders the tier-scaled effects that aren't tied to any specific screen:
 *   • AmbientEmbers — small glowing dots drifting upward (Nightmare/Hellforge)
 *   • EdgeVignette  — orange inset frame; pulses on Hellforge
 *   • ForgeSparks   — periodic spark bursts near the top (Hellforge only)
 *
 * Counts/durations come from `useMotionConfig()` so the system reduced-motion
 * override (which forces Subtle) cleanly suppresses everything.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
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

export function MotionFXLayer() {
  const cfg = useMotionConfig();

  if (cfg.ambientParticles === 0 && !cfg.vignetteOpacity && !cfg.forgeSparks) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {cfg.ambientParticles > 0 || cfg.cinderParticles > 0 ? (
        <AmbientEmbers
          count={cfg.ambientParticles}
          cinders={cfg.cinderParticles}
        />
      ) : null}
      {cfg.vignetteOpacity > 0 ? (
        <EdgeVignette
          peak={cfg.vignetteOpacity}
          pulse={cfg.vignettePulse}
        />
      ) : null}
      {cfg.forgeSparks ? <ForgeSparks /> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Ambient embers — tiny glowing dots drifting up, with horizontal sway
// ---------------------------------------------------------------------------

interface EmberSpec {
  key: string;
  left: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
  peak: number;
  color: string;
  outer: string;
  kind: 'ember' | 'cinder';
}

function pseudoRandom(i: number): number {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function AmbientEmbers({
  count,
  cinders,
}: {
  count: number;
  cinders: number;
}) {
  const particles = useMemo<EmberSpec[]>(() => {
    const arr: EmberSpec[] = [];
    for (let i = 0; i < count; i++) {
      const r = pseudoRandom(i);
      const r2 = pseudoRandom(i + 100);
      const r3 = pseudoRandom(i + 200);
      const r4 = pseudoRandom(i + 300);
      const dur = 9000 + r2 * 6000;
      arr.push({
        key: `e${i}`,
        left: r * 100,
        size: 1.4 + r * 2.2,
        drift: (r3 - 0.5) * 60,
        duration: dur,
        delay: r4 * dur,
        peak: 0.55 + r2 * 0.35,
        color: r3 > 0.5 ? '#ff6600' : '#ff4500',
        outer: colors.emberHi,
        kind: 'ember',
      });
    }
    for (let i = 0; i < cinders; i++) {
      const r = pseudoRandom(i + 500);
      const r2 = pseudoRandom(i + 600);
      const r3 = pseudoRandom(i + 700);
      const dur = 16000 + r2 * 6000;
      arr.push({
        key: `c${i}`,
        left: r * 100,
        size: 3 + r * 2.5,
        drift: (r - 0.5) * 40,
        duration: dur,
        delay: r3 * dur,
        peak: 0.32,
        color: '#ff4500',
        outer: '#b03810',
        kind: 'cinder',
      });
    }
    return arr;
  }, [count, cinders]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Ember key={p.key} spec={p} />
      ))}
    </View>
  );
}

function Ember({ spec }: { spec: EmberSpec }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(1, {
          duration: spec.duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -900]);
    const translateX = interpolate(progress.value, [0, 1], [0, spec.drift]);
    const opacity = interpolate(
      progress.value,
      [0, 0.18, 0.7, 1],
      [0, spec.peak, spec.peak, 0],
    );
    const scale = interpolate(progress.value, [0, 1], [0.9, 1]);
    return {
      opacity,
      transform: [{ translateX }, { translateY }, { scale }],
    };
  });

  const px = spec.size * 2;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: `${spec.left}%`,
          bottom: -24,
          width: px,
          height: px,
          borderRadius: spec.size,
          backgroundColor: spec.color,
          shadowColor: spec.outer,
          shadowOpacity: 0.95,
          shadowRadius: spec.size * 6,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
        animatedStyle,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Edge vignette — orange inset frame approximated by four thin gradient bands.
// ---------------------------------------------------------------------------

function EdgeVignette({ peak, pulse }: { peak: number; pulse: boolean }) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (!pulse) {
      cancelAnimation(t);
      t.value = 0;
      return;
    }
    t.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(t);
  }, [pulse, t]);

  const animatedStyle = useAnimatedStyle(() => {
    const o = pulse
      ? interpolate(t.value, [0, 1], [peak * 0.45, peak])
      : peak * 0.7;
    return { opacity: o };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="none">
      <LinearGradient
        colors={['rgba(255,80,32,0.7)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.vEdge, { top: 0, height: 80 }]}
      />
      <LinearGradient
        colors={['transparent', 'rgba(255,80,32,0.7)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.vEdge, { bottom: 0, height: 80 }]}
      />
      <LinearGradient
        colors={['rgba(255,80,32,0.6)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.hEdge, { left: 0, width: 60 }]}
      />
      <LinearGradient
        colors={['transparent', 'rgba(255,80,32,0.6)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.hEdge, { right: 0, width: 60 }]}
      />
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Forge sparks — short bursts of small dots near the top of the screen.
// ---------------------------------------------------------------------------

interface SparkBurst {
  id: number;
  x: number;
  sparks: Array<{
    id: number;
    sx: number;
    sy: number;
    delay: number;
    dur: number;
    size: number;
  }>;
}

function ForgeSparks() {
  const [bursts, setBursts] = useState<SparkBurst[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const wait = 2000 + Math.random() * 2500;
      timer = setTimeout(() => {
        if (stopped) return;
        const id = ++idRef.current;
        const x = 20 + Math.random() * 70;
        const n = 3 + Math.floor(Math.random() * 3);
        const sparks = Array.from({ length: n }).map((_, i) => ({
          id: i,
          sx: (Math.random() - 0.5) * 40,
          sy: -(20 + Math.random() * 26),
          delay: Math.random() * 120,
          dur: 500 + Math.random() * 300,
          size: 2 + Math.random() * 2,
        }));
        setBursts((prev) => [...prev, { id, x, sparks }]);
        const longest =
          Math.max(...sparks.map((s) => s.delay + s.dur)) + 100;
        setTimeout(
          () => setBursts((prev) => prev.filter((b) => b.id !== id)),
          longest,
        );
        schedule();
      }, wait);
    };

    schedule();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.sparksWrap} pointerEvents="none">
      {bursts.map((b) => (
        <View
          key={b.id}
          style={{ position: 'absolute', left: `${b.x}%`, top: 0 }}
          pointerEvents="none"
        >
          {b.sparks.map((s) => (
            <Spark
              key={s.id}
              sx={s.sx}
              sy={s.sy}
              dur={s.dur}
              delay={s.delay}
              size={s.size}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function Spark({
  sx,
  sy,
  dur,
  delay,
  size,
}: {
  sx: number;
  sy: number;
  dur: number;
  delay: number;
  size: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withTiming(1, {
        duration: dur,
        easing: Easing.bezier(0.2, 0.7, 0.4, 1),
      }),
    );
    return () => cancelAnimation(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const tx = interpolate(t.value, [0, 1], [0, sx]);
    const ty = interpolate(t.value, [0, 1], [0, sy]);
    const scale = interpolate(t.value, [0, 1], [0.3, 1]);
    const opacity = interpolate(t.value, [0, 0.15, 1], [0, 1, 0]);
    return {
      opacity,
      transform: [{ translateX: tx }, { translateY: ty }, { scale }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#ff8800',
          shadowColor: '#ff6600',
          shadowOpacity: 1,
          shadowRadius: size * 3,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  vEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  hEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  sparksWrap: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    height: 100,
  },
});
