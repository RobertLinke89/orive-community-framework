import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Mail, Phone, Shield, CheckCircle, ChevronRight, Link as LinkIcon } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function AccountsScreen() {
  const [emailVerified] = useState(true);
  const [phoneVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  return (
    <>
      <Stack.Screen options={{ 
        title: 'My Accounts',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const }
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Verification</Text>
          <View style={styles.card}>
            <View style={styles.verificationItem}>
              <View style={styles.verificationLeft}>
                <View style={[styles.iconContainer, emailVerified && styles.iconContainerVerified]}>
                  <Mail size={20} color={emailVerified ? colors.success : colors.primary} />
                </View>
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>Email Address</Text>
                  <Text style={styles.verificationSubtitle}>john.doe@example.com</Text>
                </View>
              </View>
              {emailVerified ? (
                <CheckCircle size={24} color={colors.success} />
              ) : (
                <TouchableOpacity>
                  <Text style={styles.verifyButton}>Verify</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.verificationItem}>
              <View style={styles.verificationLeft}>
                <View style={[styles.iconContainer, phoneVerified && styles.iconContainerVerified]}>
                  <Phone size={20} color={phoneVerified ? colors.success : colors.primary} />
                </View>
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>Phone Number</Text>
                  <Text style={styles.verificationSubtitle}>
                    {phoneVerified ? '+1 (555) 123-4567' : 'Not added'}
                  </Text>
                </View>
              </View>
              {phoneVerified ? (
                <CheckCircle size={24} color={colors.success} />
              ) : (
                <TouchableOpacity>
                  <Text style={styles.verifyButton}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingSubtitle}>Extra security for your account</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Services</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <LinkIcon size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Linked Accounts</Text>
                  <Text style={styles.menuItemSubtitle}>Manage connected services</Text>
                </View>
              </View>
              <ChevronRight size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <Text style={styles.actionText}>Export Account Data</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <Text style={[styles.actionText, styles.dangerText]}>Delete Account</Text>
            </TouchableOpacity>
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
  verificationItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  verificationLeft: {
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
  iconContainerVerified: {
    backgroundColor: 'rgba(0, 255, 148, 0.15)',
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  verifyButton: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 76,
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
  actionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  dangerText: {
    color: colors.danger,
  },
});
