import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';
import { darkColors, lightColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const segments = useSegments();
  const currentRoute = segments.length > 1 ? `/(tabs)/${segments[1]}` : '/(tabs)';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: '700' as const,
          },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Orbit',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="peers"
          options={{
            title: 'Peers',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'News',
            headerShown: false,
          }}
        />
      </Stack>
      <CustomTabBar currentRoute={currentRoute} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
