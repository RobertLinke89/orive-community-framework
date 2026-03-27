import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Copy, Share2, AlertCircle, Coins } from 'lucide-react-native';
import colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

export default function ReceiveScreen() {
  const router = useRouter();
  const walletAddress = '0X12317239e3C876129387JWHEFKJg9187234 1J2KH4827341U2H3G';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(walletAddress);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleShare = async () => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.qrContainer}>
          <View style={styles.qrCode}>
            <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
            <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
            <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
            <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
            
            <View style={styles.qrPattern}>
              {Array.from({ length: 15 }).map((_, rowIndex) => (
                <View key={rowIndex} style={styles.qrRow}>
                  {Array.from({ length: 15 }).map((_, colIndex) => {
                    const isCenterArea = rowIndex >= 6 && rowIndex <= 8 && colIndex >= 6 && colIndex <= 8;
                    const shouldShow = !isCenterArea && Math.random() > 0.5;
                    return shouldShow ? (
                      <View key={colIndex} style={styles.qrPixel} />
                    ) : (
                      <View key={colIndex} style={styles.qrPixelEmpty} />
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.qrLogo}>
              <LinearGradient
                colors={['#1FBFBF', '#0A5F5F']}
                style={styles.logoGradient}
              >
                <View style={styles.logoIcon}>
                  <View style={styles.logoShape} />
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        <Text style={styles.address}>{walletAddress}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1FBFBF', '#17A5A5']}
              style={styles.buttonGradient}
            >
              <Copy size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Copy</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1FBFBF', '#17A5A5']}
              style={styles.buttonGradient}
            >
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.warningBox}>
          <AlertCircle size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            Only send ORYVE (OYE) network assets to this address. Other assets will be lost forever.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.fiatCard}
          activeOpacity={0.9}
          onPress={() => router.push('/bank-account')}
        >
          <View style={styles.fiatContent}>
            <View style={styles.coinsIcon}>
              <Coins size={32} color="#1FBFBF" />
            </View>
            <View style={styles.fiatTextContent}>
              <Text style={styles.fiatTitle}>Get ORYVE by fiat currencies</Text>
              <Text style={styles.fiatSubtitle}>By direct transfer from your bank account.</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  qrCode: {
    width: 280,
    height: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  qrCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#000000',
  },
  qrCornerTopLeft: {
    top: 25,
    left: 25,
    borderTopWidth: 6,
    borderLeftWidth: 6,
  },
  qrCornerTopRight: {
    top: 25,
    right: 25,
    borderTopWidth: 6,
    borderRightWidth: 6,
  },
  qrCornerBottomLeft: {
    bottom: 25,
    left: 25,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
  },
  qrCornerBottomRight: {
    bottom: 25,
    right: 25,
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },
  qrPattern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrPixel: {
    width: 14,
    height: 14,
    backgroundColor: '#000000',
    margin: 0.5,
  },
  qrPixelEmpty: {
    width: 14,
    height: 14,
    margin: 0.5,
  },
  qrLogo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShape: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  address: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  fiatCard: {
    backgroundColor: '#E0F7F7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  fiatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  coinsIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fiatTextContent: {
    flex: 1,
  },
  fiatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  fiatSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
