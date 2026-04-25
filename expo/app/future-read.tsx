import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, ChevronLeft, Lock, Sparkles, Zap } from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';
import LottoBall from '@/components/LottoBall';
import { Colors } from '@/constants/colors';
import EnergyMeter from '@/features/psychic/EnergyMeter';
import { useLotto } from '@/providers/LottoProvider';
import { useMonetization } from '@/providers/MonetizationProvider';
import { useSettings } from '@/providers/SettingsProvider';
import {
  generateFutureRead,
  generateFutureWeekForecast,
  type FutureReadResult,
  type FutureWeekForecast,
} from '@/utils/futureReadMode';
import {
  getTodayPsychicUsage,
  incrementTodayPsychicUsage,
  savePsychicReading,
} from '@/utils/psychicStorage';
import {
  getPsychicFullUnlockExpiresAt,
  isPsychicFullUnlockActive,
  PSYCHIC_FULL_UNLOCK_COST,
  savePsychicFullUnlock,
} from '@/utils/psychicUnlocks';

const DEEP_READING_COST = 25;
const WEEK_FORECAST_COST = 150;

function formatUnlockTime(expiresAt: number | null) {
  if (!expiresAt || expiresAt <= Date.now()) return null;
  return new Date(expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function FutureReadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentGame, history } = useLotto();
  const { isPsychicEnabled } = useSettings();
  const { plan, spendCredits, totalAvailableCredits } = useMonetization();
  const [question, setQuestion] = useState('Should I play today?');
  const [usage, setUsage] = useState(0);
  const [unlockExpiresAt, setUnlockExpiresAt] = useState<number | null>(null);
  const [result, setResult] = useState<FutureReadResult | null>(null);
  const [forecast, setForecast] = useState<FutureWeekForecast | null>(null);

  const isVip = plan === 'pro' || plan === 'vip';
  const isFullUnlocked = isVip || isPsychicFullUnlockActive(unlockExpiresAt);
  const unlockTime = formatUnlockTime(unlockExpiresAt);
  const pastPickSignature = useMemo(
    () =>
      history
        .slice(0, 8)
        .map((item) => `${item.numbers.join('-')}+${item.bonusNumber}`)
        .join('|'),
    [history]
  );

  useEffect(() => {
    getTodayPsychicUsage().then(setUsage).catch(() => setUsage(0));
    getPsychicFullUnlockExpiresAt().then(setUnlockExpiresAt).catch(() => setUnlockExpiresAt(null));
  }, []);

  const buildResult = useCallback(
    () =>
      generateFutureRead({
        question,
        game: currentGame,
        pastPickSignature,
      }),
    [currentGame, pastPickSignature, question]
  );

  const chargeIfNeeded = useCallback(
    (cost: number, reason: string) => {
      if (isFullUnlocked) return true;
      if (totalAvailableCredits < cost) {
        Alert.alert('Credits needed', `${reason} requires ${cost} credits, or unlock the full Psychic Engine for 24 hours.`);
        return false;
      }
      const charged = spendCredits(cost, reason);
      if (!charged) {
        Alert.alert('Credits needed', `${reason} requires ${cost} credits.`);
        return false;
      }
      return true;
    },
    [isFullUnlocked, spendCredits, totalAvailableCredits]
  );

  const handleFutureRead = useCallback(async () => {
    if (!question.trim()) {
      Alert.alert('Ask a future question', 'Try “Should I play today?” or “Will my luck heat up soon?”');
      return;
    }

    const isFree = usage === 0;
    if (!isFree && !chargeIfNeeded(DEEP_READING_COST, 'Deep Future Read')) return;

    const next = buildResult();
    setResult(next);
    setForecast(null);
    setUsage(await incrementTodayPsychicUsage());
    await savePsychicReading({
      id: `future_${Date.now()}`,
      createdAt: new Date().toISOString(),
      userPrompt: `Future Read: ${question.trim()}`,
      reading: next.reading,
      suggestedNumbers: next.suggestedNumbers,
      pick3: next.pick3,
      pick4: next.pick4,
      energyScore: next.reading.energyScore,
    });
  }, [buildResult, chargeIfNeeded, question, usage]);

  const handleUnlock24Hours = useCallback(async () => {
    if (isFullUnlocked) {
      Alert.alert('Already active', 'Your Psychic Engine unlock is active right now.');
      return;
    }
    if (totalAvailableCredits < PSYCHIC_FULL_UNLOCK_COST) {
      Alert.alert('Credits needed', `The 24-hour Psychic Engine unlock costs ${PSYCHIC_FULL_UNLOCK_COST} credits.`);
      return;
    }
    const charged = spendCredits(PSYCHIC_FULL_UNLOCK_COST, '24-hour Psychic Engine full unlock');
    if (!charged) {
      Alert.alert('Credits needed', `The 24-hour Psychic Engine unlock costs ${PSYCHIC_FULL_UNLOCK_COST} credits.`);
      return;
    }
    const expiresAt = await savePsychicFullUnlock();
    setUnlockExpiresAt(expiresAt);
    Alert.alert('Unlocked', 'AI Psychic Engine deep readings are unlocked for 24 hours.');
  }, [isFullUnlocked, spendCredits, totalAvailableCredits]);

  const handleWeekForecast = useCallback(() => {
    if (!chargeIfNeeded(WEEK_FORECAST_COST, 'Future Week Forecast')) return;
    setForecast(
      generateFutureWeekForecast({
        question,
        game: currentGame,
        pastPickSignature,
      })
    );
  }, [chargeIfNeeded, currentGame, pastPickSignature, question]);

  if (!isPsychicEnabled) {
    return (
      <AppBackground style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Future Read Mode</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.card}>
          <Sparkles size={30} color="#8B5CF6" />
          <Text style={styles.offTitle}>AI Psychic Engine is Off</Text>
          <Text style={styles.body}>Turn it on in Settings - AI Features to use Future Read Mode.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/settings' as never)}>
            <Text style={styles.primaryText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <CalendarDays size={22} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Future Read Mode</Text>
        <View style={styles.creditPill}>
          <Text style={styles.creditText}>{totalAvailableCredits} cr</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Symbolic Future Reading</Text>
          <Text style={styles.title}>Ask about timing, luck, or whether today feels aligned.</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Will I win soon? Should I play today?"
            placeholderTextColor={Colors.textMuted}
            multiline
            style={styles.input}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={() => { void handleFutureRead(); }} activeOpacity={0.85}>
            <Zap size={16} color="#0A0A0A" />
            <Text style={styles.primaryText}>
              {usage === 0 || isFullUnlocked ? 'Generate Future Read' : `Deep Future Read - ${DEEP_READING_COST} Credits`}
            </Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            For entertainment only. Lottery outcomes are random. No reading, prediction, or number suggestion can guarantee a win.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.unlockHeader}>
            <View style={styles.unlockIcon}>
              <Lock size={18} color={Colors.gold} />
            </View>
            <View style={styles.unlockCopy}>
              <Text style={styles.cardTitle}>Psychic Unlock Ladder</Text>
              <Text style={styles.body}>
                1 free reading/day. Deep report: 25 credits. Full unlock: 100 credits / 24 hours. Future week forecast: 150 credits.
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => { void handleUnlock24Hours(); }} activeOpacity={0.82}>
            <Text style={styles.secondaryText}>
              {isFullUnlocked ? `Full Unlock Active${unlockTime ? ` until ${unlockTime}` : ''}` : `Unlock 24 Hours - ${PSYCHIC_FULL_UNLOCK_COST} Credits`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleWeekForecast} activeOpacity={0.82}>
            <Text style={styles.secondaryText}>
              {isFullUnlocked ? 'Generate Future Week Forecast' : `Future Week Forecast - ${WEEK_FORECAST_COST} Credits`}
            </Text>
          </TouchableOpacity>
        </View>

        {result ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{result.title}</Text>
            <Text style={styles.body}>{result.symbolicReading}</Text>
            <EnergyMeter score={result.reading.energyScore} label={result.reading.luckCycle} />

            <View style={styles.metaGrid}>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Emotional Tone</Text>
                <Text style={styles.metaValue}>{result.emotionalTone}</Text>
              </View>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Timing</Text>
                <Text style={styles.metaValue}>{result.timingSuggestion}</Text>
              </View>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Confidence</Text>
                <Text style={styles.metaValue}>{result.confidenceLevel} ({result.confidenceScore}%)</Text>
              </View>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Lucky Color</Text>
                <Text style={styles.metaValue}>{result.reading.luckyColor}</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Suggested numbers + strategy</Text>
            <View style={styles.numberRow}>
              {result.suggestedNumbers.map((number, index) => (
                <LottoBall key={`future-${number}`} number={number} delay={index * 70} />
              ))}
              {result.bonusNumber ? <LottoBall number={result.bonusNumber} isBonus delay={500} /> : null}
            </View>
            <View style={styles.pickRow}>
              <Text style={styles.pickText}>Pick 3: {result.pick3}</Text>
              <Text style={styles.pickText}>Pick 4: {result.pick4}</Text>
            </View>
            <Text style={styles.body}>{result.strategy}</Text>
            <Text style={styles.confidenceNote}>
              Confidence reflects symbolic clarity and prompt alignment, not lottery certainty.
            </Text>
          </View>
        ) : null}

        {forecast ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{forecast.title}</Text>
            {forecast.days.map((day) => (
              <View key={day.dateLabel} style={styles.forecastRow}>
                <View style={styles.forecastTop}>
                  <Text style={styles.forecastDate}>{day.dateLabel}</Text>
                  <Text style={styles.forecastBadge}>{day.confidenceLevel} - {day.energyScore}%</Text>
                </View>
                <Text style={styles.body}>{day.timingSuggestion} - {day.strategy}</Text>
                <Text style={styles.pickText}>Pick 3 {day.pick3}  |  Pick 4 {day.pick4}</Text>
              </View>
            ))}
            <Text style={styles.disclaimer}>{forecast.disclaimer}</Text>
          </View>
        ) : null}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
  },
  creditPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  creditText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '900' as const,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 48,
  },
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
  eyebrow: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '900' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900' as const,
  },
  cardTitle: {
    color: Colors.gold,
    fontSize: 17,
    fontWeight: '900' as const,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    minHeight: 92,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
  },
  primaryText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '900' as const,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    paddingHorizontal: 12,
  },
  secondaryText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '900' as const,
    textAlign: 'center',
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  unlockHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  unlockIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  unlockCopy: {
    flex: 1,
    gap: 5,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaCard: {
    flex: 1,
    minWidth: '47%' as unknown as number,
    borderRadius: 13,
    padding: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    gap: 4,
  },
  metaLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.45,
  },
  metaValue: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '900' as const,
  },
  sectionLabel: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  numberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  confidenceNote: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  offTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '900' as const,
  },
  forecastRow: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 7,
  },
  forecastTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  forecastDate: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  forecastBadge: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '900' as const,
  },
});
