/**
 * Reusable pulse wrapper. Wraps its child with an animated shadow glow when
 * motion is 'full'; otherwise the glow sits at a static value.
 */

import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMotionConfig } from '@/lib/settings';
import { colors } from '@/lib/theme';

interface Props {
  children: ReactNode;
  color?: string;
  min?: number;
  max?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export function EmberGlow({
  children,
  color = colors.ember,
  min = 0.35,
  max = 0.65,
  duration = 1400,
  style,
}: Props) {
  const cfg = useMotionConfig();
  const animated = cfg.itemGlowPulse;
  const opacity = useSharedValue(min);

  useEffect(() => {
    if (!animated) {
      cancelAnimation(opacity);
      opacity.value = min;
      return;
    }
    opacity.value = withRepeat(
      withTiming(max, { duration }),
      -1,
      true,
    );
    return () => cancelAnimation(opacity);
  }, [animated, opacity, min, max, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowOpacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          shadowColor: color,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
});
