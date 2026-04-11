import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLevelForXP, getNextLevel, getXPProgress, XP_REWARDS, LevelConfig } from '@/constants/gamification';

const GAMIFICATION_KEY = 'lottomind_gamification';

interface GamificationData {
  xp: number;
  credits: number;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  totalGenerations: number;
  totalShares: number;
  streakDays: number;
  lastActiveDate: string | null;
  achievements: string[];
}

const DEFAULT_DATA: GamificationData = {
  xp: 0,
  credits: 5,
  referralCode: '',
  referredBy: null,
  referralCount: 0,
  totalGenerations: 0,
  totalShares: 0,
  streakDays: 0,
  lastActiveDate: null,
  achievements: [],
};

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'LM-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export interface GamificationContextValue {
  xp: number;
  credits: number;
  level: LevelConfig;
  nextLevel: LevelConfig | null;
  progress: number;
  referralCode: string;
  referralCount: number;
  totalGenerations: number;
  totalShares: number;
  streakDays: number;
  achievements: string[];
  addXP: (action: keyof typeof XP_REWARDS) => void;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  trackGeneration: () => void;
  trackShare: () => void;
  applyReferral: (code: string) => boolean;
  isLoading: boolean;
}

export const [GamificationProvider, useGamification] = createContextHook<GamificationContextValue>(() => {
  const queryClient = useQueryClient();
  const [data, setData] = useState<GamificationData>(DEFAULT_DATA);

  const dataQuery = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GAMIFICATION_KEY);
      if (stored) {
        return JSON.parse(stored) as GamificationData;
      }
      const fresh: GamificationData = {
        ...DEFAULT_DATA,
        referralCode: generateReferralCode(),
      };
      await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(fresh));
      return fresh;
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setData(dataQuery.data);
      const today = getTodayStr();
      if (dataQuery.data.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const newStreak = dataQuery.data.lastActiveDate === yesterdayStr
          ? dataQuery.data.streakDays + 1
          : 1;
        const updated = {
          ...dataQuery.data,
          streakDays: newStreak,
          lastActiveDate: today,
          xp: dataQuery.data.xp + XP_REWARDS.dailyOpen,
        };
        setData(updated);
        void AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(updated));
      }
    }
  }, [dataQuery.data]);

  const syncData = useMutation({
    mutationFn: async (newData: GamificationData) => {
      await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(newData));
      return newData;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['gamification'] });
    },
  });

  const addXP = useCallback((action: keyof typeof XP_REWARDS) => {
    const reward = XP_REWARDS[action];
    setData(prev => {
      const updated = { ...prev, xp: prev.xp + reward };
      syncData.mutate(updated);
      return updated;
    });
    console.log(`[Gamification] +${reward} XP for ${action}`);
  }, [syncData]);

  const addCredits = useCallback((amount: number) => {
    setData(prev => {
      const updated = { ...prev, credits: prev.credits + amount };
      syncData.mutate(updated);
      return updated;
    });
  }, [syncData]);

  const spendCredits = useCallback((amount: number): boolean => {
    if (data.credits < amount) return false;
    setData(prev => {
      const updated = { ...prev, credits: prev.credits - amount };
      syncData.mutate(updated);
      return updated;
    });
    return true;
  }, [data.credits, syncData]);

  const trackGeneration = useCallback(() => {
    setData(prev => {
      const updated = {
        ...prev,
        totalGenerations: prev.totalGenerations + 1,
        xp: prev.xp + XP_REWARDS.generate,
      };
      syncData.mutate(updated);
      return updated;
    });
  }, [syncData]);

  const trackShare = useCallback(() => {
    setData(prev => {
      const updated = {
        ...prev,
        totalShares: prev.totalShares + 1,
        xp: prev.xp + XP_REWARDS.share,
        credits: prev.credits + 5,
      };
      syncData.mutate(updated);
      return updated;
    });
    console.log('[Gamification] +5 credits for sharing/posting');
  }, [syncData]);

  const applyReferral = useCallback((code: string): boolean => {
    if (data.referredBy) return false;
    if (code === data.referralCode) return false;
    if (!code.startsWith('LM-')) return false;
    setData(prev => {
      const updated = {
        ...prev,
        referredBy: code,
        credits: prev.credits + 5,
        xp: prev.xp + XP_REWARDS.invite,
      };
      syncData.mutate(updated);
      return updated;
    });
    console.log('[Gamification] Referral applied:', code);
    return true;
  }, [data.referredBy, data.referralCode, syncData]);

  const level = useMemo(() => getLevelForXP(data.xp), [data.xp]);
  const nextLevel = useMemo(() => getNextLevel(data.xp), [data.xp]);
  const progress = useMemo(() => getXPProgress(data.xp), [data.xp]);

  return useMemo(() => ({
    xp: data.xp,
    credits: data.credits,
    level,
    nextLevel,
    progress,
    referralCode: data.referralCode,
    referralCount: data.referralCount,
    totalGenerations: data.totalGenerations,
    totalShares: data.totalShares,
    streakDays: data.streakDays,
    achievements: data.achievements,
    addXP,
    addCredits,
    spendCredits,
    trackGeneration,
    trackShare,
    applyReferral,
    isLoading: dataQuery.isLoading,
  }), [
    data.xp, data.credits, data.referralCode, data.referralCount,
    data.totalGenerations, data.totalShares, data.streakDays, data.achievements,
    level, nextLevel, progress,
    addXP, addCredits, spendCredits, trackGeneration, trackShare, applyReferral,
    dataQuery.isLoading,
  ]);
});
