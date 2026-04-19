/**
 * DataRow — pressable row in the CHRONICLE · BACKUP section.
 *
 *   [icon box] Label                                    >
 *              MONO DETAIL
 *
 * `strong=true` adds the ember tint (used on Save Backup File).
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EIcon, type EIconName } from '@/components/ember/EIcon';
import { colors, typography } from '@/lib/theme';

interface Props {
  icon: EIconName;
  label: string;
  detail: string;
  strong?: boolean;
  onPress: () => void;
}

export function DataRow({ icon, label, detail, strong, onPress }: Props) {
  const accent = strong ? colors.ember : colors.gold;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        {
          borderColor: strong ? colors.borderHi : colors.border,
        },
      ]}
    >
      {strong ? (
        <LinearGradient
          colors={['rgba(255,80,32,0.10)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.7, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <View
        style={[
          styles.iconBox,
          {
            borderColor: strong ? colors.ember : colors.borderHi,
            backgroundColor: strong ? 'rgba(255,80,32,0.08)' : 'transparent',
          },
        ]}
      >
        <EIcon name={icon} size={15} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <EIcon name="chevron-right" size={14} color={colors.textDim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  detail: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.textDim,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
