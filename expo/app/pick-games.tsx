import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Flame,
  DollarSign,
  Clock,
  Trophy,
  Zap,
  Hash,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Award,
  Target,
  MapPin,
  RefreshCw,
  X,
  Check,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import {
  fetchPick3Draws,
  fetchPick4Draws,
  PICK3_PRIZES,
  PICK4_PRIZES,
  LOTTERY_STATES,
  Pick3Draw,
  Pick4Draw,
  Pick3Prize,
  Pick4Prize,
  LotteryState,
} from '@/utils/pick3pick4Api';
import { useLotto } from '@/providers/LottoProvider';
import { analyzeLatestDailyPick } from '@/utils/dailyPickPowerLab';

type PickGame = 'pick3' | 'pick4';
type ViewMode = 'results' | 'prizes';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getDigitFrequency(draws: Pick3Draw[] | Pick4Draw[]): Map<number, number> {
  const freq = new Map<number, number>();
  for (let i = 0; i <= 9; i++) freq.set(i, 0);
  draws.forEach(d => {
    d.numbers.forEach(n => freq.set(n, (freq.get(n) ?? 0) + 1));
  });
  return freq;
}

export default function PickGamesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { pickState, setPickState } = useLotto();
  const [activeGame, setActiveGame] = useState<PickGame>('pick3');
  const [viewMode, setViewMode] = useState<ViewMode>('results');
  const [expandedPrize, setExpandedPrize] = useState<boolean>(false);
  const [stateModalVisible, setStateModalVisible] = useState<boolean>(false);

  const currentLotteryState = useMemo(() => {
    return LOTTERY_STATES.find(s => s.code === pickState) ?? LOTTERY_STATES[0];
  }, [pickState]);

  const pick3Query = useQuery({
    queryKey: ['pick3draws', pickState],
    queryFn: () => fetchPick3Draws(pickState),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 2,
  });

  const pick4Query = useQuery({
    queryKey: ['pick4draws', pickState],
    queryFn: () => fetchPick4Draws(pickState),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 2,
  });

  const draws3 = pick3Query.data;
  const draws4 = pick4Query.data;
  const isLoading = activeGame === 'pick3' ? pick3Query.isLoading : pick4Query.isLoading;

  const hotDigits = useMemo(() => {
    const source = activeGame === 'pick3' ? (draws3 ?? []) : (draws4 ?? []);
    const freq = getDigitFrequency(source);
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [activeGame, draws3, draws4]);

  const latestDraw = useMemo(() => {
    if (activeGame === 'pick3') return draws3?.[0] ?? null;
    return draws4?.[0] ?? null;
  }, [activeGame, draws3, draws4]);

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['pick3draws', pickState] });
    void queryClient.invalidateQueries({ queryKey: ['pick4draws', pickState] });
  }, [queryClient, pickState]);

  const handleGameSwitch = useCallback((game: PickGame) => {
    if (game === activeGame) return;
    setActiveGame(game);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, [activeGame]);

  const handleSelectState = useCallback((state: LotteryState) => {
    setPickState(state.code);
    setStateModalVisible(false);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, [setPickState]);

  const lastRefreshed = useMemo(() => {
    const dataUpdatedAt = activeGame === 'pick3' ? pick3Query.dataUpdatedAt : pick4Query.dataUpdatedAt;
    if (!dataUpdatedAt) return 'Never';
    return new Date(dataUpdatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }, [activeGame, pick3Query.dataUpdatedAt, pick4Query.dataUpdatedAt]);

  const prizes: (Pick3Prize | Pick4Prize)[] = activeGame === 'pick3' ? PICK3_PRIZES : PICK4_PRIZES;
  const draws = activeGame === 'pick3' ? (draws3 ?? []) : (draws4 ?? []);
  const powerLab = useMemo(() => {
    if (!latestDraw) return null;
    return analyzeLatestDailyPick(latestDraw.numbers, activeGame);
  }, [latestDraw, activeGame]);

  const renderStateItem = useCallback(({ item }: { item: LotteryState }) => {
    const isSelected = item.code === pickState;
    return (
      <TouchableOpacity
        style={[styles.stateItem, isSelected && styles.stateItemSelected]}
        onPress={() => handleSelectState(item)}
        activeOpacity={0.7}
      >
        <View style={styles.stateItemLeft}>
          <View style={[styles.stateCode, isSelected && styles.stateCodeSelected]}>
            <Text style={[styles.stateCodeText, isSelected && styles.stateCodeTextSelected]}>{item.code}</Text>
          </View>
          <View style={styles.stateDetails}>
            <Text style={[styles.stateName, isSelected && styles.stateNameSelected]}>{item.name}</Text>
            <Text style={styles.stateGames}>{item.pick3Name} / {item.pick4Name}</Text>
          </View>
        </View>
        {isSelected && <Check size={18} color="#00E676" />}
      </TouchableOpacity>
    );
  }, [pickState, handleSelectState]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="pick-games-back">
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Hash size={20} color="#00E676" />
        <Text style={styles.headerTitle}>Pick Games</Text>
        <TouchableOpacity
          style={styles.stateBadge}
          onPress={() => setStateModalVisible(true)}
          activeOpacity={0.7}
          testID="state-selector"
        >
          <MapPin size={12} color="#00E676" />
          <Text style={styles.stateText}>{pickState}</Text>
          <ChevronDown size={12} color="#00E676" />
        </TouchableOpacity>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor="#00E676" />
        }
      >
        <View style={styles.gameSwitcher}>
          <TouchableOpacity
            style={[styles.gameTab, activeGame === 'pick3' && styles.gameTabActive]}
            onPress={() => handleGameSwitch('pick3')}
            activeOpacity={0.7}
          >
            <Text style={[styles.gameTabNum, activeGame === 'pick3' && styles.gameTabNumActive]}>3</Text>
            <Text style={[styles.gameTabLabel, activeGame === 'pick3' && styles.gameTabLabelActive]}>
              {currentLotteryState.pick3Name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gameTab, activeGame === 'pick4' && styles.gameTabActive]}
            onPress={() => handleGameSwitch('pick4')}
            activeOpacity={0.7}
          >
            <Text style={[styles.gameTabNum, activeGame === 'pick4' && styles.gameTabNumActive]}>4</Text>
            <Text style={[styles.gameTabLabel, activeGame === 'pick4' && styles.gameTabLabelActive]}>
              {currentLotteryState.pick4Name}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.refreshRow}>
          <RefreshCw size={12} color={Colors.textMuted} />
          <Text style={styles.refreshText}>
            Auto-refresh every 2 min · Last: {lastRefreshed} · {currentLotteryState.name}
          </Text>
        </View>

        {latestDraw && (
          <View style={styles.latestCard}>
            <View style={styles.latestTop}>
              <View style={styles.latestBadge}>
                <Trophy size={14} color="#00E676" />
                <Text style={styles.latestBadgeText}>Latest Draw</Text>
              </View>
              <View style={styles.drawTimeBadge}>
                {latestDraw.drawTime === 'evening' ? (
                  <Moon size={12} color={Colors.gold} />
                ) : (
                  <Sun size={12} color={Colors.amber} />
                )}
                <Text style={styles.drawTimeText}>
                  {latestDraw.drawTime === 'evening' ? 'Evening' : 'Midday'}
                </Text>
              </View>
            </View>

            <Text style={styles.latestDate}>{formatDate(latestDraw.drawDate)}</Text>

            <View style={styles.latestBalls}>
              {latestDraw.numbers.map((num, idx) => (
                <View key={`latest-${idx}`} style={styles.latestBall}>
                  <Text style={styles.latestBallText}>{num}</Text>
                </View>
              ))}
              {latestDraw.fireball !== null && (
                <>
                  <View style={styles.fireballSeparator}>
                    <Zap size={16} color={Colors.amber} />
                  </View>
                  <View style={styles.fireballBall}>
                    <Text style={styles.fireballBallText}>{latestDraw.fireball}</Text>
                  </View>
                </>
              )}
            </View>

            {latestDraw.fireball !== null && (
              <View style={styles.fireballLabel}>
                <Flame size={12} color="#FF6B35" />
                <Text style={styles.fireballLabelText}>Fireball</Text>
              </View>
            )}

            <View style={styles.winInfoRow}>
              <DollarSign size={14} color="#00E676" />
              <Text style={styles.winInfoText}>
                {activeGame === 'pick3'
                  ? 'Win up to $500 (Straight $1) · Odds 1 in 1,000'
                  : 'Win up to $5,000 (Straight $1) · Odds 1 in 10,000'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewTab, viewMode === 'results' && styles.viewTabActive]}
            onPress={() => setViewMode('results')}
          >
            <Clock size={14} color={viewMode === 'results' ? '#0A0A0A' : Colors.textMuted} />
            <Text style={[styles.viewTabText, viewMode === 'results' && styles.viewTabTextActive]}>Results</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewTab, viewMode === 'prizes' && styles.viewTabActive]}
            onPress={() => setViewMode('prizes')}
          >
            <DollarSign size={14} color={viewMode === 'prizes' ? '#0A0A0A' : Colors.textMuted} />
            <Text style={[styles.viewTabText, viewMode === 'prizes' && styles.viewTabTextActive]}>Prizes & Odds</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hotDigitsCard}>
          <View style={styles.hotDigitsHeader}>
            <Flame size={16} color={Colors.amber} />
            <Text style={styles.hotDigitsTitle}>Hot Digits</Text>
            <Text style={styles.hotDigitsState}>{currentLotteryState.name}</Text>
          </View>
          <View style={styles.hotDigitsRow}>
            {hotDigits.map(([digit, count]) => (
              <View key={`hot-${digit}`} style={styles.hotDigitBubble}>
                <Text style={styles.hotDigitNum}>{digit}</Text>
                <Text style={styles.hotDigitCount}>{count}x</Text>
              </View>
            ))}
          </View>
        </View>

        {powerLab ? (
          <View style={styles.hotDigitsCard}>
            <View style={styles.hotDigitsHeader}>
              <Target size={16} color={Colors.gold} />
              <Text style={styles.hotDigitsTitle}>Daily 3 / Daily 4 Power Lab</Text>
              <Text style={styles.hotDigitsState}>{powerLab.normalized}</Text>
            </View>
            <View style={styles.labGrid}>
              <View style={styles.labTile}>
                <Text style={styles.labLabel}>Sum</Text>
                <Text style={styles.labValue}>{powerLab.sum}</Text>
              </View>
              <View style={styles.labTile}>
                <Text style={styles.labLabel}>Root</Text>
                <Text style={styles.labValue}>{powerLab.rootSum}</Text>
              </View>
              <View style={styles.labTile}>
                <Text style={styles.labLabel}>Mirror</Text>
                <Text style={styles.labValue}>{powerLab.mirror}</Text>
              </View>
              <View style={styles.labTile}>
                <Text style={styles.labLabel}>Pairs</Text>
                <Text style={styles.labValue}>{powerLab.pairs.slice(0, 3).join(' ')}</Text>
              </View>
            </View>
            <Text style={styles.powerLabNote}>
              {powerLab.oddEvenBalance} · {powerLab.highLowBalance} · {powerLab.hasRepeat ? 'repeat digits' : 'no repeats'}
            </Text>
          </View>
        ) : null}

        {viewMode === 'prizes' && (
          <View style={styles.prizesSection}>
            <View style={styles.prizeHeader}>
              <Award size={18} color={Colors.gold} />
              <Text style={styles.prizeTitle}>
                {activeGame === 'pick3' ? currentLotteryState.pick3Name : currentLotteryState.pick4Name} Prize Chart
              </Text>
            </View>
            <Text style={styles.prizeSubtitle}>
              {activeGame === 'pick3'
                ? 'Match your numbers to win up to $500!'
                : 'Match your numbers to win up to $5,000!'}
            </Text>

            <View style={styles.prizeTable}>
              <View style={styles.prizeTableHeader}>
                <Text style={[styles.prizeTableCell, styles.prizeTableHeaderText, { flex: 2 }]}>Play Type</Text>
                <Text style={[styles.prizeTableCell, styles.prizeTableHeaderText]}>Wager</Text>
                <Text style={[styles.prizeTableCell, styles.prizeTableHeaderText]}>Prize</Text>
                <Text style={[styles.prizeTableCell, styles.prizeTableHeaderText]}>Odds</Text>
              </View>
              {(expandedPrize ? prizes : prizes.slice(0, 6)).map((prize, idx) => (
                <View key={`prize-${idx}`} style={[styles.prizeRow, idx % 2 === 0 && styles.prizeRowAlt]}>
                  <Text style={[styles.prizeCell, { flex: 2 }]}>{prize.playType}</Text>
                  <Text style={styles.prizeCell}>{prize.wager}</Text>
                  <Text style={[styles.prizeCell, styles.prizeCellHighlight]}>{prize.prize}</Text>
                  <Text style={[styles.prizeCell, styles.prizeCellOdds]}>{prize.odds}</Text>
                </View>
              ))}
            </View>

            {prizes.length > 6 && (
              <TouchableOpacity
                style={styles.expandBtn}
                onPress={() => setExpandedPrize(!expandedPrize)}
              >
                {expandedPrize ? (
                  <ChevronUp size={16} color={Colors.gold} />
                ) : (
                  <ChevronDown size={16} color={Colors.gold} />
                )}
                <Text style={styles.expandBtnText}>
                  {expandedPrize ? 'Show Less' : `Show All ${prizes.length} Prize Types`}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.jackpotHighlight}>
              <Target size={20} color="#00E676" />
              <View style={styles.jackpotInfo}>
                <Text style={styles.jackpotTitle}>
                  {activeGame === 'pick3' ? 'Top Prize: $500' : 'Top Prize: $5,000'}
                </Text>
                <Text style={styles.jackpotDesc}>
                  Straight play with $1.00 wager. Drawings twice daily in {currentLotteryState.name}.
                </Text>
              </View>
            </View>
          </View>
        )}

        {viewMode === 'results' && (
          <View style={styles.drawsSection}>
            <Text style={styles.drawsSectionTitle}>Recent Draws — {currentLotteryState.name}</Text>
            {draws.map((draw, idx) => (
              <View key={draw.id} style={styles.drawRow}>
                <View style={styles.drawRowLeft}>
                  <View style={styles.drawIndex}>
                    <Text style={styles.drawIndexText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.drawMeta}>
                    <Text style={styles.drawDate}>{formatDate(draw.drawDate)}</Text>
                    <View style={styles.drawTimeMini}>
                      {draw.drawTime === 'evening' ? (
                        <Moon size={10} color={Colors.textMuted} />
                      ) : (
                        <Sun size={10} color={Colors.textMuted} />
                      )}
                      <Text style={styles.drawTimeLabel}>{draw.drawTime}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.drawDigits}>
                  {draw.numbers.map((n, nIdx) => (
                    <View key={`${draw.id}-d-${nIdx}`} style={styles.drawDigitBall}>
                      <Text style={styles.drawDigitText}>{n}</Text>
                    </View>
                  ))}
                  {draw.fireball !== null && (
                    <View style={styles.drawFireball}>
                      <Text style={styles.drawFireballText}>{draw.fireball}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={stateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your State</Text>
              <TouchableOpacity
                onPress={() => setStateModalVisible(false)}
                style={styles.modalClose}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Choose your state for local Pick 3 & Pick 4 results</Text>
            <FlatList
              data={LOTTERY_STATES}
              renderItem={renderStateItem}
              keyExtractor={(item) => item.code}
              contentContainerStyle={styles.stateList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
    color: '#00E676',
    flex: 1,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  stateText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#00E676',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#00E676',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  gameSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  gameTabActive: {
    backgroundColor: '#00E676',
  },
  gameTabNum: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.textMuted,
  },
  gameTabNumActive: {
    color: '#0A0A0A',
  },
  gameTabLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  gameTabLabelActive: {
    color: '#0A0A0A',
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  latestCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  latestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  latestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  latestBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#00E676',
  },
  drawTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  drawTimeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  latestDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  latestBalls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  latestBall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  latestBallText: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#00E676',
  },
  fireballSeparator: {
    paddingHorizontal: 4,
  },
  fireballBall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  fireballBallText: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#FF6B35',
  },
  fireballLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  fireballLabelText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  winInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.12)',
  },
  winInfoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00E676',
    lineHeight: 18,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  viewTabActive: {
    backgroundColor: Colors.gold,
  },
  viewTabText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  viewTabTextActive: {
    color: '#0A0A0A',
  },
  hotDigitsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hotDigitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotDigitsTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  hotDigitsState: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  hotDigitsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  hotDigitBubble: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
  },
  hotDigitNum: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: Colors.amber,
  },
  hotDigitCount: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  labGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labTile: {
    width: '48%',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.18)',
  },
  labLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  labValue: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.gold,
    marginTop: 4,
  },
  powerLabNote: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  prizesSection: {
    gap: 14,
  },
  prizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prizeTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  prizeSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  prizeTable: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prizeTableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceHighlight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  prizeTableHeaderText: {
    fontWeight: '700' as const,
    color: Colors.gold,
    fontSize: 11,
  },
  prizeTableCell: {
    flex: 1,
    textAlign: 'center',
  },
  prizeRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 42, 42, 0.5)',
  },
  prizeRowAlt: {
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
  },
  prizeCell: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  prizeCellHighlight: {
    color: '#00E676',
    fontWeight: '700' as const,
  },
  prizeCellOdds: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  jackpotHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(0, 230, 118, 0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  jackpotInfo: {
    flex: 1,
    gap: 4,
  },
  jackpotTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#00E676',
  },
  jackpotDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  drawsSection: {
    gap: 8,
  },
  drawsSectionTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  drawRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  drawRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawIndexText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  drawMeta: {
    gap: 2,
  },
  drawDate: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  drawTimeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  drawTimeLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  drawDigits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  drawDigitBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  drawDigitText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#00E676',
  },
  drawFireball: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  drawFireballText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#FF6B35',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  stateList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stateItemSelected: {
    borderColor: 'rgba(0, 230, 118, 0.3)',
    backgroundColor: 'rgba(0, 230, 118, 0.06)',
  },
  stateItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stateCode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stateCodeSelected: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  stateCodeText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
  },
  stateCodeTextSelected: {
    color: '#00E676',
  },
  stateDetails: {
    gap: 2,
  },
  stateName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  stateNameSelected: {
    color: '#00E676',
  },
  stateGames: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
