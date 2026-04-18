/**
 * Tutorial carousel — shown once on first launch after the animated splash.
 * Three slides introducing the Realm → Mule → Item hierarchy, then hands
 * off to the app. User can skip at any time from the final slide.
 */

import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
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

type Slide =
  | {
      kind: 'single';
      color: string;
      title: string;
      body: string;
    }
  | {
      kind: 'stack';
      colors: string[];
      title: string;
      body: string;
    };

const SLIDES: Slide[] = [
  {
    kind: 'single',
    color: colors.ember,
    title: 'THE HOARD AWAITS',
    body: 'Your offline vault for Diablo 2 Resurrected.\n\nTrack every unique, set, runeword, and rune across all your mules and stashes.',
  },
  {
    kind: 'stack',
    colors: [colors.gold, colors.ember, colors.gold],
    title: 'REALMS → MULES → ITEMS',
    body: 'Realms group characters by era, mode, and ladder.\n\nMules and stashes hold your items.\n\nItems are cataloged with stats, sockets, and notes.',
  },
  {
    kind: 'single',
    color: colors.gold,
    title: 'FORGE YOUR REALM',
    body: "Let's create your first realm and mule.\n\nYou can add more realms and mules anytime.",
  },
];

export function TutorialCarousel({
  visible,
  onComplete,
  onSkip,
}: TutorialCarouselProps) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onSkip}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <EmberBG />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.slide}>
            {slide.kind === 'single' ? (
              <Diamond size="xl" color={slide.color} />
            ) : (
              <View style={styles.diamondStack}>
                {slide.colors.map((c, j) => (
                  <Diamond key={j} size={40} color={c} />
                ))}
              </View>
            )}
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>

          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === step && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.footer}>
            {step > 0 ? (
              <View style={{ flex: 1 }}>
                <EmberBtn
                  variant="ghost"
                  full
                  onPress={() => setStep(step - 1)}
                >
                  ← Back
                </EmberBtn>
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              {isLast ? (
                <EmberBtn full onPress={onComplete}>
                  Begin →
                </EmberBtn>
              ) : (
                <EmberBtn full onPress={() => setStep(step + 1)}>
                  Next →
                </EmberBtn>
              )}
            </View>
          </View>

          {isLast ? (
            <View style={styles.skipRow}>
              <EmberBtn variant="ghost" full onPress={onSkip}>
                Skip Tutorial
              </EmberBtn>
            </View>
          ) : (
            <View style={styles.skipRow}>
              <EmberBtn variant="ghost" full onPress={onSkip}>
                Skip
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
    paddingHorizontal: 32,
    gap: 28,
  },
  diamondStack: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.displaySemi,
    fontSize: 28,
    letterSpacing: 4,
    color: colors.gold,
    textAlign: 'center',
    marginTop: spacing.md,
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
    marginBottom: spacing.lg,
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  skipRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
