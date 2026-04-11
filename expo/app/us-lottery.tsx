import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Trophy,
  DollarSign,
  Calendar,
  MapPin,
  Ticket,
  Star,
  Filter,
  Globe,
  Award,
  Zap,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import {
  fetchUSLotteryData,
  formatJackpot,
  getUniqueStates,
  getUniqueGames,
  type ParsedDrawResult,
} from '@/utils/usLotteryApi';

type FilterTab = 'all' | 'jackpot' | 'state';

const FEATURED_GAMES = ['Powerball', 'Mega Millions', 'Lucky For Life', 'Cash4Life'];

function getGameAccent(gameName: string): string {
  const lower = gameName.toLowerCase();
  if (lower.includes('powerball')) return '#E74C3C';
  if (lower.includes('mega')) return '#3498DB';
  if (lower.includes('lucky')) return '#2ECC71';
  if (lower.includes('cash4life') || lower.includes('cash 4 life')) return '#9B59B6';
  if (lower.includes('lotto')) return '#F5A623';
  if (lower.includes('pick')) return '#00E676';
  return Colors.gold;
}

export default function USLotteryScreen() {
  console.log('[USLotteryScreen] rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [showPrizes, setShowPrizes] = useState<string | null>(null);
  const [showAllStates, setShowAllStates] = useState<boolean>(false);
  const [showAllResults, setShowAllResults] = useState<boolean>(false);

  const { data: results = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['usLotteryData'],
    queryFn: fetchUSLotteryData,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    gcTime: 30 * 60 * 1000,
  });

  const states = useMemo(() => getUniqueStates(results), [results]);
  const allGames = useMemo(() => getUniqueGames(results), [results]);

  const featuredResults = useMemo(() => {
    return results.filter(r => FEATURED_GAMES.some(fg => r.gameName.toLowerCase().includes(fg.toLowerCase())));
  }, [results]);

  const bigJackpots = useMemo(() => {
    return results
      .filter(r => (r.jackpot && r.jackpot > 0) || r.nextDrawJackpot > 0)
      .sort((a, b) => {
        const aVal = a.jackpot ?? a.nextDrawJackpot;
        const bVal = b.jackpot ?? b.nextDrawJackpot;
        return bVal - aVal;
      })
      .slice(0, 20);
  }, [results]);

  const filteredResults = useMemo(() => {
    let filtered = results;
    if (filterTab === 'jackpot') {
      filtered = bigJackpots;
    } else if (filterTab === 'state' && selectedState) {
      filtered = results.filter(r => r.stateCode === selectedState);
    }

    const seen = new Set<string>();
    const deduped: ParsedDrawResult[] = [];
    for (const r of filtered) {
      const key = `${r.gameCode}-${r.drawDate}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(r);
      }
    }
    return deduped;
  }, [results, filterTab, selectedState, bigJackpots]);

  const displayResults = showAllResults ? filteredResults : filteredResults.slice(0, 15);

  const totalPrizeWinners = useMemo(() => {
    let total = 0;
    for (const r of results) {
      for (const p of r.prizes) {
        total += p.numberOfWinners;
      }
    }
    return total;
  }, [results]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const toggleExpand = useCallback((key: string) => {
    setExpandedGame(prev => prev === key ? null : key);
    setShowPrizes(null);
  }, []);

  const togglePrizes = useCallback((key: string) => {
    setShowPrizes(prev => prev === key ? null : key);
  }, []);

  const renderDrawCard = useCallback((item: ParsedDrawResult, index: number) => {
    const key = `${item.gameCode}-${item.drawDate}-${index}`;
    const isExpanded = expandedGame === key;
    const isPrizesShown = showPrizes === key;
    const accent = getGameAccent(item.gameName);
    const jackpotDisplay = formatJackpot(item.jackpot) || formatJackpot(item.nextDrawJackpot);
    const hasJackpot = !!jackpotDisplay;
    const isBig = (item.jackpot ?? 0) >= 100_000_000 || item.nextDrawJackpot >= 100_000_000;

    return (
      <TouchableOpacity
        key={key}
        style={[styles.drawCard, isBig && { borderColor: `${accent}40` }]}
        onPress={() => toggleExpand(key)}
        activeOpacity={0.8}
        testID={`us-draw-${index}`}
      >
        <View style={styles.drawCardHeader}>
          <View style={[styles.gameAccentDot, { backgroundColor: accent }]} />
          <View style={styles.drawCardInfo}>
            <Text style={styles.drawGameName} numberOfLines={1}>{item.gameName}</Text>
            <Text style={styles.drawPlayName} numberOfLines={1}>{item.playName}</Text>
          </View>
          <View style={styles.drawCardRight}>
            {hasJackpot && (
              <View style={[styles.jackpotBadge, isBig && { backgroundColor: `${accent}20`, borderColor: `${accent}40` }]}>
                <DollarSign size={10} color={isBig ? accent : Colors.gold} />
                <Text style={[styles.jackpotBadgeText, isBig && { color: accent }]}>{jackpotDisplay}</Text>
              </View>
            )}
            <ChevronDown
              size={16}
              color={Colors.textMuted}
              style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
            />
          </View>
        </View>

        <View style={styles.drawNumbersRow}>
          {item.mainNumbers.map((num, i) => (
            <View key={`m-${i}`} style={[styles.numBall, { borderColor: `${accent}30` }]}>
              <Text style={styles.numBallText}>{num}</Text>
            </View>
          ))}
          {item.specialBalls.map((sb, i) => (
            <React.Fragment key={`sb-${i}`}>
              <Text style={styles.numPlus}>+</Text>
              <View style={[styles.numBall, styles.specialBall, { borderColor: `${accent}60`, backgroundColor: `${accent}15` }]}>
                <Text style={[styles.numBallText, { color: accent }]}>{sb.value}</Text>
              </View>
            </React.Fragment>
          ))}
          {item.multiplier && (
            <View style={[styles.multiplierChip, { borderColor: `${accent}30` }]}>
              <Zap size={10} color={accent} />
              <Text style={[styles.multiplierText, { color: accent }]}>x{item.multiplier}</Text>
            </View>
          )}
        </View>

        <View style={styles.drawMeta}>
          <View style={styles.drawMetaItem}>
            <Calendar size={11} color={Colors.textMuted} />
            <Text style={styles.drawMetaText}>{item.drawDate}</Text>
          </View>
          <View style={styles.drawMetaItem}>
            <MapPin size={11} color={Colors.textMuted} />
            <Text style={styles.drawMetaText}>{item.stateName}</Text>
          </View>
          {item.prizeType && (
            <View style={[styles.prizeTypeBadge, { backgroundColor: `${accent}10`, borderColor: `${accent}20` }]}>
              <Text style={[styles.prizeTypeText, { color: accent }]}>{item.prizeType}</Text>
            </View>
          )}
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Next Draw</Text>
              <Text style={styles.expandedValue}>{item.nextDrawDate}</Text>
            </View>
            {item.nextDrawJackpot > 0 && (
              <View style={styles.expandedRow}>
                <Text style={styles.expandedLabel}>Est. Next Jackpot</Text>
                <Text style={[styles.expandedValue, { color: Colors.gold }]}>{formatJackpot(item.nextDrawJackpot)}</Text>
              </View>
            )}
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Game Code</Text>
              <Text style={styles.expandedValue}>{item.gameCode}</Text>
            </View>

            {item.prizes.length > 0 && (
              <TouchableOpacity
                style={styles.prizesToggle}
                onPress={() => togglePrizes(key)}
                activeOpacity={0.7}
              >
                <Award size={14} color={Colors.gold} />
                <Text style={styles.prizesToggleText}>
                  {isPrizesShown ? 'Hide' : 'Show'} Prize Breakdown ({item.prizes.length} tiers)
                </Text>
                <ChevronRight
                  size={14}
                  color={Colors.gold}
                  style={{ transform: [{ rotate: isPrizesShown ? '90deg' : '0deg' }] }}
                />
              </TouchableOpacity>
            )}

            {isPrizesShown && (
              <View style={styles.prizesTable}>
                <View style={styles.prizeHeaderRow}>
                  <Text style={[styles.prizeHeaderCell, { flex: 2 }]}>Match</Text>
                  <Text style={styles.prizeHeaderCell}>Prize</Text>
                  <Text style={styles.prizeHeaderCell}>Winners</Text>
                </View>
                {item.prizes.map((prize, pi) => (
                  <View
                    key={`prize-${pi}`}
                    style={[styles.prizeRow, pi === 0 && styles.prizeRowTop]}
                  >
                    <Text style={[styles.prizeCell, { flex: 2 }]} numberOfLines={1}>{prize.name}</Text>
                    <Text style={[styles.prizeCell, pi === 0 && { color: Colors.gold, fontWeight: '800' as const }]}>
                      {prize.amountString}
                    </Text>
                    <Text style={[styles.prizeCell, prize.numberOfWinners > 0 && { color: Colors.green }]}>
                      {prize.numberOfWinners.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [expandedGame, showPrizes, toggleExpand, togglePrizes]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="us-lottery-back">
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Globe size={20} color={Colors.gold} />
        <Text style={styles.headerTitle}>US Lottery Results</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{states.length} States</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={Colors.gold} />
        }
      >
        {isLoading && results.length === 0 && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Loading lottery data from {states.length || '48'} states...</Text>
          </View>
        )}

        {isError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Failed to load US lottery data.{error?.message ? ` (${error.message})` : ''}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleRefresh}
              activeOpacity={0.7}
            >
              <Text style={styles.retryBtnText}>Tap to Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {results.length > 0 && (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Globe size={16} color={Colors.gold} />
                <Text style={styles.statValue}>{states.length}</Text>
                <Text style={styles.statLabel}>States</Text>
              </View>
              <View style={styles.statBox}>
                <Ticket size={16} color="#E74C3C" />
                <Text style={styles.statValue}>{allGames.length}</Text>
                <Text style={styles.statLabel}>Games</Text>
              </View>
              <View style={styles.statBox}>
                <Star size={16} color="#F5A623" />
                <Text style={styles.statValue}>{results.length}</Text>
                <Text style={styles.statLabel}>Results</Text>
              </View>
              <View style={styles.statBox}>
                <Trophy size={16} color="#2ECC71" />
                <Text style={styles.statValue}>{totalPrizeWinners > 999 ? `${(totalPrizeWinners / 1000).toFixed(0)}K` : totalPrizeWinners}</Text>
                <Text style={styles.statLabel}>Winners</Text>
              </View>
            </View>

            <View style={styles.filterRow}>
              {(['all', 'jackpot', 'state'] as FilterTab[]).map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterChip, filterTab === tab && styles.filterChipActive]}
                  onPress={() => {
                    setFilterTab(tab);
                    setShowAllResults(false);
                    if (tab !== 'state') setSelectedState(null);
                  }}
                  activeOpacity={0.7}
                >
                  {tab === 'all' && <Globe size={13} color={filterTab === tab ? Colors.gold : Colors.textMuted} />}
                  {tab === 'jackpot' && <DollarSign size={13} color={filterTab === tab ? Colors.gold : Colors.textMuted} />}
                  {tab === 'state' && <Filter size={13} color={filterTab === tab ? Colors.gold : Colors.textMuted} />}
                  <Text style={[styles.filterChipText, filterTab === tab && styles.filterChipTextActive]}>
                    {tab === 'all' ? 'All Results' : tab === 'jackpot' ? 'Big Jackpots' : 'By State'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filterTab === 'state' && (
              <View style={styles.stateSelector}>
                <Text style={styles.stateSelectorLabel}>Select State</Text>
                <View style={styles.stateChips}>
                  {(showAllStates ? states : states.slice(0, 12)).map(st => (
                    <TouchableOpacity
                      key={st.code}
                      style={[styles.stateChip, selectedState === st.code && styles.stateChipActive]}
                      onPress={() => setSelectedState(st.code)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.stateChipText, selectedState === st.code && styles.stateChipTextActive]}>
                        {st.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {states.length > 12 && (
                  <TouchableOpacity
                    style={styles.showMoreStatesBtn}
                    onPress={() => setShowAllStates(prev => !prev)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showMoreStatesText}>
                      {showAllStates ? 'Show Less' : `Show All ${states.length} States`}
                    </Text>
                    <ChevronDown
                      size={14}
                      color={Colors.gold}
                      style={{ transform: [{ rotate: showAllStates ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {featuredResults.length > 0 && filterTab === 'all' && (
              <View style={styles.featuredSection}>
                <View style={styles.featuredHeader}>
                  <Star size={16} color="#FFD700" />
                  <Text style={styles.featuredTitle}>Featured National Games</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                  {featuredResults.slice(0, 8).map((item, idx) => {
                    const accent = getGameAccent(item.gameName);
                    const jp = formatJackpot(item.jackpot) || formatJackpot(item.nextDrawJackpot);
                    return (
                      <View key={`feat-${idx}`} style={[styles.featuredCard, { borderColor: `${accent}30` }]}>
                        <View style={[styles.featuredDot, { backgroundColor: accent }]} />
                        <Text style={styles.featuredName} numberOfLines={1}>{item.gameName}</Text>
                        <View style={styles.featuredNums}>
                          {item.mainNumbers.slice(0, 5).map((n, i) => (
                            <Text key={`fn-${i}`} style={[styles.featuredNum, { color: accent }]}>{n}</Text>
                          ))}
                        </View>
                        {jp ? (
                          <Text style={[styles.featuredJackpot, { color: accent }]}>{jp}</Text>
                        ) : null}
                        <Text style={styles.featuredDate}>{item.drawDate}</Text>
                        <Text style={styles.featuredState}>{item.stateName}</Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <View style={styles.resultsSection}>
              <Text style={styles.resultsSectionTitle}>
                {filterTab === 'jackpot' ? 'Biggest Jackpots' : filterTab === 'state' && selectedState ? `${states.find(s => s.code === selectedState)?.name ?? selectedState} Results` : 'All Draw Results'}
                <Text style={styles.resultCount}> ({filteredResults.length})</Text>
              </Text>
              {displayResults.map((item, idx) => renderDrawCard(item, idx))}
              
              {filteredResults.length > 15 && !showAllResults && (
                <TouchableOpacity
                  style={styles.showMoreBtn}
                  onPress={() => setShowAllResults(true)}
                  activeOpacity={0.7}
                  testID="show-more-results"
                >
                  <Text style={styles.showMoreText}>Show More ({filteredResults.length - 15} remaining)</Text>
                  <ChevronDown size={16} color={Colors.gold} />
                </TouchableOpacity>
              )}
              {showAllResults && filteredResults.length > 15 && (
                <TouchableOpacity
                  style={styles.showMoreBtn}
                  onPress={() => setShowAllResults(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.showMoreText}>Show Less</Text>
                  <ChevronDown size={16} color={Colors.gold} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.gold,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.green,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorCard: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
  },
  errorText: {
    fontSize: 14,
    color: Colors.red,
    textAlign: 'center' as const,
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.red,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldMuted,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  filterChipTextActive: {
    color: Colors.gold,
  },
  stateSelector: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stateSelectorLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  stateChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stateChipActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.goldBorder,
  },
  stateChipText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  stateChipTextActive: {
    color: Colors.gold,
  },
  showMoreStatesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 6,
  },
  showMoreStatesText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  featuredSection: {
    gap: 10,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  featuredScroll: {
    gap: 10,
    paddingRight: 10,
  },
  featuredCard: {
    width: 150,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    gap: 6,
    borderWidth: 1,
  },
  featuredDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: 'flex-start' as const,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  featuredNums: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  featuredNum: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  featuredJackpot: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  featuredDate: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  featuredState: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  resultsSection: {
    gap: 10,
  },
  resultsSectionTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  drawCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  drawCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gameAccentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  drawCardInfo: {
    flex: 1,
    gap: 1,
  },
  drawGameName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  drawPlayName: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  drawCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jackpotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  jackpotBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  drawNumbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  numBall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  numBallText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  numPlus: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  specialBall: {
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  multiplierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
  },
  multiplierText: {
    fontSize: 11,
    fontWeight: '800' as const,
  },
  drawMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  drawMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  drawMetaText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  prizeTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  prizeTypeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    gap: 8,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  expandedValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '700' as const,
  },
  prizesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.goldMuted,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  prizesToggleText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  prizesTable: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  prizeHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  prizeHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  prizeRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(42, 42, 42, 0.5)',
  },
  prizeRowTop: {
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  prizeCell: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.goldMuted,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
});
