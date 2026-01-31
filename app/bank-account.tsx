import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  name: string;
  icon: string;
  amount: number;
  time: string;
}

const transactions: Transaction[] = [
  { id: '1', name: 'Spotify Premium', icon: 'https://via.placeholder.com/48/1DB954/FFFFFF?text=S', amount: 20, time: '2 mins ago' },
  { id: '2', name: 'Netflix', icon: 'https://via.placeholder.com/48/E50914/FFFFFF?text=N', amount: 150, time: '5 days ago' },
  { id: '3', name: 'Steam Top Up', icon: 'https://via.placeholder.com/48/171A21/FFFFFF?text=S', amount: 150, time: '5 days ago' },
  { id: '4', name: 'Amazon', icon: 'https://via.placeholder.com/48/FF9900/FFFFFF?text=A', amount: 57, time: '1 week ago' },
  { id: '5', name: 'Dribbble Pro', icon: 'https://via.placeholder.com/48/EA4C89/FFFFFF?text=D', amount: 110, time: '1 week ago' },
  { id: '6', name: 'Netflix', icon: 'https://via.placeholder.com/48/E50914/FFFFFF?text=N', amount: 57, time: '1 week ago' },
  { id: '7', name: 'Dribbble Pro', icon: 'https://via.placeholder.com/48/EA4C89/FFFFFF?text=D', amount: 110, time: '1 week ago' },
  { id: '8', name: 'Epic Games', icon: 'https://via.placeholder.com/48/313131/FFFFFF?text=E', amount: 89, time: '2 weeks ago' },
];

export default function BankAccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const name = params.name as string;
  const cardNumber = params.cardNumber as string;
  const expiration = params.expiration as string;
  const balance = parseFloat(params.balance as string);
  const isConnected = params.isConnected === 'true';
  const gradientColors = JSON.parse(params.gradient as string) as [string, string, ...string[]];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.background}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0A2540" />
          </TouchableOpacity>
        </SafeAreaView>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Text style={styles.cardIconText}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{name}</Text>
                  <Text style={styles.cardNumber}>{cardNumber}</Text>
                </View>
                <Text style={styles.cardExpiration}>Expiration: {expiration}</Text>
              </View>

              <Text style={styles.cardBalance}>
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>

              <View style={styles.cardFooter}>
                {isConnected ? (
                  <View style={styles.connectedBadge}>
                    <Image 
                      source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png' }}
                      style={styles.gPayIcon}
                    />
                    <View style={styles.connectedDot} />
                    <Text style={styles.connectedText}>Connected</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.connectButton}>
                    <Image 
                      source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png' }}
                      style={styles.gPayIcon}
                    />
                    <Text style={styles.connectButtonText}>Connect to GPay now</Text>
                  </TouchableOpacity>
                )}
                
                {isConnected && (
                  <TouchableOpacity style={styles.deleteButton}>
                    <Trash2 size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.transactionsSection}>
            <Text style={styles.transactionsTitle}>Recent transactions</Text>
            <View style={styles.transactionsList}>
              {transactions.map((transaction, index) => (
                <TouchableOpacity 
                  key={transaction.id} 
                  style={[
                    styles.transactionItem,
                    index === transactions.length - 1 && styles.transactionItemLast
                  ]}
                >
                  <Image source={{ uri: transaction.icon }} style={styles.transactionIcon} />
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName}>{transaction.name}</Text>
                    <Text style={styles.transactionTime}>{transaction.time}</Text>
                  </View>
                  <Text style={styles.transactionAmount}>${transaction.amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    padding: 24,
    minHeight: 220,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardExpiration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardBalance: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  gPayIcon: {
    width: 40,
    height: 16,
    resizeMode: 'contain',
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#00C48C',
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#0A2540',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#0A2540',
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionsSection: {
    marginTop: 32,
  },
  transactionsTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#0A2540',
    marginBottom: 20,
  },
  transactionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionItemLast: {
    borderBottomWidth: 0,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0A2540',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 13,
    color: '#8B92A8',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0A2540',
  },
});
