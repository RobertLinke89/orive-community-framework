import React, { useRef, useEffect, useState, useMemo, useCallback, memo } from 'react';
import { View, Pressable, StyleSheet, Image, Animated, Text, TouchableOpacity } from 'react-native';
import { Users, Wallet, Radar, Newspaper, Mic, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { darkColors, lightColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

type TabBarProps = {
  currentRoute: string;
};

const CustomTabBar = memo(function CustomTabBar({ currentRoute }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [showSwitch, setShowSwitch] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    sparkleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 400),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [pulseAnim, glowAnim, rotateAnim, sparkleAnims]);

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

  const glowOpacity = useMemo(() => glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  }), [glowAnim]);

  const rotate = useMemo(() => rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  }), [rotateAnim]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View style={styles.tabBar}>
        <Pressable
          style={styles.tabItem}
          onPress={() => handleNavigation('/(tabs)/wallet')}
        >
          <Wallet
            size={24}
            color={currentRoute === '/(tabs)/wallet' ? colors.primary : colors.textSecondary}
            strokeWidth={currentRoute === '/(tabs)/wallet' ? 2.5 : 2}
          />
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => handleNavigation('/(tabs)/peers')}
        >
          <Users
            size={24}
            color={currentRoute === '/(tabs)/peers' ? colors.primary : colors.textSecondary}
            strokeWidth={currentRoute === '/(tabs)/peers' ? 2.5 : 2}
          />
        </Pressable>

        <View style={styles.centerButtonContainer}>
          <Pressable
            style={styles.centerButton}
            onPress={handleOrbitPress}
          >
            <Animated.View
              style={[
                styles.magicRing,
                {
                  transform: [{ rotate }, { scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.ringGradient1} />
              <View style={styles.ringGradient2} />
            </Animated.View>

            {sparkleAnims.map((anim, index) => {
              const angle = (index * 60) * (Math.PI / 180);
              const radius = 45;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              const sparkleScale = anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              });

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.sparkle,
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        { scale: sparkleScale },
                      ],
                      opacity: anim,
                    },
                  ]}
                />
              );
            })}

            <Animated.View
              style={[
                styles.glowEffect,
                { opacity: glowOpacity },
              ]}
            />

            <Animated.View
              style={[
                styles.centerCircle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/eihy2v3f2ym8v293zl4fo' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
          </Pressable>

          {showSwitch && (
            <View style={styles.switchContainer}>
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
          <Radar
            size={24}
            color={currentRoute === '/(tabs)' || currentRoute === '/(tabs)/index' ? colors.primary : colors.textSecondary}
            strokeWidth={currentRoute === '/(tabs)' || currentRoute === '/(tabs)/index' ? 2.5 : 2}
          />
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => handleNavigation('/profile/settings')}
        >
          <Newspaper
            size={24}
            color={currentRoute === '/profile/settings' ? colors.primary : colors.textSecondary}
            strokeWidth={currentRoute === '/profile/settings' ? 2.5 : 2}
          />
        </Pressable>
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
    borderTopWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 70,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1FBFBF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 42,
    height: 42,
  },
  magicRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringGradient1: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(31, 191, 191, 0.4)',
  },
  ringGradient2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(147, 51, 234, 0.3)',
  },
  glowEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(31, 191, 191, 0.15)',
    shadowColor: '#1FBFBF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  sparkle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1FBFBF',
    shadowColor: '#1FBFBF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
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
