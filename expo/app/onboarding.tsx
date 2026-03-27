import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightColors } from '@/constants/colors';
import { CORE_VALUES } from '@/constants/values';
import { useMesh } from '@/contexts/MeshContext';



export default function OnboardingScreen() {
  const router = useRouter();
  const { updateUserValues, toggleExploringMode, isReady } = useMesh();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  useEffect(() => {
    console.log('Onboarding screen mounted', { isReady });
  }, [isReady]);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value));
    } else if (selectedValues.length < 3) {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const handleContinue = () => {
    updateUserValues(selectedValues);
    setTimeout(() => {
      toggleExploringMode();
    }, 500);
    router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/utnddtc5lghiukgnwgra7' }}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.valuesContainer}
          showsVerticalScrollIndicator={false}
        >
          {CORE_VALUES.map((value) => {
            const isSelected = selectedValues.includes(value);
            const index = selectedValues.indexOf(value);
            
            return (
              <Pressable
                key={value}
                style={[
                  styles.valueButton,
                  isSelected && styles.valueButtonSelected,
                ]}
                onPress={() => toggleValue(value)}
              >
                <Text style={[styles.valueText, isSelected && styles.valueTextSelected]}>
                  {value}
                </Text>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>{index + 1}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[
              styles.continueButton,
              selectedValues.length === 3 && styles.continueButtonActive,
            ]}
            onPress={handleContinue}
            disabled={selectedValues.length !== 3}
          >
            <Text style={[
              styles.continueButtonText,
              selectedValues.length === 3 && styles.continueButtonTextActive,
            ]}>
              {selectedValues.length === 3 ? 'Start Exploring' : `Select ${3 - selectedValues.length} more value${3 - selectedValues.length !== 1 ? 's' : ''}`}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  scrollView: {
    flex: 1,
  },
  valuesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  valueButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: lightColors.surface,
    borderWidth: 2,
    borderColor: 'rgba(31, 191, 191, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueButtonSelected: {
    backgroundColor: 'rgba(31, 191, 191, 0.12)',
    borderColor: lightColors.primary,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  valueTextSelected: {
    color: lightColors.primary,
    fontWeight: '700' as const,
  },
  selectedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: lightColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 191, 191, 0.1)',
  },
  continueButton: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(31, 191, 191, 0.2)',
  },
  continueButtonActive: {
    backgroundColor: lightColors.primary,
    borderColor: lightColors.primary,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#64748B',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
});
