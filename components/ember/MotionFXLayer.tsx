/**
 * Motion FX overlay layer — drops in above the app, below the status bar.
 *
 * Renders the tier-scaled effects that aren't tied to any specific screen:
 *   • AmbientEmbers — small glowing dots drifting upward (Nightmare/Hellforge)
 *   • Flames        — SVG tongues licking the bottom edge (Nightmare/Hellforge)
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
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';

import { useMotionConfig } from '@/lib/settings';
import { colors } from '@/lib/theme';

export function MotionFXLayer() {
  const cfg = useMotionConfig();

  if (cfg.ambientParticles === 0 && cfg.flameCount === 0 && !cfg.vignetteOpacity && !cfg.forgeSparks) {
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
      {cfg.flameCount > 0 ? (
        <Flames count={cfg.flameCount} opacity={cfg.flameOpacity} />
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
// Flames — SVG tongues along the bottom; scaleY flicker + horizontal wobble
// ---------------------------------------------------------------------------

interface FlameSpec {
  key: number;
  width: number;
  height: number;
  left: number;
  flickerDur: number;
  wobbleDur: number;
  glowDur: number;
  delay: number;
  fsMin: number;
  fsMax: number;
  hue: 'core' | 'mid' | 'outer';
}

const FLAME_PATH =
  'M50 120 C 15 110, 15 85, 30 60 C 38 48, 34 38, 40 28 C 44 20, 48 22, 48 34 ' +
  'C 52 24, 60 18, 58 8 C 58 2, 64 2, 66 10 C 72 24, 78 40, 78 58 ' +
  'C 78 76, 88 82, 88 98 C 88 112, 72 120, 50 120 Z';

function Flames({ count, opacity }: { count: number; opacity: number }) {
  const flames = useMemo<FlameSpec[]>(() => {
    const arr: FlameSpec[] = [];
    for (let i = 0; i < count; i++) {
      const r = pseudoRandom(i + 1000);
      const r2 = pseudoRandom(i + 2000);
      const r3 = pseudoRandom(i + 3000);
      const r4 = pseudoRandom(i + 4000);
      arr.push({
        key: i,
        width: 60 + r * 80,
        height: 80 + r2 * 130,
        left: ((i + 0.5) / count) * 100 + (r3 - 0.5) * (40 / count),
        flickerDur: 550 + r2 * 450,
        wobbleDur: 1800 + r * 1400,
        glowDur: 900 + r3 * 600,
        delay: r4 * 2000,
        fsMin: 0.78 + r * 0.08,
        fsMax: 1.02 + r2 * 0.12,
        hue: r3 > 0.6 ? 'core' : r3 > 0.25 ? 'mid' : 'outer',
      });
    }
    return arr.sort((a, b) => a.height - b.height);
  }, [count]);

  return (
    <View style={[styles.flamesWrap, { opacity }]} pointerEvents="none">
      <LinearGradient
        colors={[
          'rgba(255,120,60,0.55)',
          'rgba(255,80,32,0.25)',
          'transparent',
        ]}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.flameBaseGlow}
      />
      {flames.map((f) => (
        <FlameTongue key={f.key} spec={f} />
      ))}
    </View>
  );
}

function FlameTongue({ spec }: { spec: FlameSpec }) {
  const flicker = useSharedValue(0);
  const wobble = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    flicker.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: spec.flickerDur * 0.5 }),
          withTiming(0, { duration: spec.flickerDur * 0.5 }),
        ),
        -1,
        false,
      ),
    );
    wobble.value = withRepeat(
      withTiming(1, {
        duration: spec.wobbleDur,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    glow.value = withRepeat(
      withTiming(1, {
        duration: spec.glowDur,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(flicker);
      cancelAnimation(wobble);
      cancelAnimation(glow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scaleY = interpolate(flicker.value, [0, 1], [spec.fsMin, spec.fsMax]);
    const skewDeg = interpolate(wobble.value, [0, 1], [-2, 3]);
    const opacity = interpolate(glow.value, [0, 1], [0.55, 1]);
    return {
      opacity,
      transform: [
        { scaleY },
        { skewX: `${skewDeg}deg` },
      ],
    };
  });

  const colorFor = (hue: FlameSpec['hue']) => {
    if (hue === 'core') return { fill: '#ffb050', glow: '#ff8800' };
    if (hue === 'mid') return { fill: '#ff6600', glow: '#ff4500' };
    return { fill: '#c83018', glow: '#b03810' };
  };
  const c = colorFor(spec.hue);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${spec.left}%`,
          bottom: -10,
          width: spec.width,
          height: spec.height,
          marginLeft: -spec.width / 2,
          shadowColor: c.glow,
          shadowOpacity: 0.85,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -6 },
          elevation: 5,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Svg
        viewBox="0 0 100 120"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgLinearGradient
            id={`flameGrad${spec.key}`}
            x1="50%"
            y1="100%"
            x2="50%"
            y2="0%"
          >
            <Stop offset="0%" stopColor={c.glow} stopOpacity={0.95} />
            <Stop offset="45%" stopColor={c.fill} stopOpacity={0.85} />
            <Stop offset="80%" stopColor="#ffd080" stopOpacity={0.45} />
            <Stop offset="100%" stopColor="#fff5c8" stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        <Path d={FLAME_PATH} fill={`url(#flameGrad${spec.key})`} />
      </Svg>
    </Animated.View>
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
  flamesWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  flameBaseGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
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
