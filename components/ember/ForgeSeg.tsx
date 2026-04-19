/**
 * ForgeSeg — inline segmented control used by Forge tab settings + the
 * Bind a Realm sheet.
 *
 * Active option uses an ember→lava gradient with dark text; inactive options
 * are transparent over `bgSoft` with `textDim`. Light haptic on press.
 *
 * Generic over option value type — must accept `Region` (`... | null`) for
 * the Region picker. Default `T` is `string` for simple cases.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/lib/theme';

export interface ForgeSegOption<T> {
  v: T;
  l: string;
}

interface Props<T extends string | null> {
  value: T;
  onChange: (v: T) => void;
  options: Array<ForgeSegOption<T>>;
  small?: boolean;
}

export function ForgeSeg<T extends string | null = string>({
  value,
  onChange,
  options,
  small,
}: Props<T>) {
  const padV = small ? 5 : 7;
  const padH = small ? 9 : 11;
  const fs = small ? 9 : 10;

  return (
    <View style={styles.wrap}>
      {options.map((o, idx) => {
        const on = value === o.v;
        const last = idx === options.length - 1;
        const handlePress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => undefined,
          );
          onChange(o.v);
        };
        return (
          <Pressable
            key={String(o.v ?? `__null_${idx}`)}
            onPress={handlePress}
            accessibilityRole="radio"
            accessibilityLabel={o.l}
            accessibilityState={{ selected: on }}
            style={[
              styles.cell,
              {
                paddingVertical: padV,
                paddingHorizontal: padH,
                borderRightWidth: last ? 0 : 1,
              },
            ]}
          >
            {on ? (
              <LinearGradient
                colors={[colors.ember, colors.lava]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                {
                  fontSize: fs,
                  color: on ? '#1a0a04' : colors.textDim,
                },
              ]}
            >
              {o.l}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
    overflow: 'hidden',
  },
  cell: {
    borderRightColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontFamily: typography.mono,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
