import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, CheckCheck } from 'lucide-react-native';
import { Peer } from '@/types/mesh';
import { darkColors, lightColors } from '@/constants/colors';
import { useMesh } from '@/contexts/MeshContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface PeerCardProps {
  peer: Peer;
  type?: 'conversation' | 'connection';
}

export default function PeerCard({ peer, type = 'conversation' }: PeerCardProps) {
  const { userValues } = useMesh();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const router = useRouter();

  const matchingValues = peer.values.map(value => userValues.includes(value));
  const matchCount = matchingValues.filter(Boolean).length;

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePress = () => {
    if (peer.connectionStatus === 'connected' && type === 'conversation') {
      router.push(`/chat/${peer.id}`);
    }
  };

  if (type === 'conversation') {
    return (
      <TouchableOpacity 
        style={[styles.conversationContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: peer.color }]}>
          <Text style={[styles.initial, { color: colors.background }]}>{peer.name[0]}</Text>
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.name, { color: colors.text }]}>{peer.name}</Text>
            {peer.lastMessageTime && (
              <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                {formatTime(peer.lastMessageTime)}
              </Text>
            )}
          </View>
          {peer.lastMessage && (
            <Text 
              style={[styles.lastMessage, { color: colors.textSecondary }, peer.unreadCount ? styles.unreadText : {}]} 
              numberOfLines={1}
            >
              {peer.lastMessage}
            </Text>
          )}
        </View>
        {peer.unreadCount ? (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.unreadCount, { color: colors.background }]}>{peer.unreadCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.connectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: peer.color }]}>
        <Text style={[styles.initial, { color: colors.background }]}>{peer.name[0]}</Text>
      </View>
      <View style={styles.connectionInfo}>
        <Text style={[styles.name, { color: colors.text }]}>{peer.name}</Text>
        {peer.title && <Text style={[styles.title, { color: colors.textSecondary }]}>{peer.title}</Text>}
        {peer.company && <Text style={[styles.company, { color: colors.textSecondary }]}>{peer.company}</Text>}
        <View style={styles.matchContainer}>
          <View style={styles.dots}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { borderColor: colors.textSecondary },
                  matchingValues[index] && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.matchLabel, { color: colors.textSecondary }]}>{matchCount} shared values</Text>
        </View>
      </View>
      {peer.connectionStatus === 'pending' && (
        <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
          <Clock size={12} color={colors.warning} />
        </View>
      )}
      {peer.connectionStatus === 'connected' && (
        <View style={[styles.statusBadge, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
          <CheckCheck size={12} color={colors.success} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  conversationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderBottomWidth: 1,
    gap: 14,
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  conversationInfo: {
    flex: 1,
    gap: 6,
  },
  connectionInfo: {
    flex: 1,
    gap: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  company: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  unreadText: {
    fontWeight: '600' as const,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  matchLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
