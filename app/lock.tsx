import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Vibration } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { useMesh } from '@/contexts/MeshContext';

const PIN_LENGTH = 6;

export default function LockScreen() {
  const router = useRouter();
  const { unlockApp, hasCompletedOnboarding, isReady } = useMesh();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    console.log('Lock screen mounted', { isReady, hasCompletedOnboarding });
  }, [isReady, hasCompletedOnboarding]);

  const handleNumberPress = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => {
          if (newPin === '371001') {
            unlockApp();
            if (hasCompletedOnboarding) {
              router.replace('/(tabs)');
            } else {
              router.replace('/onboarding');
            }
          } else {
            setError(true);
            Vibration.vibrate(500);
            setTimeout(() => {
              setPin('');
              setError(false);
            }, 500);
          }
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled,
              error && styles.pinDotError,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'back'],
    ];

    return (
      <View style={styles.keypad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((num, colIndex) => {
              if (num === '') {
                return <View key={colIndex} style={styles.keyButton} />;
              }
              if (num === 'back') {
                return (
                  <Pressable
                    key={colIndex}
                    style={styles.keyButton}
                    onPress={handleBackspace}
                  >
                    <Text style={styles.keyText}>←</Text>
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={colIndex}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(num)}
                >
                  <Text style={styles.keyText}>
                    {num}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/utnddtc5lghiukgnwgra7' }}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <Text style={styles.title}>Enter your PIN to sign in</Text>

        {renderPinDots()}

        {renderKeypad()}

        <View style={styles.buttonsContainer}>
          <Pressable style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>SignUp</Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.loginButton,
              pin.length !== PIN_LENGTH && styles.loginButtonDisabled
            ]}
            disabled={pin.length !== PIN_LENGTH}
          >
            <Text style={[
              styles.loginButtonText,
              pin.length !== PIN_LENGTH && styles.loginButtonTextDisabled
            ]}>Login</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 24,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(31, 191, 191, 0.4)',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#1FBFBF',
    borderColor: '#1FBFBF',
  },
  pinDotError: {
    backgroundColor: '#FF4757',
    borderColor: '#FF4757',
  },
  keypad: {
    marginTop: 28,
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'center',
  },
  keyButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 32,
    fontWeight: '300' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 16,
    width: 274,
  },
  signUpButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center' as const,
  },
  loginButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 191, 191, 0.15)',
    borderWidth: 1,
    borderColor: '#1FBFBF',
  },
  loginButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1FBFBF',
    textAlign: 'center' as const,
  },
  loginButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
