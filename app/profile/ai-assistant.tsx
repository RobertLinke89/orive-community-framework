import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import colors from '@/constants/colors';

type Gender = 'male' | 'female';
type ToneOfVoice = 'formal' | 'informal' | 'factual' | 'directive' | 'assertive' | 'friendly' | 'questioning' | 'conversational';
type Mood = 'neutral' | 'excited' | 'cheerful' | 'relaxed' | 'calm' | 'sad' | 'bored' | 'irritated' | 'tense';

export default function AIAssistantScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [gender, setGender] = useState<Gender>('male');
  const [toneOfVoice, setToneOfVoice] = useState<ToneOfVoice>('formal');
  const [mood, setMood] = useState<Mood>('neutral');

  const bgColor = isDark ? '#0A3A52' : colors.background;
  const surfaceColor = isDark ? 'rgba(255, 255, 255, 0.08)' : colors.surface;
  const selectedColor = isDark ? 'rgba(255, 255, 255, 0.15)' : colors.primary + '20';
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary;

  return (
    <>
      <Stack.Screen options={{ 
        title: 'AI assistant setting',
        headerStyle: { backgroundColor: bgColor },
        headerTintColor: textColor,
        headerTitleStyle: { fontWeight: '600' as const }
      }} />
      <ScrollView style={[styles.container, { backgroundColor: bgColor }]} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Gender</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: gender === 'male' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setGender('male')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>👨 Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: gender === 'female' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setGender('female')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>👩 Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Tone of voice</Text>
          <View style={styles.optionsGrid}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: toneOfVoice === 'formal' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setToneOfVoice('formal')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>✍️ Formal tone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: toneOfVoice === 'informal' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setToneOfVoice('informal')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>🤙 Informal tone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: toneOfVoice === 'factual' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setToneOfVoice('factual')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>👍 Factual tone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: toneOfVoice === 'directive' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setToneOfVoice('directive')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>👌 Directive tone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: toneOfVoice === 'assertive' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setToneOfVoice('assertive')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>✍️ Assertive tone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: toneOfVoice === 'friendly' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setToneOfVoice('friendly')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>👍 Friendly tone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: toneOfVoice === 'questioning' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setToneOfVoice('questioning')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>🤙 Questioning tone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: toneOfVoice === 'conversational' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setToneOfVoice('conversational')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>🗣️ Conversational tone</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>AI's mood</Text>
          <View style={styles.optionsGrid}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'neutral' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('neutral')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😐 Neutral</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'excited' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('excited')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😃 Excited</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'cheerful' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('cheerful')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😊 Cheerful</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'relaxed' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('relaxed')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😌 Relaxed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'calm' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('calm')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😊 Calm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'sad' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('sad')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😢 Sad</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'bored' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('bored')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😐 Bored</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'irritated' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('irritated')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😠 Irritated</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { backgroundColor: mood === 'tense' ? selectedColor : surfaceColor }
              ]}
              onPress={() => setMood('tense')}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, { color: textColor }]}>😰 Tense</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            console.log('AI settings:', { gender, toneOfVoice, mood });
            router.back();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>OK, let's try it</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  optionsRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  optionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
  },
});
