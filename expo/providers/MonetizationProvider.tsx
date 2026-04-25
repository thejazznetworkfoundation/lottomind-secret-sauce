import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlanId,
  BillingCycle,
  FeatureId,
  PLAN_RANK,
  PLANS,
  getFeatureById,
  getPlanById,
  CreditPack,
} from '@/constants/monetization';

const MONETIZATION_KEY = 'lottomind_monetization';
const REWARDED_ADS_KEY = 'lottomind_rewarded_ads';

interface MonetizationData {
  plan: PlanId;
  billingCycle: BillingCycle | null;
  renewalDate: string | null;
  monthlyCredits: number;
  monthlyCreditsUsed: number;
  purchasedCredits: number;
  unlockedFeatures: FeatureId[];
  rewardedAdsWatchedToday: number;
  rewardedAdsDate: string | null;
}

const DEFAULT_DATA: MonetizationData = {
  plan: 'free',
  billingCycle: null,
  renewalDate: null,
  monthlyCredits: 25,
  monthlyCreditsUsed: 0,
  purchasedCredits: 0,
  unlockedFeatures: [],
  rewardedAdsWatchedToday: 0,
  rewardedAdsDate: null,
};

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export interface MonetizationContextValue {
  plan: PlanId;
  planName: string;
  planTagline: string;
  billingCycle: BillingCycle | null;
  renewalDate: string | null;
  monthlyCreditsRemaining: number;
  monthlyCreditsTotal: number;
  monthlyCreditsUsed: number;
  purchasedCredits: number;
  totalAvailableCredits: number;
  unlockedFeatures: FeatureId[];
  rewardedAdsWatchedToday: number;
  adsEnabled: boolean;
  isLoading: boolean;
  canAccessFeature: (featureId: FeatureId) => boolean;
  isFeatureLocked: (featureId: FeatureId) => boolean;
  getCreditSource: (featureId: FeatureId) => 'monthly' | 'purchased' | 'insufficient';
  useFeatureCredits: (featureId: FeatureId) => boolean;
  spendCredits: (amount: number, reason: string) => boolean;
  subscribeToPlan: (planId: PlanId, cycle: BillingCycle) => void;
  buyCreditPack: (pack: CreditPack) => void;
  unlockFeature: (featureId: FeatureId) => void;
  addPurchasedCredits: (amount: number) => void;
  watchRewardedAd: () => { success: boolean; message: string };
  creditUsagePercent: number;
  isLowCredits: boolean;
}

export const [MonetizationProvider, useMonetization] = createContextHook<MonetizationContextValue>(() => {
  const queryClient = useQueryClient();
  const [data, setData] = useState<MonetizationData>(DEFAULT_DATA);

  const dataQuery = useQuery({
    queryKey: ['monetization'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(MONETIZATION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MonetizationData;
        const today = getTodayStr();
        if (parsed.rewardedAdsDate !== today) {
          parsed.rewardedAdsWatchedToday = 0;
          parsed.rewardedAdsDate = today;
        }
        return parsed;
      }
      return DEFAULT_DATA;
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setData(dataQuery.data);
      console.log('[Monetization] Loaded plan:', dataQuery.data.plan);
    }
  }, [dataQuery.data]);

  const syncData = useMutation({
    mutationFn: async (newData: MonetizationData) => {
      await AsyncStorage.setItem(MONETIZATION_KEY, JSON.stringify(newData));
      return newData;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['monetization'] });
    },
  });

  const monthlyCreditsRemaining = Math.max(0, data.monthlyCredits - data.monthlyCreditsUsed);
  const totalAvailableCredits = monthlyCreditsRemaining + data.purchasedCredits;
  const creditUsagePercent = data.monthlyCredits > 0
    ? Math.min(100, Math.round((data.monthlyCreditsUsed / data.monthlyCredits) * 100))
    : 0;
  const isLowCredits = creditUsagePercent >= 80;

  const currentPlan = getPlanById(data.plan);

  const canAccessFeature = useCallback((featureId: FeatureId): boolean => {
    const feature = getFeatureById(featureId);
    if (!feature) return false;
    if (feature.requiredPlan === null) return true;
    if (data.unlockedFeatures.includes(featureId)) return true;
    return PLAN_RANK[data.plan] >= PLAN_RANK[feature.requiredPlan];
  }, [data.plan, data.unlockedFeatures]);

  const isFeatureLocked = useCallback((featureId: FeatureId): boolean => {
    return !canAccessFeature(featureId);
  }, [canAccessFeature]);

  const getCreditSource = useCallback((featureId: FeatureId): 'monthly' | 'purchased' | 'insufficient' => {
    const feature = getFeatureById(featureId);
    if (!feature) return 'insufficient';
    if (monthlyCreditsRemaining >= feature.creditCost) return 'monthly';
    if (data.purchasedCredits >= feature.creditCost) return 'purchased';
    return 'insufficient';
  }, [monthlyCreditsRemaining, data.purchasedCredits]);

  const useFeatureCredits = useCallback((featureId: FeatureId): boolean => {
    const feature = getFeatureById(featureId);
    if (!feature) return false;

    const source = getCreditSource(featureId);
    if (source === 'insufficient') return false;

    setData(prev => {
      let updated: MonetizationData;
      if (source === 'monthly') {
        updated = { ...prev, monthlyCreditsUsed: prev.monthlyCreditsUsed + feature.creditCost };
      } else {
        updated = { ...prev, purchasedCredits: Math.max(0, prev.purchasedCredits - feature.creditCost) };
      }
      syncData.mutate(updated);
      return updated;
    });
    console.log(`[Monetization] Used ${feature.creditCost} credits for ${feature.name} (${source})`);
    return true;
  }, [getCreditSource, syncData]);

  const spendCredits = useCallback((amount: number, reason: string): boolean => {
    if (amount <= 0) return true;
    if (totalAvailableCredits < amount) return false;

    setData(prev => {
      const availableMonthly = Math.max(0, prev.monthlyCredits - prev.monthlyCreditsUsed);
      const monthlySpend = Math.min(availableMonthly, amount);
      const purchasedSpend = amount - monthlySpend;
      const updated: MonetizationData = {
        ...prev,
        monthlyCreditsUsed: prev.monthlyCreditsUsed + monthlySpend,
        purchasedCredits: Math.max(0, prev.purchasedCredits - purchasedSpend),
      };
      syncData.mutate(updated);
      return updated;
    });
    console.log(`[Monetization] Spent ${amount} credits for ${reason}`);
    return true;
  }, [syncData, totalAvailableCredits]);

  const subscribeToPlan = useCallback((planId: PlanId, cycle: BillingCycle) => {
    const plan = getPlanById(planId);
    if (!plan) return;

    setData(prev => {
      const updated: MonetizationData = {
        ...prev,
        plan: plan.id,
        billingCycle: cycle,
        renewalDate: '30 days from now',
        monthlyCredits: plan.monthlyCredits,
        monthlyCreditsUsed: 0,
      };
      syncData.mutate(updated);
      return updated;
    });
    console.log(`[Monetization] Subscribed to ${plan.name} (${cycle})`);
  }, [syncData]);

  const buyCreditPack = useCallback((pack: CreditPack) => {
    setData(prev => {
      const updated = { ...prev, purchasedCredits: prev.purchasedCredits + pack.credits };
      syncData.mutate(updated);
      return updated;
    });
    console.log(`[Monetization] Bought ${pack.credits} credits`);
  }, [syncData]);

  const unlockFeature = useCallback((featureId: FeatureId) => {
    if (data.unlockedFeatures.includes(featureId)) return;
    setData(prev => {
      const updated = { ...prev, unlockedFeatures: [...prev.unlockedFeatures, featureId] };
      syncData.mutate(updated);
      return updated;
    });
    console.log(`[Monetization] Unlocked feature: ${featureId}`);
  }, [data.unlockedFeatures, syncData]);

  const addPurchasedCredits = useCallback((amount: number) => {
    setData(prev => {
      const updated = { ...prev, purchasedCredits: prev.purchasedCredits + amount };
      syncData.mutate(updated);
      return updated;
    });
  }, [syncData]);

  const watchRewardedAd = useCallback((): { success: boolean; message: string } => {
    if (data.plan !== 'free') {
      return { success: false, message: 'Rewarded ads are only for free users' };
    }
    if (data.rewardedAdsWatchedToday >= 5) {
      return { success: false, message: 'Daily rewarded ad limit reached (5/5)' };
    }

    setData(prev => {
      const updated = {
        ...prev,
        purchasedCredits: prev.purchasedCredits + 3,
        rewardedAdsWatchedToday: prev.rewardedAdsWatchedToday + 1,
        rewardedAdsDate: getTodayStr(),
      };
      syncData.mutate(updated);
      return updated;
    });
    console.log('[Monetization] Rewarded ad watched, +3 credits');
    return { success: true, message: 'Added 3 bonus credits!' };
  }, [data.plan, data.rewardedAdsWatchedToday, syncData]);

  return useMemo(() => ({
    plan: data.plan,
    planName: currentPlan?.name ?? 'Free',
    planTagline: currentPlan?.tagline ?? '',
    billingCycle: data.billingCycle,
    renewalDate: data.renewalDate,
    monthlyCreditsRemaining,
    monthlyCreditsTotal: data.monthlyCredits,
    monthlyCreditsUsed: data.monthlyCreditsUsed,
    purchasedCredits: data.purchasedCredits,
    totalAvailableCredits,
    unlockedFeatures: data.unlockedFeatures,
    rewardedAdsWatchedToday: data.rewardedAdsWatchedToday,
    adsEnabled: currentPlan?.adsEnabled ?? true,
    isLoading: dataQuery.isLoading,
    canAccessFeature,
    isFeatureLocked,
    getCreditSource,
    useFeatureCredits,
    spendCredits,
    subscribeToPlan,
    buyCreditPack,
    unlockFeature,
    addPurchasedCredits,
    watchRewardedAd,
    creditUsagePercent,
    isLowCredits,
  }), [
    data.plan, data.billingCycle, data.renewalDate, data.monthlyCredits,
    data.monthlyCreditsUsed, data.purchasedCredits, data.unlockedFeatures,
    data.rewardedAdsWatchedToday,
    currentPlan, monthlyCreditsRemaining, totalAvailableCredits,
    creditUsagePercent, isLowCredits,
    dataQuery.isLoading,
    canAccessFeature, isFeatureLocked, getCreditSource, useFeatureCredits, spendCredits,
    subscribeToPlan, buyCreditPack, unlockFeature, addPurchasedCredits, watchRewardedAd,
  ]);
});
