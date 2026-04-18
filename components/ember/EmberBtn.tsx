/**
 * Ember button — primary (ember gradient), ghost (gold outline),
 * outline (neutral), danger. Snappy press animation via Reanimated.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Children, isValidElement, useCallback, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, typography } from '@/lib/theme';

export type EmberBtnVariant = 'primary' | 'ghost' | 'outline' | 'danger';
export type EmberBtnSize = 'sm' | 'md' | 'lg';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  variant?: EmberBtnVariant;
  size?: EmberBtnSize;
  full?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  leading?: ReactNode;
  trailing?: ReactNode;
}

const SIZE_STYLES: Record<
  EmberBtnSize,
  { height: number; pad: number; font: number; letterSpacing: number }
> = {
  sm: { height: 36, pad: 14, font: 11, letterSpacing: 1.5 },
  md: { height: 44, pad: 18, font: 13, letterSpacing: 3 },
  lg: { height: 52, pad: 22, font: 15, letterSpacing: 3 },
};

export function EmberBtn({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  full,
  disabled,
  haptic = true,
  style,
  leading,
  trailing,
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onPress?.();
  }, [disabled, haptic, onPress]);

  const sizing = SIZE_STYLES[size];
  const textColor = textColorFor(variant);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 80 });
        opacity.value = withTiming(0.85, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
        opacity.value = withTiming(1, { duration: 120 });
      }}
      disabled={disabled}
      style={[
        {
          alignSelf: full ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Animated.View style={animatedStyle}>
        <ButtonBody
          variant={variant}
          height={sizing.height}
          pad={sizing.pad}
          font={sizing.font}
          letterSpacing={sizing.letterSpacing}
          textColor={textColor}
          leading={leading}
          trailing={trailing}
        >
          {children}
        </ButtonBody>
      </Animated.View>
    </Pressable>
  );
}

interface BodyProps {
  variant: EmberBtnVariant;
  height: number;
  pad: number;
  font: number;
  letterSpacing: number;
  textColor: string;
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
}

function ButtonBody({
  variant,
  height,
  pad,
  font,
  letterSpacing,
  textColor,
  children,
  leading,
  trailing,
}: BodyProps) {
  const hasElement = Children.toArray(children).some((c) => isValidElement(c));
  const label = (
    <>
      {leading}
      {hasElement ? (
        children
      ) : (
        <Text
          style={[
            styles.label,
            { color: textColor, fontSize: font, letterSpacing },
          ]}
        >
          {children}
        </Text>
      )}
      {trailing}
    </>
  );

  if (variant === 'primary') {
    return (
      <LinearGradient
        colors={[colors.ember, colors.lava]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.base,
          {
            height,
            paddingHorizontal: pad,
            shadowColor: colors.ember,
            shadowOpacity: 0.5,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          },
        ]}
      >
        {label}
      </LinearGradient>
    );
  }

  if (variant === 'ghost') {
    return (
      <View
        style={[
          styles.base,
          {
            height,
            paddingHorizontal: pad,
            borderWidth: 1,
            borderColor: colors.goldDim,
            backgroundColor: colors.bgSoft,
          },
        ]}
      >
        {label}
      </View>
    );
  }

  if (variant === 'danger') {
    return (
      <View
        style={[
          styles.base,
          {
            height,
            paddingHorizontal: pad,
            borderWidth: 1,
            borderColor: `${colors.danger}66`,
            backgroundColor: 'transparent',
          },
        ]}
      >
        {label}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.base,
        {
          height,
          paddingHorizontal: pad,
          borderWidth: 1,
          borderColor: colors.borderHi,
          backgroundColor: 'transparent',
        },
      ]}
    >
      {label}
    </View>
  );
}

function textColorFor(v: EmberBtnVariant): string {
  switch (v) {
    case 'primary':
      return '#1a0805';
    case 'ghost':
      return colors.gold;
    case 'danger':
      return colors.danger;
    default:
      return colors.text;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
  },
  label: {
    fontFamily: typography.displaySemi,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
