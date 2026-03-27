import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Message } from '@/types/mesh';
import colors from '@/constants/colors';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.senderId === 'me';

  return (
    <View style={[styles.container, isMe && styles.containerMe]}>
      {!isMe && <Text style={styles.sender}>{message.senderName}</Text>}
      {isMe && (
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/x1oirw68dtnq15o0pt10s' }}
          style={styles.avatar}
        />
      )}
      <View style={[styles.bubble, isMe && styles.bubbleMe]}>
        <Text style={[styles.text, isMe && styles.textMe]}>{message.text}</Text>
        <View style={styles.footer}>
          <Text style={[styles.time, isMe && styles.timeMe]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {!isMe && message.hops > 0 && (
            <Text style={styles.hops}> • {message.hops} hop{message.hops > 1 ? 's' : ''}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  containerMe: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 20,
  },
  sender: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 4,
    marginLeft: 8,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '75%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  textMe: {
    color: colors.background,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  timeMe: {
    color: 'rgba(10, 14, 26, 0.6)',
  },
  hops: {
    fontSize: 11,
    color: colors.mesh,
    fontWeight: '500' as const,
  },
});
