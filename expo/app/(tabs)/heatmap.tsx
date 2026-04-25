import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Grid3x3,
  X,
  Flame,
  Snowflake,
  Activity,
  Radio,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Brain,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { GAME_CONFIGS } from '@/constants/games';
import { useRouter } from 'expo-router';
import { useLotto } from '@/providers/LottoProvider';
import { usePro } from '@/providers/ProProvider';
import { useTrivia } from '@/providers/TriviaProvider';
import GameSwitcher from '@/components/GameSwitcher';
import DailyPick from '@/components/DailyPick';
import AnimatedCard from '@/components/AnimatedCard';
import PulsingDot from '@/components/PulsingDot';
import WinFeed from '@/components/WinFeed';
import { buildMatrixAwareStats } from '@/utils/matrixAwareStats';

function getHeatColor(normalized: number): string {
  if (normalized > 0.8) return Colors.gold;
  if (normalized > 0.6) return Colors.goldLight;
  if (normalized > 0.4) return Colors.goldDim;
  if (normalized > 0.2) return Colors.surfaceHighlight;
  return Colors.surface;
}

function getHeatTextColor(normalized: number): string {
  if (normalized > 0.6) return '#1A1200';
  return Colors.textSecondary;
}

export default function HeatmapScreen() {
  const insets = useSafeAreaInsets();
  const {
    currentGame,
    switchGame,
    frequencies,
    hotNumbers,
    coldNumbers,
    latestDraw,
    liveDraws,
  } = useLotto();
  const router = useRouter();
  const { isPro } = usePro();
  const { isFeatureUnlocked } = useTrivia();
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [deadNumbersExpanded, setDeadNumbersExpanded] = useState<boolean>(false);

  const config = GAME_CONFIGS[currentGame];

  const cells = useMemo<number[]>(() => {
    return Array.from({ length: config.mainRange }, (_, index) => index + 1);
  }, [config.mainRange]);

  const hotSet = useMemo(() => new Set(hotNumbers.slice(0, 10)), [hotNumbers]);
  const hottestNumber = hotNumbers.length > 0 ? hotNumbers[0] : null;
  const deadNumbers = useMemo(() => coldNumbers.slice(0, 12), [coldNumbers]);
  const matrixStats = useMemo(
    () => buildMatrixAwareStats(currentGame, liveDraws, 'current'),
    [currentGame, liveDraws]
  );

  const blinkAnim = useRef(new Animated.Value(1)).current;
  const liveDataBlinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    const liveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDataBlinkAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(liveDataBlinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    liveLoop.start();
    return () => { loop.stop(); liveLoop.stop(); };
  }, [blinkAnim, liveDataBlinkAnim]);

  const selectedData = selectedNum !== null ? frequencies[selectedNum - 1] ?? null : null;

  const handleCellPress = useCallback((num: number) => {
    setSelectedNum(num);
  }, []);

  const toggleDeadNumbers = useCallback(() => {
    setDeadNumbersExpanded((current) => !current);
  }, []);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: liveDataBlinkAnim }}>
        <TouchableOpacity
          style={styles.liveDataCard}
          onPress={() => {
            if (isPro || isFeatureUnlocked('live_data')) {
              router.push('/live-data');
            } else {
              Alert.alert('Locked', 'Unlock "Live Draw Data" in Trivia Rewards or subscribe to Pro.', [
                { text: 'Go Pro', onPress: () => router.push('/paywall') },
                { text: 'Earn Credits', onPress: () => router.push('/trivia-rewards' as never) },
                { text: 'OK' },
              ]);
            }
          }}
          activeOpacity={0.85}
          testID="heatmap-live-data"
        >
          <View style={styles.liveDataIcon}>
            <Radio size={20} color="#FF6B35" />
          </View>
          <View style={styles.liveDataInfo}>
            <Text style={styles.liveDataTitle}>Live Data</Text>
            <Text style={styles.liveDataSub}>Real-time draw results & trends</Text>
          </View>
          <View style={styles.liveDataBadge}>
            <View style={styles.liveDataDot} />
            <Text style={styles.liveDataBadgeText}>LIVE</Text>
          </View>
        </TouchableOpacity>
        </Animated.View>

        <View style={styles.header}>
          <Grid3x3 size={22} color={Colors.gold} />
          <Text style={styles.title}>Live Heatmap</Text>
        </View>
        <Text style={styles.subtitle}>
          Frequency + recency intensity for {config.name} from recent live draws
        </Text>

        <AnimatedCard style={styles.infoCard} delay={50} depth="medium" glowColor="rgba(139, 92, 246, 0.18)">
          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <Grid3x3 size={14} color={Colors.gold} />
              <Text style={styles.infoPillText}>Matrix-aware</Text>
            </View>
            <View style={styles.infoPill}>
              <Activity size={14} color={Colors.gold} />
              <Text style={styles.infoPillText}>{matrixStats.drawingsAnalyzed} draws</Text>
            </View>
          </View>
          <Text style={styles.infoText}>{matrixStats.era.label}</Text>
          <Text style={styles.infoText}>{matrixStats.summary}</Text>
        </AnimatedCard>

        <GameSwitcher currentGame={currentGame} onSwitch={switchGame} />

        <View style={styles.deadDropCard}>
          <TouchableOpacity
            style={styles.deadDropHeader}
            onPress={toggleDeadNumbers}
            activeOpacity={0.76}
            testID="heatmap-dead-dropdown"
          >
            <View style={styles.deadDropTitleWrap}>
              <View style={styles.deadDropIcon}>
                <Snowflake size={18} color="#77B4FF" />
              </View>
              <View>
                <Text style={styles.deadDropTitle}>Dead / Cold Number Watch</Text>
                <Text style={styles.deadDropSub}>Lower-frequency numbers from the current live model</Text>
              </View>
            </View>
            <View style={{ transform: [{ rotate: deadNumbersExpanded ? '180deg' : '0deg' }] }}>
              <ChevronDown size={18} color="#77B4FF" />
            </View>
          </TouchableOpacity>
          {deadNumbersExpanded ? (
            <View style={styles.deadNumberGrid}>
              {deadNumbers.map((num, index) => (
                <TouchableOpacity
                  key={`dead-${num}-${index}`}
                  style={styles.deadNumberCell}
                  onPress={() => handleCellPress(num)}
                  activeOpacity={0.78}
                >
                  <Text style={styles.deadNumberText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <WinFeed />

        <AnimatedCard style={styles.infoCard} delay={100} depth="medium" glowColor="rgba(212, 175, 55, 0.2)">
          <View style={styles.infoRow}>
            <View style={styles.infoPill}>
              <Radio size={14} color={Colors.gold} />
              <Text style={styles.infoPillText}>Live model</Text>
            </View>
            <View style={styles.infoPill}>
              <Activity size={14} color={Colors.gold} />
              <Text style={styles.infoPillText}>Trend scoring</Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            Latest draw {latestDraw?.drawDate ? new Date(latestDraw.drawDate).toLocaleDateString() : 'unavailable'}
          </Text>
          <View style={styles.numberRow}>
            <View style={styles.numberGroup}>
              <Flame size={14} color={Colors.amber} />
              <Text style={styles.numberGroupTitle}>Hot</Text>
              <Text style={styles.numberGroupValue}>{hotNumbers.slice(0, 5).join(', ')}</Text>
            </View>
            <View style={styles.numberGroup}>
              <Snowflake size={14} color={Colors.blue} />
              <Text style={styles.numberGroupTitle}>Cold</Text>
              <Text style={styles.numberGroupValue}>{coldNumbers.slice(0, 5).join(', ')}</Text>
            </View>
          </View>
        </AnimatedCard>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Snowflake size={14} color={Colors.blue} />
            <Text style={styles.legendText}>Cold</Text>
          </View>
          <View style={styles.legendBar}>
            <View style={[styles.legendBlock, { backgroundColor: Colors.surface }]} />
            <View style={[styles.legendBlock, { backgroundColor: Colors.surfaceHighlight }]} />
            <View style={[styles.legendBlock, { backgroundColor: Colors.goldDim }]} />
            <View style={[styles.legendBlock, { backgroundColor: Colors.goldLight }]} />
            <View style={[styles.legendBlock, { backgroundColor: Colors.gold }]} />
          </View>
          <View style={styles.legendItem}>
            <Flame size={14} color={Colors.amber} />
            <Text style={styles.legendText}>Hot</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {cells.map((num) => {
            const item = frequencies[num - 1];
            const normalized = item?.score ?? 0;
            const isHot = hotSet.has(num);
            if (num === hottestNumber) {
              return (
                <Animated.View key={num} style={{ opacity: blinkAnim }}>
                  <TouchableOpacity
                    style={[styles.cell, styles.hottestCell, { backgroundColor: getHeatColor(normalized) }]}
                    onPress={() => handleCellPress(num)}
                    activeOpacity={0.8}
                    testID={`heatmap-cell-${num}`}
                  >
                    <Text style={[styles.cellText, { color: getHeatTextColor(normalized) }]}>{num}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            }
            if (isHot) {
              return (
                <TouchableOpacity
                  key={num}
                  style={[styles.cell, styles.hotCell, { backgroundColor: getHeatColor(normalized) }]}
                  onPress={() => handleCellPress(num)}
                  activeOpacity={0.8}
                  testID={`heatmap-cell-${num}`}
                >
                  <Text style={[styles.cellText, { color: getHeatTextColor(normalized) }]}>{num}</Text>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={num}
                style={[styles.cell, { backgroundColor: getHeatColor(normalized) }]}
                onPress={() => handleCellPress(num)}
                activeOpacity={0.8}
                testID={`heatmap-cell-${num}`}
              >
                <Text style={[styles.cellText, { color: getHeatTextColor(normalized) }]}>{num}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.signalsRow}>
          <AnimatedCard style={styles.signalCard} delay={200} depth="medium" glowColor="rgba(245, 166, 35, 0.15)">
            <View style={styles.signalHeader}>
              <TrendingUp size={16} color={Colors.amber} />
              <Text style={styles.signalTitle}>Hot Signals</Text>
            </View>
            <View style={styles.signalBalls}>
              {hotNumbers.slice(0, 5).map((num) => (
                <View key={`hot-${num}`} style={styles.miniGoldBall}>
                  <Text style={styles.miniBallText}>{num}</Text>
                </View>
              ))}
            </View>
          </AnimatedCard>

          <AnimatedCard style={styles.signalCard} delay={300} depth="medium" glowColor="rgba(52, 152, 219, 0.15)">
            <View style={styles.signalHeader}>
              <TrendingDown size={16} color={Colors.blue} />
              <Text style={styles.signalTitle}>Cold Signals</Text>
            </View>
            <View style={styles.signalBalls}>
              {coldNumbers.slice(0, 5).map((num) => (
                <View key={`cold-${num}`} style={styles.miniBlueBall}>
                  <Text style={styles.miniBallText}>{num}</Text>
                </View>
              ))}
            </View>
          </AnimatedCard>
        </View>

        <DailyPick game={currentGame} onShare={() => {}} />

        <TouchableOpacity
          style={styles.intelligenceCard}
          onPress={() => router.push('/intelligence')}
          activeOpacity={0.85}
          testID="heatmap-intelligence"
        >
          <View style={styles.intelligenceIcon}>
            <Brain size={22} color="#8B5CF6" />
          </View>
          <View style={styles.intelligenceInfo}>
            <Text style={styles.intelligenceTitle}>Intelligence Analysis</Text>
            <Text style={styles.intelligenceSub}>Context-aware pattern analysis & smart picks</Text>
          </View>
          <ChevronRight size={18} color="#8B5CF6" />
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal
        visible={selectedNum !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNum(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedNum(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Number {selectedNum}</Text>
              <TouchableOpacity onPress={() => setSelectedNum(null)} testID="heatmap-close-modal">
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {selectedData ? (
              <>
                <View style={styles.modalBallContainer}>
                  <View
                    style={[
                      styles.modalBall,
                      { backgroundColor: getHeatColor(selectedData.score) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalBallText,
                        { color: getHeatTextColor(selectedData.score) },
                      ]}
                    >
                      {selectedNum}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalStats}>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.modalStatLabel}>Model score</Text>
                    <Text style={styles.modalStatValue}>{(selectedData.score * 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.modalStatLabel}>Frequency</Text>
                    <Text style={styles.modalStatValue}>{selectedData.frequency}</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.modalStatLabel}>Recency</Text>
                    <Text style={styles.modalStatValue}>{(selectedData.recencyScore * 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.modalStatLabel}>Momentum</Text>
                    <Text style={styles.modalStatValue}>{(selectedData.momentumScore * 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.modalStatRow}>
                    <Text style={styles.modalStatLabel}>Rank</Text>
                    <Text style={styles.modalStatValue}>
                      {selectedData.score > 0.7 ? 'Hot' : selectedData.score > 0.45 ? 'Balanced' : 'Cold'}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 23,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  alertsSection: {
    gap: 0,
  },
  alertsDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 215, 0, 0.07)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.24)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  alertsDropdownLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertsDropdownTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  alertsDropdownSub: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  alertsDropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertToggleSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.22)',
  },
  alertsDropdownContent: {
    backgroundColor: 'rgba(8, 18, 40, 0.88)',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.16)',
  },
  alertsStatus: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    lineHeight: 17,
  },
  alertsJackpotRow: {
    flexDirection: 'row',
    gap: 10,
  },
  alertJackpotChip: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 45, 0.82)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
  },
  alertJackpotChipHuge: {
    borderColor: 'rgba(255, 215, 0, 0.36)',
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
  },
  alertJackpotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertJackpotName: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  alertJackpotAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  alertJackpotAmount: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  alertJackpotAmountHuge: {
    color: '#FFD700',
    fontSize: 17,
  },
  alertHugeBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  alertHugeBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: 'rgba(8, 20, 43, 0.82)',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.16)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  infoPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  numberRow: {
    flexDirection: 'row',
    gap: 12,
  },
  numberGroup: {
    flex: 1,
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
  },
  numberGroupTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  numberGroupValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  legendBar: {
    flexDirection: 'row',
    gap: 2,
  },
  legendBlock: {
    width: 24,
    height: 12,
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  cell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: 'rgba(212, 175, 55, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  hotCell: {
    borderColor: Colors.gold,
    borderWidth: 2,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  hottestCell: {
    borderColor: '#FF4500',
    borderWidth: 3,
    shadowColor: '#FF4500',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  cellText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  deadDropCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(8, 20, 43, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(119, 180, 255, 0.18)',
  },
  deadDropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  deadDropTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deadDropIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(119, 180, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(119, 180, 255, 0.2)',
  },
  deadDropTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800' as const,
  },
  deadDropSub: {
    marginTop: 2,
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  deadNumberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  deadNumberCell: {
    width: 38,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(119, 180, 255, 0.24)',
  },
  deadNumberText: {
    color: '#D8ECFF',
    fontSize: 12,
    fontWeight: '800' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 320,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalBallContainer: {
    alignItems: 'center',
  },
  modalBall: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  modalBallText: {
    fontSize: 26,
    fontWeight: '800' as const,
  },
  modalStats: {
    gap: 12,
  },
  modalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalStatLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  modalStatValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  signalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  signalCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  signalBalls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniGoldBall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  miniBlueBall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.25)',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  miniBallText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  liveDataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  liveDataIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.25)',
  },
  liveDataInfo: {
    flex: 1,
    gap: 2,
  },
  liveDataTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FF6B35',
  },
  liveDataSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  liveDataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  liveDataDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  liveDataBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#00E676',
  },
  intelligenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  intelligenceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  intelligenceInfo: {
    flex: 1,
    gap: 3,
  },
  intelligenceTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#A78BFA',
  },
  intelligenceSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
