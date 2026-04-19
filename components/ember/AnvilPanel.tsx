/**
 * AnvilPanel — gold-bordered panel with corner ornaments and a dark
 * cardHi → card → near-black gradient. Optional `glow` adds an ember halo
 * (iOS shadow + Android elevation + a 1px ember-tinted border ring as a
 * cross-platform fallback).
 *
 * Used as the Forge tab's hero panel and the Bind a Realm bottom sheet.
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/lib/theme';

interface Props {
  children: ReactNode;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
  noCorners?: boolean;
}

const ORNAMENT = 8;

export function AnvilPanel({ children, glow, style, noCorners }: Props) {
  return (
    <View
      style={[
        styles.outer,
        glow ? styles.glow : null,
        glow && Platform.OS === 'android' ? styles.glowAndroidRing : null,
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.cardHi, colors.card, '#0a0504']}
        locations={[0, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {!noCorners ? (
        <>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: colors.card,
    overflow: 'visible',
  },
  glow: {
    shadowColor: colors.ember,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  // Android falls back to a 1px ember-tinted border tone since shadows
  // don't render on the platform; combined with elevation this reads as glow.
  glowAndroidRing: {
    borderColor: 'rgba(255,80,32,0.55)',
  },
  corner: {
    position: 'absolute',
    width: ORNAMENT,
    height: ORNAMENT,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.gold,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.gold,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.gold,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.gold,
  },
});
