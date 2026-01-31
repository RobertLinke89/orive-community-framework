import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { darkColors, lightColors } from '@/constants/colors';
import { useMesh } from '@/contexts/MeshContext';
import { useTheme } from '@/contexts/ThemeContext';
import PeerCard from '@/components/PeerCard';
import { MessageCircle, Users, UserPlus, Search } from 'lucide-react-native';

type Tab = 'messages' | 'connections' | 'discover';

export default function PeersScreen() {
  const { peers } = useMesh();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [searchQuery, setSearchQuery] = useState('');

  const messagePeers = useMemo(() => 
    peers
      .filter(p => p.connectionStatus === 'connected' && p.lastMessage)
      .sort((a, b) => {
        const timeA = a.lastMessageTime?.getTime() || 0;
        const timeB = b.lastMessageTime?.getTime() || 0;
        return timeB - timeA;
      }),
    [peers]
  );

  const connectedPeers = useMemo(() => 
    peers.filter(p => p.connectionStatus === 'connected'),
    [peers]
  );

  const newPeers = useMemo(() => 
    peers.filter(p => p.connectionStatus === 'new' || p.connectionStatus === 'pending'),
    [peers]
  );

  const filteredPeers = useMemo(() => {
    let list = activeTab === 'messages' ? messagePeers : activeTab === 'connections' ? connectedPeers : newPeers;
    if (searchQuery) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [activeTab, messagePeers, connectedPeers, newPeers, searchQuery]);

  const unreadCount = messagePeers.reduce((sum, p) => sum + (p.unreadCount || 0), 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Network' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'messages' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('messages')}
          >
            <MessageCircle size={20} color={activeTab === 'messages' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'messages' ? colors.primary : colors.textSecondary }]}>Messages</Text>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.background }]}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'connections' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('connections')}
          >
            <Users size={20} color={activeTab === 'connections' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'connections' ? colors.primary : colors.textSecondary }]}>Connections</Text>
            <View style={[styles.countBadge, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.countText, { color: colors.textSecondary }]}>{connectedPeers.length}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'discover' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('discover')}
          >
            <UserPlus size={20} color={activeTab === 'discover' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'discover' ? colors.primary : colors.textSecondary }]}>Discover</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {activeTab === 'messages' && (
            <View style={styles.section}>
              {filteredPeers.length === 0 ? (
                <View style={styles.emptyState}>
                  <MessageCircle size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations yet</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Connect with peers to start messaging</Text>
                </View>
              ) : (
                filteredPeers.map((peer) => (
                  <PeerCard key={peer.id} peer={peer} type="conversation" />
                ))
              )}
            </View>
          )}
          {activeTab === 'connections' && (
            <View style={styles.section}>
              {filteredPeers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Users size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No connections</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Discover peers to build your network</Text>
                </View>
              ) : (
                filteredPeers.map((peer) => (
                  <PeerCard key={peer.id} peer={peer} type="connection" />
                ))
              )}
            </View>
          )}
          {activeTab === 'discover' && (
            <View style={styles.section}>
              <View style={[styles.infoCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Discover New Connections</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Find professionals in your decentralized network. Connect based on shared values and interests.
                </Text>
              </View>
              {filteredPeers.length === 0 ? (
                <View style={styles.emptyState}>
                  <UserPlus size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No new peers nearby</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Check back later for new connections</Text>
                </View>
              ) : (
                filteredPeers.map((peer) => (
                  <PeerCard key={peer.id} peer={peer} type="connection" />
                ))
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: -4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  section: {
    gap: 0,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400' as const,
    textAlign: 'center',
    lineHeight: 20,
  },
});
