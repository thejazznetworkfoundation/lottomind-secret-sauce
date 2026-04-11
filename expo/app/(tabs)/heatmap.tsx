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
import { Grid3x3, X, Flame, Snowflake, Activity, Radio, TrendingUp, TrendingDown, BarChart3, ChevronRight, Brain } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { GAME_CONFIGS } from '@/constants/games';
import { useRouter } from 'expo-router';
import { useLotto } from '@/providers/LottoProvider';
import { usePro } from '@/providers/ProProvider';
import { useTrivia } from '@/providers/TriviaProvider';
import GameSwitcher from '@/components/GameSwitcher';
import DailyPick from '@/components/DailyPick';
import GlossyButton from '@/components/GlossyButton';
import AnimatedCard from '@/components/AnimatedCard';
import PulsingDot from '@/components/PulsingDot';

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
  } = useLotto();
  const router = useRouter();
  const { isPro } = usePro();
  const { isFeatureUnlocked } = useTrivia();
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  const config = GAME_CONFIGS[currentGame];

  const cells = useMemo<number[]>(() => {
    return Array.from({ length: config.mainRange }, (_, index) => index + 1);
  }, [config.mainRange]);

  const hotSet = useMemo(() => new Set(hotNumbers.slice(0, 10)), [hotNumbers]);
  const hottestNumber = hotNumbers.length > 0 ? hotNumbers[0] : null;

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

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlossyButton
          onPress={() => router.push('/nationwide-analysis')}
          label="Nationwide Number Analysis"
          icon={<BarChart3 size={20} color="#FFFFFF" />}
          testID="nationwide-analysis-btn"
          variant="green"
          size="medium"
        />

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

        <GameSwitcher currentGame={currentGame} onSwitch={switchGame} />

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
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -8,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    shadowColor: '#D4AF37',
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
    gap: 5,
    justifyContent: 'center',
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 10,
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
    fontSize: 13,
    fontWeight: '700' as const,
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
