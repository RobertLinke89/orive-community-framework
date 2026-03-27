import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Info, ExternalLink, FileText, Shield, Heart, Mail } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function AboutScreen() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'About Us',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const }
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.logoCard}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>R</Text>
          </View>
          <Text style={styles.appName}>Rork</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            Building a decentralized future where human values guide technology. We&apos;re creating tools that help people connect authentically and transact transparently in a balanced, AI-enhanced ecosystem.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => console.log('Terms of Service')}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <FileText size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemTitle}>Terms of Service</Text>
              </View>
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => console.log('Privacy Policy')}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemTitle}>Privacy Policy</Text>
              </View>
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => console.log('Licenses')}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Info size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemTitle}>Open Source Licenses</Text>
              </View>
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => Linking.openURL('mailto:support@rork.app')}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Mail size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Contact Us</Text>
                  <Text style={styles.menuItemSubtitle}>support@rork.app</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => console.log('Website')}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <ExternalLink size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Website</Text>
                  <Text style={styles.menuItemSubtitle}>www.rork.app</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerCard}>
          <Heart size={20} color={colors.primary} />
          <Text style={styles.footerText}>
            Made with passion for a better future
          </Text>
        </View>

        <Text style={styles.copyright}>
          © 2024 Rork. All rights reserved.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  logoCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: colors.navy,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  version: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  missionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  missionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 191, 191, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 76,
  },
  footerCard: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 191, 191, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  footerText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500' as const,
  },
  copyright: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
});
