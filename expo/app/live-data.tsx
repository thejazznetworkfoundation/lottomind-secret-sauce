import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Radio,
  Trophy,
  TrendingUp,
  Flame,
  Snowflake,
  BarChart3,
  Zap,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { GAME_CONFIGS } from '@/constants/games';
import { useLotto } from '@/providers/LottoProvider';
import { LiveDraw } from '@/types/lottery';
import GameSwitcher from '@/components/GameSwitcher';
import { useQueryClient } from '@tanstack/react-query';
import { getNewsRadarAlerts } from '@/utils/newsRadar';

function formatDrawDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function getNumberFrequency(draws: LiveDraw[], maxRange: number): { number: number; count: number }[] {
  const counts = new Map<number, number>();
  for (let i = 1; i <= maxRange; i++) counts.set(i, 0);
  draws.forEach(d => d.numbers.forEach(n => counts.set(n, (counts.get(n) ?? 0) + 1)));
  return [...counts.entries()].map(([number, count]) => ({ number, count })).sort((a, b) => b.count - a.count);
}

export default function LiveDataScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    currentGame,
    switchGame,
    liveDraws,
    isLiveDataLoading,
    liveDataError,
    hotNumbers,
    coldNumbers,
    latestDraw,
    stateName,
    pickState,
  } = useLotto();
  const config = GAME_CONFIGS[currentGame];
  const [expandedDraw, setExpandedDraw] = useState<string | null>(null);

  const numberStats = useMemo(() => getNumberFrequency(liveDraws, config.mainRange), [liveDraws, config.mainRange]);
  const topHot = useMemo(() => numberStats.slice(0, 5), [numberStats]);
  const topCold = useMemo(() => [...numberStats].sort((a, b) => a.count - b.count).slice(0, 5), [numberStats]);
  const newsAlerts = useMemo(() => getNewsRadarAlerts(currentGame), [currentGame]);

  const bonusStats = useMemo(() => {
    const counts = new Map<number, number>();
    liveDraws.forEach(d => counts.set(d.bonusNumber, (counts.get(d.bonusNumber) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [liveDraws]);

  const avgSum = useMemo(() => {
    if (liveDraws.length === 0) return 0;
    const total = liveDraws.reduce((s, d) => s + d.numbers.reduce((a, b) => a + b, 0), 0);
    return Math.round(total / liveDraws.length);
  }, [liveDraws]);

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['liveDraws', currentGame] });
  }, [queryClient, currentGame]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="live-data-back">
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Radio size={22} color="#FF6B35" />
        <Text style={styles.headerTitle}>Live Data · {stateName}</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: liveDataError ? Colors.red : '#FF6B35' }]} />
          <Text style={styles.statusText}>
            {isLiveDataLoading ? 'Loading...' : liveDataError ? 'Error' : `${liveDraws.length} draws · ${pickState}`}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLiveDataLoading}
            onRefresh={handleRefresh}
            tintColor="#FF6B35"
          />
        }
      >
        <GameSwitcher currentGame={currentGame} onSwitch={switchGame} />

        <View style={styles.latestCard}>
          <View style={styles.latestHeader}>
            <View style={styles.latestBadge}>
              <Zap size={16} color="#31F7C8" />
              <Text style={styles.latestBadgeText}>News Radar</Text>
            </View>
            <Text style={styles.latestDate}>{newsAlerts.length} alerts</Text>
          </View>
          {newsAlerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={styles.newsAlertRow}>
              <Text style={styles.newsAlertTitle}>{alert.title}</Text>
              <Text style={styles.newsAlertDetail}>{alert.detail}</Text>
            </View>
          ))}
        </View>

        {latestDraw && (
          <View style={styles.latestCard}>
            <View style={styles.latestHeader}>
              <View style={styles.latestBadge}>
                <Trophy size={16} color="#FF6B35" />
                <Text style={styles.latestBadgeText}>Latest Draw</Text>
              </View>
              <Text style={styles.latestDate}>{formatDrawDate(latestDraw.drawDate)}</Text>
            </View>

            <View style={styles.latestBalls}>
              {latestDraw.numbers.map((num) => (
                <View key={`latest-${num}`} style={styles.latestBall}>
                  <Text style={styles.latestBallText}>{num}</Text>
                </View>
              ))}
              <Text style={styles.latestPlus}>+</Text>
              <View style={styles.latestBonusBall}>
                <Text style={styles.latestBonusText}>{latestDraw.bonusNumber}</Text>
              </View>
            </View>

            {latestDraw.jackpot && (
              <View style={styles.jackpotRow}>
                <Text style={styles.jackpotLabel}>Jackpot</Text>
                <Text style={styles.jackpotValue}>{latestDraw.jackpot}</Text>
              </View>
            )}
            {latestDraw.multiplier && (
              <View style={styles.multiplierRow}>
                <Zap size={14} color={Colors.amber} />
                <Text style={styles.multiplierText}>{latestDraw.multiplier}x Multiplier</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <BarChart3 size={18} color="#FF6B35" />
            <Text style={styles.statValue}>{liveDraws.length}</Text>
            <Text style={styles.statLabel}>Draws Loaded</Text>
          </View>
          <View style={styles.statBox}>
            <TrendingUp size={18} color={Colors.amber} />
            <Text style={styles.statValue}>{avgSum}</Text>
            <Text style={styles.statLabel}>Avg Sum</Text>
          </View>
          <View style={styles.statBox}>
            <Flame size={18} color={Colors.red} />
            <Text style={styles.statValue}>{hotNumbers[0] ?? '-'}</Text>
            <Text style={styles.statLabel}>Hottest #</Text>
          </View>
          <View style={styles.statBox}>
            <Snowflake size={18} color={Colors.blue} />
            <Text style={styles.statValue}>{coldNumbers[0] ?? '-'}</Text>
            <Text style={styles.statLabel}>Coldest #</Text>
          </View>
        </View>

        <View style={styles.trendSection}>
          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Flame size={16} color={Colors.amber} />
              <Text style={styles.trendTitle}>Hot Numbers</Text>
            </View>
            <View style={styles.trendBalls}>
              {topHot.map((item) => (
                <View key={`hot-${item.number}`} style={styles.hotBall}>
                  <Text style={styles.hotBallNum}>{item.number}</Text>
                  <Text style={styles.hotBallCount}>{item.count}x</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Snowflake size={16} color={Colors.blue} />
              <Text style={styles.trendTitle}>Cold Numbers</Text>
            </View>
            <View style={styles.trendBalls}>
              {topCold.map((item) => (
                <View key={`cold-${item.number}`} style={styles.coldBall}>
                  <Text style={styles.coldBallNum}>{item.number}</Text>
                  <Text style={styles.coldBallCount}>{item.count}x</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {bonusStats.length > 0 && (
          <View style={styles.bonusCard}>
            <View style={styles.bonusHeader}>
              <Zap size={16} color={Colors.amber} />
              <Text style={styles.bonusTitle}>Top {config.bonusName} Numbers</Text>
            </View>
            <View style={styles.bonusBalls}>
              {bonusStats.map(([num, count]) => (
                <View key={`bonus-stat-${num}`} style={styles.bonusStatBall}>
                  <Text style={styles.bonusStatNum}>{num}</Text>
                  <Text style={styles.bonusStatCount}>{count}x</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.drawsSection}>
          <Text style={styles.drawsSectionTitle}>Recent Draws</Text>
          {liveDraws.slice(0, 15).map((draw, idx) => {
            const isExpanded = expandedDraw === draw.id;
            return (
              <TouchableOpacity
                key={draw.id}
                style={styles.drawRow}
                onPress={() => setExpandedDraw(isExpanded ? null : draw.id)}
                activeOpacity={0.7}
              >
                <View style={styles.drawRowTop}>
                  <View style={styles.drawIndex}>
                    <Text style={styles.drawIndexText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.drawInfo}>
                    <Text style={styles.drawDate}>{formatDrawDate(draw.drawDate)}</Text>
                    <View style={styles.drawNums}>
                      {draw.numbers.map((n) => (
                        <Text key={`d-${draw.id}-${n}`} style={styles.drawNum}>{n}</Text>
                      ))}
                      <Text style={styles.drawBonusNum}>+{draw.bonusNumber}</Text>
                    </View>
                  </View>
                  {draw.jackpot && (
                    <Text style={styles.drawJackpot}>{draw.jackpot}</Text>
                  )}
                </View>

                {isExpanded && (
                  <View style={styles.drawExpanded}>
                    {draw.multiplier && (
                      <Text style={styles.drawExpandedText}>Multiplier: {draw.multiplier}x</Text>
                    )}
                    <Text style={styles.drawExpandedText}>
                      Sum: {draw.numbers.reduce((s, n) => s + n, 0)}
                    </Text>
                    <Text style={styles.drawExpandedText}>
                      Range: {Math.min(...draw.numbers)} – {Math.max(...draw.numbers)}
                    </Text>
                    <Text style={styles.drawExpandedText}>
                      Source: {draw.source === 'live' ? 'Official API' : 'Fallback data'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

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
    color: '#FF6B35',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 18,
  },
  latestCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  latestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  latestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  latestBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FF6B35',
  },
  latestDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  newsAlertRow: {
    backgroundColor: 'rgba(49, 247, 200, 0.06)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(49, 247, 200, 0.12)',
    gap: 4,
  },
  newsAlertTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '800' as const,
  },
  newsAlertDetail: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  latestBalls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  latestBall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  latestBallText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#FF6B35',
  },
  latestPlus: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  latestBonusBall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.redMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  latestBonusText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.red,
  },
  jackpotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.goldMuted,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  jackpotLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  jackpotValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  multiplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  multiplierText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.amber,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  trendSection: {
    gap: 12,
  },
  trendCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  trendBalls: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  hotBall: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
  },
  hotBallNum: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.amber,
  },
  hotBallCount: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  coldBall: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.blueMuted,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.2)',
  },
  coldBallNum: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.blue,
  },
  coldBallCount: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  bonusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bonusTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  bonusBalls: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  bonusStatBall: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldMuted,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  bonusStatNum: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  bonusStatCount: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
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
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  drawRowTop: {
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
  drawInfo: {
    flex: 1,
    gap: 4,
  },
  drawDate: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  drawNums: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  drawNum: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  drawBonusNum: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.red,
  },
  drawJackpot: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  drawExpanded: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  drawExpandedText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
