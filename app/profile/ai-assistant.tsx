import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Bot, Zap, Shield, MessageSquare, TrendingUp, Settings } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function AIAssistantScreen() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [learningMode, setLearningMode] = useState(true);

  return (
    <>
      <Stack.Screen options={{ 
        title: 'AI Assistant',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const }
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.botIcon}>
            <Bot size={32} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Your AI Assistant</Text>
          <Text style={styles.heroDescription}>
            Powered by advanced AI to help you make better decisions, manage your network, and optimize your interactions
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Zap size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>AI Assistant</Text>
                  <Text style={styles.settingSubtitle}>Enable AI-powered features</Text>
                </View>
              </View>
              <Switch
                value={aiEnabled}
                onValueChange={setAiEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <MessageSquare size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Smart Suggestions</Text>
                  <Text style={styles.settingSubtitle}>Get AI recommendations</Text>
                </View>
              </View>
              <Switch
                value={smartSuggestions}
                onValueChange={setSmartSuggestions}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                disabled={!aiEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <TrendingUp size={20} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Learning Mode</Text>
                  <Text style={styles.settingSubtitle}>Adapt to your preferences</Text>
                </View>
              </View>
              <Switch
                value={learningMode}
                onValueChange={setLearningMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                disabled={!aiEnabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Settings size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Conversation Style</Text>
                  <Text style={styles.menuItemSubtitle}>Professional</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Shield size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Privacy Settings</Text>
                  <Text style={styles.menuItemSubtitle}>Manage data usage</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>AI Usage Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1,247</Text>
              <Text style={styles.statLabel}>Suggestions Made</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>94%</Text>
              <Text style={styles.statLabel}>Accuracy Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>18h</Text>
              <Text style={styles.statLabel}>Time Saved</Text>
            </View>
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
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  botIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 191, 191, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
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
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
});
