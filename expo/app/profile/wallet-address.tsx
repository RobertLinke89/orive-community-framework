import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Wallet, Copy, Check, AlertCircle } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function WalletAddressScreen() {
  const [address, setAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (address.length < 20) {
      Alert.alert('Invalid Address', 'Please enter a valid wallet address');
      return;
    }
    setSavedAddress(address);
    setAddress('');
    Alert.alert('Success', 'Wallet address updated successfully');
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Wallet Address',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const }
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <AlertCircle size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Your wallet address is used for receiving payments and managing your digital assets securely.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Wallet Address</Text>
          {savedAddress ? (
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.iconContainer}>
                  <Wallet size={20} color={colors.primary} />
                </View>
                <Text style={styles.addressLabel}>Primary Wallet</Text>
              </View>
              <View style={styles.addressContent}>
                <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
                  {savedAddress}
                </Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                >
                  {copied ? (
                    <Check size={20} color={colors.success} />
                  ) : (
                    <Copy size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Wallet size={48} color={colors.textSecondary} opacity={0.3} />
              <Text style={styles.emptyText}>No wallet address set</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Wallet Address</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Enter new wallet address"
              placeholderTextColor={colors.textSecondary}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity 
            style={[styles.saveButton, !address && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!address}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityTitle}>Security Note</Text>
          <Text style={styles.securityText}>
            • Double-check your wallet address before saving{'\n'}
            • Never share your private keys{'\n'}
            • Ensure you have backup access to this wallet{'\n'}
            • Transactions are irreversible
          </Text>
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
  infoCard: {
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(31, 191, 191, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
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
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  addressHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(31, 191, 191, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  addressContent: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  address: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace' as const,
    color: colors.primary,
    marginRight: 12,
  },
  copyButton: {
    padding: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
  },
  input: {
    padding: 20,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'monospace' as const,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.navy,
  },
  securityNote: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  securityText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
