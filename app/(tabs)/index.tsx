import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Animated, Pressable, Dimensions, Image, Text, PanResponder, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { darkColors, lightColors } from '@/constants/colors';
import { CheckCircle2, Search, SearchX, X, Hand, Sparkles, Users } from 'lucide-react-native';
import { useMesh } from '@/contexts/MeshContext';
import { useTheme } from '@/contexts/ThemeContext';
import ValueSelectionModal from '@/components/ValueSelectionModal';
import { CORE_VALUES } from '@/constants/values';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OrbitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const { peers, userValues, updateUserValues, isExploringMode, toggleExploringMode, getMatchingPeers, hasSeenRadarTutorial, completeRadarTutorial } = useMesh();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const successBannerAnim = useRef(new Animated.Value(-100)).current;

  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  
  const breathAnim = useRef(new Animated.Value(0)).current;
  const sonarAnim1 = useRef(new Animated.Value(0)).current;
  const sonarAnim2 = useRef(new Animated.Value(0)).current;
  const sonarAnim3 = useRef(new Animated.Value(0)).current;
  const sonarAnim4 = useRef(new Animated.Value(0)).current;
  
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [isSeekingAnimation, setIsSeekingAnimation] = useState(false);
  const seekX = useRef(new Animated.Value(0)).current;
  const seekY = useRef(new Animated.Value(0)).current;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const tutorialOpacity = useRef(new Animated.Value(0)).current;
  const tutorialScale = useRef(new Animated.Value(0.9)).current;
  const handAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasSeenRadarTutorial) {
      setTimeout(() => {
        setShowTutorial(true);
        Animated.parallel([
          Animated.spring(tutorialOpacity, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(tutorialScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
        ]).start();
      }, 500);
    }
    
    if (userValues.length === 0) {
      setShowValueModal(true);
    } else if (isExploringMode && userValues.length === 3) {
      setIsSeekingAnimation(true);
      
      const matchingPeers = getMatchingPeers().filter(p => {
        const matches = p.values?.filter((v: string) => userValues.includes(v)).length || 0;
        return matches === 3;
      });
      
      if (matchingPeers.length > 0) {
        const targetPeer = matchingPeers[0];
        const waypoints = [
          { x: 150, y: -100 },
          { x: -80, y: 180 },
          { x: 200, y: 100 },
          { x: -150, y: -50 },
          { x: targetPeer.x * 0.7, y: targetPeer.y * 0.7 },
          { x: targetPeer.x, y: targetPeer.y },
        ];
        
        const animations = waypoints.map((point, index) => {
          return Animated.parallel([
            Animated.timing(seekX, {
              toValue: point.x,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(seekY, {
              toValue: point.y,
              duration: 2000,
              useNativeDriver: false,
            }),
          ]);
        });
        
        Animated.sequence(animations).start(() => {
          setIsSeekingAnimation(false);
          setSelectedPeer(targetPeer.id);
          Animated.parallel([
            Animated.spring(panX, {
              toValue: -targetPeer.x,
              useNativeDriver: false,
              tension: 40,
              friction: 7,
            }),
            Animated.spring(panY, {
              toValue: -targetPeer.y,
              useNativeDriver: false,
              tension: 40,
              friction: 7,
            }),
          ]).start();
        });
      }
    }
  }, [userValues.length, isExploringMode, getMatchingPeers, seekX, seekY, panX, panY, userValues, hasSeenRadarTutorial, tutorialOpacity, tutorialScale]);

  useEffect(() => {
    if (showTutorial && tutorialStep === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(handAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(handAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    
    if (showTutorial) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showTutorial, tutorialStep, handAnim, pulseAnim]);

  const nextTutorialStep = useCallback(() => {
    if (tutorialStep < 2) {
      setTutorialStep(tutorialStep + 1);
    } else {
      Animated.parallel([
        Animated.timing(tutorialOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(tutorialScale, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 50,
        }),
      ]).start(() => {
        setShowTutorial(false);
        completeRadarTutorial();
      });
    }
  }, [tutorialStep, tutorialOpacity, tutorialScale, completeRadarTutorial]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panX.setOffset((panX as any)._value);
        panY.setOffset((panY as any)._value);
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: panX, dy: panY },
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        panX.flattenOffset();
        panY.flattenOffset();
        
        const velocity = Math.sqrt(
          gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy
        );
        
        if (velocity > 0.3) {
          Animated.decay(panX, {
            velocity: gestureState.vx,
            deceleration: 0.995,
            useNativeDriver: false,
          }).start();
          
          Animated.decay(panY, {
            velocity: gestureState.vy,
            deceleration: 0.995,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (params.showSuccess === 'true') {
      setShowSuccessBanner(true);
      Animated.sequence([
        Animated.timing(successBannerAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(successBannerAnim, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccessBanner(false);
        router.setParams({ showSuccess: undefined, successMessage: undefined });
      });
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 4500,
          useNativeDriver: false,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 4500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    const createSonarAnimation = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: false,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    createSonarAnimation(sonarAnim1, 0);
    createSonarAnimation(sonarAnim2, 800);
    createSonarAnimation(sonarAnim3, 1600);
    createSonarAnimation(sonarAnim4, 2400);
  }, [params.showSuccess, router, successBannerAnim, breathAnim, sonarAnim1, sonarAnim2, sonarAnim3, sonarAnim4]);

  const breathShadowRadius = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 32],
  });

  const breathShadowOpacity = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const visiblePeers = useMemo(() => {
    let filteredPeers = peers;
    
    if (isExploringMode && userValues.length === 3) {
      filteredPeers = getMatchingPeers();
    }
    
    if (selectedTags.length > 0) {
      filteredPeers = filteredPeers.filter(peer => {
        return peer.values?.some((v: string) => selectedTags.includes(v));
      });
    }
    
    return filteredPeers;
  }, [peers, isExploringMode, userValues.length, getMatchingPeers, selectedTags]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  }, []);

  const clearAllTags = useCallback(() => {
    setSelectedTags([]);
  }, []);



  const renderPeer = useCallback((peer: any) => {
    const isSelected = selectedPeer === peer.id;
    const matchCount = isExploringMode && userValues.length === 3 
      ? peer.values?.filter((v: string) => userValues.includes(v)).length || 0
      : 0;
    const hasMatch = matchCount > 0;
    const size = isSelected ? 18 : hasMatch ? 12 : 10;
    
    return (
      <Animated.View
        key={peer.id}
        style={[
          styles.peerContainer,
          {
            transform: [
              { translateX: panX },
              { translateY: panY },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.peerWrapper,
            {
              left: SCREEN_WIDTH / 2 + peer.x,
              top: SCREEN_HEIGHT / 2 + peer.y,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              if (isSelected) {
                setSelectedPeer(null);
              } else {
                setSelectedPeer(peer.id);
                Animated.parallel([
                  Animated.spring(panX, {
                    toValue: -peer.x,
                    useNativeDriver: false,
                    tension: 40,
                    friction: 7,
                  }),
                  Animated.spring(panY, {
                    toValue: -peer.y,
                    useNativeDriver: false,
                    tension: 40,
                    friction: 7,
                  }),
                ]).start();
              }
            }}
            style={[
              styles.peerDot,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: hasMatch ? colors.primary : '#FFFFFF',
                opacity: isSelected ? 0.95 : hasMatch ? (0.5 + matchCount * 0.15) : (0.3 + (peer.signal / 100) * 0.6),
                shadowColor: hasMatch ? colors.primary : '#FFFFFF',
                shadowOpacity: isSelected ? 0.9 : hasMatch ? 0.7 : 0.5,
                shadowRadius: isSelected ? 12 : hasMatch ? 8 : 6,
                elevation: isSelected ? 6 : hasMatch ? 4 : 3,
              },
            ]}
          />
          {isSelected && (
            <View style={styles.peerLabel}>
              <Text style={styles.peerLabelText}>{peer.name}</Text>
              <Text style={styles.peerLabelDistance}>{peer.distance}m</Text>
              {isExploringMode && matchCount > 0 && (
                <View style={[styles.matchBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.matchBadgeText}>{matchCount} value{matchCount !== 1 ? 's' : ''} match</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    );
  }, [selectedPeer, isExploringMode, userValues, panX, panY]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.searchHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.searchHeaderTop}>
            <View style={styles.searchTitleContainer}>
              <Search size={20} color={colors.primary} />
              <Text style={[styles.searchTitle, { color: colors.text }]}>Discover by Values</Text>
            </View>
            {selectedTags.length > 0 && (
              <Pressable onPress={clearAllTags} style={[styles.clearButton, { backgroundColor: colors.surfaceLight }]}>
                <X size={14} color={colors.textSecondary} />
                <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>Clear</Text>
              </Pressable>
            )}
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScrollContent}
            style={styles.tagsScroll}
          >
            {CORE_VALUES.map((value) => {
              const isSelected = selectedTags.includes(value);
              return (
                <Pressable
                  key={value}
                  onPress={() => toggleTag(value)}
                  style={[
                    styles.tagChip,
                    { 
                      backgroundColor: isSelected ? colors.primary : colors.surfaceLight,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }
                  ]}
                >
                  <Text style={[
                    styles.tagChipText,
                    { color: isSelected ? '#FFFFFF' : colors.text }
                  ]}>
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {selectedTags.length > 0 && (
            <View style={styles.selectedTagsInfo}>
              <Text style={[styles.selectedTagsText, { color: colors.textSecondary }]}>
                {selectedTags.length} value{selectedTags.length !== 1 ? 's' : ''} selected
              </Text>
            </View>
          )}
        </View>
        {showSuccessBanner && (
          <Animated.View
            style={[
              styles.successBanner,
              {
                transform: [{ translateY: successBannerAnim }],
              },
            ]}
          >
            <CheckCircle2 size={20} color="#059669" />
            <Text style={styles.successText}>
              {params.successMessage || 'Success!'}
            </Text>
          </Animated.View>
        )}
        <View style={styles.navigationSpace} {...panResponder.panHandlers}>
          <View style={styles.gridBackground}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLine, styles.gridLineVertical, { left: i * 100 }]} />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLine, styles.gridLineHorizontal, { top: i * 100 }]} />
            ))}
          </View>
          {visiblePeers.map((peer) => renderPeer(peer))}
          <Animated.View 
            style={[
              styles.centerAvatarContainer,
              isSeekingAnimation && {
                transform: [
                  { translateX: seekX },
                  { translateY: seekY },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.sonarRing,
                {
                  width: sonarAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 200],
                  }),
                  height: sonarAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 200],
                  }),
                  borderRadius: sonarAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 100],
                  }),
                  opacity: sonarAnim1.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.5, 0.3, 0],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.sonarRing,
                {
                  width: sonarAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 200],
                  }),
                  height: sonarAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 200],
                  }),
                  borderRadius: sonarAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 100],
                  }),
                  opacity: sonarAnim2.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.5, 0.3, 0],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.sonarRing,
                {
                  width: sonarAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 200],
                  }),
                  height: sonarAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 200],
                  }),
                  borderRadius: sonarAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 100],
                  }),
                  opacity: sonarAnim3.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.5, 0.3, 0],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.sonarRing,
                {
                  width: sonarAnim4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 200],
                  }),
                  height: sonarAnim4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 200],
                  }),
                  borderRadius: sonarAnim4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 100],
                  }),
                  opacity: sonarAnim4.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.5, 0.3, 0],
                  }),
                },
              ]}
            />
            <Pressable 
              style={styles.centerButton}
              onPress={() => {
                router.push('/profile');
              }}
            >
              <Animated.View
                style={[
                  styles.centerCircle,
                  {
                    shadowRadius: breathShadowRadius,
                    shadowOpacity: breathShadowOpacity,
                  },
                ]}
              >
                <Image
                  source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8u1txdk0of4zxscl5v2dq' }}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>
        <View style={styles.statsBar}>
          <View style={styles.statsContent}>
            <View style={styles.statsLeft}>
              <Text style={styles.statsText}>{visiblePeers.length} peers {isExploringMode ? 'matching' : 'nearby'}</Text>
              <Text style={styles.statsHint}>Scroll to explore • Tap users to focus</Text>
            </View>
            <Pressable
              style={[
                styles.exploreButton,
                { backgroundColor: colors.surface, borderColor: colors.primary },
                isExploringMode && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => {
                if (userValues.length < 3) {
                  setShowValueModal(true);
                } else {
                  toggleExploringMode();
                }
              }}
            >
              {isExploringMode ? (
                <SearchX size={18} color="#FFFFFF" />
              ) : (
                <Search size={18} color={colors.primary} />
              )}
              <Text style={[styles.exploreButtonText, { color: colors.primary }, isExploringMode && styles.exploreButtonTextActive]}>
                {isExploringMode ? 'Exit' : 'Explore'}
              </Text>
            </Pressable>
          </View>
        </View>
        
        {showTutorial && (
          <Animated.View
            style={[
              styles.tutorialOverlay,
              {
                opacity: tutorialOpacity,
              },
            ]}
          >
            <Pressable style={styles.tutorialBackdrop} onPress={nextTutorialStep} />
            
            <Animated.View
              style={[
                styles.tutorialCard,
                {
                  backgroundColor: colors.surface,
                  transform: [{ scale: tutorialScale }],
                  borderColor: colors.primary,
                },
              ]}
            >
              {tutorialStep === 0 && (
                <View style={styles.tutorialContent}>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          translateX: handAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 30],
                          }),
                        },
                        {
                          translateY: handAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -30],
                          }),
                        },
                      ],
                    }}
                  >
                    <Hand size={48} color={colors.primary} />
                  </Animated.View>
                  <Text style={[styles.tutorialTitle, { color: colors.text }]}>Welcome to the Radar!</Text>
                  <Text style={[styles.tutorialText, { color: colors.textSecondary }]}>Drag and pan around to explore peers in your decentralized network</Text>
                </View>
              )}
              
              {tutorialStep === 1 && (
                <View style={styles.tutorialContent}>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.2],
                          }),
                        },
                      ],
                    }}
                  >
                    <Users size={48} color={colors.primary} />
                  </Animated.View>
                  <Text style={[styles.tutorialTitle, { color: colors.text }]}>Tap on Peers</Text>
                  <Text style={[styles.tutorialText, { color: colors.textSecondary }]}>Tap any peer dot to view their info and auto-center on them</Text>
                </View>
              )}
              
              {tutorialStep === 2 && (
                <View style={styles.tutorialContent}>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '15deg'],
                          }),
                        },
                      ],
                    }}
                  >
                    <Sparkles size={48} color={colors.primary} />
                  </Animated.View>
                  <Text style={[styles.tutorialTitle, { color: colors.text }]}>Discover by Values</Text>
                  <Text style={[styles.tutorialText, { color: colors.textSecondary }]}>Use the search tags above to filter peers by shared values and interests</Text>
                </View>
              )}
              
              <View style={styles.tutorialActions}>
                <View style={styles.tutorialDots}>
                  {[0, 1, 2].map((step) => (
                    <View
                      key={step}
                      style={[
                        styles.tutorialDot,
                        {
                          backgroundColor: tutorialStep === step ? colors.primary : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Pressable
                  style={[styles.tutorialButton, { backgroundColor: colors.primary }]}
                  onPress={nextTutorialStep}
                >
                  <Text style={styles.tutorialButtonText}>
                    {tutorialStep === 2 ? 'Get Started' : 'Next'}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        )}
        
        <ValueSelectionModal
          visible={showValueModal}
          onClose={() => setShowValueModal(false)}
          onConfirm={(values) => {
            updateUserValues(values);
            setShowValueModal(false);
          }}
          initialValues={userValues}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  tagsScroll: {
    marginHorizontal: -20,
  },
  tagsScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  tagChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  selectedTagsInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  selectedTagsText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },

  navigationSpace: {
    flex: 1,
    overflow: 'hidden',
  },
  gridBackground: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    width: 3000,
    height: 3000,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(31, 191, 191, 0.06)',
  },
  gridLineVertical: {
    width: 1,
    height: 3000,
  },
  gridLineHorizontal: {
    width: 3000,
    height: 1,
  },
  peerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  peerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerDot: {
    shadowOffset: { width: 0, height: 0 },
  },
  peerLabel: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  peerLabelText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  peerLabelDistance: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.7)',
  },
  centerAvatarContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 120,
    left: SCREEN_WIDTH / 2 - 120,
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  sonarRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#1FBFBF',
  },
  centerButton: {
    zIndex: 10,
  },
  centerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logo: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  statsBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(31, 191, 191, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 191, 191, 0.15)',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsLeft: {
    flex: 1,
    gap: 2,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1FBFBF',
  },
  statsHint: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#64748B',
  },
  successBanner: {
    position: 'absolute' as const,
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#059669',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  exploreButtonTextActive: {
    color: '#FFFFFF',
  },
  matchBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  matchBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorialBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  tutorialCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 2,
    maxWidth: 400,
  },
  tutorialContent: {
    alignItems: 'center',
    gap: 16,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tutorialText: {
    fontSize: 16,
    fontWeight: '400' as const,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  tutorialActions: {
    marginTop: 32,
    gap: 20,
    alignItems: 'center',
  },
  tutorialDots: {
    flexDirection: 'row',
    gap: 8,
  },
  tutorialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tutorialButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
  },
  tutorialButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
