import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';

const THEME_KEY = 'lottomind_theme';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceHighlight: string;
  gold: string;
  goldLight: string;
  goldDim: string;
  goldMuted: string;
  goldBorder: string;
  amber: string;
  champagne: string;
  red: string;
  redMuted: string;
  green: string;
  greenMuted: string;
  blue: string;
  blueMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  overlay: string;
  cardBg: string;
  cardBorder: string;
  tabBarBg: string;
  tabBarBorder: string;
  inputBg: string;
  statusBarStyle: 'light' | 'dark';
}

const DARK_THEME: ThemeColors = {
  background: '#0A0A0A',
  surface: '#141414',
  surfaceLight: '#1C1C1C',
  surfaceHighlight: '#252525',
  gold: '#D4AF37',
  goldLight: '#E8CC6E',
  goldDim: '#8B7425',
  goldMuted: 'rgba(212, 175, 55, 0.15)',
  goldBorder: 'rgba(212, 175, 55, 0.25)',
  amber: '#F5A623',
  champagne: '#F7E7CE',
  red: '#E74C3C',
  redMuted: 'rgba(231, 76, 60, 0.15)',
  green: '#2ECC71',
  greenMuted: 'rgba(46, 204, 113, 0.15)',
  blue: '#3498DB',
  blueMuted: 'rgba(52, 152, 219, 0.15)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  border: '#2A2A2A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  cardBg: 'rgba(8, 18, 40, 0.85)',
  cardBorder: 'rgba(0, 229, 255, 0.25)',
  tabBarBg: 'rgba(6, 11, 24, 0.95)',
  tabBarBorder: 'rgba(0, 229, 255, 0.12)',
  inputBg: '#141414',
  statusBarStyle: 'light',
};

const LIGHT_THEME: ThemeColors = {
  background: '#F5F3EE',
  surface: '#FFFFFF',
  surfaceLight: '#F0EDE6',
  surfaceHighlight: '#E8E4DB',
  gold: '#9E7C1F',
  goldLight: '#C9A742',
  goldDim: '#6B5415',
  goldMuted: 'rgba(158, 124, 31, 0.12)',
  goldBorder: 'rgba(158, 124, 31, 0.2)',
  amber: '#C4851B',
  champagne: '#F7E7CE',
  red: '#D63031',
  redMuted: 'rgba(214, 48, 49, 0.1)',
  green: '#27AE60',
  greenMuted: 'rgba(39, 174, 96, 0.1)',
  blue: '#2980B9',
  blueMuted: 'rgba(41, 128, 185, 0.1)',
  textPrimary: '#1A1A1A',
  textSecondary: '#5A5A5A',
  textMuted: '#999999',
  border: '#D9D5CC',
  overlay: 'rgba(0, 0, 0, 0.3)',
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(158, 124, 31, 0.15)',
  tabBarBg: 'rgba(255, 255, 255, 0.97)',
  tabBarBorder: 'rgba(158, 124, 31, 0.12)',
  inputBg: '#F0EDE6',
  statusBarStyle: 'dark',
};

export interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const [ThemeProvider, useTheme] = createContextHook<ThemeContextValue>(() => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const themeQuery = useQuery({
    queryKey: ['theme'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      return (stored === 'light' || stored === 'dark') ? stored as ThemeMode : 'dark';
    },
  });

  useEffect(() => {
    if (themeQuery.data) {
      setMode(themeQuery.data);
    }
  }, [themeQuery.data]);

  const syncTheme = useMutation({
    mutationFn: async (newMode: ThemeMode) => {
      await AsyncStorage.setItem(THEME_KEY, newMode);
      return newMode;
    },
  });

  const toggleTheme = useCallback(() => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    syncTheme.mutate(next);
    console.log('[Theme] Switched to:', next);
  }, [mode, syncTheme]);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    syncTheme.mutate(newMode);
  }, [syncTheme]);

  const colors = mode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const isDark = mode === 'dark';

  return useMemo(() => ({
    mode,
    colors,
    isDark,
    toggleTheme,
    setTheme: setThemeMode,
  }), [mode, colors, isDark, toggleTheme, setThemeMode]);
});
