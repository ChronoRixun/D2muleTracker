import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/lib/theme';

// Lazy-load to avoid importing expo-sqlite on web
const NativeApp = React.lazy(() => import('../components/NativeApp'));

function Loading() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

function WebUnsupported() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          textAlign: 'center',
        }}
      >
        Web preview not supported — use Expo Go on your phone to test
      </Text>
    </View>
  );
}

export default function RootLayout() {
  if (Platform.OS === 'web') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <WebUnsupported />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <React.Suspense fallback={<Loading />}>
          <NativeApp />
        </React.Suspense>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
