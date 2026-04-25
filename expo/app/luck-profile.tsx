import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { Brain, ChevronLeft, Dna, Flame, Snowflake, Sparkles } from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';
import LottoBall from '@/components/LottoBall';
import { GAME_CONFIGS } from '@/constants/games';
import { Colors } from '@/constants/colors';
import { useGamification } from '@/providers/GamificationProvider';
import { useLotto } from '@/providers/LottoProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { generatePersonalLuckProfile } from '@/utils/personalLuckProfile';

const PROFILE_INPUT_KEY = 'lottomind.personalLuckProfile.inputs';

type SavedInputs = {
  name: string;
  birthDate: string;
};

export default function LuckProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentGame, history } = useLotto();
  const { credits, streakDays, totalGenerations, totalShares, xp } = useGamification();
  const { isPsychicEnabled } = useSettings();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(PROFILE_INPUT_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const saved = JSON.parse(raw) as SavedInputs;
        setName(saved.name ?? '');
        setBirthDate(saved.birthDate ?? '');
      })
      .catch((error) => console.log('[LuckProfile] load error', error));

    return () => {
      mounted = false;
    };
  }, []);

  const profile = useMemo(
    () =>
      generatePersonalLuckProfile({
        name,
        birthDate,
        currentGame,
        history,
        totalGenerations,
        totalShares,
        streakDays,
        xp,
        credits,
      }),
    [birthDate, credits, currentGame, history, name, streakDays, totalGenerations, totalShares, xp]
  );

  const saveProfileInputs = useCallback(async () => {
    try {
      await AsyncStorage.setItem(PROFILE_INPUT_KEY, JSON.stringify({ name, birthDate }));
      setSavedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    } catch (error) {
      console.log('[LuckProfile] save error', error);
      Alert.alert('Could not save', 'Your luck profile inputs could not be saved right now.');
    }
  }, [birthDate, name]);

  if (!isPsychicEnabled) {
    return (
      <AppBackground style={{ paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Luck Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.card}>
          <Dna size={30} color="#8B5CF6" />
          <Text style={styles.cardTitle}>AI Psychic Engine is Off</Text>
          <Text style={styles.body}>
            Turn it on in Settings to reveal your evolving psychic fingerprint. Normal LottoMind tools remain available.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/settings' as never)} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </AppBackground>
    );
  }

  const config = GAME_CONFIGS[currentGame];

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Dna size={22} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Personal Luck Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Psychic Fingerprint</Text>
          <Text style={styles.heroTitle}>{profile.fingerprintTitle}</Text>
          <Text style={styles.body}>
            LottoMind blends your name, birthdate, app behavior, and past picks into evolving number inspiration.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Inputs</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />
          <TextInput
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="Birthdate, e.g. 07/14/1990"
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={() => { void saveProfileInputs(); }} activeOpacity={0.85}>
            <Sparkles size={16} color="#0A0A0A" />
            <Text style={styles.primaryButtonText}>Save & Refresh Fingerprint</Text>
          </TouchableOpacity>
          {savedAt ? <Text style={styles.savedText}>Saved at {savedAt}. Profile evolves as your activity changes.</Text> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.rowTitle}>
            <Brain size={18} color={Colors.gold} />
            <Text style={styles.cardTitle}>{profile.energySignature}</Text>
          </View>
          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Evolution</Text>
              <Text style={styles.metricValue}>{profile.evolutionStage}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Name Number</Text>
              <Text style={styles.metricValue}>{profile.nameNumber}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Birth Path</Text>
              <Text style={styles.metricValue}>{profile.birthPathNumber}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Best Time</Text>
              <Text style={styles.metricValue}>{profile.bestPlayWindow}</Text>
            </View>
          </View>
          <Text style={styles.body}>{profile.behaviorSignal}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{config.name} Lucky Numbers</Text>
          <View style={styles.numberRow}>
            {profile.luckyNumbers.map((number, index) => (
              <LottoBall key={`luck-${number}`} number={number} delay={index * 90} />
            ))}
            <Text style={styles.plus}>+</Text>
            <LottoBall number={profile.bonusNumber} isBonus delay={520} />
          </View>
          <Text style={styles.body}>{config.bonusName}: {profile.bonusNumber}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pick 3 / Pick 4 Fingerprint Sets</Text>
          <View style={styles.pickGrid}>
            <View style={styles.pickCard}>
              <Text style={styles.metricLabel}>Pick 3</Text>
              <Text style={styles.pickValue}>{profile.pick3}</Text>
            </View>
            <View style={styles.pickCard}>
              <Text style={styles.metricLabel}>Pick 4</Text>
              <Text style={styles.pickValue}>{profile.pick4}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.streakRow}>
            <Flame size={18} color={Colors.amber} />
            <Text style={styles.bodyStrong}>{profile.hotStreak}</Text>
          </View>
          <View style={styles.streakRow}>
            <Snowflake size={18} color={Colors.blue} />
            <Text style={styles.bodyStrong}>{profile.coldStreak}</Text>
          </View>
          <Text style={styles.body}>{profile.explanation}</Text>
          <Text style={styles.disclaimer}>{profile.disclaimer}</Text>
        </View>
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
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 56,
  },
  heroCard: {
    backgroundColor: 'rgba(20, 14, 30, 0.92)',
    borderRadius: 22,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eyebrow: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as const,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '900' as const,
  },
  cardTitle: {
    color: Colors.gold,
    fontSize: 17,
    fontWeight: '900' as const,
  },
  rowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 13,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
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
  primaryButtonText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: '900' as const,
  },
  savedText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%' as unknown as number,
    borderRadius: 14,
    padding: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  metricValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '900' as const,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  bodyStrong: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800' as const,
    lineHeight: 19,
    flex: 1,
  },
  numberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  plus: {
    color: Colors.textMuted,
    fontSize: 18,
    fontWeight: '900' as const,
  },
  pickGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  pickCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    alignItems: 'center',
  },
  pickValue: {
    color: '#C4B5FD',
    fontSize: 24,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
