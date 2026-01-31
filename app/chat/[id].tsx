import React, { useState } from 'react';
import { StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import MessageBubble from '@/components/MessageBubble';
import MessageInput from '@/components/MessageInput';
import { useTheme } from '@/contexts/ThemeContext';
import { darkColors, lightColors } from '@/constants/colors';
import { useMesh } from '@/contexts/MeshContext';
import { Message } from '@/types/mesh';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const { peers } = useMesh();
  
  const peer = peers.find(p => p.id === id);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! Great to connect with you.',
      senderId: id as string,
      senderName: peer?.name || 'Unknown',
      timestamp: new Date(Date.now() - 3600000),
      hops: 0,
    },
    {
      id: '2',
      text: 'Hi! Thanks for reaching out.',
      senderId: 'me',
      senderName: 'Me',
      timestamp: new Date(Date.now() - 3000000),
      hops: 0,
    },
  ]);

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      senderId: 'me',
      senderName: 'Me',
      timestamp: new Date(),
      hops: 0,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: peer?.name || 'Chat',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' as const },
        }} 
      />
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
});
