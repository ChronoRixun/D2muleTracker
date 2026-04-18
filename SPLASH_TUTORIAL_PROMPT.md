# Hoard: First-Launch Experience + App Icon Implementation

## Context
You're implementing the first-launch experience for Hoard, a D2 Resurrected mule tracker. This includes:
1. App icon (Diamond Sigil)
2. Static splash screen
3. Animated splash handoff (plays once on first launch)
4. Tutorial carousel (3 screens)
5. Guided first realm/container setup

**Important:** This is an Expo/React Native app. All references to the handoff doc at `O:\Claude\Hoard\NewIcons\claude-code-handoff.md` are already incorporated below.

---

## Part 1: App Icon — Diamond Sigil

### Export Assets

Create a Node.js script to generate all required icon sizes from the Diamond Sigil design.

**File:** `scripts/generate-app-icon.js`

```javascript
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Ember palette
const C = {
  void: '#030201',
  bg: '#0a0403',
  bg2: '#1c0d08',
  gold1: '#f5cf7a',
  gold2: '#e8b048',
  gold3: '#c88a28',
  goldDim: '#8a5018',
  ember1: '#ffd080',
  ember2: '#ff8038',
  ember3: '#ff5020',
  emberDim: '#b03810',
};

function drawDiamondSigil(ctx, size, withGlow = true) {
  const scale = size / 1024;
  const center = size / 2;

  // Background radial gradient
  const bgGrad = ctx.createRadialGradient(
    center, center * 1.1, 0,
    center, center * 1.1, size * 0.75
  );
  bgGrad.addColorStop(0, C.bg2);
  bgGrad.addColorStop(1, C.bg);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Outer glow (dark mode only)
  if (withGlow && size > 200) {
    ctx.save();
    ctx.filter = 'blur(20px)';
    ctx.fillStyle = C.ember3;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(center, center, 280 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Transform to center for rotated diamond
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(Math.PI / 4);

  // Outer diamond — forged gold
  const outerSize = 270 * scale;
  const goldGrad = ctx.createLinearGradient(0, -outerSize, 0, outerSize);
  goldGrad.addColorStop(0, C.gold1);
  goldGrad.addColorStop(0.5, C.gold2);
  goldGrad.addColorStop(1, C.gold3);
  
  ctx.fillStyle = goldGrad;
  ctx.fillRect(-outerSize, -outerSize, outerSize * 2, outerSize * 2);
  
  // Bevel — inner stroke
  ctx.strokeStyle = C.gold3;
  ctx.lineWidth = 6 * scale;
  ctx.strokeRect(-outerSize, -outerSize, outerSize * 2, outerSize * 2);

  // Black cutout 1
  ctx.fillStyle = C.bg;
  const cutout1 = 240 * scale;
  ctx.fillRect(-cutout1, -cutout1, cutout1 * 2, cutout1 * 2);

  // Inner diamond
  const innerSize = 170 * scale;
  ctx.fillStyle = goldGrad;
  ctx.fillRect(-innerSize, -innerSize, innerSize * 2, innerSize * 2);

  // Black cutout 2
  ctx.fillStyle = C.bg;
  const cutout2 = 140 * scale;
  ctx.fillRect(-cutout2, -cutout2, cutout2 * 2, cutout2 * 2);

  ctx.restore();

  // Ember core (not rotated)
  const emberGrad = ctx.createRadialGradient(center, center, 0, center, center, 95 * scale);
  emberGrad.addColorStop(0, C.ember1);
  emberGrad.addColorStop(0.3, C.ember2);
  emberGrad.addColorStop(0.7, C.ember3);
  emberGrad.addColorStop(1, 'transparent');
  
  ctx.fillStyle = emberGrad;
  ctx.beginPath();
  ctx.arc(center, center, 95 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Hot center
  ctx.fillStyle = '#ffe8b0';
  ctx.beginPath();
  ctx.arc(center, center, 40 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(center, center, 16 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function generateIcon(size, filename, withGlow = true) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  drawDiamondSigil(ctx, size, withGlow);
  
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '..', 'assets', 'icon', filename);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Generated ${filename} (${size}×${size})`);
}

// Generate all required sizes
generateIcon(1024, 'icon.png', true);           // App Store
generateIcon(1024, 'adaptive-icon.png', false); // Android foreground (no glow)
generateIcon(200, 'splash-icon.png', true);     // Splash screen
generateIcon(48, 'favicon.png', false);         // Web fallback

console.log('✨ App icons generated successfully');
```

**Add to package.json scripts:**
```json
{
  "scripts": {
    "generate:icons": "node scripts/generate-app-icon.js"
  }
}
```

**Run:** `npm run generate:icons`

### Update app.json

```json
{
  "expo": {
    "name": "Hoard",
    "icon": "./assets/icon/icon.png",
    "splash": {
      "image": "./assets/icon/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#070403"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.chronorixun.hoard"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon/adaptive-icon.png",
        "backgroundColor": "#0a0403"
      }
    }
  }
}
```

---

## Part 2: Animated Splash Handoff

### Create AnimatedSplash Component

**File:** `components/AnimatedSplash.tsx`

```typescript
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useSettings } from '@/lib/settings';
import { colors, typography } from '@/lib/theme';
import { Diamond } from './ember/Diamond';

interface AnimatedSplashProps {
  onComplete: () => void;
}

export function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const { motion } = useSettings();
  const progress = useSharedValue(0);
  const particles = motion === 'full' ? 16 : 0;

  // Full: 2.4s total
  // Subtle: 1.65s total
  const duration = motion === 'full' ? 2400 : 1650;

  useEffect(() => {
    progress.value = withTiming(1, {
      duration,
      easing: Easing.linear,
    });

    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // Sigil animations
  const sigilStyle = useAnimatedStyle(() => {
    if (motion === 'full') {
      // 0.0-0.6s: ember core ignites
      const emberAlpha = interpolate(progress.value, [0, 0.25], [0, 1], Easing.out(Easing.quad));
      return { opacity: emberAlpha };
    }
    // Subtle: simple fade in
    return { opacity: interpolate(progress.value, [0, 0.24], [0, 1]) };
  });

  // Wordmark animations
  const wordmarkStyle = useAnimatedStyle(() => {
    if (motion === 'full') {
      // 0.4-1.0s: wordmark fades in with flicker
      const t = progress.value;
      const fadeIn = interpolate(t, [0.17, 0.42], [0, 1], Easing.out(Easing.cubic));
      const scale = interpolate(t, [0.17, 0.42], [0.98, 1.0]);
      
      // Flicker effect: decaying sine for first 800ms after reveal
      const flickerPhase = (t - 0.17) * 18;
      const flicker = t > 0.17 && t < 0.5
        ? 1 + 0.25 * Math.sin(flickerPhase) * Math.exp(-(t - 0.17) * 2)
        : 1;
      
      return { opacity: fadeIn, transform: [{ scale: scale * flicker }] };
    }
    // Subtle: simple fade in
    return { opacity: interpolate(progress.value, [0.24, 0.48], [0, 1]) };
  });

  // Tagline animations
  const taglineStyle = useAnimatedStyle(() => {
    if (motion === 'full') {
      // 0.8-1.4s: tagline appears
      const fadeIn = interpolate(progress.value, [0.33, 0.58], [0, 1], Easing.out(Easing.cubic));
      return { opacity: fadeIn };
    }
    // Subtle: no tagline
    return { opacity: 0 };
  });

  // Full screen fade out
  const containerStyle = useAnimatedStyle(() => {
    if (motion === 'full') {
      // 2.0-2.4s: fade out (0.83-1.0)
      const fadeOut = interpolate(progress.value, [0.83, 1.0], [1, 0], Easing.in(Easing.cubic));
      return { opacity: Math.pow(fadeOut, 0.6) }; // Front-loaded curve
    }
    // Subtle: 1.4-1.65s: fade out
    const fadeOut = interpolate(progress.value, [0.85, 1.0], [1, 0]);
    return { opacity: fadeOut };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[colors.bg, colors.void]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Ambient ember glow (full mode only) */}
      {motion === 'full' && (
        <View style={styles.emberGlow}>
          <LinearGradient
            colors={['rgba(255,80,32,0.25)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0.4 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
      )}

      {/* Particles (full mode only) */}
      {particles > 0 && <ParticleField count={particles} />}

      {/* Diamond Sigil */}
      <Animated.View style={[styles.sigil, sigilStyle]}>
        <Diamond size="xl" color={colors.ember} />
      </Animated.View>

      {/* HOARD Wordmark */}
      <Animated.Text style={[styles.wordmark, wordmarkStyle]}>
        HOARD
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        even in hell, the damned keep ledgers
      </Animated.Text>
    </Animated.View>
  );
}

// Particle field component
function ParticleField({ count }: { count: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        x: 10 + Math.random() * 80,
        delay: Math.random() * 2,
        duration: 4000 + Math.random() * 5000,
        size: 1 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Particle key={i} particle={p} index={i} />
      ))}
    </View>
  );
}

function Particle({ particle, index }: { particle: any; index: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const delay = particle.delay * 1000;
    setTimeout(() => {
      progress.value = Animated.withRepeat(
        withTiming(1, {
          duration: particle.duration,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -120]);
    const translateX = interpolate(progress.value, [0, 1], [0, particle.drift]);
    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.85, 1],
      [0, 0.9, 0.6, 0]
    );
    
    return {
      opacity,
      transform: [{ translateX }, { translateY }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${particle.x}%`,
          bottom: -20,
          width: particle.size * 2,
          height: particle.size * 2,
          borderRadius: particle.size,
          backgroundColor: colors.emberHi,
          shadowColor: colors.ember,
          shadowOpacity: 0.9,
          shadowRadius: particle.size * 6,
          shadowOffset: { width: 0, height: 0 },
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
  emberGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
```

### Update Diamond Component

Make sure Diamond component supports `xl` size:

**File:** `components/ember/Diamond.tsx`

```typescript
// Add to size mapping:
const sizeMap = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 128, // NEW: for splash screen
};
```

---

## Part 3: Tutorial System

### Add Tutorial Completed Flag to Settings

**File:** `lib/settings.tsx` (update existing)

```typescript
export interface Settings {
  motion: Motion;
  density: Density;
  tutorialCompleted: boolean; // ADD THIS
}

const DEFAULTS: Settings = {
  motion: 'subtle',
  density: 'comfortable',
  tutorialCompleted: false, // ADD THIS
};

// Add to context value:
interface SettingsContextValue extends Settings {
  // ...existing
  setTutorialCompleted: (completed: boolean) => void;
}

// In provider's useMemo value:
setTutorialCompleted: (completed) => update({ tutorialCompleted: completed }),
```

### Create Tutorial Components

**File:** `components/tutorial/TutorialCarousel.tsx`

```typescript
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Diamond } from '@/components/ember/Diamond';
import { EmberBG } from '@/components/ember/EmberBG';
import { EmberBtn } from '@/components/ember/EmberBtn';
import { colors, spacing, typography } from '@/lib/theme';

interface TutorialCarouselProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialCarousel({
  visible,
  onComplete,
  onSkip,
}: TutorialCarouselProps) {
  const [step, setStep] = useState(0);
  const { width } = useWindowDimensions();

  const slides = [
    {
      diamond: { size: 'lg' as const, color: colors.ember },
      title: 'THE HOARD AWAITS',
      body: 'Your offline vault for Diablo 2 Resurrected.\n\nTrack every unique, set, runeword, and rune across all your mules and stashes.',
    },
    {
      diamonds: [
        { size: 'md' as const, color: colors.gold },
        { size: 'md' as const, color: colors.ember },
        { size: 'md' as const, color: colors.gold },
      ],
      title: 'REALMS → MULES → ITEMS',
      body: 'Realms group characters by era, mode, and ladder.\n\nMules and stashes hold your items.\n\nItems are cataloged with stats, sockets, and notes.',
    },
    {
      diamond: { size: 'lg' as const, color: colors.gold },
      title: 'FORGE YOUR REALM',
      body: "Let's create your first realm and mule.\n\nYou can add more realms and mules anytime.",
    },
  ];

  const currentSlide = slides[step];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onSkip}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <EmberBG />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <ScrollView
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width: width * 3 }}
            scrollEventThrottle={16}
          >
            {slides.map((slide, i) => (
              <View key={i} style={[styles.slide, { width }]}>
                {'diamond' in slide ? (
                  <Diamond size={slide.diamond.size} color={slide.diamond.color} />
                ) : (
                  <View style={styles.diamondStack}>
                    {slide.diamonds!.map((d, j) => (
                      <Diamond key={j} size={d.size} color={d.color} />
                    ))}
                  </View>
                )}
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.body}>{slide.body}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Page indicators */}
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Navigation */}
          <View style={styles.footer}>
            {step > 0 && (
              <View style={{ flex: 1 }}>
                <EmberBtn
                  variant="ghost"
                  full
                  onPress={() => setStep(step - 1)}
                >
                  ← Back
                </EmberBtn>
              </View>
            )}
            <View style={{ flex: 1 }}>
              {step < slides.length - 1 ? (
                <EmberBtn full onPress={() => setStep(step + 1)}>
                  Next →
                </EmberBtn>
              ) : (
                <EmberBtn full onPress={onComplete}>
                  Begin →
                </EmberBtn>
              )}
            </View>
          </View>

          {step === slides.length - 1 && (
            <View style={styles.skipRow}>
              <EmberBtn variant="ghost" full onPress={onSkip}>
                Skip Tutorial
              </EmberBtn>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 24,
  },
  diamondStack: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.displaySemi,
    fontSize: 28,
    letterSpacing: 4,
    color: colors.gold,
    textAlign: 'center',
  },
  body: {
    fontFamily: typography.hand,
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 320,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textDim,
  },
  dotActive: {
    backgroundColor: colors.ember,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
});
```

---

## Part 4: Wire Everything Together

### Update app/_layout.tsx

```typescript
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { TutorialCarousel } from '@/components/tutorial/TutorialCarousel';
import { useSettings } from '@/lib/settings';

// Prevent auto-hide
SplashScreen.preventAutoHideAsync().catch(() => undefined);

let hasPlayedAnimatedSplash = false; // Module-level flag for warm starts

export default function RootLayout() {
  const { tutorialCompleted, setTutorialCompleted } = useSettings();
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(
    !hasPlayedAnimatedSplash && Platform.OS !== 'web'
  );
  const [showTutorial, setShowTutorial] = useState(false);
  const [fontsLoaded] = useFonts({
    // ...existing font config
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  const handleAnimatedSplashComplete = () => {
    hasPlayedAnimatedSplash = true;
    setShowAnimatedSplash(false);
    
    // Show tutorial if not completed
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
    // Tutorial completion triggers guided setup (implement in tutorial component)
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
  };

  if (Platform.OS === 'web') {
    return <WebUnsupported />;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <DatabaseProvider loadingFallback={<Loading />}>
            <StatusBar style="light" />
            <Stack screenOptions={{...}}>
              {/* Existing screens */}
            </Stack>

            {/* Animated splash - plays once on cold start */}
            {showAnimatedSplash && (
              <AnimatedSplash onComplete={handleAnimatedSplashComplete} />
            )}

            {/* Tutorial - shows after splash if not completed */}
            <TutorialCarousel
              visible={showTutorial}
              onComplete={handleTutorialComplete}
              onSkip={handleTutorialSkip}
            />
          </DatabaseProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### Add Replay Tutorial Button to Settings

**File:** `app/(tabs)/settings.tsx`

In the About section, add:

```typescript
<View style={{ marginTop: spacing.md }}>
  <EmberBtn
    variant="ghost"
    full
    onPress={() => {
      setTutorialCompleted(false);
      // Show tutorial on next restart
      Alert.alert(
        'Tutorial Reset',
        'The tutorial will show the next time you open the app.'
      );
    }}
  >
    Replay Tutorial
  </EmberBtn>
</View>
```

---

## Testing Checklist

After implementation:

- [ ] Run `npm run generate:icons` and verify icon files created
- [ ] App icon shows correctly on device home screen
- [ ] Static splash displays on app launch (black bg, diamond sigil)
- [ ] Animated splash plays once on first launch
  - [ ] Full Hellforge: particles, flicker, tagline
  - [ ] Subtle: simple fades, no particles
- [ ] Tutorial shows after animated splash (first launch only)
- [ ] Tutorial can be skipped
- [ ] Tutorial can be completed (Begin button)
- [ ] Tutorial doesn't show on second launch
- [ ] "Replay Tutorial" button in Settings resets flag
- [ ] Tutorial respects motion setting

---

## Important Notes

1. **First-launch sequence:**
   - Static splash (Apple requirement)
   - Animated handoff (once, 2.4s or 1.65s)
   - Tutorial carousel (if not completed)
   - Mules tab

2. **Warm starts:** Animated splash skipped via module flag

3. **Motion modes:**
   - Full Hellforge: particles, pulse, flicker
   - Subtle: simple fades, performance-first

4. **Tutorial can be extended later** with guided setup (create realm + mule)

Execute this implementation carefully, test each piece, and verify the entire flow works smoothly.
