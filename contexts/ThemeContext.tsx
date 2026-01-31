import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isLight: boolean;
  isDark: boolean;
}

export const [ThemeProvider, useTheme] = createContextHook<ThemeContextValue>(() => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('app-theme').then((stored) => {
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
      setIsLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const newTheme = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem('app-theme', newTheme);
      return newTheme;
    });
  };

  return {
    theme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark',
  };
});
