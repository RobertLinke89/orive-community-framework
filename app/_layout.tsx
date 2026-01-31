import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MeshProvider, useMesh } from '@/contexts/MeshContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { darkColors, lightColors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { hasCompletedOnboarding, isLocked, isReady } = useMesh();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isReady) return;

    const inLock = segments[0] === 'lock';
    const inOnboarding = segments[0] === 'onboarding';

    if (isLocked && !inLock) {
      router.replace('/lock');
    } else if (!isLocked && inLock) {
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (!isLocked && !hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (!isLocked && hasCompletedOnboarding && (inOnboarding || inLock)) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, isLocked, isReady, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="lock" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="agent" options={{ headerShown: false }} />
      <Stack.Screen name="article" options={{ headerShown: false }} />
      <Stack.Screen name="bank-account" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="receive" options={{ headerShown: false }} />
      <Stack.Screen name="send" options={{ headerShown: false }} />
    </Stack>
  );
}

function ThemedApp() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [theme, colors.background]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MeshProvider>
        <RootLayoutNav />
      </MeshProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
