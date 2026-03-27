import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MoreHorizontal, ThumbsUp, MessageCircle, Repeat2, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { darkColors, lightColors } from '@/constants/colors';

interface Article {
  id: string;
  title: string;
  image: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  timePosted: string;
}

const articles: Article[] = [
  {
    id: '0',
    title: 'Unlocking the Future: The Rise of ORYVE in the Crypto Sphere',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    excerpt: 'In the fast-paced world of cryptocurrency, where innovation and disruption are the driving forces, a new player has emerged to reshape the landscape. ORYVE stands at the intersection of cutting-edge technology and financial freedom.',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      role: 'Blockchain Analyst',
    },
    timePosted: '3d',
  },
  {
    id: '1',
    title: "Breaking Barriers: ORYVE's Mission to Democratize Finance Through Blockchain",
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    excerpt: 'We stand at the threshold of a profound transformation. Artificial intelligence is not merely a technological advancement - it is the catalyst for a fundamental restructuring of how humanity organizes value, trust, and prosperity.',
    author: {
      name: 'Marcus Thompson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      role: 'Tech Futurist',
    },
    timePosted: '1w',
  },
  {
    id: '2',
    title: 'The Power of Community: How ORYVE Builds Financial Potential',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    excerpt: 'The industrial revolution taught us to compete. The information revolution taught us to connect. The AI revolution is teaching us to collaborate at scales previously unimaginable. ORYVE harnesses this evolutionary leap.',
    author: {
      name: 'Elena Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      role: 'Community Lead',
    },
    timePosted: '2w',
  },
];

export default function NewspaperScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>News & Insights</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Stay updated with the latest from ORYVE</Text>
            </View>
          </View>

          <View style={styles.postsContainer}>
            {articles.map((article) => (
              <View key={article.id} style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.postHeader}>
                  <Image
                    source={{ uri: article.author.avatar }}
                    style={styles.authorAvatar}
                    resizeMode="cover"
                  />
                  <View style={styles.authorInfo}>
                    <Text style={[styles.authorName, { color: colors.text }]}>{article.author.name}</Text>
                    <Text style={[styles.authorRole, { color: colors.textSecondary }]}>{article.author.role}</Text>
                    <Text style={[styles.postTime, { color: colors.textSecondary }]}>{article.timePosted} • 🌍</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreHorizontal size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => router.push(`/article?id=${article.id}`)}
                  activeOpacity={1}
                >
                  <View style={styles.postContent}>
                    <Text style={[styles.postTitle, { color: colors.text }]}>{article.title}</Text>
                    <Text style={[styles.postExcerpt, { color: colors.textSecondary }]} numberOfLines={3}>
                      {article.excerpt}
                    </Text>
                  </View>

                  <Image
                    source={{ uri: article.image }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity style={styles.actionButton}>
                    <ThumbsUp size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <MessageCircle size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>Comment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Repeat2 size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>Repost</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Send size={20} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  postsContainer: {
    gap: 12,
  },
  postCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  authorRole: {
    fontSize: 13,
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 14,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 280,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
