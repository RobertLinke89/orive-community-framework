import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Shield, Fingerprint, Key, Smartphone, Clock, LogOut, ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function SecurityScreen() {
  const [biometric, setBiometric] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [autoLock, setAutoLock] = useState(true);

  const handleLogoutAll = () => {
    Alert.alert(
      'Logout All Devices',
      'This will log you out from all devices except this one. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout All', style: 'destructive', onPress: () => console.log('Logout all') }
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Security',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const }
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Fingerprint size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Biometric Login</Text>
                  <Text style={styles.settingSubtitle}>Use Face ID or Touch ID</Text>
                </View>
              </View>
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingSubtitle}>Extra layer of security</Text>
                </View>
              </View>
              <Switch
                value={twoFactor}
                onValueChange={setTwoFactor}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Key size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Change Password</Text>
                  <Text style={styles.menuItemSubtitle}>Update your password</Text>
                </View>
              </View>
              <ChevronRight size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Security</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Auto-Lock</Text>
                  <Text style={styles.settingSubtitle}>Lock when inactive</Text>
                </View>
              </View>
              <Switch
                value={autoLock}
                onValueChange={setAutoLock}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Sessions</Text>
          <View style={styles.card}>
            <View style={styles.sessionItem}>
              <View style={styles.sessionLeft}>
                <View style={styles.iconContainer}>
                  <Smartphone size={20} color={colors.success} />
                </View>
                <View>
                  <Text style={styles.sessionTitle}>iPhone 15 Pro</Text>
                  <Text style={styles.sessionSubtitle}>Active now • New York, US</Text>
                </View>
              </View>
              <View style={styles.currentBadge}>
                <Text style={styles.currentText}>Current</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.sessionItem}>
              <View style={styles.sessionLeft}>
                <View style={styles.iconContainer}>
                  <Smartphone size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.sessionTitle}>MacBook Pro</Text>
                  <Text style={styles.sessionSubtitle}>2 hours ago • New York, US</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.sessionItem}>
              <View style={styles.sessionLeft}>
                <View style={styles.iconContainer}>
                  <Smartphone size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.sessionTitle}>iPad Air</Text>
                  <Text style={styles.sessionSubtitle}>Yesterday • San Francisco, US</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogoutAll}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Logout All Other Devices</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityTip}>
          <Shield size={24} color={colors.primary} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Security Tip</Text>
            <Text style={styles.tipText}>
              Enable two-factor authentication for maximum account protection. We recommend using an authenticator app.
            </Text>
          </View>
        </View>
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
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
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
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 76,
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
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sessionItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sessionLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currentBadge: {
    backgroundColor: 'rgba(0, 255, 148, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currentText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.success,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.danger,
  },
  securityTip: {
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(31, 191, 191, 0.1)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
