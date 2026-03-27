import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Check } from 'lucide-react-native';
import colors from '@/constants/colors';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
];

export default function CurrencyScreen() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Currency',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const }
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Select your preferred currency for displaying values throughout the app
        </Text>

        <View style={styles.card}>
          {currencies.map((currency, index) => (
            <React.Fragment key={currency.code}>
              <TouchableOpacity
                style={styles.currencyItem}
                onPress={() => setSelectedCurrency(currency.code)}
                activeOpacity={0.7}
              >
                <View style={styles.currencyLeft}>
                  <View style={styles.symbolContainer}>
                    <Text style={styles.symbol}>{currency.symbol}</Text>
                  </View>
                  <View>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                </View>
                {selectedCurrency === currency.code && (
                  <Check size={24} color={colors.primary} strokeWidth={3} />
                )}
              </TouchableOpacity>
              {index < currencies.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.note}>
          Exchange rates are updated in real-time. Actual transaction amounts may vary.
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
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  currencyItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  currencyLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    flex: 1,
  },
  symbolContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 191, 191, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  symbol: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  currencyCode: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 80,
  },
  note: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 18,
  },
});
