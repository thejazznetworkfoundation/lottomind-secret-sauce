import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PRO_KEY = 'lottomind_pro';
const FREE_GENERATIONS_KEY = 'lottomind_free_gens';
const FREE_GENERATION_LIMIT = 5;
const FREE_DREAM_USES_KEY = 'lottomind_free_dream_uses';
const FREE_CHAT_USES_KEY = 'lottomind_free_chat_uses';
const FREE_HOROSCOPE_USES_KEY = 'lottomind_free_horoscope_uses';
const FREE_BABY_NAMES_USES_KEY = 'lottomind_free_baby_names_uses';
const FREE_WEATHER_USES_KEY = 'lottomind_free_weather_uses';
const FREE_BABY_NAMES_RESET_KEY = 'lottomind_free_baby_names_reset';
const FREE_WEATHER_RESET_KEY = 'lottomind_free_weather_reset';
const FREE_DREAM_LIMIT = 1;
const FREE_DREAM_RESET_KEY = 'lottomind_free_dream_reset';
const FREE_HOROSCOPE_RESET_KEY = 'lottomind_free_horoscope_reset';
const FREE_CHAT_LIMIT = 3;
const FREE_HOROSCOPE_LIMIT = 1;
const FREE_BABY_NAMES_LIMIT = 1;
const FREE_WEATHER_LIMIT = 1;

interface ProData {
  isPro: boolean;
  subscribedAt: string | null;
  unlockMethod: 'stripe' | 'referral' | null;
}

const DEFAULT_PRO: ProData = {
  isPro: false,
  subscribedAt: null,
  unlockMethod: null,
};

export interface ProContextValue {
  isPro: boolean;
  freeGenerationsLeft: number;
  canGenerate: boolean;
  freeDreamUsesLeft: number;
  freeChatUsesLeft: number;
  freeHoroscopeUsesLeft: number;
  canUseDream: boolean;
  canUseChat: boolean;
  canUseHoroscope: boolean;
  freeBabyNamesUsesLeft: number;
  freeWeatherUsesLeft: number;
  canUseBabyNames: boolean;
  canUseWeather: boolean;
  useBabyNamesUse: () => boolean;
  useWeatherUse: () => boolean;
  subscribedAt: string | null;
  unlockMethod: string | null;
  isLoading: boolean;
  openPaywall: () => void;
  setPaywallVisible: (visible: boolean) => void;
  paywallVisible: boolean;
  upgradeToPro: (method: 'stripe' | 'referral') => void;
  useGeneration: () => boolean;
  useDreamUse: () => boolean;
  useChatUse: () => boolean;
  useHoroscopeUse: () => boolean;
  checkProFeature: (featureName: string) => boolean;
}

export const [ProProvider, usePro] = createContextHook<ProContextValue>(() => {
  const queryClient = useQueryClient();
  const [proData, setProData] = useState<ProData>(DEFAULT_PRO);
  const [freeGens, setFreeGens] = useState<number>(FREE_GENERATION_LIMIT);
  const [freeDreamUses, setFreeDreamUses] = useState<number>(FREE_DREAM_LIMIT);
  const [freeChatUses, setFreeChatUses] = useState<number>(FREE_CHAT_LIMIT);
  const [freeHoroscopeUses, setFreeHoroscopeUses] = useState<number>(FREE_HOROSCOPE_LIMIT);
  const [freeBabyNamesUses, setFreeBabyNamesUses] = useState<number>(FREE_BABY_NAMES_LIMIT);
  const [freeWeatherUses, setFreeWeatherUses] = useState<number>(FREE_WEATHER_LIMIT);
  const [paywallVisible, setPaywallVisible] = useState<boolean>(false);

  const proQuery = useQuery({
    queryKey: ['proStatus'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PRO_KEY);
      return stored ? (JSON.parse(stored) as ProData) : DEFAULT_PRO;
    },
  });

  const freeGensQuery = useQuery({
    queryKey: ['freeGenerations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FREE_GENERATIONS_KEY);
      return stored ? parseInt(stored, 10) : FREE_GENERATION_LIMIT;
    },
  });

  const freeDreamQuery = useQuery({
    queryKey: ['freeDreamUses'],
    queryFn: async () => {
      const resetDateStr = await AsyncStorage.getItem(FREE_DREAM_RESET_KEY);
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
      if (resetDateStr !== currentMonth) {
        await AsyncStorage.setItem(FREE_DREAM_RESET_KEY, currentMonth);
        await AsyncStorage.setItem(FREE_DREAM_USES_KEY, String(FREE_DREAM_LIMIT));
        console.log('[ProProvider] Dream uses reset for new month');
        return FREE_DREAM_LIMIT;
      }
      const stored = await AsyncStorage.getItem(FREE_DREAM_USES_KEY);
      return stored ? parseInt(stored, 10) : FREE_DREAM_LIMIT;
    },
  });

  const freeChatQuery = useQuery({
    queryKey: ['freeChatUses'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FREE_CHAT_USES_KEY);
      return stored ? parseInt(stored, 10) : FREE_CHAT_LIMIT;
    },
  });

  const freeHoroscopeQuery = useQuery({
    queryKey: ['freeHoroscopeUses'],
    queryFn: async () => {
      const resetDateStr = await AsyncStorage.getItem(FREE_HOROSCOPE_RESET_KEY);
      const now = new Date();
      const currentDay = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (resetDateStr !== currentDay) {
        await AsyncStorage.setItem(FREE_HOROSCOPE_RESET_KEY, currentDay);
        await AsyncStorage.setItem(FREE_HOROSCOPE_USES_KEY, String(FREE_HOROSCOPE_LIMIT));
        console.log('[ProProvider] Horoscope uses reset for new day');
        return FREE_HOROSCOPE_LIMIT;
      }
      const stored = await AsyncStorage.getItem(FREE_HOROSCOPE_USES_KEY);
      return stored ? parseInt(stored, 10) : FREE_HOROSCOPE_LIMIT;
    },
  });

  function getWeekKey(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNum}`;
  }

  const freeBabyNamesQuery = useQuery({
    queryKey: ['freeBabyNamesUses'],
    queryFn: async () => {
      const resetKey = await AsyncStorage.getItem(FREE_BABY_NAMES_RESET_KEY);
      const currentWeek = getWeekKey();
      if (resetKey !== currentWeek) {
        await AsyncStorage.setItem(FREE_BABY_NAMES_RESET_KEY, currentWeek);
        await AsyncStorage.setItem(FREE_BABY_NAMES_USES_KEY, String(FREE_BABY_NAMES_LIMIT));
        console.log('[ProProvider] Baby names uses reset for new week');
        return FREE_BABY_NAMES_LIMIT;
      }
      const stored = await AsyncStorage.getItem(FREE_BABY_NAMES_USES_KEY);
      return stored ? parseInt(stored, 10) : FREE_BABY_NAMES_LIMIT;
    },
  });

  const freeWeatherQuery = useQuery({
    queryKey: ['freeWeatherUses'],
    queryFn: async () => {
      const resetKey = await AsyncStorage.getItem(FREE_WEATHER_RESET_KEY);
      const currentWeek = getWeekKey();
      if (resetKey !== currentWeek) {
        await AsyncStorage.setItem(FREE_WEATHER_RESET_KEY, currentWeek);
        await AsyncStorage.setItem(FREE_WEATHER_USES_KEY, String(FREE_WEATHER_LIMIT));
        console.log('[ProProvider] Weather uses reset for new week');
        return FREE_WEATHER_LIMIT;
      }
      const stored = await AsyncStorage.getItem(FREE_WEATHER_USES_KEY);
      return stored ? parseInt(stored, 10) : FREE_WEATHER_LIMIT;
    },
  });

  useEffect(() => {
    if (proQuery.data) {
      setProData(proQuery.data);
      console.log('[ProProvider] Loaded pro status:', proQuery.data.isPro);
    }
  }, [proQuery.data]);

  useEffect(() => {
    if (freeGensQuery.data !== undefined) {
      setFreeGens(freeGensQuery.data);
    }
  }, [freeGensQuery.data]);

  useEffect(() => {
    if (freeDreamQuery.data !== undefined) {
      setFreeDreamUses(freeDreamQuery.data);
    }
  }, [freeDreamQuery.data]);

  useEffect(() => {
    if (freeChatQuery.data !== undefined) {
      setFreeChatUses(freeChatQuery.data);
    }
  }, [freeChatQuery.data]);

  useEffect(() => {
    if (freeHoroscopeQuery.data !== undefined) {
      setFreeHoroscopeUses(freeHoroscopeQuery.data);
    }
  }, [freeHoroscopeQuery.data]);

  useEffect(() => {
    if (freeBabyNamesQuery.data !== undefined) {
      setFreeBabyNamesUses(freeBabyNamesQuery.data);
    }
  }, [freeBabyNamesQuery.data]);

  useEffect(() => {
    if (freeWeatherQuery.data !== undefined) {
      setFreeWeatherUses(freeWeatherQuery.data);
    }
  }, [freeWeatherQuery.data]);

  const syncPro = useMutation({
    mutationFn: async (data: ProData) => {
      await AsyncStorage.setItem(PRO_KEY, JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['proStatus'] });
    },
  });

  const syncFreeGens = useMutation({
    mutationFn: async (count: number) => {
      await AsyncStorage.setItem(FREE_GENERATIONS_KEY, String(count));
      return count;
    },
  });

  const syncFreeDreamUses = useMutation({
    mutationFn: async (count: number) => {
      await AsyncStorage.setItem(FREE_DREAM_USES_KEY, String(count));
      return count;
    },
  });

  const syncFreeChatUses = useMutation({
    mutationFn: async (count: number) => {
      await AsyncStorage.setItem(FREE_CHAT_USES_KEY, String(count));
      return count;
    },
  });

  const syncFreeHoroscopeUses = useMutation({
    mutationFn: async (count: number) => {
      await AsyncStorage.setItem(FREE_HOROSCOPE_USES_KEY, String(count));
      return count;
    },
  });

  const syncFreeBabyNamesUses = useMutation({
    mutationFn: async (count: number) => {
      await AsyncStorage.setItem(FREE_BABY_NAMES_USES_KEY, String(count));
      return count;
    },
  });

  const syncFreeWeatherUses = useMutation({
    mutationFn: async (count: number) => {
      await AsyncStorage.setItem(FREE_WEATHER_USES_KEY, String(count));
      return count;
    },
  });

  const upgradeToPro = useCallback((method: 'stripe' | 'referral') => {
    const updated: ProData = {
      isPro: true,
      subscribedAt: new Date().toISOString(),
      unlockMethod: method,
    };
    setProData(updated);
    syncPro.mutate(updated);
    setPaywallVisible(false);
    console.log('[ProProvider] Upgraded to Pro via', method);
  }, [syncPro]);

  const openPaywall = useCallback(() => {
    setPaywallVisible(true);
  }, []);

  const useGeneration = useCallback((): boolean => {
    if (proData.isPro) return true;
    if (freeGens <= 0) return false;
    const newCount = freeGens - 1;
    setFreeGens(newCount);
    syncFreeGens.mutate(newCount);
    console.log('[ProProvider] Free generation used, remaining:', newCount);
    return true;
  }, [proData.isPro, freeGens, syncFreeGens]);

  const useDreamUse = useCallback((): boolean => {
    if (proData.isPro) return true;
    if (freeDreamUses <= 0) return false;
    const newCount = freeDreamUses - 1;
    setFreeDreamUses(newCount);
    syncFreeDreamUses.mutate(newCount);
    console.log('[ProProvider] Free dream use consumed, remaining:', newCount);
    return true;
  }, [proData.isPro, freeDreamUses, syncFreeDreamUses]);

  const useChatUse = useCallback((): boolean => {
    if (proData.isPro) return true;
    if (freeChatUses <= 0) return false;
    const newCount = freeChatUses - 1;
    setFreeChatUses(newCount);
    syncFreeChatUses.mutate(newCount);
    console.log('[ProProvider] Free chat use consumed, remaining:', newCount);
    return true;
  }, [proData.isPro, freeChatUses, syncFreeChatUses]);

  const useHoroscopeUse = useCallback((): boolean => {
    if (proData.isPro) return true;
    if (freeHoroscopeUses <= 0) return false;
    const newCount = freeHoroscopeUses - 1;
    setFreeHoroscopeUses(newCount);
    syncFreeHoroscopeUses.mutate(newCount);
    console.log('[ProProvider] Free horoscope use consumed, remaining:', newCount);
    return true;
  }, [proData.isPro, freeHoroscopeUses, syncFreeHoroscopeUses]);

  const useBabyNamesUse = useCallback((): boolean => {
    if (proData.isPro) return true;
    if (freeBabyNamesUses <= 0) return false;
    const newCount = freeBabyNamesUses - 1;
    setFreeBabyNamesUses(newCount);
    syncFreeBabyNamesUses.mutate(newCount);
    console.log('[ProProvider] Free baby names use consumed, remaining:', newCount);
    return true;
  }, [proData.isPro, freeBabyNamesUses, syncFreeBabyNamesUses]);

  const useWeatherUse = useCallback((): boolean => {
    if (proData.isPro) return true;
    if (freeWeatherUses <= 0) return false;
    const newCount = freeWeatherUses - 1;
    setFreeWeatherUses(newCount);
    syncFreeWeatherUses.mutate(newCount);
    console.log('[ProProvider] Free weather use consumed, remaining:', newCount);
    return true;
  }, [proData.isPro, freeWeatherUses, syncFreeWeatherUses]);

  const checkProFeature = useCallback((featureName: string): boolean => {
    if (proData.isPro) return true;
    console.log('[ProProvider] Pro feature blocked:', featureName);
    return false;
  }, [proData.isPro]);

  const canGenerate = proData.isPro || freeGens > 0;
  const canUseDream = proData.isPro || freeDreamUses > 0;
  const canUseChat = proData.isPro || freeChatUses > 0;
  const canUseHoroscope = proData.isPro || freeHoroscopeUses > 0;
  const canUseBabyNames = proData.isPro || freeBabyNamesUses > 0;
  const canUseWeather = proData.isPro || freeWeatherUses > 0;

  return useMemo(() => ({
    isPro: proData.isPro,
    freeGenerationsLeft: freeGens,
    canGenerate,
    freeDreamUsesLeft: freeDreamUses,
    freeChatUsesLeft: freeChatUses,
    freeHoroscopeUsesLeft: freeHoroscopeUses,
    canUseDream,
    canUseChat,
    canUseHoroscope,
    freeBabyNamesUsesLeft: freeBabyNamesUses,
    freeWeatherUsesLeft: freeWeatherUses,
    canUseBabyNames,
    canUseWeather,
    useBabyNamesUse,
    useWeatherUse,
    subscribedAt: proData.subscribedAt,
    unlockMethod: proData.unlockMethod,
    isLoading: proQuery.isLoading,
    openPaywall,
    setPaywallVisible,
    paywallVisible,
    upgradeToPro,
    useGeneration,
    useDreamUse,
    useChatUse,
    useHoroscopeUse,
    checkProFeature,
  }), [
    proData.isPro, freeGens, canGenerate, freeDreamUses, freeChatUses, freeHoroscopeUses, canUseDream, canUseChat, canUseHoroscope,
    freeBabyNamesUses, freeWeatherUses, canUseBabyNames, canUseWeather,
    proData.subscribedAt, proData.unlockMethod,
    proQuery.isLoading, openPaywall, paywallVisible, upgradeToPro, useGeneration, useDreamUse, useChatUse, useHoroscopeUse, useBabyNamesUse, useWeatherUse, checkProFeature,
  ]);
});
