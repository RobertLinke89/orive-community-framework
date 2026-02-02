import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, PanResponder, Modal, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Bell, ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff, X, CheckCircle, TrendingUp, AlertCircle, Clock, Send, Download, RefreshCw } from 'lucide-react-native';
import { lightColors, darkColors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  change: number;
  icon: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'buy' | 'swap';
  amount: string;
  currency: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  address?: string;
}

interface BankAccount {
  id: string;
  name: string;
  cardNumber: string;
  expiration: string;
  balance: number;
  gradient: readonly [string, string, ...string[]];
  hasGooglePay?: boolean;
  isConnected?: boolean;
}

interface MarketToken {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
}

export default function WalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightColors : darkColors;
  const [activeTab, setActiveTab] = useState<'crypto' | 'bank' | 'market'>('crypto');
  const [marketFilter, setMarketFilter] = useState<'all' | 'top' | 'gainers' | 'losers' | 'topMarket'>('all');
  const [showBalance, setShowBalance] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tabs = useMemo<('crypto' | 'bank' | 'market')[]>(() => ['crypto', 'bank', 'market'], []);

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentIndex = tabs.indexOf(activeTab);
        
        if (gestureState.dx > 50 && currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1]);
        } else if (gestureState.dx < -50 && currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1]);
        }
      },
    }),
    [tabs, activeTab]
  );

  const tokens = useMemo<Token[]>(() => [
    {
      id: '1',
      name: 'ORYVE',
      symbol: 'OYE',
      amount: 1228,
      value: 50.952345,
      change: 5.4,
      icon: 'https://via.placeholder.com/40/1FBFBF/FFFFFF?text=O',
    },
    {
      id: '2',
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: 1.228,
      value: 50952.345,
      change: 5.4,
      icon: 'https://via.placeholder.com/40/F7931A/FFFFFF?text=B',
    },
    {
      id: '3',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: 0.1241234551,
      value: 50.952345,
      change: -0.3,
      icon: 'https://via.placeholder.com/40/627EEA/FFFFFF?text=E',
    },
  ], []);

  const totalBalance = 2325.0;
  const profitLoss24h = 120.0;
  const profitLoss24hPercent = 0.5;
  const totalProfitLoss = 302.0;
  const totalProfitLossPercent = 1.3;

  const bankAccounts = useMemo<BankAccount[]>(() => [
    {
      id: '1',
      name: 'John Doe',
      cardNumber: '**** 6789',
      expiration: '06/22',
      balance: 1097.0,
      gradient: ['#E91E63', '#9C27B0', '#00BCD4'],
      hasGooglePay: true,
      isConnected: true,
    },
    {
      id: '2',
      name: 'John Doe',
      cardNumber: '**** 6789',
      expiration: '06/22',
      balance: 2000.0,
      gradient: ['#00BCD4', '#00BCD4'],
    },
  ], []);

  const totalBankBalance = useMemo(() => bankAccounts.reduce((sum, acc) => sum + acc.balance, 0), [bankAccounts]);

  const transactions = useMemo<Transaction[]>(() => [
    {
      id: '1',
      type: 'receive',
      amount: '125.50',
      currency: 'OYE',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed',
      address: '0x742d35...32c4',
    },
    {
      id: '2',
      type: 'send',
      amount: '50.00',
      currency: 'OYE',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'completed',
      address: '0x9a3c21...7e8f',
    },
    {
      id: '3',
      type: 'buy',
      amount: '500.00',
      currency: 'OYE',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'completed',
    },
    {
      id: '4',
      type: 'send',
      amount: '200.00',
      currency: 'OYE',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      status: 'completed',
      address: '0x1f8a45...b2d9',
    },
  ], []);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  }, []);

  const handleTabChange = useCallback((tab: 'crypto' | 'bank' | 'market') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const generateMarketTokens = useCallback((): MarketToken[] => {
    const cryptos = [
      { symbol: 'BTC', name: 'Bitcoin', basePrice: 43250, color: 'F7931A' },
      { symbol: 'ETH', name: 'Ethereum', basePrice: 2280, color: '627EEA' },
      { symbol: 'USDT', name: 'Tether', basePrice: 1.00, color: '26A17B' },
      { symbol: 'BNB', name: 'Binance', basePrice: 310, color: 'F3BA2F' },
      { symbol: 'SOL', name: 'Solana', basePrice: 98, color: '14F195' },
      { symbol: 'XRP', name: 'Ripple', basePrice: 0.63, color: '23292F' },
      { symbol: 'USDC', name: 'USD Coin', basePrice: 1.00, color: '2775CA' },
      { symbol: 'ADA', name: 'Cardano', basePrice: 0.58, color: '0033AD' },
      { symbol: 'AVAX', name: 'Avalanche', basePrice: 37, color: 'E84142' },
      { symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.09, color: 'C2A633' },
      { symbol: 'OYE', name: 'ORYVE', basePrice: 0.041, color: '1FBFBF' },
    ];

    return cryptos.map((crypto, index) => {
      const variance = (Math.random() - 0.5) * 0.2;
      const price = crypto.basePrice * (1 + variance);
      const change = (Math.random() - 0.4) * 20;

      return {
        id: (index + 1).toString(),
        symbol: crypto.symbol,
        name: crypto.name,
        price: parseFloat(price.toFixed(crypto.basePrice < 1 ? 6 : 2)),
        change: parseFloat(change.toFixed(2)),
        icon: `https://via.placeholder.com/40/${crypto.color}/FFFFFF?text=${crypto.symbol.charAt(0)}`,
      };
    });
  }, []);

  const marketTokens = useMemo(() => generateMarketTokens(), [generateMarketTokens]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          {...panResponder.panHandlers}
        >
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/w16ey4ddxczud9e4zwudf' }}
                style={[styles.avatar, { borderColor: colors.primary }]}
              />
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back</Text>
                <Text style={[styles.userName, { color: colors.text }]}>Robert</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleRefresh}
                activeOpacity={0.7}
              >
                <RefreshCw 
                  size={20} 
                  color={colors.text} 
                  style={{ transform: [{ rotate: isRefreshing ? '180deg' : '0deg' }] }} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowNotifications(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
                <Bell size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'crypto' && [styles.tabActive, { backgroundColor: colors.primary }],
              ]}
              onPress={() => handleTabChange('crypto')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'crypto' ? colors.surface : colors.textSecondary },
                  activeTab === 'crypto' && styles.tabTextActive,
                ]}
              >
                Crypto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'bank' && [styles.tabActive, { backgroundColor: colors.primary }],
              ]}
              onPress={() => handleTabChange('bank')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'bank' ? colors.surface : colors.textSecondary },
                  activeTab === 'bank' && styles.tabTextActive,
                ]}
              >
                Bank
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'market' && [styles.tabActive, { backgroundColor: colors.primary }],
              ]}
              onPress={() => handleTabChange('market')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'market' ? colors.surface : colors.textSecondary },
                  activeTab === 'market' && styles.tabTextActive,
                ]}
              >
                Market
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'market' ? (
            <View style={styles.marketContainer}>
              <Text style={[styles.marketTitle, { color: colors.text }]}>Market</Text>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={180}
                decelerationRate="fast"
                style={styles.topCryptoCardsScroll}
                contentContainerStyle={styles.topCryptoCardsContent}
              >
                {marketTokens.slice(0, 10).map((token) => (
                  <TouchableOpacity 
                    key={token.id} 
                    style={[styles.cryptoCard, { backgroundColor: colors.surface }]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cryptoCardHeader}>
                      <View style={[styles.cryptoCardIconSmall, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.cryptoCardIconText, { color: colors.surface }]}>
                          {token.symbol.charAt(0)}
                        </Text>
                      </View>
                      <Text style={[styles.cryptoCardSymbol, { color: colors.text }]} numberOfLines={1}>
                        {token.name}
                      </Text>
                    </View>
                    <Text style={[styles.cryptoCardPrice, { color: colors.text }]}>
                      ${token.price.toLocaleString()}
                    </Text>
                    <View style={[
                      styles.cryptoCardBadge, 
                      { backgroundColor: token.change < 0 ? 'rgba(255, 71, 87, 0.15)' : 'rgba(0, 217, 126, 0.15)' }
                    ]}>
                      <Text style={[
                        styles.cryptoCardBadgeText,
                        { color: token.change < 0 ? '#FF4757' : '#00D97E' }
                      ]}>
                        {token.change > 0 ? '+' : ''}{token.change.toFixed(1)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.findCryptoTitle, { color: colors.text }]}>Find a best crypto for you!</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterScrollContent}
              >
                {['all', 'top', 'gainers', 'losers', 'topMarket'].map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterTab,
                      { backgroundColor: colors.surfaceLight },
                      marketFilter === filter && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMarketFilter(filter as any);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.filterTabText,
                      { color: marketFilter === filter ? colors.surface : colors.textSecondary }
                    ]}>
                      {filter === 'all' ? 'All tokens' : 
                       filter === 'top' ? 'Top tokens' : 
                       filter === 'topMarket' ? 'Top market cap' :
                       filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={[styles.marketTokenList, { backgroundColor: colors.surface }]}>
                {marketTokens.map((token) => (
                  <TouchableOpacity 
                    key={token.id} 
                    style={styles.marketTokenItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.marketTokenLeft}>
                      <Image source={{ uri: token.icon }} style={styles.marketTokenIcon} />
                      <View>
                        <Text style={[styles.marketTokenSymbol, { color: colors.text }]}>{token.symbol}</Text>
                        <Text style={[styles.marketTokenName, { color: colors.textSecondary }]}>{token.name}</Text>
                      </View>
                    </View>
                    <View style={styles.marketTokenRight}>
                      <Text style={[styles.marketTokenPrice, { color: colors.text }]}>
                        ${token.price.toLocaleString()}
                      </Text>
                      <View style={[
                        styles.marketTokenBadge,
                        { backgroundColor: token.change < 0 ? 'rgba(255, 71, 87, 0.1)' : 'rgba(0, 217, 126, 0.1)' }
                      ]}>
                        <Text style={[
                          styles.marketTokenBadgeText,
                          { color: token.change < 0 ? '#FF4757' : '#00D97E' }
                        ]}>
                          {token.change > 0 ? '+' : ''}{token.change}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : activeTab === 'crypto' ? (
            <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Total Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
                  <Text style={[styles.balanceAmount, { color: colors.text }]}>
                    {showBalance ? totalBalance.toFixed(2) : '••••••'}
                  </Text>
                </View>
                <Text style={[styles.balanceSubtext, { color: colors.textSecondary }]}>
                  1,228 OYE · 2 other tokens
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.eyeButton, { backgroundColor: colors.surfaceLight }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowBalance(!showBalance);
                }}
                activeOpacity={0.7}
              >
                {showBalance ? (
                  <Eye size={20} color={colors.text} />
                ) : (
                  <EyeOff size={20} color={colors.text} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/send');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.actionIconContainer}>
                  <ArrowUpRight size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionButtonText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/receive');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.actionIconContainer}>
                  <ArrowDownLeft size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.actionButtonText}>Receive</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.statsContainer, { backgroundColor: colors.surfaceLight }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>24H Change</Text>
                <View style={styles.statValueRow}>
                  <TrendingUp size={14} color="#00D97E" />
                  <Text style={[styles.statValue, { color: '#00D97E' }]}>
                    ${profitLoss24h.toFixed(2)}
                  </Text>
                </View>
                <Text style={[styles.statPercentage, { color: '#00D97E' }]}>
                  +{profitLoss24hPercent}%
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total P/L</Text>
                <View style={styles.statValueRow}>
                  <TrendingUp size={14} color="#00D97E" />
                  <Text style={[styles.statValue, { color: '#00D97E' }]}>
                    ${totalProfitLoss.toFixed(2)}
                  </Text>
                </View>
                <Text style={[styles.statPercentage, { color: '#00D97E' }]}>
                  +{totalProfitLossPercent}%
                </Text>
              </View>
            </View>

            <View style={styles.portfolioSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Assets</Text>
              <View style={styles.tokenList}>
                {tokens.map((token) => (
                  <TouchableOpacity 
                    key={token.id} 
                    style={[styles.tokenItem, { backgroundColor: colors.surfaceLight }]}
                    activeOpacity={0.7}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View style={styles.tokenLeft}>
                      <Image
                        source={{ uri: token.icon }}
                        style={styles.tokenIcon}
                      />
                      <View style={styles.tokenInfo}>
                        <Text style={[styles.tokenSymbol, { color: colors.text }]}>{token.symbol}</Text>
                        <Text style={[styles.tokenName, { color: colors.textSecondary }]}>{token.name}</Text>
                      </View>
                    </View>
                    <View style={styles.tokenRight}>
                      <Text style={[styles.tokenAmount, { color: colors.text }]}>
                        {token.amount.toLocaleString()}
                      </Text>
                      <Text style={[styles.tokenValue, { color: colors.textSecondary }]}>
                        ${token.value.toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.tokenChangeBadge,
                        { backgroundColor: token.change < 0 ? 'rgba(255, 71, 87, 0.1)' : 'rgba(0, 217, 126, 0.1)' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tokenChangeText,
                          { color: token.change < 0 ? '#FF4757' : '#00D97E' },
                        ]}
                      >
                        {token.change > 0 ? '+' : ''}{token.change.toFixed(1)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.portfolioSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
              <View style={styles.transactionList}>
                {transactions.map((tx) => (
                  <TouchableOpacity 
                    key={tx.id} 
                    style={[styles.transactionItem, { backgroundColor: colors.surfaceLight }]}
                    activeOpacity={0.7}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: tx.type === 'receive' ? 'rgba(0, 217, 126, 0.15)' : 'rgba(31, 191, 191, 0.15)' }
                    ]}>
                      {tx.type === 'receive' ? (
                        <Download size={18} color="#00D97E" />
                      ) : tx.type === 'send' ? (
                        <Send size={18} color={colors.primary} />
                      ) : (
                        <Plus size={18} color={colors.primary} />
                      )}
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionType, { color: colors.text }]}>
                        {tx.type === 'receive' ? 'Received' : tx.type === 'send' ? 'Sent' : 'Bought'}
                      </Text>
                      <View style={styles.transactionMeta}>
                        <Clock size={12} color={colors.textSecondary} />
                        <Text style={[styles.transactionTime, { color: colors.textSecondary }]}>
                          {formatTimeAgo(tx.timestamp)}
                        </Text>
                        {tx.address && (
                          <Text style={[styles.transactionAddress, { color: colors.textSecondary }]}>
                            · {tx.address}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text style={[
                        styles.transactionAmount,
                        { color: tx.type === 'receive' ? '#00D97E' : colors.text }
                      ]}>
                        {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.currency}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.buyCryptoButton, { borderColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Text style={[styles.buyCryptoButtonText, { color: colors.primary }]}>Buy More Crypto</Text>
            </TouchableOpacity>
          </View>
          ) : (
            <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
              <View style={styles.bankBalanceHeader}>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Total Bank Balance</Text>
                <Text style={[styles.bankBalanceAmount, { color: colors.text }]}>
                  ${totalBankBalance.toFixed(2)}
                </Text>
                <Text style={[styles.bankBalanceSubtext, { color: colors.textSecondary }]}>
                  {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''} connected
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.addBankButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addBankButtonText}>Add Bank Account</Text>
              </TouchableOpacity>

              <View style={styles.bankAccountsSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Accounts</Text>
                <View style={styles.bankAccountsList}>
                  {bankAccounts.map((account) => (
                    <TouchableOpacity 
                      key={account.id} 
                      style={styles.bankCardWrapper}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push({
                          pathname: '/bank-account',
                          params: {
                            id: account.id,
                            name: account.name,
                            cardNumber: account.cardNumber,
                            expiration: account.expiration,
                            balance: account.balance.toString(),
                            isConnected: account.isConnected ? 'true' : 'false',
                            gradient: JSON.stringify(account.gradient),
                          },
                        });
                      }}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={account.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.bankCard}
                      >
                        <View style={styles.bankCardHeader}>
                          <View style={styles.bankCardIcon}>
                            <Text style={styles.bankCardIconText}>
                              {account.name.split(' ').map(n => n[0]).join('')}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.bankCardName}>{account.name}</Text>
                            <Text style={styles.bankCardNumber}>{account.cardNumber}</Text>
                          </View>
                          <Text style={styles.bankCardExpiration}>Exp: {account.expiration}</Text>
                        </View>

                        <Text style={styles.bankCardBalance}>
                          ${account.balance.toFixed(2)}
                        </Text>

                        {(account.hasGooglePay || account.isConnected) && (
                          <View style={styles.bankCardBadges}>
                            {account.hasGooglePay && (
                              <View style={styles.bankCardBadge}>
                                <Text style={styles.bankCardBadgeText}>G Pay</Text>
                              </View>
                            )}
                            {account.isConnected && (
                              <View style={[styles.bankCardBadge, styles.bankCardBadgeConnected]}>
                                <View style={styles.connectedDot} />
                                <Text style={styles.bankCardBadgeText}>Connected</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent
          onRequestClose={() => setShowNotifications(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowNotifications(false)}
          >
            <Pressable style={[styles.notificationModal, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.notificationHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>Notifications</Text>
                <TouchableOpacity 
                  onPress={() => setShowNotifications(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.notificationList}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity 
                  style={[styles.notificationItem, { borderBottomColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={[styles.notificationIcon, styles.notificationIconSuccess]}>
                    <CheckCircle size={20} color="#059669" />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationItemTitle, { color: colors.text }]}>Transaction Completed</Text>
                    <Text style={[styles.notificationItemText, { color: colors.textSecondary }]}>
                      Your transfer of 0.5 BTC has been successfully completed
                    </Text>
                    <Text style={[styles.notificationItemTime, { color: colors.textSecondary }]}>5 minutes ago</Text>
                  </View>
                  <View style={styles.notificationDot} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.notificationItem, { borderBottomColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={[styles.notificationIcon, styles.notificationIconInfo]}>
                    <TrendingUp size={20} color="#0EA5E9" />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationItemTitle, { color: colors.text }]}>Price Alert</Text>
                    <Text style={[styles.notificationItemText, { color: colors.textSecondary }]}>
                      Bitcoin price increased by 5.2% in the last 24 hours
                    </Text>
                    <Text style={[styles.notificationItemTime, { color: colors.textSecondary }]}>2 hours ago</Text>
                  </View>
                  <View style={styles.notificationDot} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.notificationItem, { borderBottomColor: colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <View style={[styles.notificationIcon, styles.notificationIconWarning]}>
                    <AlertCircle size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationItemTitle, { color: colors.text }]}>Security Update</Text>
                    <Text style={[styles.notificationItemText, { color: colors.textSecondary }]}>
                      New login detected from Chrome on Windows
                    </Text>
                    <Text style={[styles.notificationItemTime, { color: colors.textSecondary }]}>1 day ago</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>

              <View style={[styles.notificationFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.markAllReadButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <Text style={styles.markAllReadText}>Mark All as Read</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 10,
  },
  notificationButton: {
    padding: 10,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tabTextActive: {},
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginTop: 4,
    marginRight: 4,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
  balanceSubtext: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statPercentage: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  statDivider: {
    width: 1,
  },
  portfolioSection: {
    marginTop: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  tokenList: {
    gap: 10,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tokenIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  tokenInfo: {
    gap: 2,
  },
  tokenSymbol: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  tokenName: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  tokenRight: {
    alignItems: 'flex-end',
    gap: 2,
    marginLeft: 'auto',
    marginRight: 12,
  },
  tokenAmount: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  tokenValue: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  tokenChangeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tokenChangeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  transactionList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    gap: 4,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionTime: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  transactionAddress: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  buyCryptoButton: {
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buyCryptoButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  bankBalanceHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bankBalanceAmount: {
    fontSize: 44,
    fontWeight: '700' as const,
    letterSpacing: -1,
    marginTop: 8,
    marginBottom: 8,
  },
  bankBalanceSubtext: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addBankButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  bankAccountsSection: {
    marginTop: 24,
    gap: 12,
  },
  bankAccountsList: {
    gap: 12,
  },
  bankCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bankCard: {
    padding: 24,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  bankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  bankCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankCardIconText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  bankCardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  bankCardNumber: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  bankCardExpiration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 'auto',
  },
  bankCardBalance: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  bankCardBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  bankCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bankCardBadgeConnected: {
    gap: 6,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00C48C',
  },
  bankCardBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#0A2540',
  },
  marketContainer: {
    gap: 20,
  },
  marketTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  topCryptoCardsScroll: {
    marginHorizontal: -20,
  },
  topCryptoCardsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cryptoCard: {
    width: 168,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cryptoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cryptoCardIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cryptoCardIconText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  cryptoCardSymbol: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  cryptoCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cryptoCardBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  cryptoCardPrice: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  findCryptoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  filterScroll: {
    marginHorizontal: -20,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  marketTokenList: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginTop: 4,
  },
  marketTokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marketTokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  marketTokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  marketTokenSymbol: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  marketTokenName: {
    fontSize: 13,
    marginTop: 2,
  },
  marketTokenRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  marketTokenPrice: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  marketTokenBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  marketTokenBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  closeButton: {
    padding: 4,
  },
  notificationList: {
    paddingHorizontal: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconSuccess: {
    backgroundColor: '#ECFDF5',
  },
  notificationIconInfo: {
    backgroundColor: '#F0F9FF',
  },
  notificationIconWarning: {
    backgroundColor: '#FEF3C7',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationItemTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  notificationItemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationItemTime: {
    fontSize: 12,
    marginTop: 2,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1FBFBF',
    marginTop: 6,
  },
  notificationFooter: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  markAllReadButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  markAllReadText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
