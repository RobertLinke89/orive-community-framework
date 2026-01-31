import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import colors from '@/constants/colors';

interface PeerIndicatorProps {
  peerCount: number;
  isConnected: boolean;
}

export default function PeerIndicator({ peerCount, isConnected }: PeerIndicatorProps) {
  return (
    <View style={styles.container}>
      {isConnected ? (
        <Wifi size={16} color={colors.success} />
      ) : (
        <WifiOff size={16} color={colors.danger} />
      )}
      <Text style={styles.text}>
        {peerCount} peer{peerCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
});
