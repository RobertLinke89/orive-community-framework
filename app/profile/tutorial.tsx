import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Play, Book, Video, HelpCircle, Compass, Users, Wallet, MessageCircle } from 'lucide-react-native';
import colors from '@/constants/colors';

const tutorials = [
  {
    icon: Compass,
    title: 'Getting Started',
    description: 'Learn the basics of navigating the app',
    duration: '3 min',
  },
  {
    icon: Users,
    title: 'Exploring Mode',
    description: 'Match with people based on shared values',
    duration: '5 min',
  },
  {
    icon: Wallet,
    title: 'Wallet Setup',
    description: 'Configure your digital wallet',
    duration: '4 min',
  },
  {
    icon: MessageCircle,
    title: 'Messaging & Chat',
    description: 'Connect and communicate effectively',
    duration: '3 min',
  },
];

export default function TutorialScreen() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Tutorial',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const }
      }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.playIcon}>
            <Play size={32} color={colors.primary} fill={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Welcome Tutorial</Text>
          <Text style={styles.heroDescription}>
            Take a quick tour to discover all features and get the most out of your experience
          </Text>
          <TouchableOpacity style={styles.startButton} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Start Tutorial</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Guides</Text>
          {tutorials.map((tutorial, index) => {
            const IconComponent = tutorial.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.tutorialCard}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <IconComponent size={24} color={colors.primary} />
                </View>
                <View style={styles.tutorialContent}>
                  <View style={styles.tutorialHeader}>
                    <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>{tutorial.duration}</Text>
                    </View>
                  </View>
                  <Text style={styles.tutorialDescription}>{tutorial.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.resourceIcon}>
                  <Book size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Help Center</Text>
                  <Text style={styles.menuItemSubtitle}>Browse articles & FAQs</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.resourceIcon}>
                  <Video size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>Video Tutorials</Text>
                  <Text style={styles.menuItemSubtitle}>Watch step-by-step guides</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.resourceIcon}>
                  <HelpCircle size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuItemTitle}>FAQ</Text>
                  <Text style={styles.menuItemSubtitle}>Frequently asked questions</Text>
                </View>
              </View>
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
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  playIcon: {
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
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.navy,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 16,
    marginLeft: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  tutorialCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(31, 191, 191, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tutorialTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  tutorialDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    flex: 1,
  },
  resourceIcon: {
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
    marginBottom: 4,
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
});
