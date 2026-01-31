import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

type Step = 'amount' | 'payment' | 'pin';

interface PaymentMethod {
  id: string;
  name: string;
  cardNumber: string;
  expiration: string;
  gradient: [string, string, ...string[]];
  icon?: string;
}

export default function SendScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('1');
  const [pin, setPin] = useState('');

  const exchangeRate = 0.0823;
  const oyeAmount = amount ? (parseFloat(amount) * exchangeRate).toFixed(2) : '0';

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'John Doe',
      cardNumber: '**** 6789',
      expiration: '06/22',
      gradient: ['#E91E63', '#9C27B0', '#00BCD4'],
      icon: 'R',
    },
    {
      id: '2',
      name: 'John Doe',
      cardNumber: '**** 6789',
      expiration: '06/22',
      gradient: ['#00BCD4', '#00BCD4'],
      icon: '⚡',
    },
  ];

  const otherMethods = [
    { id: 'stripe', name: 'Stripe', color: '#635BFF' },
    { id: 'visa', name: 'Visa', color: '#1A1F71' },
    { id: 'mastercard', name: 'MasterCard', color: '#EB001B' },
  ];

  const handleNumberPress = (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'amount') {
      if (num === '000') {
        setAmount(prev => prev + '000');
      } else {
        setAmount(prev => prev + num);
      }
    } else if (step === 'pin') {
      if (pin.length < 6) {
        const newPin = pin + num;
        setPin(newPin);
        if (newPin.length === 6) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(() => {
            router.push({
              pathname: '/article',
              params: { 
                fromTransaction: 'true', 
                amount: oyeAmount,
                currency: 'OYE'
              }
            });
          }, 300);
        }
      }
    }
  };

  const handleBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'amount') {
      setAmount(prev => prev.slice(0, -1));
    } else if (step === 'pin') {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 'amount') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('pin');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'amount') {
      router.back();
    } else if (step === 'payment') {
      setStep('amount');
    } else if (step === 'pin') {
      setStep('payment');
    }
  };

  const handlePercentage = (percentage: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const balance = 1000;
    const calculatedAmount = Math.floor((balance * percentage) / 100).toString();
    setAmount(calculatedAmount);
  };

  const renderAmountStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.currencySelector}>
        <Image source={{ uri: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/generic.png' }} style={styles.currencyIcon} />
        <Text style={styles.currencyText}>ORYVE (OYE)</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amountInput, amount === '' && styles.amountPlaceholder]}>
          {amount === '' ? 'Enter the amount' : amount}
        </Text>
        {amount !== '' && <View style={styles.cursor} />}
      </View>

      <Text style={styles.balanceText}>
        Your balance: <Text style={styles.balanceAmount}>1,000 OYE</Text>
      </Text>

      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>ORYVE (OYE) will be exchanged to the major fiat currency used for your bank account.</Text>
      </View>

      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <ArrowRight size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.percentageButtons}>
        {[25, 50, 75, 100].map((percentage) => (
          <TouchableOpacity
            key={percentage}
            style={styles.percentageButton}
            onPress={() => handlePercentage(percentage)}
            activeOpacity={0.7}
          >
            <Text style={styles.percentageText}>{percentage}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select payment method</Text>

      <ScrollView style={styles.paymentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.paymentMethods}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.paymentCardWrapper}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelectedPayment(method.id);
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={method.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.paymentCard}
              >
                <View style={styles.paymentCardHeader}>
                  <View style={styles.paymentCardIcon}>
                    <Text style={styles.paymentCardIconText}>{method.icon}</Text>
                  </View>
                  <View style={styles.paymentCardInfo}>
                    <Text style={styles.paymentCardName}>{method.name}</Text>
                    <Text style={styles.paymentCardNumber}>{method.cardNumber}</Text>
                  </View>
                  <Text style={styles.paymentCardExpiration}>Expiration: {method.expiration}</Text>
                </View>
                {selectedPayment === method.id && (
                  <View style={styles.selectedBadge}>
                    <View style={styles.checkmark} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addBankAccountButton} activeOpacity={0.8}>
          <Text style={styles.addBankAccountText}>Add bank account</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.otherMethodsTitle}>Or choose another method</Text>

        <View style={styles.otherMethods}>
          {otherMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.otherMethodButton}
              activeOpacity={0.8}
            >
              <View style={[styles.methodCircle, { backgroundColor: method.color }]} />
              <Text style={styles.otherMethodText}>{method.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <ArrowRight size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderPinStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.pinHeader}>
        <View style={styles.lockIcon}>
          <LinearGradient
            colors={['#00BCD4', '#0A5F5F']}
            style={styles.lockGradient}
          >
            <Lock size={32} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.pinTitle}>Enter your PIN to continue</Text>
      </View>

      <View style={styles.pinDots}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.forgotPinButton} activeOpacity={0.7}>
        <Text style={styles.forgotPinText}>Forgot PIN?</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNumberPad = () => (
    <View style={styles.numberPad}>
      <View style={styles.numberRow}>
        {['1', '2', '3'].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num)}
            activeOpacity={0.7}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numberRow}>
        {['4', '5', '6'].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num)}
            activeOpacity={0.7}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numberRow}>
        {['7', '8', '9'].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num)}
            activeOpacity={0.7}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numberRow}>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => handleNumberPress('000')}
          activeOpacity={0.7}
        >
          <Text style={styles.numberText}>000</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => handleNumberPress('0')}
          activeOpacity={0.7}
        >
          <Text style={styles.numberText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numberButton}
          onPress={handleBackspace}
          activeOpacity={0.7}
        >
          <Text style={styles.backspaceText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPinNumberPad = () => (
    <View style={styles.pinNumberPad}>
      <View style={styles.numberRow}>
        {['1', '2', '3'].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.pinNumberButton}
            onPress={() => handleNumberPress(num)}
            activeOpacity={0.7}
          >
            <Text style={styles.pinNumberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numberRow}>
        {['4', '5', '6'].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.pinNumberButton}
            onPress={() => handleNumberPress(num)}
            activeOpacity={0.7}
          >
            <Text style={styles.pinNumberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numberRow}>
        {['7', '8', '9'].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.pinNumberButton}
            onPress={() => handleNumberPress(num)}
            activeOpacity={0.7}
          >
            <Text style={styles.pinNumberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.numberRow}>
        <View style={styles.pinNumberButton} />
        <TouchableOpacity
          style={styles.pinNumberButton}
          onPress={() => handleNumberPress('0')}
          activeOpacity={0.7}
        >
          <Text style={styles.pinNumberText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pinNumberButton}
          onPress={handleBackspace}
          activeOpacity={0.7}
        >
          <Text style={styles.pinBackspaceText}>←</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={24} color="#0A2540" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{step === 'pin' ? '' : 'Send'}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {step === 'amount' && renderAmountStep()}
          {step === 'payment' && renderPaymentStep()}
          {step === 'pin' && renderPinStep()}
        </View>

        {(step === 'amount' || step === 'pin') && (
          step === 'pin' ? renderPinNumberPad() : renderNumberPad()
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#0A2540',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8F4F8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  currencyIcon: {
    width: 24,
    height: 24,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0A2540',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#8B92A8',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 80,
  },
  amountInput: {
    fontSize: 64,
    fontWeight: '600' as const,
    color: '#0A2540',
    textAlign: 'center',
  },
  amountPlaceholder: {
    color: '#CBD5E1',
    fontSize: 32,
  },
  cursor: {
    width: 3,
    height: 60,
    backgroundColor: '#00BCD4',
    marginLeft: 4,
  },
  balanceText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  balanceAmount: {
    fontWeight: '700' as const,
    color: '#0A2540',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF9E7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F4D03F',
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#D68910',
    lineHeight: 18,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 24,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  percentageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  percentageButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0A2540',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#0A2540',
    marginTop: 20,
    marginBottom: 32,
  },
  paymentScroll: {
    flex: 1,
  },
  paymentMethods: {
    gap: 16,
    marginBottom: 20,
  },
  paymentCardWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentCard: {
    padding: 20,
    minHeight: 140,
    position: 'relative',
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCardIconText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  paymentCardInfo: {
    flex: 1,
  },
  paymentCardName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  paymentCardNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  paymentCardExpiration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  selectedBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 12,
    height: 6,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateY: -2 }],
  },
  addBankAccountButton: {
    borderWidth: 2,
    borderColor: '#00BCD4',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  addBankAccountText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#00BCD4',
  },
  divider: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  otherMethodsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0A2540',
    marginBottom: 16,
  },
  otherMethods: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 100,
  },
  otherMethodButton: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  methodCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  otherMethodText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#0A2540',
  },
  pinHeader: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 60,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 24,
  },
  lockGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#64748B',
    textAlign: 'center',
  },
  pinDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00BCD4',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#00BCD4',
  },
  forgotPinButton: {
    alignSelf: 'center',
  },
  forgotPinText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#00BCD4',
  },
  numberPad: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  numberRow: {
    flexDirection: 'row',
    gap: 16,
  },
  numberButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#0A2540',
  },
  backspaceText: {
    fontSize: 24,
    fontWeight: '400' as const,
    color: '#0A2540',
  },
  pinNumberPad: {
    paddingHorizontal: 50,
    paddingBottom: 60,
    gap: 20,
  },
  pinNumberButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#E8EDF2',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinNumberText: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#0A2540',
  },
  pinBackspaceText: {
    fontSize: 26,
    fontWeight: '400' as const,
    color: '#0A2540',
  },
});
