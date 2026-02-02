import React, { useState, useCallback, memo } from 'react';
import { View, Pressable, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { Users, Wallet, Radar, Newspaper, Mic, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

type TabBarProps = {
  currentRoute: string;
};

const CustomTabBar = memo(function CustomTabBar({ currentRoute }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [showSwitch, setShowSwitch] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const iconColor = isDark ? '#94A3B8' : '#64748B';
  const activeColor = '#1FBFBF';
  const indicatorColor = '#CBD5E1';

  const handleNavigation = useCallback((route: string) => {
    router.push(route as any);
  }, []);

  const handleOrbitPress = useCallback(() => {
    setShowSwitch(!showSwitch);
  }, [showSwitch]);

  const handleModeSwitch = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
    if (!speaking) {
      router.push('/agent');
    }
    setShowSwitch(false);
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8, backgroundColor: 'transparent' }]}>
      <View style={[styles.tabBarWrapper, { backgroundColor: bgColor }]}>
        <View style={styles.tabBar}>
          <Pressable
            style={styles.tabItem}
            onPress={() => handleNavigation('/(tabs)/wallet')}
          >
            <View style={styles.iconWrapper}>
              <Wallet
                size={24}
                color={currentRoute === '/(tabs)/wallet' ? activeColor : iconColor}
                strokeWidth={2}
              />
              {currentRoute === '/(tabs)/wallet' && (
                <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
              )}
            </View>
          </Pressable>

          <Pressable
            style={styles.tabItem}
            onPress={() => handleNavigation('/(tabs)/peers')}
          >
            <View style={styles.iconWrapper}>
              <Users
                size={24}
                color={currentRoute === '/(tabs)/peers' ? activeColor : iconColor}
                strokeWidth={2}
              />
              {currentRoute === '/(tabs)/peers' && (
                <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
              )}
            </View>
          </Pressable>

          <View style={styles.centerButtonContainer}>
            <Pressable
              style={[styles.centerButton, { backgroundColor: activeColor }]}
              onPress={handleOrbitPress}
            >
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/eihy2v3f2ym8v293zl4fo' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </Pressable>

            {showSwitch && (
              <View style={[styles.switchContainer, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <TouchableOpacity
                  style={[styles.switchButton, isSpeaking && styles.switchButtonActive]}
                  onPress={() => handleModeSwitch(true)}
                  activeOpacity={0.7}
                >
                  <Mic size={16} color={isSpeaking ? "#FFFFFF" : "#64748B"} strokeWidth={2.5} />
                  <Text style={[styles.switchText, isSpeaking && styles.switchTextActive]}>Speaking</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.switchButton, !isSpeaking && styles.switchButtonActive]}
                  onPress={() => handleModeSwitch(false)}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={16} color={!isSpeaking ? "#FFFFFF" : "#64748B"} strokeWidth={2.5} />
                  <Text style={[styles.switchText, !isSpeaking && styles.switchTextActive]}>Chatting</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Pressable
            style={styles.tabItem}
            onPress={() => handleNavigation('/(tabs)')}
          >
            <View style={styles.iconWrapper}>
              <Radar
                size={24}
                color={currentRoute === '/(tabs)' || currentRoute === '/(tabs)/index' ? activeColor : iconColor}
                strokeWidth={2}
              />
              {(currentRoute === '/(tabs)' || currentRoute === '/(tabs)/index') && (
                <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
              )}
            </View>
          </Pressable>

          <Pressable
            style={styles.tabItem}
            onPress={() => handleNavigation('/profile/settings')}
          >
            <View style={styles.iconWrapper}>
              <Newspaper
                size={24}
                color={currentRoute === '/profile/settings' ? activeColor : iconColor}
                strokeWidth={2}
              />
              {currentRoute === '/profile/settings' && (
                <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
              )}
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  tabBarWrapper: {
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 70,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: -20,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 38,
    height: 38,
  },
  switchContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  switchButtonActive: {
    backgroundColor: '#1FBFBF',
    shadowColor: '#1FBFBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  switchText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  switchTextActive: {
    color: '#FFFFFF',
  },
});

export default CustomTabBar;
