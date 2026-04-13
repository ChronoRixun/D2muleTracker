import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { DatabaseProvider } from '@/hooks/useDatabase';
import { colors } from '@/lib/theme';

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

export default function NativeApp() {
  return (
    <DatabaseProvider loadingFallback={<Loading />}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="container/[id]"
          options={{ title: 'Container' }}
        />
        <Stack.Screen
          name="modal/add-item"
          options={{ presentation: 'modal', title: 'Add Item' }}
        />
      </Stack>
    </DatabaseProvider>
  );
}
