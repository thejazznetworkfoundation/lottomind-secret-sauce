import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Sparkles, Dices, Search, Zap, Calendar, RefreshCw } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { NumbersAPI } from '@/services/numbersApi';
import { generateSmartLottoSet, type LottoSetResult } from '@/utils/lottoSetGenerator';
import LottoSetCard from '@/components/LottoSetCard';

type ActiveTab = 'analyze' | 'generate' | 'date';

export default function LottoMindAIScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  const [numberInput, setNumberInput] = useState<string>('');
  const [analyzeResult, setAnalyzeResult] = useState<string>('');
  const [lottoSet, setLottoSet] = useState<LottoSetResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameType, setGameType] = useState<'powerball' | 'megamillions'>('powerball');

  const buttonScale = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const btnBlinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(btnBlinkAnim, { toValue: 0.45, duration: 500, useNativeDriver: true }),
        Animated.timing(btnBlinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [btnBlinkAnim]);

  const animateButton = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [buttonScale]);

  const showResult = useCallback(() => {
    resultFade.setValue(0);
    Animated.timing(resultFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [resultFade]);

  const handleAnalyze = useCallback(async () => {
    const num = parseInt(numberInput, 10);
    if (isNaN(num)) return;

    animateButton();
    setIsLoading(true);
    setAnalyzeResult('');

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const data = await NumbersAPI.getNumberFact(num);
      setAnalyzeResult(data.text);
      showResult();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.log('[LottoMindAI] Analyze error:', error);
      setAnalyzeResult('Failed to fetch insight. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, [numberInput, animateButton, showResult]);

  const handleGenerateSet = useCallback(async () => {
    animateButton();
    setIsLoading(true);
    setLottoSet(null);

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    try {
      const result = await generateSmartLottoSet(gameType);
      setLottoSet(result);
      showResult();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.log('[LottoMindAI] Generate error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gameType, animateButton, showResult]);

  const handleDateEnergy = useCallback(async () => {
    animateButton();
    setIsLoading(true);
    setAnalyzeResult('');

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const now = new Date();
      const data = await NumbersAPI.getDateEnergy(now.getMonth() + 1, now.getDate());
      setAnalyzeResult(data.text);
      showResult();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.log('[LottoMindAI] Date energy error:', error);
      setAnalyzeResult('Failed to fetch date energy.');
    } finally {
      setIsLoading(false);
    }
  }, [animateButton, showResult]);

  const handleRandom = useCallback(async () => {
    animateButton();
    setIsLoading(true);
    setAnalyzeResult('');

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const data = await NumbersAPI.getRandomFact();
      setAnalyzeResult(data.text);
      showResult();
    } catch (error) {
      console.log('[LottoMindAI] Random error:', error);
      setAnalyzeResult('Failed to fetch random insight.');
    } finally {
      setIsLoading(false);
    }
  }, [animateButton, showResult]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          testID="lottomind-back"
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Sparkles size={18} color={Colors.gold} />
          <Text style={styles.headerTitle}>LottoMind™</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <Text style={styles.headerSub}>
        Discover hidden meanings behind numbers
      </Text>

      <View style={styles.tabBar}>
        {([
          { key: 'generate' as const, label: 'AI Set', icon: Dices },
          { key: 'analyze' as const, label: 'Analyze', icon: Search },
          { key: 'date' as const, label: 'Date Energy', icon: Calendar },
        ]).map(({ key, label, icon: Icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => {
              setActiveTab(key);
              if (Platform.OS !== 'web') {
                void Haptics.selectionAsync();
              }
            }}
            activeOpacity={0.7}
          >
            <Icon size={16} color={activeTab === key ? Colors.gold : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'generate' && (
            <>
              <View style={styles.gameToggle}>
                <TouchableOpacity
                  style={[styles.gameBtn, gameType === 'powerball' && styles.gameBtnActive]}
                  onPress={() => setGameType('powerball')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.gameDot, { backgroundColor: '#E74C3C' }]} />
                  <Text style={[styles.gameBtnText, gameType === 'powerball' && styles.gameBtnTextActive]}>
                    Powerball
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.gameBtn, gameType === 'megamillions' && styles.gameBtnActive]}
                  onPress={() => setGameType('megamillions')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.gameDot, { backgroundColor: '#3498DB' }]} />
                  <Text style={[styles.gameBtnText, gameType === 'megamillions' && styles.gameBtnTextActive]}>
                    Mega Millions
                  </Text>
                </TouchableOpacity>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }], opacity: isLoading ? 1 : btnBlinkAnim }}>
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={() => { void handleGenerateSet(); }}
                  activeOpacity={0.85}
                  disabled={isLoading}
                  testID="ai-generate-set"
                >
                  <View style={styles.mainButtonGlow} />
                  <Zap size={22} color={Colors.gold} />
                  <View style={styles.mainButtonCopy}>
                    <Text style={styles.mainButtonText}>
                      {isLoading ? 'Generating AI Set...' : 'Generate AI Number Set'}
                    </Text>
                    <View style={styles.mainButtonXpBadge}>
                      <Text style={styles.mainButtonXpText}>AI XP 60</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {isLoading && activeTab === 'generate' && (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color={Colors.gold} />
                  <Text style={styles.loadingText}>Analyzing number patterns...</Text>
                </View>
              )}

              {lottoSet && (
                <Animated.View style={{ opacity: resultFade }}>
                  <View style={styles.setHeader}>
                    <Sparkles size={16} color={Colors.gold} />
                    <Text style={styles.setTitle}>AI-Enhanced Number Set</Text>
                  </View>

                  <View style={styles.quickBallsRow}>
                    {lottoSet.numbers.map((item) => (
                      <View key={`qb-${item.number}`} style={styles.quickBall}>
                        <Text style={styles.quickBallText}>{item.number}</Text>
                      </View>
                    ))}
                    <Text style={styles.plusSign}>+</Text>
                    <View style={[styles.quickBall, styles.quickBonusBall]}>
                      <Text style={[styles.quickBallText, styles.quickBonusText]}>
                        {lottoSet.bonusNumber.number}
                      </Text>
                    </View>
                  </View>

                  <LottoSetCard
                    data={lottoSet.numbers}
                    bonusNumber={lottoSet.bonusNumber}
                    dateEnergy={lottoSet.dateEnergy}
                  />
                </Animated.View>
              )}
            </>
          )}

          {activeTab === 'analyze' && (
            <>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.numberInput}
                  placeholder="Enter a number..."
                  placeholderTextColor={Colors.textMuted}
                  value={numberInput}
                  onChangeText={setNumberInput}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  testID="number-input"
                />
              </View>

              <View style={styles.analyzeActions}>
                <Animated.View style={[styles.flex, { transform: [{ scale: buttonScale }] }]}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryAction]}
                    onPress={() => { void handleAnalyze(); }}
                    activeOpacity={0.85}
                    disabled={isLoading || !numberInput.trim()}
                    testID="analyze-btn"
                  >
                    <Search size={18} color="#1A1200" />
                    <Text style={styles.primaryActionText}>Analyze Number</Text>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryAction]}
                  onPress={() => { void handleRandom(); }}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} color={Colors.gold} />
                  <Text style={styles.secondaryActionText}>Random</Text>
                </TouchableOpacity>
              </View>

              {isLoading && activeTab === 'analyze' && (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color={Colors.gold} />
                </View>
              )}

              {analyzeResult !== '' && !isLoading && (
                <Animated.View style={[styles.resultCard, { opacity: resultFade }]}>
                  <View style={styles.resultIcon}>
                    <Sparkles size={20} color={Colors.gold} />
                  </View>
                  <Text style={styles.resultText}>{analyzeResult}</Text>
                </Animated.View>
              )}
            </>
          )}

          {activeTab === 'date' && (
            <>
              <View style={styles.dateInfo}>
                <Calendar size={28} color={Colors.gold} />
                <Text style={styles.dateTitle}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.dateSub}>
                  Discover the cosmic energy and hidden significance of today's date
                </Text>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.primaryAction]}
                  onPress={() => { void handleDateEnergy(); }}
                  activeOpacity={0.85}
                  disabled={isLoading}
                  testID="date-energy-btn"
                >
                  <Zap size={18} color="#1A1200" />
                  <Text style={styles.primaryActionText}>
                    {isLoading ? 'Reading energy...' : 'Reveal Date Energy'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {isLoading && activeTab === 'date' && (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color={Colors.gold} />
                </View>
              )}

              {analyzeResult !== '' && !isLoading && (
                <Animated.View style={[styles.resultCard, { opacity: resultFade }]}>
                  <View style={styles.resultIcon}>
                    <Calendar size={20} color={Colors.gold} />
                  </View>
                  <Text style={styles.resultLabel}>DATE ENERGY</Text>
                  <Text style={styles.resultText}>{analyzeResult}</Text>
                </Animated.View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  headerSub: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.gold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  gameToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  gameBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameBtnActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldMuted,
  },
  gameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gameBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  gameBtnTextActive: {
    color: Colors.gold,
  },
  mainButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  mainButtonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  mainButtonCopy: {
    alignItems: 'center',
    gap: 5,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  mainButtonXpBadge: {
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'transparent',
  },
  mainButtonXpText: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '800' as const,
    letterSpacing: 0,
    color: Colors.champagne,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  quickBallsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  quickBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
  },
  quickBonusBall: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: 'rgba(231, 76, 60, 0.4)',
  },
  quickBallText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  quickBonusText: {
    color: Colors.red,
  },
  plusSign: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  inputRow: {
    gap: 10,
  },
  numberInput: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    fontWeight: '600' as const,
  },
  analyzeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  secondaryAction: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    paddingHorizontal: 18,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dateInfo: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  dateSub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
});
