import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Share,
  Image,
  ImageBackground,
  Linking,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Moon, Sparkles, Eye, Zap, Cloud, TriangleAlert, X, Dice3, Share2, Sun, ChevronRight, Crown, Lock, Play, Video, Brain, CalendarDays } from 'lucide-react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import VoiceRecordButton from '@/components/VoiceRecordButton';
import SpeakButton from '@/components/SpeakButton';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { useLotto } from '@/providers/LottoProvider';
import { useMonetization } from '@/providers/MonetizationProvider';
import { usePro } from '@/providers/ProProvider';
import { useSettings } from '@/providers/SettingsProvider';

import { useRouter } from 'expo-router';
import { GAME_CONFIGS } from '@/constants/games';
import { interpretDream, DreamResult } from '@/utils/dreamInterpreter';
import { generatePsychicReading } from '@/utils/psychicEngine';
import { getPsychicFullUnlockExpiresAt, isPsychicFullUnlockActive } from '@/utils/psychicUnlocks';
import LottoBall from '@/components/LottoBall';
import GlossyButton from '@/components/GlossyButton';

const dreamOracleBackground = require('@/assets/images/dream-oracle-jungle-bg.png');
const DREAM_ORACLE_HEADER_VIDEO_URI = '/videos/play-arcade-button-loop.mp4';
const DREAM_ORACLE_GATE_VIDEO_URI = '/videos/power-tools-dashboard-box.mp4';

const DREAM_PROMPTS = [
  'I was flying over a golden city...',
  'A snake was guarding a treasure chest...',
  'I found money in a river while drowning...',
  'I saw a rainbow after a storm at the beach...',
];

const DISCLAIMER = 'For entertainment only. Lottery outcomes are random. No reading, prediction, or number suggestion can guarantee a win.';
const DREAM_FUSION_COST = 25;
const DREAM_PREMIUM_FEATURES: {
  title: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  {
    title: 'AI Psychic Engine',
    detail: 'Run dream questions through an energy reader with lotto-style number sets.',
    icon: Brain,
  },
  {
    title: 'Future Read Mode',
    detail: 'Ask timing questions and turn dream themes into a weekly energy forecast.',
    icon: CalendarDays,
  },
  {
    title: 'Unlimited Dream History',
    detail: 'Save every dream reading, symbol, mood, and number set.',
    icon: Eye,
  },
  {
    title: 'Advanced Symbol Analysis',
    detail: 'Deeper symbol categories, emotional tone, and repeat themes.',
    icon: Sparkles,
  },
  {
    title: 'Dream Streak Calendar',
    detail: 'Track dream-entry streaks and your strongest symbolic days.',
    icon: Moon,
  },
  {
    title: 'Voice-to-Dream Entry',
    detail: 'Speak a dream, convert it to text, then run Oracle analysis.',
    icon: Video,
  },
  {
    title: 'Dream-to-Number Pattern Engine',
    detail: 'Convert saved symbols into evolving Pick 3, Pick 4, and lotto patterns.',
    icon: Zap,
  },
];

const DREAM_SUITE_ACTIONS: {
  title: string;
  detail: string;
  route: '/psychic' | '/future-read' | '/daily-fortune';
  icon: React.ComponentType<{ size?: number; color?: string }>;
  accent: string;
  meta: string;
}[] = [
  {
    title: 'AI Psychic Engine',
    detail: 'Ask the oracle about a dream, number, date, or lucky window.',
    route: '/psychic',
    icon: Brain,
    accent: '#31F7C8',
    meta: '1 free/day',
  },
  {
    title: 'Future Read Pro',
    detail: 'Turn dream energy into a day/week timing forecast.',
    route: '/future-read',
    icon: CalendarDays,
    accent: '#00E5FF',
    meta: 'Pro depth',
  },
  {
    title: 'Daily Fortune',
    detail: 'Blend dream mood, signs, and numbers into a quick daily read.',
    route: '/daily-fortune',
    icon: Sun,
    accent: '#FFD700',
    meta: 'Daily pull',
  },
];

function getEnergyDirection(score: number) {
  if (score >= 72) return 'Upward momentum';
  if (score >= 45) return 'Balanced and watchful';
  return 'Cooling - play slowly';
}

export default function DreamsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentGame } = useLotto();
  const { plan, spendCredits, totalAvailableCredits } = useMonetization();
  const { isPro, canUseDream, freeDreamUsesLeft, useDreamUse, canUseHoroscope, freeHoroscopeUsesLeft } = usePro();
  const { isPsychicEnabled } = useSettings();
  const config = GAME_CONFIGS[currentGame];
  const [dreamText, setDreamText] = useState<string>('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const [fusionEnabled, setFusionEnabled] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const horoscopeBlinkAnim = useRef(new Animated.Value(1)).current;
  const interpretBlinkAnim = useRef(new Animated.Value(1)).current;
  const psychicFusion = useMemo(() => {
    if (!isPsychicEnabled || !result || !fusionEnabled) return null;
    return generatePsychicReading({
      prompt: dreamText,
      dreamText,
      game: currentGame,
    });
  }, [currentGame, dreamText, fusionEnabled, isPsychicEnabled, result]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(horoscopeBlinkAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(horoscopeBlinkAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    const interpretLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(interpretBlinkAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(interpretBlinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    interpretLoop.start();
    return () => { loop.stop(); interpretLoop.stop(); };
  }, [horoscopeBlinkAnim, interpretBlinkAnim]);

  const dreamMutation = useMutation({
    mutationFn: async (text: string) => {
      return interpretDream(text, currentGame);
    },
    onSuccess: (data) => {
      console.log('[DreamsScreen] Dream interpreted successfully');
      setResult(data);
      setFusionEnabled(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    },
    onError: (error) => {
      console.log('[DreamsScreen] Dream interpretation error:', error);
    },
  });

  const handleInterpret = useCallback(() => {
    if (!dreamText.trim() || dreamMutation.isPending) return;

    if (!canUseDream) {
      router.push('/paywall');
      return;
    }

    if (!isPro) {
      const consumed = useDreamUse();
      if (!consumed) {
        router.push('/paywall');
        return;
      }
    }

    setResult(null);
    setFusionEnabled(false);
    fadeAnim.setValue(0);

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      { iterations: 4 }
    ).start();

    dreamMutation.mutate(dreamText.trim());
  }, [dreamText, dreamMutation, fadeAnim, pulseAnim, isPro, canUseDream, useDreamUse, router]);

  const handlePromptTap = useCallback((prompt: string) => {
    setDreamText(prompt);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const handleClear = useCallback(() => {
    setDreamText('');
    setResult(null);
    setFusionEnabled(false);
    fadeAnim.setValue(0);
  }, [fadeAnim]);

  const handlePsychicFusion = useCallback(async () => {
    if (!isPsychicEnabled) return;

    const unlockExpiresAt = await getPsychicFullUnlockExpiresAt();
    const hasPremiumFusion = plan === 'pro' || plan === 'vip' || isPsychicFullUnlockActive(unlockExpiresAt);

    if (!hasPremiumFusion) {
      if (totalAvailableCredits < DREAM_FUSION_COST) {
        Alert.alert(
          'Credits needed',
          `Dream + Psychic Fusion is a premium psychic layer and costs ${DREAM_FUSION_COST} credits.`
        );
        return;
      }

      const charged = spendCredits(DREAM_FUSION_COST, 'Dream + Psychic Fusion');
      if (!charged) {
        Alert.alert('Credits needed', `Dream + Psychic Fusion costs ${DREAM_FUSION_COST} credits.`);
        return;
      }
    }

    setFusionEnabled(true);
  }, [isPsychicEnabled, plan, spendCredits, totalAvailableCredits]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <ImageBackground
        source={dreamOracleBackground}
        resizeMode="cover"
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.backgroundScrim}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ExpoVideo
              source={{ uri: DREAM_ORACLE_HEADER_VIDEO_URI }}
              style={styles.headerVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
              useNativeControls={false}
              pointerEvents="none"
            />
            <View style={styles.headerVideoScrim} pointerEvents="none" />
            <View style={styles.titleRow}>
              <Moon size={22} color="#9B8CE8" />
              <Text style={styles.title}>Dream Oracle℠</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Describe your dream. AI interprets it into lucky numbers.</Text>
          </View>

          {!isPro && (
            <TouchableOpacity
              style={[styles.proGateCard, canUseDream ? styles.proGateCardTrial : undefined]}
              onPress={canUseDream ? undefined : () => router.push('/paywall')}
              activeOpacity={canUseDream ? 1 : 0.85}
              testID="dream-pro-gate"
            >
              <ExpoVideo
                source={{ uri: DREAM_ORACLE_GATE_VIDEO_URI }}
                style={styles.proGateVideo}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping
                isMuted
                useNativeControls={false}
                pointerEvents="none"
              />
              <View style={styles.proGateVideoScrim} pointerEvents="none" />
              <View style={[styles.proGateIconWrap, canUseDream ? styles.proGateIconWrapTrial : undefined]}>
                {canUseDream ? <Sparkles size={22} color="#2ECC71" /> : <Crown size={22} color="#FFD700" />}
              </View>
              <View style={styles.proGateInfo}>
                <Text style={[styles.proGateTitle, canUseDream ? styles.proGateTrialTitle : undefined]}>
                  {canUseDream ? `${freeDreamUsesLeft} Free Use${freeDreamUsesLeft !== 1 ? 's' : ''} Left` : 'Pro Feature'}
                </Text>
                <Text style={styles.proGateSub}>
                  {canUseDream ? 'Try Dream Oracle\u2120 free before upgrading' : 'Dream Oracle\u2120 requires LottoMind\u2122 Pro'}
                </Text>
              </View>
              {!canUseDream && (
                <View style={styles.proGateLockIcon}>
                  <Lock size={16} color={Colors.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.premiumSuiteCard}>
            <View style={styles.premiumSuiteHeader}>
              <View style={styles.premiumSuiteIcon}>
                <Crown size={18} color={Colors.gold} />
              </View>
              <View style={styles.premiumSuiteCopy}>
                <Text style={styles.premiumSuiteTitle}>AI Psychic Engine Pro Dream Suite</Text>
                <Text style={styles.premiumSuiteSub}>
                  Premium dream tools for psychic readings, future timing, history, streaks, voice capture, and deeper pattern work.
                </Text>
              </View>
              <View style={[styles.premiumStatusPill, isPro && styles.premiumStatusPillActive]}>
                <Text style={[styles.premiumStatusText, isPro && styles.premiumStatusTextActive]}>
                  {isPro ? 'ACTIVE' : 'PRO'}
                </Text>
              </View>
            </View>

            <View style={styles.premiumFeatureGrid}>
              {DREAM_PREMIUM_FEATURES.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <TouchableOpacity
                    key={feature.title}
                    style={[styles.premiumFeatureCard, isPro && styles.premiumFeatureCardActive]}
                    onPress={isPro ? undefined : () => router.push('/paywall')}
                    activeOpacity={isPro ? 1 : 0.78}
                  >
                    <View style={styles.premiumFeatureIcon}>
                      <FeatureIcon size={16} color={isPro ? '#31F7C8' : Colors.gold} />
                    </View>
                    <View style={styles.premiumFeatureCopy}>
                      <Text style={styles.premiumFeatureTitle}>{feature.title}</Text>
                      <Text style={styles.premiumFeatureDetail}>{feature.detail}</Text>
                    </View>
                    {!isPro ? <Lock size={13} color={Colors.textMuted} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.psychicSuiteActionGrid}>
              {DREAM_SUITE_ACTIONS.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <TouchableOpacity
                    key={action.title}
                    style={[styles.psychicSuiteActionCard, { borderColor: `${action.accent}35` }]}
                    onPress={() => router.push(action.route)}
                    activeOpacity={0.84}
                    testID={`dream-suite-${action.route.slice(1)}`}
                  >
                    <View style={[styles.psychicSuiteActionIcon, { backgroundColor: `${action.accent}18`, borderColor: `${action.accent}35` }]}>
                      <ActionIcon size={17} color={action.accent} />
                    </View>
                    <View style={styles.psychicSuiteActionCopy}>
                      <View style={styles.psychicSuiteActionTop}>
                        <Text style={styles.psychicSuiteActionTitle}>{action.title}</Text>
                        <Text style={[styles.psychicSuiteActionMeta, { color: action.accent }]}>{action.meta}</Text>
                      </View>
                      <Text style={styles.psychicSuiteActionDetail}>{action.detail}</Text>
                    </View>
                    <ChevronRight size={16} color={action.accent} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {!isPro ? (
              <TouchableOpacity
                style={styles.premiumUpgradeButton}
                onPress={() => router.push('/paywall')}
                activeOpacity={0.84}
                testID="dream-premium-suite-upgrade"
              >
                <Crown size={15} color="#07101F" />
                <Text style={styles.premiumUpgradeText}>Unlock Dream Suite</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Animated.View style={{ opacity: horoscopeBlinkAnim }}>
          <TouchableOpacity
            style={styles.horoscopeCard}
            onPress={() => router.push('/horoscope')}
            activeOpacity={0.85}
            testID="dream-horoscope-link"
          >
            <View style={styles.horoscopeIconWrap}>
              <Sun size={22} color={Colors.gold} />
            </View>
            <View style={styles.horoscopeInfo}>
              <Text style={styles.horoscopeTitle}>Daily Horoscope</Text>
              <Text style={styles.horoscopeSub}>
                {isPro ? 'Unlimited readings' : canUseHoroscope ? `${freeHoroscopeUsesLeft} free reading today` : 'Play games to earn mind credits'}
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.gold} />
          </TouchableOpacity>
          </Animated.View>

          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Eye size={16} color="#9B8CE8" />
              <Text style={styles.inputLabel}>Your Dream</Text>
              <View style={styles.inputActions}>
                <VoiceRecordButton
                  onTranscript={(text) => setDreamText((prev) => prev ? `${prev} ${text}` : text)}
                  size={32}
                  color="#9B8CE8"
                  disabled={dreamMutation.isPending}
                />
                {dreamText.length > 0 && (
                  <TouchableOpacity onPress={handleClear} style={styles.clearBtn} testID="dream-clear">
                    <X size={14} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <TextInput
              style={styles.dreamInput}
              placeholder="I dreamed I was flying over mountains and found a golden key..."
              placeholderTextColor={Colors.textMuted}
              value={dreamText}
              onChangeText={setDreamText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="dream-input"
            />
            <Text style={styles.charCount}>{dreamText.length}/500</Text>
          </View>

          {!dreamText.trim() && (
            <View style={styles.promptsSection}>
              <Text style={styles.promptsLabel}>Try a dream...</Text>
              <View style={styles.promptsGrid}>
                {DREAM_PROMPTS.map((prompt) => (
                  <TouchableOpacity
                    key={prompt}
                    style={styles.promptChip}
                    onPress={() => handlePromptTap(prompt)}
                    activeOpacity={0.7}
                  >
                    <Cloud size={14} color="#9B8CE8" />
                    <Text style={styles.promptText} numberOfLines={2}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Animated.View style={{ opacity: interpretBlinkAnim }}>
            <GlossyButton
              onPress={handleInterpret}
              label={dreamMutation.isPending ? 'Reading your dream...' : (!isPro && !canUseDream) ? 'Unlock with Pro' : isPro ? 'Interpret Dream' : `Interpret Dream (${freeDreamUsesLeft} free)`}
              icon={dreamMutation.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : (!isPro && !canUseDream) ? <Lock size={20} color="#FFFFFF" /> : <Moon size={20} color="#FFFFFF" />}
              disabled={!dreamText.trim() || dreamMutation.isPending}
              testID="dream-interpret-button"
              variant="green"
              size="large"
              blink={!!dreamText.trim() && !dreamMutation.isPending}
            />
          </Animated.View>

          {dreamMutation.isError && (
            <View style={styles.errorCard}>
              <TriangleAlert size={16} color={Colors.red} />
              <Text style={styles.errorText}>
                Failed to interpret dream. Please try again.
              </Text>
            </View>
          )}

          {result && (
            <Animated.View style={[styles.resultSection, { opacity: fadeAnim }]}>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View style={styles.insightIconWrap}>
                    <Sparkles size={18} color="#9B8CE8" />
                  </View>
                  <Text style={styles.insightTitle}>Dream Insight</Text>
                  <View style={styles.speakWrap}>
                    <SpeakButton
                      text={result.interpretation.meaning}
                      size={34}
                      color="#9B8CE8"
                    />
                  </View>
                </View>
                <Text style={styles.insightMeaning}>{result.interpretation.meaning}</Text>

                <View style={styles.emotionRow}>
                  {result.interpretation.emotions.map((emotion) => (
                    <View key={emotion} style={styles.emotionChip}>
                      <Text style={styles.emotionText}>{emotion}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.intensityBar}>
                  <Text style={styles.intensityLabel}>Dream Intensity</Text>
                  <View style={styles.intensityTrack}>
                    <View
                      style={[
                        styles.intensityFill,
                        { width: `${Math.round(result.interpretation.intensity * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.intensityValue}>
                    {Math.round(result.interpretation.intensity * 100)}%
                  </Text>
                </View>
              </View>

              <View style={styles.symbolsCard}>
                <Text style={styles.symbolsTitle}>Symbol Mapping</Text>
                {result.symbolMap.map((entry) => (
                  <View key={entry.symbol} style={styles.symbolRow}>
                    <View style={styles.symbolNameWrap}>
                      <View style={styles.symbolDot} />
                      <Text style={styles.symbolName}>{entry.symbol}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{entry.category}</Text>
                      </View>
                    </View>
                    <View style={styles.symbolNumbers}>
                      {entry.numbers.slice(0, 4).map((num) => (
                        <View key={`sym-${entry.symbol}-${num}`} style={styles.miniNum}>
                          <Text style={styles.miniNumText}>{num}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.numbersCard}>
                <View style={styles.numbersHeader}>
                  <Text style={styles.numbersTitle}>Your Lucky Numbers</Text>
                  <View style={styles.gamePill}>
                    <Text style={styles.gamePillText}>{config.name}</Text>
                  </View>
                </View>
                <View style={styles.ballsRow}>
                  {result.finalPick.map((num, index) => (
                    <LottoBall key={`dream-${num}`} number={num} delay={index * 140} />
                  ))}
                  <Text style={styles.plusText}>+</Text>
                  <LottoBall
                    number={result.bonusNumber}
                    isBonus
                    delay={result.finalPick.length * 140}
                  />
                </View>
                <Text style={styles.numbersSubtext}>
                  {config.bonusName}: {result.bonusNumber} · Derived from {result.symbolMap.length} dream symbol{result.symbolMap.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={styles.digitPickCard}>
                <View style={styles.digitPickHeader}>
                  <View style={styles.digitPickIconWrap}>
                    <Dice3 size={16} color="#2ECC71" />
                  </View>
                  <Text style={styles.digitPickTitle}>Pick 3</Text>
                </View>
                <View style={styles.digitPickNumbers}>
                  {result.pick3.map((num, idx) => (
                    <View key={`p3-${idx}`} style={styles.digitPickNumWrap}>
                      <Text style={styles.digitPickNum}>{num}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.digitPickHint}>3-digit picks</Text>
              </View>

              {isPsychicEnabled && !fusionEnabled ? (
                <TouchableOpacity
                  style={styles.psychicFusionButton}
                  onPress={() => { void handlePsychicFusion(); }}
                  activeOpacity={0.85}
                  testID="dream-psychic-fusion-button"
                >
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.psychicFusionButtonText}>
                    {plan === 'pro' || plan === 'vip'
                      ? 'Add Psychic Fusion'
                      : `Unlock Dream + Psychic Fusion - ${DREAM_FUSION_COST} Credits`}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {psychicFusion ? (
                <View style={styles.numbersCard}>
                  <View style={styles.numbersHeader}>
                    <Text style={styles.numbersTitle}>Dream + Psychic Fusion</Text>
                    <View style={styles.gamePill}>
                      <Text style={styles.gamePillText}>{psychicFusion.luckCycle}</Text>
                    </View>
                  </View>
                  <Text style={styles.numbersSubtext}>
                    Energy direction: {getEnergyDirection(psychicFusion.energyScore)}
                  </Text>
                  <View style={styles.fusionMetaGrid}>
                    <View style={styles.fusionMetaCard}>
                      <Text style={styles.fusionMetaLabel}>Luck Cycle</Text>
                      <Text style={styles.fusionMetaValue}>{psychicFusion.luckCycle}</Text>
                    </View>
                    <View style={styles.fusionMetaCard}>
                      <Text style={styles.fusionMetaLabel}>Best Time To Play</Text>
                      <Text style={styles.fusionMetaValue}>{psychicFusion.bestPlayWindow}</Text>
                    </View>
                    <View style={styles.fusionMetaCard}>
                      <Text style={styles.fusionMetaLabel}>Lucky Color</Text>
                      <Text style={styles.fusionMetaValue}>{psychicFusion.luckyColor}</Text>
                    </View>
                    <View style={styles.fusionMetaCard}>
                      <Text style={styles.fusionMetaLabel}>Energy Score</Text>
                      <Text style={styles.fusionMetaValue}>{psychicFusion.energyScore}%</Text>
                    </View>
                  </View>
                  <Text style={styles.numbersSubtext}>
                    Energy {psychicFusion.energyScore}% · Lucky color {psychicFusion.luckyColor}
                  </Text>
                  <Text style={styles.fusionSectionLabel}>{config.name} number inspiration</Text>
                  <View style={styles.ballsRow}>
                    {psychicFusion.suggestedNumbers.map((num, index) => (
                      <LottoBall key={`fusion-main-${num}`} number={num} delay={index * 100} />
                    ))}
                    {psychicFusion.bonusNumber ? (
                      <>
                        <Text style={styles.plusText}>+</Text>
                        <LottoBall
                          number={psychicFusion.bonusNumber}
                          isBonus
                          delay={psychicFusion.suggestedNumbers.length * 100}
                        />
                      </>
                    ) : null}
                  </View>
                  <Text style={styles.numbersSubtext}>
                    {psychicFusion.bonusNumber ? `${config.bonusName}: ${psychicFusion.bonusNumber} - ` : ''}
                    Blended from dream symbols, today's date, and the active game matrix.
                  </Text>

                  <Text style={styles.fusionSectionLabel}>Pick 3 / Pick 4 sets</Text>
                  <View style={styles.digitPickNumbers}>
                    <View style={[styles.digitPickNumWrap, styles.psychicPickWrap]}>
                      <Text style={styles.fusionPickLabel}>Pick 3</Text>
                      <Text style={styles.digitPickNum}>{psychicFusion.pick3}</Text>
                    </View>
                    <View style={[styles.digitPickNumWrap, styles.psychicPickWrap]}>
                      <Text style={styles.fusionPickLabel}>Pick 4</Text>
                      <Text style={styles.digitPickNum}>{psychicFusion.pick4}</Text>
                    </View>
                  </View>
                  <Text style={styles.numbersSubtext}>{psychicFusion.explanation}</Text>
                </View>
              ) : null}

              {result.comboNumbers.length > 0 && (
                <View style={styles.combosCard}>
                  <View style={styles.combosHeader}>
                    <Zap size={16} color={Colors.amber} />
                    <Text style={styles.combosTitle}>Extended Number Pool</Text>
                  </View>
                  <View style={styles.comboNumbers}>
                    {result.comboNumbers.slice(0, 12).map((num) => (
                      <View key={`combo-${num}`} style={styles.comboNum}>
                        <Text style={styles.comboNumText}>{num}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.comboHint}>
                    Additional numbers derived from symbol math transformations
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.dreamShareBtn}
                onPress={async () => {
                  if (Platform.OS !== 'web') {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  const shareText = [
                    '\u{1F52E} DREAM ORACLE \u{1F52E}',
                    '',
                    `Dream: "${dreamText.slice(0, 80)}${dreamText.length > 80 ? '...' : ''}"`,
                    '',
                    `Insight: ${result.interpretation.meaning}`,
                    `Emotions: ${result.interpretation.emotions.join(', ')}`,
                    `Intensity: ${Math.round(result.interpretation.intensity * 100)}%`,
                    '',
                    `Lucky Numbers: ${result.finalPick.join(' \u2022 ')} + ${result.bonusNumber}`,
                    `Pick 3: ${result.pick3.join(', ')}`,
                    '',
                    `Symbols: ${result.symbolMap.map(s => s.symbol).join(', ')}`,
                    '',
                    'Generated by LottoMind™',
                  ].join('\n');
                  try {
                    await Share.share({ message: shareText, title: 'My Dream Numbers - LottoMind™' });
                  } catch (error) {
                    console.log('[Dreams] Share error:', error);
                  }
                }}
                activeOpacity={0.8}
                testID="dream-share-result"
              >
                <Share2 size={16} color="#9B8CE8" />
                <Text style={styles.dreamShareBtnText}>Share Dream Reading</Text>
              </TouchableOpacity>

              <View style={styles.disclaimerCard}>
                <TriangleAlert size={14} color={Colors.textMuted} />
                <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
              </View>
            </Animated.View>
          )}

          <View style={styles.commercialCard}>
            <View style={styles.commercialHeader}>
              <Video size={14} color="#9B8CE8" />
              <Text style={styles.commercialTitle}>Featured Video</Text>
            </View>
            <View style={styles.commercialVideoWrap}>
              <ExpoVideo
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/rf69lfvzqn37d4odtlo8v.mov' }}
                style={styles.commercialVideo}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                shouldPlay={false}
                isLooping={false}
                volume={1.0}
                isMuted={false}
              />
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.84,
  },
  backgroundScrim: {
    flex: 1,
    backgroundColor: 'rgba(1, 8, 16, 0.46)',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 18,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(2, 10, 22, 0.54)',
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.18)',
  },
  headerVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 8, 18, 0.92)',
  },
  headerVideoScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 16, 0.62)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#C4B5FD',
    letterSpacing: -0.5,
  },
  aiBadge: {
    backgroundColor: 'rgba(155, 140, 232, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.3)',
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#9B8CE8',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    zIndex: 1,
  },
  horoscopeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 16, 28, 0.86)',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  horoscopeIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  horoscopeInfo: {
    flex: 1,
    gap: 3,
  },
  horoscopeTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  horoscopeSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inputCard: {
    backgroundColor: 'rgba(6, 16, 28, 0.9)',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.2)',
    shadowColor: '#9B8CE8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#C4B5FD',
    flex: 1,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dreamInput: {
    minHeight: 100,
    maxHeight: 160,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  promptsSection: {
    gap: 10,
  },
  promptsLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  promptsGrid: {
    gap: 8,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(6, 16, 28, 0.86)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: 'rgba(155, 140, 232, 0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  promptText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  proGateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    borderRadius: 18,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  proGateVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 8, 18, 0.92)',
  },
  proGateVideoScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 16, 0.58)',
  },
  proGateIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    zIndex: 1,
  },
  proGateInfo: {
    flex: 1,
    gap: 2,
    zIndex: 1,
  },
  proGateTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  proGateSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  proGateCardTrial: {
    borderColor: 'rgba(46, 204, 113, 0.25)',
    backgroundColor: 'rgba(46, 204, 113, 0.06)',
  },
  proGateIconWrapTrial: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: 'rgba(46, 204, 113, 0.25)',
  },
  proGateTrialTitle: {
    color: '#2ECC71',
  },
  proGateLockIcon: {
    zIndex: 1,
  },
  premiumSuiteCard: {
    backgroundColor: 'rgba(4, 12, 28, 0.88)',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.24)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 5,
  },
  premiumSuiteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumSuiteIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  premiumSuiteCopy: {
    flex: 1,
    gap: 3,
  },
  premiumSuiteTitle: {
    color: Colors.gold,
    fontSize: 17,
    fontWeight: '900' as const,
  },
  premiumSuiteSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600' as const,
  },
  premiumStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  premiumStatusPillActive: {
    backgroundColor: 'rgba(49, 247, 200, 0.12)',
    borderColor: 'rgba(49, 247, 200, 0.3)',
  },
  premiumStatusText: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 0.8,
  },
  premiumStatusTextActive: {
    color: '#31F7C8',
  },
  premiumFeatureGrid: {
    gap: 9,
  },
  premiumFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
    backgroundColor: 'rgba(8, 18, 40, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.16)',
  },
  premiumFeatureCardActive: {
    borderColor: 'rgba(49, 247, 200, 0.22)',
    backgroundColor: 'rgba(49, 247, 200, 0.06)',
  },
  premiumFeatureIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  premiumFeatureCopy: {
    flex: 1,
    gap: 2,
  },
  premiumFeatureTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  premiumFeatureDetail: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600' as const,
  },
  psychicSuiteActionGrid: {
    gap: 10,
    marginTop: 12,
  },
  psychicSuiteActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderWidth: 1,
  },
  psychicSuiteActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  psychicSuiteActionCopy: {
    flex: 1,
    gap: 4,
  },
  psychicSuiteActionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  psychicSuiteActionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
  },
  psychicSuiteActionMeta: {
    fontSize: 10,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
  },
  psychicSuiteActionDetail: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  premiumUpgradeButton: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: Colors.goldLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  premiumUpgradeText: {
    color: '#07101F',
    fontSize: 14,
    fontWeight: '900' as const,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.redMuted,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.red,
  },
  resultSection: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: 'rgba(6, 16, 28, 0.9)',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.2)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(155, 140, 232, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.25)',
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#C4B5FD',
    flex: 1,
  },
  speakWrap: {
    marginLeft: 'auto' as const,
  },
  insightMeaning: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  emotionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionChip: {
    backgroundColor: 'rgba(155, 140, 232, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.2)',
  },
  emotionText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#C4B5FD',
  },
  intensityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  intensityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  intensityTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceLight,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#9B8CE8',
  },
  intensityValue: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#C4B5FD',
    minWidth: 36,
    textAlign: 'right',
  },
  symbolsCard: {
    backgroundColor: 'rgba(6, 16, 28, 0.9)',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  symbolsTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  symbolRow: {
    gap: 8,
  },
  symbolNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9B8CE8',
  },
  symbolName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textTransform: 'capitalize' as const,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
  },
  symbolNumbers: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 14,
  },
  miniNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155, 140, 232, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.2)',
  },
  miniNumText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#C4B5FD',
  },
  numbersCard: {
    backgroundColor: 'rgba(6, 16, 28, 0.9)',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  numbersHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numbersTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  gamePill: {
    backgroundColor: Colors.goldMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  gamePillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  ballsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  plusText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  numbersSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  fusionMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fusionMetaCard: {
    flex: 1,
    minWidth: '47%' as unknown as number,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    padding: 10,
    gap: 4,
  },
  fusionMetaLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.45,
  },
  fusionMetaValue: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '900' as const,
  },
  fusionSectionLabel: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },
  fusionPickLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '900' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.45,
    marginBottom: 4,
  },
  psychicPickWrap: {
    borderColor: 'rgba(139, 92, 246, 0.22)',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  combosCard: {
    backgroundColor: 'rgba(6, 16, 28, 0.9)',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  combosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  combosTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  comboNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  comboNum: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  comboNumText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  comboHint: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  dreamShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(155, 140, 232, 0.1)',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.25)',
  },
  dreamShareBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#9B8CE8',
  },
  psychicFusionButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  psychicFusionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900' as const,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  digitPickCard: {
    backgroundColor: 'rgba(6, 16, 28, 0.9)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
  },
  digitPickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digitPickIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.25)',
  },
  digitPickTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  digitPickNumbers: {
    gap: 6,
  },
  digitPickNumWrap: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.15)',
  },
  digitPickNum: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#2ECC71',
    letterSpacing: 4,
    fontVariant: ['tabular-nums'] as any,
  },
  digitPickHint: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  commercialCard: {
    backgroundColor: 'rgba(6, 16, 28, 0.92)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(155, 140, 232, 0.2)',
    gap: 0,
  },
  commercialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  commercialTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#C4B5FD',
  },
  commercialVideoWrap: {
    position: 'relative' as const,
    height: 200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  commercialVideo: {
    width: '100%',
    height: 200,
  },
  commercialWebFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  commercialWebText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  commercialThumbnail: {
    width: '100%',
    height: '100%',
  },
  commercialPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commercialPlayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(155, 140, 232, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  commercialLabel: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  commercialLabelText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#C4B5FD',
  },
});
