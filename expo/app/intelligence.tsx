import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  Shield,
  Target,
  AlertCircle,
  Sparkles,
  TriangleAlert,
  Minus,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { GAME_CONFIGS } from '@/constants/games';
import { useLotto } from '@/providers/LottoProvider';
import GameSwitcher from '@/components/GameSwitcher';
import LottoBall from '@/components/LottoBall';
import { buildIntelligenceReport, IntelligenceReport } from '@/utils/lotteryIntelligence';

const RISK_CONFIG = {
  conservative: { label: 'Conservative', color: Colors.blue, icon: Shield },
  moderate: { label: 'Moderate', color: Colors.amber, icon: Target },
  aggressive: { label: 'Aggressive', color: Colors.red, icon: Flame },
} as const;

const TREND_CONFIG = {
  heating: { label: 'Heating Up', color: Colors.amber, icon: TrendingUp },
  cooling: { label: 'Cooling Down', color: Colors.blue, icon: TrendingDown },
  stable: { label: 'Stable', color: Colors.green, icon: Minus },
} as const;

export default function IntelligenceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    currentGame,
    switchGame,
    liveDraws,
    frequencies,
    hotNumbers,
    coldNumbers,
    history,
  } = useLotto();
  const config = GAME_CONFIGS[currentGame];

  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
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

  const handleGenerate = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    fadeAnim.setValue(0);

    const newReport = buildIntelligenceReport(
      currentGame,
      liveDraws,
      frequencies,
      history,
      hotNumbers,
      coldNumbers
    );
    setReport(newReport);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 400);
  }, [currentGame, liveDraws, frequencies, history, hotNumbers, coldNumbers, fadeAnim]);

  const riskInfo = report ? RISK_CONFIG[report.riskLevel] : null;
  const trendInfo = report ? TREND_CONFIG[report.trendDirection] : null;
  const RiskIcon = riskInfo?.icon ?? Shield;
  const TrendIcon = trendInfo?.icon ?? Minus;

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="intel-back">
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Brain size={22} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Intelligence</Text>
        <View style={styles.dataBadge}>
          <Zap size={12} color="#8B5CF6" />
          <Text style={styles.dataText}>{liveDraws.length} draws · {history.length} picks</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GameSwitcher currentGame={currentGame} onSwitch={switchGame} />

        <View style={styles.introCard}>
          <View style={styles.introIconWrap}>
            <Brain size={36} color="#8B5CF6" />
          </View>
          <Text style={styles.introTitle}>Context-Aware Intelligence</Text>
          <Text style={styles.introSubtitle}>
            Combines live draw patterns, your pick history, overdue numbers, streaks, pair patterns, and gap analysis into one smart recommendation.
          </Text>

          <View style={styles.dataSourcesRow}>
            <View style={styles.dataSourcePill}>
              <TrendingUp size={12} color="#8B5CF6" />
              <Text style={styles.dataSourceText}>Live Draws</Text>
            </View>
            <View style={styles.dataSourcePill}>
              <Clock size={12} color="#8B5CF6" />
              <Text style={styles.dataSourceText}>Your History</Text>
            </View>
            <View style={styles.dataSourcePill}>
              <Flame size={12} color="#8B5CF6" />
              <Text style={styles.dataSourceText}>Hot/Cold</Text>
            </View>
            <View style={styles.dataSourcePill}>
              <AlertCircle size={12} color="#8B5CF6" />
              <Text style={styles.dataSourceText}>Gap Analysis</Text>
            </View>
          </View>
        </View>

        <Animated.View style={{ opacity: btnBlinkAnim }}>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerate}
            activeOpacity={0.85}
            testID="intel-generate"
          >
            <Sparkles size={20} color="#0A0A0A" />
            <Text style={styles.generateText}>Run Intelligence Analysis</Text>
          </TouchableOpacity>
        </Animated.View>

        {report && (
          <Animated.View style={[styles.reportSection, { opacity: fadeAnim }]}>
            <View style={styles.recommendCard}>
              <View style={styles.recommendHeader}>
                <RiskIcon size={20} color={riskInfo?.color ?? Colors.textMuted} />
                <Text style={styles.recommendTitle}>AI Recommendation</Text>
                <View style={[styles.riskPill, { backgroundColor: `${riskInfo?.color ?? Colors.textMuted}20`, borderColor: `${riskInfo?.color ?? Colors.textMuted}40` }]}>
                  <Text style={[styles.riskText, { color: riskInfo?.color ?? Colors.textMuted }]}>
                    {riskInfo?.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.recommendText}>{report.recommendation}</Text>

              <View style={styles.trendRow}>
                <TrendIcon size={16} color={trendInfo?.color ?? Colors.textMuted} />
                <Text style={[styles.trendLabel, { color: trendInfo?.color ?? Colors.textMuted }]}>
                  Market trend: {trendInfo?.label}
                </Text>
              </View>
            </View>

            <View style={styles.smartPickCard}>
              <View style={styles.smartPickHeader}>
                <Sparkles size={18} color={Colors.gold} />
                <Text style={styles.smartPickTitle}>Smart Picks</Text>
                <View style={styles.gamePill}>
                  <Text style={styles.gamePillText}>{config.name}</Text>
                </View>
              </View>
              <View style={styles.smartPickBalls}>
                {report.smartPicks.map((num, idx) => (
                  <LottoBall key={`smart-${num}`} number={num} delay={idx * 120} />
                ))}
                <Text style={styles.smartPlus}>+</Text>
                <LottoBall
                  number={report.smartBonus}
                  isBonus
                  delay={report.smartPicks.length * 120}
                />
              </View>
              <Text style={styles.smartPickMeta}>
                Blended from {liveDraws.length} live draws + {history.filter(h => h.game === currentGame).length} of your picks
              </Text>
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.insightsTitle}>Key Insights</Text>
              {report.insights.map((insight, idx) => (
                <View key={`insight-${idx}`} style={styles.insightRow}>
                  <View style={styles.insightDot} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>

            {report.streakNumbers.length > 0 && (
              <View style={styles.streakCard}>
                <View style={styles.streakHeader}>
                  <Flame size={16} color={Colors.amber} />
                  <Text style={styles.streakTitle}>Hot Streaks</Text>
                </View>
                <Text style={styles.streakSubtitle}>Numbers appearing in 3+ of the last 5 draws</Text>
                <View style={styles.streakBalls}>
                  {report.streakNumbers.map((num) => (
                    <View key={`streak-${num}`} style={styles.streakBall}>
                      <Text style={styles.streakBallText}>{num}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {report.overduNumbers.length > 0 && (
              <View style={styles.overdueCard}>
                <View style={styles.overdueHeader}>
                  <Clock size={16} color="#8B5CF6" />
                  <Text style={styles.overdueTitle}>Overdue Numbers</Text>
                </View>
                <Text style={styles.overdueSubtitle}>Haven't appeared in 10+ recent draws</Text>
                <View style={styles.overdueBalls}>
                  {report.overduNumbers.slice(0, 8).map((num) => (
                    <View key={`overdue-${num}`} style={styles.overdueBall}>
                      <Text style={styles.overdueBallText}>{num}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {report.pairPatterns.length > 0 && (
              <View style={styles.pairsCard}>
                <View style={styles.pairsHeader}>
                  <Target size={16} color={Colors.green} />
                  <Text style={styles.pairsTitle}>Pair Patterns</Text>
                </View>
                <Text style={styles.pairsSubtitle}>Number pairs appearing together frequently</Text>
                <View style={styles.pairsList}>
                  {report.pairPatterns.slice(0, 5).map((pair, idx) => (
                    <View key={`pair-${idx}`} style={styles.pairRow}>
                      <View style={styles.pairNums}>
                        {pair.pair.split('-').map((n) => (
                          <View key={`pn-${idx}-${n}`} style={styles.pairBall}>
                            <Text style={styles.pairBallText}>{n}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.pairCountBadge}>
                        <Text style={styles.pairCountText}>{pair.count}x together</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {report.gapAnalysis.length > 0 && (
              <View style={styles.gapCard}>
                <View style={styles.gapHeader}>
                  <AlertCircle size={16} color={Colors.textSecondary} />
                  <Text style={styles.gapTitle}>Gap Analysis</Text>
                </View>
                <Text style={styles.gapSubtitle}>Longest gaps since last appearance</Text>
                <View style={styles.gapList}>
                  {report.gapAnalysis.slice(0, 6).map((item, idx) => (
                    <View key={`gap-${idx}`} style={styles.gapRow}>
                      <View style={styles.gapNumBall}>
                        <Text style={styles.gapNumText}>{item.number}</Text>
                      </View>
                      <View style={styles.gapBarTrack}>
                        <View
                          style={[
                            styles.gapBarFill,
                            { width: `${Math.min(100, (item.gapSinceLast / Math.max(liveDraws.length, 1)) * 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.gapValue}>{item.gapSinceLast} draws</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.disclaimerCard}>
              <TriangleAlert size={14} color={Colors.textMuted} />
              <Text style={styles.disclaimerText}>
                This analysis is for entertainment purposes only. Lottery outcomes are random and past patterns do not guarantee future results.
              </Text>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#8B5CF6',
    flex: 1,
  },
  dataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  dataText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 18,
  },
  introCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  introIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  dataSourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  dataSourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  dataSourceText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#A78BFA',
  },
  generateBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  generateText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  reportSection: {
    gap: 16,
  },
  recommendCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  recommendTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  riskPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  recommendText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  smartPickCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  smartPickHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smartPickTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    flex: 1,
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
  smartPickBalls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  smartPlus: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  smartPickMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  insightsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 7,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  streakCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  streakSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  streakBalls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  streakBall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.3)',
  },
  streakBallText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.amber,
  },
  overdueCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  overdueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overdueTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  overdueSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  overdueBalls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  overdueBall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  overdueBallText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#A78BFA',
  },
  pairsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.15)',
  },
  pairsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pairsTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  pairsSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  pairsList: {
    gap: 8,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 10,
  },
  pairNums: {
    flexDirection: 'row',
    gap: 6,
  },
  pairBall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.greenMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.25)',
  },
  pairBallText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.green,
  },
  pairCountBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pairCountText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  gapCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gapTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  gapSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  gapList: {
    gap: 8,
  },
  gapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gapNumBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gapNumText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  gapBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
    overflow: 'hidden',
  },
  gapBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  gapValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    minWidth: 60,
    textAlign: 'right',
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
});
