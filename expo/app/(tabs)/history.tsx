import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Brain, ChevronRight, Clock, Crown, Database, Flame, Scale, Share2, ShoppingBag, Snowflake, Trash2, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ARCADE_COLORS } from '@/constants/arcade';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { GAME_CONFIGS } from '@/constants/games';
import { useGamification } from '@/providers/GamificationProvider';
import { useLotto } from '@/providers/LottoProvider';

import { GeneratedSet, StrategyType } from '@/types/lottery';
import { shareReferral } from '@/utils/share';

function getStrategyIcon(strategy: StrategyType) {
  switch (strategy) {
    case 'hot':
      return <Flame size={14} color={Colors.amber} />;
    case 'cold':
      return <Snowflake size={14} color={Colors.blue} />;
    case 'balanced':
      return <Scale size={14} color={Colors.green} />;
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, clearHistory } = useLotto();
  const { referralCode, referralCount, trackShare } = useGamification();

  const handleShareReferral = useCallback(async () => {
    const shared = await shareReferral(referralCode);

    if (shared) {
      trackShare();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [referralCode, trackShare]);


  const renderItem = useCallback(({ item }: { item: GeneratedSet }) => {
    const config = GAME_CONFIGS[item.game];

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardInfo}>
            <View style={[styles.gameDot, { backgroundColor: config.color }]} />
            <Text style={styles.gameName}>{config.name}</Text>
            <View style={styles.strategyTag}>
              {getStrategyIcon(item.strategy)}
              <Text style={styles.strategyText}>
                {item.strategy.charAt(0).toUpperCase() + item.strategy.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.numbersRow}>
          {item.numbers.map((num) => (
            <View key={`${item.id}-${num}`} style={styles.numBall}>
              <Text style={styles.numText}>{num}</Text>
            </View>
          ))}
          <Text style={styles.plus}>+</Text>
          <View style={[styles.numBall, styles.bonusBall]}>
            <Text style={styles.bonusText}>{item.bonusNumber}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Brain size={14} color={Colors.gold} />
            <Text style={styles.metaPillText}>{item.prediction.confidence}% confidence</Text>
          </View>
          <View style={styles.metaPill}>
            <Database size={14} color={Colors.gold} />
            <Text style={styles.metaPillText}>
              {item.prediction.source === 'live-ml' ? 'Live ML blend' : 'Fallback model'}
            </Text>
          </View>
        </View>

        <View style={styles.reasonList}>
          {item.prediction.reasons.map((reason) => (
            <Text key={`${item.id}-${reason}`} style={styles.reasonText}>
              • {reason}
            </Text>
          ))}
        </View>
      </View>
    );
  }, []);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Clock size={22} color={Colors.gold} />
        <Text style={styles.title}>Prediction History</Text>
        {history.length > 0 ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearHistory}
            activeOpacity={0.7}
            testID="clear-history"
          >
            <Trash2 size={16} color={Colors.red} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.merchStoreBar}
        onPress={() => router.push('/shop')}
        activeOpacity={0.78}
        testID="history-merch-store"
      >
        <View style={styles.merchStoreIcon}>
          <ShoppingBag size={18} color="#07101F" />
        </View>
        <View style={styles.merchStoreCopy}>
          <Text style={styles.merchStoreTitle}>Merch Store</Text>
          <Text style={styles.merchStoreSubtitle}>T-shirts, books, and LottoMind drops</Text>
        </View>
        <ChevronRight size={18} color={Colors.gold} />
      </TouchableOpacity>

      <View style={styles.inviteRewardsCard}>
        <View style={styles.inviteHeader}>
          <View style={styles.inviteIconWrap}>
            <Crown size={20} color="#FFD700" />
          </View>
          <View style={styles.inviteHeaderCopy}>
            <Text style={styles.inviteTitle}>Invite Friends, Earn Rewards</Text>
            <Text style={styles.inviteSub}>Arcade squad rewards: +100 XP and +5 credits per invite.</Text>
          </View>
        </View>
        <View style={styles.inviteCodeRow}>
          <View style={styles.inviteCodeBox}>
            <Text style={styles.inviteCodeLabel}>Your code</Text>
            <Text style={styles.inviteCodeText}>{referralCode}</Text>
          </View>
          <View style={styles.inviteStatsBox}>
            <Users size={15} color={ARCADE_COLORS.teal} />
            <Text style={styles.inviteStatsText}>{referralCount} invited</Text>
          </View>
        </View>
        <View style={styles.inviteActions}>
          <TouchableOpacity
            style={styles.invitePrimaryButton}
            onPress={() => { void handleShareReferral(); }}
            activeOpacity={0.78}
            testID="history-share-invite-btn"
          >
            <Share2 size={16} color="#1A1200" />
            <Text style={styles.invitePrimaryText}>Share Invite Link</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inviteSecondaryButton}
            onPress={() => router.push('/profile' as never)}
            activeOpacity={0.78}
            testID="history-referral-profile-btn"
          >
            <Text style={styles.inviteSecondaryText}>Rewards</Text>
            <ChevronRight size={15} color={ARCADE_COLORS.gold} />
          </TouchableOpacity>
        </View>
        <Text style={styles.inviteFinePrint}>Rewards are in-app credits, XP, badges, and unlocks only.</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Clock size={40} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No Predictions Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your saved live-model number sets will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.gold,
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.redMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.red,
  },
  merchStoreBar: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 2,
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  merchStoreIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchStoreCopy: {
    flex: 1,
    gap: 2,
  },
  merchStoreTitle: {
    fontSize: 15,
    fontWeight: '900' as const,
    color: Colors.gold,
  },
  merchStoreSubtitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  inviteRewardsCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(8, 18, 40, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.24)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.28)',
  },
  inviteHeaderCopy: {
    flex: 1,
    gap: 3,
  },
  inviteTitle: {
    color: '#FFD700',
    fontSize: 17,
    fontWeight: '900' as const,
  },
  inviteSub: {
    color: ARCADE_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  inviteCodeBox: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 201, 95, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 201, 95, 0.18)',
  },
  inviteCodeLabel: {
    color: ARCADE_COLORS.muted,
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  inviteCodeText: {
    marginTop: 5,
    color: ARCADE_COLORS.gold,
    fontSize: 18,
    fontWeight: '900' as const,
  },
  inviteStatsBox: {
    minWidth: 104,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.16)',
  },
  inviteStatsText: {
    color: ARCADE_COLORS.text,
    fontSize: 12,
    fontWeight: '800' as const,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  invitePrimaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
  },
  invitePrimaryText: {
    color: '#1A1200',
    fontSize: 14,
    fontWeight: '900' as const,
  },
  inviteSecondaryButton: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  inviteSecondaryText: {
    color: ARCADE_COLORS.gold,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  inviteFinePrint: {
    marginTop: 10,
    color: ARCADE_COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  gameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  strategyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  strategyText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  numBall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  numText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  bonusBall: {
    backgroundColor: Colors.redMuted,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.red,
  },
  plus: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  reasonList: {
    gap: 6,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
