import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Hash, ChevronRight, Flame, Clock, MapPin } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { type Pick3Draw, type Pick4Draw, getHotDigits, LOTTERY_STATES } from '@/utils/pick3pick4Api';

interface Pick34LiveSectionProps {
  pick3Draws: Pick3Draw[];
  pick4Draws: Pick4Draw[];
  isPick3Loading: boolean;
  isPick4Loading: boolean;
  stateName: string;
  pickState: string;
  onViewAll: () => void;
}

export default function Pick34LiveSection({
  pick3Draws,
  pick4Draws,
  isPick3Loading,
  isPick4Loading,
  stateName,
  pickState,
  onViewAll,
}: Pick34LiveSectionProps) {
  const stateInfo = useMemo(() => {
    return LOTTERY_STATES.find(s => s.code === pickState);
  }, [pickState]);

  const pick3Name = stateInfo?.pick3Name ?? 'Pick 3';
  const pick4Name = stateInfo?.pick4Name ?? 'Pick 4';

  const latest3 = pick3Draws[0] ?? null;
  const latest4 = pick4Draws[0] ?? null;

  const hot3 = useMemo(() => {
    if (pick3Draws.length === 0) return [];
    return getHotDigits(pick3Draws).slice(0, 5);
  }, [pick3Draws]);

  const hot4 = useMemo(() => {
    if (pick4Draws.length === 0) return [];
    return getHotDigits(pick4Draws).slice(0, 5);
  }, [pick4Draws]);

  const recent3Draws = useMemo(() => pick3Draws.slice(0, 5), [pick3Draws]);
  const recent4Draws = useMemo(() => pick4Draws.slice(0, 5), [pick4Draws]);

  const isLoading = isPick3Loading || isPick4Loading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrap}>
            <Hash size={16} color="#00E676" />
          </View>
          <View>
            <Text style={styles.headerTitle}>3 & 4 Digit Games</Text>
            <View style={styles.locationRow}>
              <MapPin size={10} color={Colors.textMuted} />
              <Text style={styles.headerSub}>{stateName}</Text>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={onViewAll}
          activeOpacity={0.7}
          testID="pick34-view-all"
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={styles.loadingText}>Loading digit games...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.gameCard}>
            <View style={styles.gameCardHeader}>
              <View style={[styles.gameBadge, { backgroundColor: 'rgba(155, 89, 182, 0.15)', borderColor: 'rgba(155, 89, 182, 0.3)' }]}>
                <Text style={[styles.gameBadgeText, { color: '#9B59B6' }]}>3-DIGIT</Text>
              </View>
              <Text style={styles.gameName}>{pick3Name}</Text>
              {latest3 && (
                <View style={styles.drawTimeBadge}>
                  <Clock size={10} color={Colors.textMuted} />
                  <Text style={styles.drawTimeText}>
                    {latest3.drawTime === 'midday' ? 'Mid' : 'Eve'}
                  </Text>
                </View>
              )}
            </View>

            {latest3 ? (
              <>
                <View style={styles.numbersRow}>
                  {latest3.numbers.map((num, idx) => (
                    <View key={`p3-${idx}`} style={[styles.digitBall, styles.digitBall3]}>
                      <Text style={[styles.digitBallText, { color: '#9B59B6' }]}>{num}</Text>
                    </View>
                  ))}
                  {latest3.fireball != null && (
                    <>
                      <View style={styles.fireballSep}>
                        <Flame size={12} color="#FF6B35" />
                      </View>
                      <View style={[styles.digitBall, styles.fireballBall]}>
                        <Text style={styles.fireballText}>{latest3.fireball}</Text>
                      </View>
                    </>
                  )}
                </View>
                <Text style={styles.drawDate}>{latest3.drawDate}</Text>

                {recent3Draws.length > 1 && (
                  <View style={styles.recentList}>
                    <Text style={styles.recentLabel}>Recent</Text>
                    {recent3Draws.slice(1).map((d, idx) => (
                      <View key={`r3-${idx}`} style={styles.recentRow}>
                        <Text style={styles.recentNums}>{d.numbers.join(' - ')}</Text>
                        <Text style={styles.recentMeta}>
                          {d.drawTime === 'midday' ? 'Mid' : 'Eve'} · {d.drawDate.slice(5)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {hot3.length > 0 && (
                  <View style={styles.hotRow}>
                    <Flame size={12} color={Colors.amber} />
                    <Text style={styles.hotLabel}>Hot:</Text>
                    {hot3.map((h) => (
                      <View key={`h3-${h.digit}`} style={styles.hotChip}>
                        <Text style={styles.hotChipText}>{h.digit}</Text>
                        <Text style={styles.hotChipCount}>{h.count}x</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.noData}>No data available</Text>
            )}
          </View>

          <View style={styles.gameCard}>
            <View style={styles.gameCardHeader}>
              <View style={[styles.gameBadge, { backgroundColor: 'rgba(22, 160, 133, 0.15)', borderColor: 'rgba(22, 160, 133, 0.3)' }]}>
                <Text style={[styles.gameBadgeText, { color: '#16A085' }]}>4-DIGIT</Text>
              </View>
              <Text style={styles.gameName}>{pick4Name}</Text>
              {latest4 && (
                <View style={styles.drawTimeBadge}>
                  <Clock size={10} color={Colors.textMuted} />
                  <Text style={styles.drawTimeText}>
                    {latest4.drawTime === 'midday' ? 'Mid' : 'Eve'}
                  </Text>
                </View>
              )}
            </View>

            {latest4 ? (
              <>
                <View style={styles.numbersRow}>
                  {latest4.numbers.map((num, idx) => (
                    <View key={`p4-${idx}`} style={[styles.digitBall, styles.digitBall4]}>
                      <Text style={[styles.digitBallText, { color: '#16A085' }]}>{num}</Text>
                    </View>
                  ))}
                  {latest4.fireball != null && (
                    <>
                      <View style={styles.fireballSep}>
                        <Flame size={12} color="#FF6B35" />
                      </View>
                      <View style={[styles.digitBall, styles.fireballBall]}>
                        <Text style={styles.fireballText}>{latest4.fireball}</Text>
                      </View>
                    </>
                  )}
                </View>
                <Text style={styles.drawDate}>{latest4.drawDate}</Text>

                {recent4Draws.length > 1 && (
                  <View style={styles.recentList}>
                    <Text style={styles.recentLabel}>Recent</Text>
                    {recent4Draws.slice(1).map((d, idx) => (
                      <View key={`r4-${idx}`} style={styles.recentRow}>
                        <Text style={styles.recentNums}>{d.numbers.join(' - ')}</Text>
                        <Text style={styles.recentMeta}>
                          {d.drawTime === 'midday' ? 'Mid' : 'Eve'} · {d.drawDate.slice(5)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {hot4.length > 0 && (
                  <View style={styles.hotRow}>
                    <Flame size={12} color={Colors.amber} />
                    <Text style={styles.hotLabel}>Hot:</Text>
                    {hot4.map((h) => (
                      <View key={`h4-${h.digit}`} style={styles.hotChip}>
                        <Text style={styles.hotChipText}>{h.digit}</Text>
                        <Text style={styles.hotChipCount}>{h.count}x</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.noData}>No data available</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.green,
    marginLeft: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.green,
    letterSpacing: 0.5,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  loadingWrap: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  content: {
    gap: 12,
  },
  gameCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  gameBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.8,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  drawTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  drawTimeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digitBall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  digitBall3: {
    backgroundColor: 'rgba(155, 89, 182, 0.1)',
    borderColor: 'rgba(155, 89, 182, 0.35)',
  },
  digitBall4: {
    backgroundColor: 'rgba(22, 160, 133, 0.1)',
    borderColor: 'rgba(22, 160, 133, 0.35)',
  },
  digitBallText: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
  fireballSep: {
    marginHorizontal: 2,
  },
  fireballBall: {
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderColor: 'rgba(255, 107, 53, 0.4)',
  },
  fireballText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FF6B35',
  },
  drawDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  recentList: {
    gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 10,
    padding: 10,
  },
  recentLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  recentNums: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  recentMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  hotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  hotLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.amber,
  },
  hotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
  },
  hotChipText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.amber,
  },
  hotChipCount: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  noData: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
