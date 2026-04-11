import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  ChevronLeft,
  Layers,
  GitMerge,
  RefreshCw,
  Flame,
  Snowflake,
  BarChart3,
  Zap,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import {
  fetchNationwideAnalysis,
  NationwideAnalysis,
  NumberFrequency,
  PairCombo,
  CrossOverlap,
} from '@/utils/nationwideAnalysis';

type TabId = 'hot' | 'cold' | 'pairs' | 'overlaps';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: 'hot', label: 'Hot', icon: <Flame size={14} color={Colors.amber} /> },
  { id: 'cold', label: 'Cold', icon: <Snowflake size={14} color={Colors.blue} /> },
  { id: 'pairs', label: 'Combos', icon: <Layers size={14} color="#00E676" /> },
  { id: 'overlaps', label: 'Overlaps', icon: <GitMerge size={14} color="#AB47BC" /> },
];

function FrequencyRow({ item, rank, color }: { item: NumberFrequency; rank: number; color: string }) {
  const barWidth = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(barWidth, {
      toValue: Math.min(item.percentage * 1.8, 100),
      duration: 600 + rank * 40,
      useNativeDriver: false,
    }).start();
  }, [item.percentage, rank, barWidth]);

  const animatedWidth = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.freqRow}>
      <View style={styles.freqRank}>
        <Text style={styles.freqRankText}>#{rank}</Text>
      </View>
      <View style={[styles.freqBall, { borderColor: color }]}>
        <Text style={[styles.freqBallText, { color }]}>{item.number}</Text>
      </View>
      <View style={styles.freqBarContainer}>
        <Animated.View
          style={[
            styles.freqBar,
            { backgroundColor: color, width: animatedWidth },
          ]}
        />
      </View>
      <View style={styles.freqStats}>
        <Text style={styles.freqCount}>{item.count}×</Text>
        <Text style={styles.freqPct}>{item.percentage}%</Text>
      </View>
      <Text style={styles.freqLastSeen}>
        {item.daysSinceLastSeen < 9999 ? `${item.daysSinceLastSeen}d ago` : '—'}
      </Text>
    </View>
  );
}

function PairRow({ item, rank }: { item: PairCombo; rank: number }) {
  const isCross = item.games.length > 1;
  return (
    <View style={styles.pairRow}>
      <View style={styles.freqRank}>
        <Text style={styles.freqRankText}>#{rank}</Text>
      </View>
      <View style={styles.pairBalls}>
        <View style={styles.pairBall}>
          <Text style={styles.pairBallText}>{item.pair[0]}</Text>
        </View>
        <Text style={styles.pairDash}>–</Text>
        <View style={styles.pairBall}>
          <Text style={styles.pairBallText}>{item.pair[1]}</Text>
        </View>
      </View>
      <View style={styles.pairInfo}>
        <Text style={styles.pairCount}>{item.count} draws</Text>
        {isCross && (
          <View style={styles.crossBadge}>
            <Text style={styles.crossBadgeText}>CROSS</Text>
          </View>
        )}
      </View>
      <View style={styles.pairGames}>
        {item.games.includes('powerball') && (
          <View style={[styles.gameTag, { backgroundColor: 'rgba(231, 76, 60, 0.15)', borderColor: 'rgba(231, 76, 60, 0.3)' }]}>
            <Text style={[styles.gameTagText, { color: '#E74C3C' }]}>PB</Text>
          </View>
        )}
        {item.games.includes('megamillions') && (
          <View style={[styles.gameTag, { backgroundColor: 'rgba(52, 152, 219, 0.15)', borderColor: 'rgba(52, 152, 219, 0.3)' }]}>
            <Text style={[styles.gameTagText, { color: '#3498DB' }]}>MM</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function OverlapRow({ item, rank }: { item: CrossOverlap; rank: number }) {
  const maxTotal = 100;
  const pbPct = Math.min((item.pbCount / maxTotal) * 100, 100);
  const mmPct = Math.min((item.mmCount / maxTotal) * 100, 100);

  return (
    <View style={styles.overlapRow}>
      <View style={styles.freqRank}>
        <Text style={styles.freqRankText}>#{rank}</Text>
      </View>
      <View style={[styles.freqBall, { borderColor: '#AB47BC' }]}>
        <Text style={[styles.freqBallText, { color: '#AB47BC' }]}>{item.number}</Text>
      </View>
      <View style={styles.overlapBars}>
        <View style={styles.overlapBarRow}>
          <Text style={styles.overlapBarLabel}>PB</Text>
          <View style={styles.overlapBarTrack}>
            <View style={[styles.overlapBarFill, { width: `${pbPct}%`, backgroundColor: '#E74C3C' }]} />
          </View>
          <Text style={styles.overlapBarCount}>{item.pbCount}</Text>
        </View>
        <View style={styles.overlapBarRow}>
          <Text style={styles.overlapBarLabel}>MM</Text>
          <View style={styles.overlapBarTrack}>
            <View style={[styles.overlapBarFill, { width: `${mmPct}%`, backgroundColor: '#3498DB' }]} />
          </View>
          <Text style={styles.overlapBarCount}>{item.mmCount}</Text>
        </View>
      </View>
      <Text style={styles.overlapTotal}>{item.totalCount}</Text>
    </View>
  );
}

function GameSection({
  title,
  color,
  data,
  type,
  totalDraws,
}: {
  title: string;
  color: string;
  data: NumberFrequency[];
  type: 'hot' | 'cold';
  totalDraws: number;
}) {
  return (
    <View style={styles.gameSection}>
      <View style={styles.gameSectionHeader}>
        <View style={[styles.gameSectionDot, { backgroundColor: color }]} />
        <Text style={styles.gameSectionTitle}>{title}</Text>
        <Text style={styles.gameSectionMeta}>{totalDraws} draws analyzed</Text>
      </View>
      {data.map((item, i) => (
        <FrequencyRow
          key={`${type}-${title}-${item.number}`}
          item={item}
          rank={i + 1}
          color={type === 'hot' ? Colors.amber : Colors.blue}
        />
      ))}
    </View>
  );
}

export default function NationwideAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('hot');

  const { data, isLoading, error, refetch, isRefetching } = useQuery<NationwideAnalysis>({
    queryKey: ['nationwide-analysis'],
    queryFn: fetchNationwideAnalysis,
    staleTime: 1000 * 60 * 10,
  });

  const handleRefresh = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    void refetch();
  }, [refetch]);

  const handleTabPress = useCallback((tab: TabId) => {
    setActiveTab(tab);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Pulling all U.S. lottery data...</Text>
          <Text style={styles.loadingSubtext}>Analyzing Powerball & Mega Millions</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load analysis</Text>
          <Text style={styles.errorMsg}>{(error as Error).message}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <RefreshCw size={16} color="#1A1200" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!data) return null;

    switch (activeTab) {
      case 'hot':
        return (
          <View style={styles.tabContent}>
            <View style={styles.insightCard}>
              <Flame size={18} color={Colors.amber} />
              <Text style={styles.insightText}>
                Numbers appearing most frequently across {data.powerball.totalDraws + data.megamillions.totalDraws} total draws
              </Text>
            </View>
            <GameSection
              title="Powerball"
              color="#E74C3C"
              data={data.powerball.hot}
              type="hot"
              totalDraws={data.powerball.totalDraws}
            />
            <GameSection
              title="Mega Millions"
              color="#3498DB"
              data={data.megamillions.hot}
              type="hot"
              totalDraws={data.megamillions.totalDraws}
            />
          </View>
        );

      case 'cold':
        return (
          <View style={styles.tabContent}>
            <View style={styles.insightCard}>
              <Snowflake size={18} color={Colors.blue} />
              <Text style={styles.insightText}>
                Least drawn numbers — overdue or truly cold
              </Text>
            </View>
            <GameSection
              title="Powerball"
              color="#E74C3C"
              data={data.powerball.cold}
              type="cold"
              totalDraws={data.powerball.totalDraws}
            />
            <GameSection
              title="Mega Millions"
              color="#3498DB"
              data={data.megamillions.cold}
              type="cold"
              totalDraws={data.megamillions.totalDraws}
            />
          </View>
        );

      case 'pairs':
        return (
          <View style={styles.tabContent}>
            <View style={styles.insightCard}>
              <Layers size={18} color="#00E676" />
              <Text style={styles.insightText}>
                Most frequent number pairs drawn together across both games
              </Text>
            </View>
            <View style={styles.pairsList}>
              {data.topPairs.map((pair, i) => (
                <PairRow
                  key={`pair-${pair.pair[0]}-${pair.pair[1]}`}
                  item={pair}
                  rank={i + 1}
                />
              ))}
            </View>
          </View>
        );

      case 'overlaps':
        return (
          <View style={styles.tabContent}>
            <View style={styles.insightCard}>
              <GitMerge size={18} color="#AB47BC" />
              <Text style={styles.insightText}>
                Numbers that appear frequently in BOTH Powerball and Mega Millions
              </Text>
            </View>
            <View style={styles.overlapList}>
              {data.crossOverlaps.map((o, i) => (
                <OverlapRow
                  key={`overlap-${o.number}`}
                  item={o}
                  rank={i + 1}
                />
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <BarChart3 size={18} color={Colors.gold} />
          <Text style={styles.headerTitle}>Nationwide Analysis</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleRefresh}
          activeOpacity={0.7}
          disabled={isRefetching}
        >
          {isRefetching ? (
            <ActivityIndicator size="small" color={Colors.gold} />
          ) : (
            <RefreshCw size={18} color={Colors.gold} />
          )}
        </TouchableOpacity>
      </View>

      {data && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.powerball.totalDraws + data.megamillions.totalDraws}</Text>
            <Text style={styles.summaryLabel}>Total Draws</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>2</Text>
            <Text style={styles.summaryLabel}>Games</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Zap size={12} color={Colors.green} />
            <Text style={styles.summaryLabel}>Live Data</Text>
          </View>
        </View>
      )}

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              {tab.icon}
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        <View style={{ height: insets.bottom + 30 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.goldMuted,
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
    paddingTop: 8,
  },
  tabContent: {
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  loadingSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.red,
  },
  errorMsg: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  gameSection: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gameSectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gameSectionTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  gameSectionMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  freqRank: {
    width: 28,
    alignItems: 'center',
  },
  freqRankText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  freqBall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
  },
  freqBallText: {
    fontSize: 13,
    fontWeight: '800' as const,
  },
  freqBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  freqBar: {
    height: '100%',
    borderRadius: 4,
  },
  freqStats: {
    alignItems: 'flex-end',
    width: 50,
  },
  freqCount: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  freqPct: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  freqLastSeen: {
    fontSize: 10,
    color: Colors.textMuted,
    width: 42,
    textAlign: 'right',
  },
  pairsList: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  pairBalls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pairBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  pairBallText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  pairDash: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700' as const,
  },
  pairInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  pairCount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  crossBadge: {
    backgroundColor: 'rgba(171, 71, 188, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(171, 71, 188, 0.3)',
  },
  crossBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#AB47BC',
    letterSpacing: 0.5,
  },
  pairGames: {
    flexDirection: 'row',
    gap: 4,
  },
  gameTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  gameTagText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  overlapList: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overlapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  overlapBars: {
    flex: 1,
    gap: 3,
  },
  overlapBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overlapBarLabel: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    width: 18,
  },
  overlapBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  overlapBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  overlapBarCount: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    width: 24,
    textAlign: 'right',
  },
  overlapTotal: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.gold,
    width: 32,
    textAlign: 'right',
  },
});
