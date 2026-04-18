import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Cinzel_600SemiBold, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { CormorantGaramond_400Regular_Italic } from '@expo-google-fonts/cormorant-garamond';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { TutorialCarousel } from '@/components/tutorial/TutorialCarousel';
import { DatabaseProvider } from '@/hooks/useDatabase';
import { SettingsProvider, useSettings } from '@/lib/settings';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

// Module-level flag — the animated splash plays once per process lifetime.
// Warm resumes (app backgrounded then foregrounded without being killed) skip it.
let hasPlayedAnimatedSplash = false;

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
  const [fontsLoaded] = useFonts({
    'Cinzel-SemiBold': Cinzel_600SemiBold,
    'Cinzel-Bold': Cinzel_700Bold,
    'CormorantGaramond-Italic': CormorantGaramond_400Regular_Italic,
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    'JetBrainsMono-Bold': JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <DatabaseProvider loadingFallback={<Loading />}>
            <StatusBar style="light" />
            <AppShell />
          </DatabaseProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const { tutorialCompleted, setTutorialCompleted, loaded } = useSettings();
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(
    !hasPlayedAnimatedSplash,
  );
  const [showTutorial, setShowTutorial] = useState(false);

  const handleSplashComplete = () => {
    hasPlayedAnimatedSplash = true;
    setShowAnimatedSplash(false);
    if (loaded && !tutorialCompleted) {
      setShowTutorial(true);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: 'Cinzel-SemiBold',
          },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="container/[id]" options={{ title: 'Mule' }} />
        <Stack.Screen
          name="modal/add-item"
          options={{ presentation: 'modal', title: 'Add Item' }}
        />
      </Stack>

      {showAnimatedSplash ? (
        <AnimatedSplash onComplete={handleSplashComplete} />
      ) : null}

      <TutorialCarousel
        visible={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </>
  );
}
