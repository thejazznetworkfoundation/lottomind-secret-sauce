import React, { useCallback, useEffect, useState } from 'react';
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
import { CalendarDays, ChevronLeft, Sparkles, Zap } from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';
import LottoBall from '@/components/LottoBall';
import { Colors } from '@/constants/colors';
import EnergyMeter from '@/features/psychic/EnergyMeter';
import { useLotto } from '@/providers/LottoProvider';
import { useMonetization } from '@/providers/MonetizationProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { generatePsychicReading, type PsychicReadingResult } from '@/utils/psychicEngine';
import { emitPsychicEvent } from '@/utils/psychicEvents';
import {
  clearPsychicReadings,
  getPsychicReadings,
  getTodayPsychicUsage,
  incrementTodayPsychicUsage,
  savePsychicReading,
  type SavedPsychicReading,
} from '@/utils/psychicStorage';
import {
  getPsychicFullUnlockExpiresAt,
  isPsychicFullUnlockActive,
} from '@/utils/psychicUnlocks';

const READING_COST = 25;

export default function PsychicScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentGame } = useLotto();
  const { plan, spendCredits, totalAvailableCredits } = useMonetization();
  const { isPsychicEnabled } = useSettings();
  const [prompt, setPrompt] = useState('');
  const [usage, setUsage] = useState(0);
  const [unlockExpiresAt, setUnlockExpiresAt] = useState<number | null>(null);
  const [reading, setReading] = useState<PsychicReadingResult | null>(null);
  const [history, setHistory] = useState<SavedPsychicReading[]>([]);

  useEffect(() => {
    getTodayPsychicUsage().then(setUsage).catch(() => setUsage(0));
    getPsychicReadings().then(setHistory).catch(() => setHistory([]));
    getPsychicFullUnlockExpiresAt().then(setUnlockExpiresAt).catch(() => setUnlockExpiresAt(null));
  }, []);

  const generateReading = useCallback(async () => {
    if (!prompt.trim()) {
      Alert.alert('Ask the oracle', 'Enter a question, dream, timing, or number-energy thought first.');
      return;
    }

    const hasUnlimitedPsychic = plan === 'pro' || plan === 'vip' || isPsychicFullUnlockActive(unlockExpiresAt);
    if (usage >= 1 && !hasUnlimitedPsychic) {
      if (totalAvailableCredits < READING_COST) {
        Alert.alert('Credits needed', `You get 1 free psychic reading per day. Extra readings require ${READING_COST} credits.`);
        return;
      }

      const charged = spendCredits(READING_COST, 'AI Psychic Engine reading');
      if (!charged) {
        Alert.alert('Credits needed', `You get 1 free psychic reading per day. Extra readings require ${READING_COST} credits.`);
        return;
      }
    }

    const nextReading = generatePsychicReading({
      prompt: prompt.trim(),
      game: currentGame,
    });

    setReading(nextReading);
    setUsage(await incrementTodayPsychicUsage());
    await savePsychicReading({
      id: `psychic_${Date.now()}`,
      createdAt: new Date().toISOString(),
      userPrompt: prompt.trim(),
      reading: nextReading,
      suggestedNumbers: nextReading.suggestedNumbers,
      pick3: nextReading.pick3,
      pick4: nextReading.pick4,
      energyScore: nextReading.energyScore,
    });
    setHistory(await getPsychicReadings());
    emitPsychicEvent('PSYCHIC_READING_SAVED', { game: currentGame, energyScore: nextReading.energyScore });
  }, [currentGame, plan, prompt, spendCredits, totalAvailableCredits, unlockExpiresAt, usage]);

  const handleClearHistory = useCallback(async () => {
    await clearPsychicReadings();
    setHistory([]);
  }, []);

  if (!isPsychicEnabled) {
    return (
      <AppBackground style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Psychic Engine</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.offCard}>
          <Sparkles size={30} color="#8B5CF6" />
          <Text style={styles.offTitle}>AI Psychic Engine is Off</Text>
          <Text style={styles.offText}>
            Turn it on in Settings - AI Features. Dream Oracle and standard LottoMind tools remain available.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/settings' as never)} activeOpacity={0.85}>
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
        <Sparkles size={22} color="#8B5CF6" />
        <Text style={styles.headerTitle}>AI Psychic Engine</Text>
        <View style={styles.creditPill}>
          <Text style={styles.creditText}>{totalAvailableCredits} cr</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ask Your Question</Text>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ask the oracle about your luck, dream, timing, or number energy..."
            placeholderTextColor={Colors.textMuted}
            multiline
            style={styles.input}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={generateReading} activeOpacity={0.85}>
            <Zap size={17} color="#0A0A0A" />
            <Text style={styles.primaryText}>
              {usage === 0
                ? 'Generate Free Reading'
                : plan === 'pro' || plan === 'vip' || isPsychicFullUnlockActive(unlockExpiresAt)
                  ? 'Generate Reading - Included'
                  : `Generate Reading - ${READING_COST} Credits`}
            </Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            For entertainment only. Lottery outcomes are random. No reading, prediction, or number suggestion can guarantee a win.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.futureModeCard}
          onPress={() => router.push('/future-read' as never)}
          activeOpacity={0.85}
        >
          <View style={styles.futureIconWrap}>
            <CalendarDays size={18} color="#C4B5FD" />
          </View>
          <View style={styles.futureCopy}>
            <Text style={styles.futureTitle}>Future Read Mode</Text>
            <Text style={styles.futureBody}>
              Ask “Should I play today?” and get symbolic timing, confidence level, next-draw strategy, and suggested numbers.
            </Text>
          </View>
        </TouchableOpacity>

        {reading ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{reading.title}</Text>
            <Text style={styles.message}>{reading.message}</Text>
            <EnergyMeter score={reading.energyScore} label={reading.luckCycle} />
            <Text style={styles.metaLine}>Lucky color: {reading.luckyColor}</Text>
            <Text style={styles.metaLine}>Best play window: {reading.bestPlayWindow}</Text>
            <View style={styles.numberRow}>
              {reading.suggestedNumbers.map((number, index) => (
                <LottoBall key={`psychic-${number}`} number={number} delay={index * 80} />
              ))}
              {reading.bonusNumber ? <LottoBall number={reading.bonusNumber} isBonus delay={500} /> : null}
            </View>
            <View style={styles.pickRow}>
              <Text style={styles.pickText}>Pick 3: {reading.pick3}</Text>
              <Text style={styles.pickText}>Pick 4: {reading.pick4}</Text>
            </View>
            <Text style={styles.message}>{reading.explanation}</Text>
          </View>
        ) : null}

        {history.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.historyHeader}>
              <Text style={styles.cardTitle}>Psychic Reading History</Text>
              <TouchableOpacity onPress={() => { void handleClearHistory(); }} activeOpacity={0.75}>
                <Text style={styles.clearHistoryText}>Clear</Text>
              </TouchableOpacity>
            </View>
            {history.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyPrompt} numberOfLines={1}>{item.userPrompt}</Text>
                <Text style={styles.historyMeta}>
                  Energy {item.energyScore}% - Pick 3 {item.pick3} - Pick 4 {item.pick4}
                </Text>
              </View>
            ))}
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
    fontWeight: '800' as const,
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
    fontWeight: '800' as const,
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
    borderColor: Colors.border,
  },
  cardTitle: {
    color: Colors.gold,
    fontSize: 17,
    fontWeight: '900' as const,
  },
  input: {
    minHeight: 110,
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
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  futureModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  futureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
  },
  futureCopy: {
    flex: 1,
    gap: 4,
  },
  futureTitle: {
    color: '#C4B5FD',
    fontSize: 15,
    fontWeight: '900' as const,
  },
  futureBody: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  metaLine: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  numberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pickText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '800' as const,
  },
  offCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  offTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '900' as const,
  },
  offText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearHistoryText: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '900' as const,
  },
  historyItem: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  historyPrompt: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800' as const,
  },
  historyMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
