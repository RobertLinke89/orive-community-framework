import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { Message, Peer } from '@/types/mesh';
import { MOCK_PEERS } from '@/mocks/peers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

export const [MeshProvider, useMesh] = createContextHook(() => {
  const [peers, setPeers] = useState<Peer[]>(MOCK_PEERS);
  const [userValues, setUserValues] = useState<string[]>([]);
  const [isExploringMode, setIsExploringMode] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [hasSeenRadarTutorial, setHasSeenRadarTutorial] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      text: 'Hey everyone! Just joined the mesh network.',
      senderId: 'peer-1',
      senderName: 'Alice',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      hops: 1,
    },
    {
      id: 'msg-2',
      text: 'Welcome Alice! The mesh is working great today.',
      senderId: 'peer-2',
      senderName: 'Bob',
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      hops: 2,
    },
    {
      id: 'msg-3',
      text: 'Signal strength looking good on my end',
      senderId: 'peer-3',
      senderName: 'Charlie',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      hops: 1,
    },
  ]);
  const [isConnected] = useState<boolean>(true);

  useEffect(() => {
    AsyncStorage.multiGet(['userValues', 'hasCompletedOnboarding', 'hasSeenRadarTutorial', 'isLocked']).then((result) => {
      const storedValues = result[0][1];
      const storedOnboarding = result[1][1];
      const storedRadarTutorial = result[2][1];
      const storedLocked = result[3][1];
      
      if (storedValues) {
        setUserValues(JSON.parse(storedValues));
      }
      if (storedOnboarding) {
        setHasCompletedOnboarding(JSON.parse(storedOnboarding));
      }
      if (storedRadarTutorial) {
        setHasSeenRadarTutorial(JSON.parse(storedRadarTutorial));
      }
      if (storedLocked !== null) {
        setIsLocked(JSON.parse(storedLocked));
      }
      setIsReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  const updateUserValues = useCallback((values: string[]) => {
    setUserValues(values);
    AsyncStorage.setItem('userValues', JSON.stringify(values));
    setHasCompletedOnboarding(true);
    AsyncStorage.setItem('hasCompletedOnboarding', JSON.stringify(true));
  }, []);

  const toggleExploringMode = useCallback(() => {
    setIsExploringMode(prev => !prev);
  }, []);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
    AsyncStorage.setItem('isLocked', JSON.stringify(false));
  }, []);

  const lockApp = useCallback(() => {
    setIsLocked(true);
    AsyncStorage.setItem('isLocked', JSON.stringify(true));
  }, []);

  const completeRadarTutorial = useCallback(() => {
    setHasSeenRadarTutorial(true);
    AsyncStorage.setItem('hasSeenRadarTutorial', JSON.stringify(true));
  }, []);

  const getMatchingPeers = useCallback(() => {
    if (userValues.length === 0) return peers;
    
    return peers.map(peer => {
      const matchCount = peer.values.filter(v => userValues.includes(v)).length;
      return { ...peer, matchCount };
    }).sort((a, b) => (b.matchCount || 0) - (a.matchCount || 0));
  }, [peers, userValues]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPeers((current) =>
        current.map((peer) => ({
          ...peer,
          signal: Math.max(30, Math.min(100, peer.signal + (Math.random() - 0.5) * 10)),
          lastSeen: new Date(),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback((text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      senderId: 'me',
      senderName: 'You',
      timestamp: new Date(),
      hops: 0,
    };
    setMessages((current) => [...current, newMessage]);
  }, []);

  const connectedPeers = peers.filter((peer) => peer.signal > 40);

  return {
    peers,
    messages,
    isConnected,
    sendMessage,
    connectedPeers,
    userValues,
    updateUserValues,
    isExploringMode,
    toggleExploringMode,
    getMatchingPeers,
    hasCompletedOnboarding,
    hasSeenRadarTutorial,
    completeRadarTutorial,
    isLocked,
    isReady,
    unlockApp,
    lockApp,
  };
});
