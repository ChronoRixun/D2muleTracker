import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { EIcon, type EIconName } from '@/components/ember/EIcon';
import { colors, typography } from '@/lib/theme';

const TAB_ICONS: Record<string, EIconName> = {
  index: 'skull',
  search: 'eye',
  collections: 'tome',
  settings: 'cog',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Mules',
  search: 'Seek',
  collections: 'Codex',
  settings: 'Forge',
};

function TabGlyph({
  name,
  focused,
}: {
  name: keyof typeof TAB_ICONS;
  focused: boolean;
}) {
  const color = focused ? colors.ember : colors.textMuted;
  return (
    <View style={styles.tabGlyph}>
      <View
        style={[
          styles.activeDot,
          { backgroundColor: focused ? colors.ember : 'transparent' },
        ]}
      />
      <EIcon
        name={TAB_ICONS[name]}
        size={22}
        color={color}
        stroke={focused ? 1.6 : 1.3}
      />
      <Text
        style={[
          styles.label,
          { color },
        ]}
      >
        {TAB_LABELS[name]}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.borderHi,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { display: 'none' },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.ember,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.gold,
          fontFamily: typography.displaySemi,
          letterSpacing: 3,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'The Hoard',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabGlyph name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Seek',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabGlyph name="search" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'Codex',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabGlyph name="collections" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Forge',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabGlyph name="settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabGlyph: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 72,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
