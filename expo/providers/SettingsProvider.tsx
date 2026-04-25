import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_FEATURE_FLAGS, FEATURE_FLAG_KEYS, LEGACY_FEATURE_FLAG_KEYS } from '@/config/featureFlags';
import type { FeatureFlags } from '@/config/featureFlags';

type SettingsContextValue = {
  featureFlags: FeatureFlags;
  setFeatureFlag: <Key extends keyof FeatureFlags>(key: Key, value: FeatureFlags[Key]) => Promise<void>;
  toggleFeatureFlag: (key: keyof FeatureFlags) => Promise<void>;
  isPsychicEnabled: boolean;
  hydrated: boolean;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

async function loadFeatureFlags(): Promise<FeatureFlags> {
  try {
    const entries = await Promise.all(
      Object.entries(FEATURE_FLAG_KEYS).map(async ([key, storageKey]) => {
        const legacyKey = LEGACY_FEATURE_FLAG_KEYS[key as keyof FeatureFlags];
        const raw = (await AsyncStorage.getItem(storageKey)) ?? (await AsyncStorage.getItem(legacyKey));
        return [key, raw === null ? undefined : raw === 'true'] as const;
      })
    );

    return entries.reduce<FeatureFlags>(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value ?? DEFAULT_FEATURE_FLAGS[key as keyof FeatureFlags],
      }),
      DEFAULT_FEATURE_FLAGS
    );
  } catch (error) {
    console.log('[SettingsProvider] Failed to load feature flags', error);
    return DEFAULT_FEATURE_FLAGS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadFeatureFlags()
      .then((next) => {
        if (mounted) setFeatureFlags(next);
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setFeatureFlag: SettingsContextValue['setFeatureFlag'] = async (key, value) => {
    setFeatureFlags((prev) => ({ ...prev, [key]: value }));
    try {
      await AsyncStorage.setItem(FEATURE_FLAG_KEYS[key], String(value));
    } catch (error) {
      console.log('[SettingsProvider] Failed to save feature flag', error);
    }
  };

  const toggleFeatureFlag: SettingsContextValue['toggleFeatureFlag'] = async (key) => {
    await setFeatureFlag(key, !featureFlags[key]);
  };

  const value = useMemo(
    () => ({
      featureFlags,
      setFeatureFlag,
      toggleFeatureFlag,
      isPsychicEnabled: featureFlags.aiPsychicEngine,
      hydrated,
    }),
    [featureFlags, hydrated]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return context;
}
