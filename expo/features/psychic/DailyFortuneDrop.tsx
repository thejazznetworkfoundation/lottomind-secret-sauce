import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDays, RefreshCw, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import LottoBall from '@/components/LottoBall';
import { Colors } from '@/constants/colors';
import { useLotto } from '@/providers/LottoProvider';
import { useMonetization } from '@/providers/MonetizationProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { emitPsychicEvent } from '@/utils/psychicEvents';
import { generatePsychicReading, type PsychicReadingResult } from '@/utils/psychicEngine';
import {
  getPsychicFullUnlockExpiresAt,
  isPsychicFullUnlockActive,
} from '@/utils/psychicUnlocks';
import EnergyMeter from './EnergyMeter';

const FORTUNE_PREFIX = 'lottomind.psychic.dailyFortune.';
const REFRESH_COST = 10;

type SavedDailyFortune = {
  date: string;
  reading: PsychicReadingResult;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyFortuneDrop({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { currentGame } = useLotto();
  const { isPsychicEnabled } = useSettings();
  const { spendCredits, totalAvailableCredits, plan } = useMonetization();
  const [fortune, setFortune] = useState<PsychicReadingResult | null>(null);
  const [unlockExpiresAt, setUnlockExpiresAt] = useState<number | null>(null);
  const dateKey = todayKey();
  const hasFullUnlock = plan === 'pro' || plan === 'vip' || isPsychicFullUnlockActive(unlockExpiresAt);

  const buildFortune = useCallback(
    () =>
      generatePsychicReading({
        prompt: `daily fortune drop ${dateKey}`,
        game: currentGame,
      }),
    [currentGame, dateKey]
  );

  const persistFortune = useCallback(async (reading: PsychicReadingResult) => {
    const payload: SavedDailyFortune = { date: dateKey, reading };
    await AsyncStorage.setItem(`${FORTUNE_PREFIX}${dateKey}`, JSON.stringify(payload));
    emitPsychicEvent('PSYCHIC_DAILY_FORTUNE_READY', {
      energyScore: reading.energyScore,
      luckCycle: reading.luckCycle,
    });
  }, [dateKey]);

  useEffect(() => {
    if (!isPsychicEnabled) return;

    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(`${FORTUNE_PREFIX}${dateKey}`);
        if (raw) {
          const saved = JSON.parse(raw) as SavedDailyFortune;
          if (mounted) setFortune(saved.reading);
          return;
        }
        const next = buildFortune();
        await persistFortune(next);
        if (mounted) setFortune(next);
      } catch (error) {
        console.log('[DailyFortuneDrop] load error', error);
        if (mounted) setFortune(buildFortune());
      }
    })();

    return () => {
      mounted = false;
    };
  }, [buildFortune, dateKey, isPsychicEnabled, persistFortune]);

  useEffect(() => {
    if (!isPsychicEnabled) return;
    getPsychicFullUnlockExpiresAt().then(setUnlockExpiresAt).catch(() => setUnlockExpiresAt(null));
  }, [isPsychicEnabled]);

  const refreshWithCredits = useCallback(async () => {
    if (!hasFullUnlock && totalAvailableCredits < REFRESH_COST) {
      Alert.alert('Credits needed', `Refreshing the Daily Fortune Drop costs ${REFRESH_COST} credits.`);
      return;
    }

    if (!hasFullUnlock) {
      const charged = spendCredits(REFRESH_COST, 'Daily Fortune Drop refresh');
      if (!charged) {
        Alert.alert('Credits needed', `Refreshing the Daily Fortune Drop costs ${REFRESH_COST} credits.`);
        return;
      }
    }

    const next = generatePsychicReading({
      prompt: `daily fortune refresh ${dateKey} ${Date.now()}`,
      game: currentGame,
    });
    setFortune(next);
    await persistFortune(next);
  }, [currentGame, dateKey, hasFullUnlock, persistFortune, spendCredits, totalAvailableCredits]);

  if (!isPsychicEnabled || !fortune) return null;

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <CalendarDays size={18} color={Colors.gold} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Daily Fortune Drop</Text>
          <Text style={styles.title}>Today's symbolic energy</Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => router.push('/daily-fortune' as never)}
          activeOpacity={0.8}
        >
          <Sparkles size={15} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <EnergyMeter score={fortune.energyScore} label={fortune.luckCycle} compact />
      <Text style={styles.body}>Focus: Patience, clean tickets, and saved-game review.</Text>
      <Text style={styles.body}>Avoid: Impulse plays and chasing losses.</Text>
      <Text style={styles.body}>Lucky color: {fortune.luckyColor}</Text>

      <View style={styles.numberRow}>
        {fortune.suggestedNumbers.slice(0, compact ? 5 : 6).map((number, index) => (
          <LottoBall key={`daily-fortune-${number}-${index}`} number={number} delay={index * 60} />
        ))}
        {fortune.bonusNumber ? <LottoBall number={fortune.bonusNumber} isBonus delay={420} /> : null}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={() => { void refreshWithCredits(); }} activeOpacity={0.82}>
        <RefreshCw size={14} color={Colors.gold} />
        <Text style={styles.refreshText}>
          {hasFullUnlock ? 'Refresh Included' : `Refresh (${REFRESH_COST} Credits)`}
        </Text>
      </TouchableOpacity>

      {!compact ? <Text style={styles.disclaimer}>{fortune.disclaimer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.28)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  compactCard: {
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '800' as const,
  },
  detailsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  numberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  refreshButton: {
    minHeight: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  refreshText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
