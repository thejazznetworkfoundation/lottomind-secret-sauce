import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
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
  Linking,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Moon, Sparkles, Eye, Zap, Cloud, TriangleAlert, X, Dice3, Share2, Sun, ChevronRight, Crown, Lock, Play, Video } from 'lucide-react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import VoiceRecordButton from '@/components/VoiceRecordButton';
import SpeakButton from '@/components/SpeakButton';
import { useMutation } from '@tanstack/react-query';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { useLotto } from '@/providers/LottoProvider';
import { usePro } from '@/providers/ProProvider';

import { useRouter } from 'expo-router';
import { GAME_CONFIGS } from '@/constants/games';
import { interpretDream, DreamResult } from '@/utils/dreamInterpreter';
import GameSwitcher from '@/components/GameSwitcher';
import LottoBall from '@/components/LottoBall';
import GlossyButton from '@/components/GlossyButton';

const DREAM_PROMPTS = [
  'I was flying over a golden city...',
  'A snake was guarding a treasure chest...',
  'I found money in a river while drowning...',
  'I saw a rainbow after a storm at the beach...',
];

const DISCLAIMER = 'This feature is for entertainment purposes only. Lottery outcomes are random.';

export default function DreamsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentGame, switchGame } = useLotto();
  const { isPro, canUseDream, freeDreamUsesLeft, useDreamUse, canUseHoroscope, freeHoroscopeUsesLeft } = usePro();
  const config = GAME_CONFIGS[currentGame];
  const [dreamText, setDreamText] = useState<string>('');
  const [result, setResult] = useState<DreamResult | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const horoscopeBlinkAnim = useRef(new Animated.Value(1)).current;
  const interpretBlinkAnim = useRef(new Animated.Value(1)).current;

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
    fadeAnim.setValue(0);
  }, [fadeAnim]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
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
            <View style={styles.titleRow}>
              <Moon size={22} color="#9B8CE8" />
              <Text style={styles.title}>Dream Oracle℠</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Describe your dream. AI interprets it into lucky numbers.</Text>
          </View>

          <GameSwitcher currentGame={currentGame} onSwitch={switchGame} />

          {!isPro && (
            <TouchableOpacity
              style={[styles.proGateCard, canUseDream ? styles.proGateCardTrial : undefined]}
              onPress={canUseDream ? undefined : () => router.push('/paywall')}
              activeOpacity={canUseDream ? 1 : 0.85}
              testID="dream-pro-gate"
            >
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
              {!canUseDream && <Lock size={16} color={Colors.textMuted} />}
            </TouchableOpacity>
          )}

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
    </AppBackground>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  horoscopeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
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
  proGateIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  proGateInfo: {
    flex: 1,
    gap: 2,
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
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
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
  combosCard: {
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
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
