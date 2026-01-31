import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RelatedArticle {
  id: string;
  title: string;
  image: string;
}

interface Article {
  id: string;
  title: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  sections: {
    title?: string;
    content: string;
  }[];
  relatedIds: string[];
}

const articles: Record<string, Article> = {
  '0': {
    id: '0',
    title: 'Unlocking the Future: The Rise of ORYVE in the Crypto Sphere',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      role: 'Blockchain Analyst',
    },
    sections: [
      {
        content: 'In the fast-paced world of cryptocurrency, where innovation and disruption are the driving forces, a new player has emerged to reshape the landscape. ORYVE, a dynamic and forward-thinking crypto platform, is steadily gaining momentum and unlocking the future of decentralized finance.',
      },
      {
        title: '1. Embracing the Power of Innovation',
        content: 'ORYVE stands at the intersection of cutting-edge technology and financial freedom. Born out of a deep commitment to innovation, it brings to the table a set of features that distinguish it from the crowd in the crypto market.',
      },
      {
        title: '2. The Foundation: Blockchain Reinvented',
        content: "At the core of ORYVE's success is its utilization of a robust and efficient blockchain. With a focus on security, speed, and scalability, ORYVE's blockchain ensures that transactions are not only swift but also secure. This commitment to technological excellence positions ORYVE as a frontrunner in the race toward a more efficient and seamless ecosystem.",
      },
      {
        title: '3. Decentralized Finance Redefined',
        content: "ORYVE goes beyond being just a cryptocurrency. It is a catalyst for change in the financial landscape. Through decentralized finance (DeFi), its architecture allows users to participate in a variety of financial activities without the need for traditional intermediaries. Whether it's lending, borrowing, or trading, ORYVE empowers users to take control of their financial destinies.",
      },
      {
        title: '4. User-Friendly Wallets for Seamless Transactions',
        content: 'In the world of cryptocurrency, user experience is paramount. ORYVE understands this and has developed intuitive and user-friendly wallets that cater to both beginners and seasoned crypto enthusiasts. The seamless integration of these wallets with the ORYVE ecosystem ensures that users can transact with ease, further propelling the adoption of this revolutionary crypto coin.',
      },
      {
        title: '5. Community-Driven Growth',
        content: "One of the key factors contributing to the rise of ORYVE is its vibrant and engaged community. From developers to investors, ORYVE's community is passionate about the project's vision and actively contributes to its growth. This collaborative spirit not only fosters innovation but also establishes a strong foundation for the sustained success of ORYVE.",
      },
      {
        title: '6. Future Prospects and Beyond',
        content: "As ORYVE continues its ascent in the crypto sphere, the future looks promising. With a commitment to ongoing development, community engagement, and technological excellence, ORYVE is well-positioned to play a pivotal role in shaping the decentralized future of finance. In conclusion, ORYVE's rise in the crypto sphere is not merely a journey. It's a testament to the potential of forward-thinking projects that leverage blockchain technology for the greater good. As we unlock the future, ORYVE stands tall, representing a new era in decentralized finance, where innovation knows no bounds.",
      },
    ],
    relatedIds: ['1', '2'],
  },
  '1': {
    id: '1',
    title: "Breaking Barriers: ORYVE's Mission to Democratize Finance Through Blockchain",
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    author: {
      name: 'Marcus Thompson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      role: 'Tech Futurist',
    },
    sections: [
      {
        content: 'We stand at the threshold of a profound transformation. Artificial intelligence is not merely a technological advancement - it is the catalyst for a fundamental restructuring of how humanity organizes value, trust, and prosperity. ORYVE emerges at this pivotal moment with absolute conviction: financial systems must evolve to serve all, not just the privileged few.',
      },
      {
        title: 'The AI-Powered Shift: From Exclusion to Inclusion',
        content: 'For centuries, financial power has been concentrated in the hands of institutions that gatekeep access, extract fees, and maintain information asymmetries. AI is dismantling these walls with unprecedented precision. Machine learning algorithms can now assess creditworthiness beyond traditional metrics, smart contracts eliminate intermediary costs, and decentralized networks distribute power across communities rather than concentrating it in boardrooms. This is not a possibility - this is happening now.',
      },
      {
        title: 'Balance as a Core Principle',
        content: "ORYVE recognizes that true progress requires balance across multiple dimensions. Financial balance - ensuring wealth creation is accessible to all economic strata. Technological balance - harnessing AI's power while maintaining human agency and ethical oversight. Environmental balance - building systems that reward sustainable practices and penalize exploitation. Social balance - creating peer-to-peer networks that strengthen community bonds rather than atomizing society into isolated economic actors.",
      },
      {
        title: 'The Mesh Economy: Connection Over Hierarchy',
        content: "Traditional finance operates as a pyramid. ORYVE operates as a mesh - a resilient, adaptive network where value flows freely between peers. AI enables this by reducing transaction friction to near-zero, automating trust verification, and identifying opportunities for mutual benefit that human analysis would miss. Every member of the ORYVE network is simultaneously a contributor and beneficiary, creating a self-reinforcing ecosystem of shared prosperity.",
      },
      {
        title: 'Breaking Free from Legacy Constraints',
        content: "Banks take days to process transactions. ORYVE takes seconds. Traditional institutions require extensive documentation and credit histories. ORYVE's AI assesses reputation through network behavior and contribution patterns. Conventional finance charges percentage-based fees that compound inequality. ORYVE's blockchain architecture operates on minimal fixed costs, making micro-transactions economically viable for the first time in history.",
      },
      {
        title: 'The Necessity of Now',
        content: "This transition is not optional. Climate change demands new economic models that price externalities accurately. Growing inequality threatens social cohesion. Centralized systems have proven vulnerable to corruption, manipulation, and catastrophic failure. AI gives us the tools to build something better - not someday, but today. ORYVE is the practical implementation of this vision, translating ideals into executable code and functional networks.",
      },
      {
        title: 'Empowerment Through Education',
        content: 'Democratization means nothing without understanding. ORYVE commits to transparent operations, accessible documentation, and community-driven learning. AI can explain complex financial instruments in plain language, personalize educational content to individual knowledge levels, and provide real-time guidance that traditionally required expensive advisors. Knowledge becomes a public good rather than a competitive advantage hoarded by elites.',
      },
      {
        title: 'The Path Forward',
        content: "We are absolutely certain that the next decade will see a wholesale migration from legacy financial systems to decentralized, AI-enhanced networks. Those who adapt early will thrive. Those who cling to outdated models will find themselves irrelevant. ORYVE is building the infrastructure for this new world - a world where financial opportunity is a human right, not a privilege. The barriers are falling. The future is decentralized. The time is now.",
      },
    ],
    relatedIds: ['0', '2'],
  },
  '2': {
    id: '2',
    title: 'The Power of Community: How ORYVE Builds Financial Potential',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    author: {
      name: 'Elena Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      role: 'Community Lead',
    },
    sections: [
      {
        content: "The industrial revolution taught us to compete. The information revolution taught us to connect. The AI revolution is teaching us to collaborate at scales previously unimaginable. ORYVE harnesses this evolutionary leap, transforming isolated individuals into a coherent financial organism that amplifies collective potential while honoring individual sovereignty.",
      },
      {
        title: 'Intelligence Emerges from Connection',
        content: "A single neuron has no intelligence. A network of billions creates consciousness. Similarly, isolated economic actors struggle with limited resources and fragmented information. But connect them through ORYVE's mesh architecture, augmented with AI that identifies synergies and facilitates cooperation, and something remarkable emerges: collective financial intelligence that exceeds the sum of its parts.",
      },
      {
        title: 'Trust as Infrastructure',
        content: "Traditional finance requires trust in institutions. ORYVE distributes trust across the network itself. Every transaction, every interaction, every exchange builds a reputation score that AI analyzes in real-time. Bad actors are naturally filtered out through algorithmic consensus. Good actors accumulate social capital that opens doors to opportunities. Trust becomes quantifiable, portable, and impossible to fake - a fundamental shift that eliminates the need for costly verification intermediaries.",
      },
      {
        title: 'Balanced Growth: Individual and Collective',
        content: "The false dichotomy between individual achievement and community welfare dissolves in properly designed systems. ORYVE's AI optimizes for both simultaneously. When you help a peer access capital for a sustainable project, the network rewards your contribution while that project generates returns that flow back to community pools. Individual prosperity and collective advancement become two expressions of the same underlying dynamic. This is balance in action - not compromise, but synergy.",
      },
      {
        title: 'Local Action, Global Impact',
        content: 'Climate scientists speak of "think globally, act locally." ORYVE embodies this principle in financial form. A farmer in Kenya using ORYVE to secure fair pricing connects with a consumer in Sweden seeking ethically sourced goods. AI handles currency conversion, compliance verification, and logistics coordination automatically. Both parties benefit, middlemen who extracted value without adding it are removed, and carbon-efficient direct trade patterns emerge organically. Multiply this by millions of interactions daily, and you have systemic transformation through aggregated individual choices.',
      },
      {
        title: 'Resilience Through Diversity',
        content: "Monocultures fail. Diverse ecosystems thrive. ORYVE's community spans continents, cultures, and economic sectors. When one region faces hardship, others provide liquidity. When one industry declines, capital reallocates to emerging opportunities. AI monitors these flows, ensuring balance and preventing the cascade failures that plague centralized systems. The community becomes anti-fragile - not just surviving shocks, but growing stronger through adversity.",
      },
      {
        title: 'The Democratization of Opportunity',
        content: "In legacy finance, access to the best investment opportunities correlates directly with existing wealth. ORYVE inverts this equation. AI identifies promising projects at inception, when capital requirements are modest and potential returns are highest. Community members collectively fund these ventures, sharing risks and rewards proportionally. A teacher in Brazil has the same access to high-growth opportunities as a banker in New York. Merit and contribution matter; pedigree and connections do not.",
      },
      {
        title: 'Cultural Evolution: From Competition to Cooperation',
        content: "The most profound shift ORYVE facilitates is not technological but psychological. When your financial success is directly tied to community health, your mindset transforms. You become invested in others' prosperity. You share knowledge rather than hoarding it. You build rather than extract. AI accelerates this cultural evolution by making cooperative strategies demonstrably more profitable than zero-sum competition. Game theory predicts this outcome; ORYVE makes it reality.",
      },
      {
        title: 'The Inevitable Convergence',
        content: "We are witnessing the convergence of several irreversible trends: the decline of institutional trust, the rise of AI capabilities, growing demand for economic justice, and the maturation of blockchain technology. ORYVE sits at the intersection of these forces, not by accident but by intentional design. The community-powered financial future is not a utopian fantasy - it is an engineering problem we are actively solving. The infrastructure is built. The community is growing. The momentum is unstoppable. This is how we achieve balance: by distributing power, rewarding contribution, and aligning individual incentives with collective flourishing. Welcome to the future of finance. Welcome to ORYVE.",
      },
    ],
    relatedIds: ['0', '1'],
  },
};

const getRelatedArticles = (articleId: string): RelatedArticle[] => {
  const article = articles[articleId];
  if (!article) return [];
  return article.relatedIds.map(id => ({
    id,
    title: articles[id].title,
    image: articles[id].image,
  }));
};

export default function ArticleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTheme();
  const fromTransaction = params.fromTransaction === 'true';
  const amount = params.amount as string;
  const currency = params.currency as string;
  const articleId = (params.id as string) || '0';
  const article = articles[articleId] || articles['0'];
  const relatedArticles = getRelatedArticles(articleId);

  useEffect(() => {
    if (fromTransaction) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const timer = setTimeout(() => {
        router.replace('/(tabs)/wallet');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [fromTransaction, router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, isDark && styles.containerDark]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => fromTransaction ? router.replace('/(tabs)/wallet') : router.back()}
          >
            <ArrowLeft size={24} color={isDark ? '#FFFFFF' : '#0A2540'} />
          </TouchableOpacity>
        </SafeAreaView>

        {fromTransaction && (
          <View style={[styles.successBanner, isDark && styles.successBannerDark]}>
            <View style={styles.successContent}>
              <CheckCircle2 size={24} color="#10B981" strokeWidth={2.5} />
              <View style={styles.successTextContainer}>
                <Text style={[styles.successTitle, isDark && styles.successTitleDark]}>Transaction Successful</Text>
                <Text style={[styles.successMessage, isDark && styles.successMessageDark]}>
                  You have sent {amount} {currency} successfully
                </Text>
              </View>
            </View>
          </View>
        )}

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, isDark && styles.titleDark]}>{article.title}</Text>

          <View style={styles.authorContainer}>
            <Image
              source={{ uri: article.author.avatar }}
              style={styles.authorAvatar}
              resizeMode="cover"
            />
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, isDark && styles.authorNameDark]}>{article.author.name}</Text>
              <Text style={[styles.authorRole, isDark && styles.authorRoleDark]}>{article.author.role}</Text>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: article.image }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </View>

          {article.sections.map((section, index) => (
            <View key={index} style={section.title ? styles.section : undefined}>
              {section.title && (
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{section.title}</Text>
              )}
              <Text style={[styles.bodyText, isDark && styles.bodyTextDark]}>{section.content}</Text>
            </View>
          ))}

          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, isDark && styles.relatedTitleDark]}>Related articles</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {relatedArticles.map((relatedArticle) => (
                <TouchableOpacity 
                  key={relatedArticle.id} 
                  style={[styles.relatedCard, isDark && styles.relatedCardDark]}
                  onPress={() => router.push(`/article?id=${relatedArticle.id}`)}
                >
                  <Image
                    source={{ uri: relatedArticle.image }}
                    style={styles.relatedImage}
                    resizeMode="cover"
                  />
                  <Text style={[styles.relatedCardTitle, isDark && styles.relatedCardTitleDark]}>{relatedArticle.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  successTextContainer: {
    flex: 1,
    gap: 2,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#065F46',
  },
  successMessage: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#0A2540',
    lineHeight: 36,
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1FBFBF',
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0A2540',
  },
  authorRole: {
    fontSize: 13,
    color: '#64748B',
  },
  imageContainer: {
    width: SCREEN_WIDTH - 40,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0A2540',
    marginBottom: 12,
    lineHeight: 24,
  },
  relatedSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#0A2540',
    marginBottom: 16,
  },
  relatedScroll: {
    gap: 16,
  },
  relatedCard: {
    width: 280,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 160,
  },
  relatedCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#0A2540',
    lineHeight: 22,
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#01223F',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  authorNameDark: {
    color: '#FFFFFF',
  },
  authorRoleDark: {
    color: '#94A3B8',
  },
  bodyTextDark: {
    color: '#CBD5E1',
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  relatedTitleDark: {
    color: '#FFFFFF',
  },
  relatedCardDark: {
    backgroundColor: '#012A4C',
  },
  relatedCardTitleDark: {
    color: '#FFFFFF',
  },
  successBannerDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderLeftColor: '#10B981',
  },
  successTitleDark: {
    color: '#34D399',
  },
  successMessageDark: {
    color: '#6EE7B7',
  },
});
