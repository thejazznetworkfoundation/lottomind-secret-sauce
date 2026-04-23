import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  X,
  Zap,
  Crown,
  Gift,
  Play,
  ChevronRight,
  Coins,
  ShoppingBag,
  Radio,
  Sparkles,
  Ticket,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMonetization } from '@/providers/MonetizationProvider';
import { CREDIT_PACKS } from '@/constants/monetization';
import AppBackground from '@/components/AppBackground';

type MarketplaceLane = {
  title: string;
  subtitle: string;
  detail: string;
  actionLabel: string;
  accent: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  route?: string;
};

type RecordDrop = {
  title: string;
  format: string;
  detail: string;
  priceCredits: number;
  accent: string;
  tags: string[];
};

const MARKETPLACE_LANES: MarketplaceLane[] = [
  {
    title: 'Credit Vault',
    subtitle: 'Top up instantly',
    detail: 'Reload your balance, protect your workflow, and keep premium tools live.',
    actionLabel: 'Browse vault packs',
    accent: '#FFD700',
    icon: Coins,
  },
  {
    title: 'Arcade Rewards',
    subtitle: 'Play to earn',
    detail: 'Vault Run, Gothtechnology, trivia, and mobile runs all feed your credit balance.',
    actionLabel: 'Open arcade',
    accent: '#00E5FF',
    icon: Play,
    route: '/arcade',
  },
  {
    title: 'Power Tool Access',
    subtitle: 'Spend smarter',
    detail: 'Use credits on scanner workflows, dream tools, AI picks, and advanced reports.',
    actionLabel: 'View power tools',
    accent: '#31F7C8',
    icon: Sparkles,
    route: '/powertools',
  },
];

const RECORD_DROPS: RecordDrop[] = [
  {
    title: 'Vault Run OST',
    format: 'Arcade soundtrack',
    detail: 'A jungle-tech chase score built for arcade sessions, trailers, and live promo loops.',
    priceCredits: 420,
    accent: '#8A7BFF',
    tags: ['Arcade', 'Synth', 'Loop Pack'],
  },
  {
    title: 'Oracle Nights',
    format: 'Focus session',
    detail: 'Late-night LottoMind ambience for dream study, journaling, and quiet number work.',
    priceCredits: 260,
    accent: '#4DD6FF',
    tags: ['Ambient', 'Dreams', 'Focus'],
  },
  {
    title: 'Lucky Frequency Sessions',
    format: 'Record drop',
    detail: 'Branded audio art for promos, lounges, and stream-ready LottoMind showcase reels.',
    priceCredits: 340,
    accent: '#F9C74F',
    tags: ['Promo', 'Branding', 'Live Mix'],
  },
];

export default function CreditStoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    monthlyCreditsRemaining,
    monthlyCreditsTotal,
    purchasedCredits,
    totalAvailableCredits,
    creditUsagePercent,
    isLowCredits,
    plan,
    rewardedAdsWatchedToday,
    buyCreditPack,
    watchRewardedAd,
  } = useMonetization();

  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const usagePercent = useMemo(
    () => Math.max(0, Math.min(100, creditUsagePercent)),
    [creditUsagePercent]
  );

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [glowAnim, scaleAnim]);

  const handleBuyPack = useCallback(
    (packId: string) => {
      const pack = CREDIT_PACKS.find((entry) => entry.id === packId);
      if (!pack) {
        return;
      }

      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      Alert.alert(`Buy ${pack.name}`, `Purchase ${pack.credits} credits for $${pack.price}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: () => {
            buyCreditPack(pack);
            Alert.alert('Credits Added', `${pack.credits} credits have been added to your account.`);
          },
        },
      ]);
    },
    [buyCreditPack]
  );

  const handleWatchAd = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }

    const result = watchRewardedAd();
    Alert.alert(result.success ? 'Credits Earned' : 'Unavailable', result.message);
  }, [watchRewardedAd]);

  const handleOpenRoute = useCallback(
    (route: string) => {
      if (Platform.OS !== 'web') {
        void Haptics.selectionAsync();
      }
      router.push(route as never);
    },
    [router]
  );

  const handleOpenVaultLane = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }

    Alert.alert(
      'Credit Vault',
      'Scroll down for vault packs, or open the arcade to earn more Mind Credits through play.'
    );
  }, []);

  const handleRecordDrop = useCallback((drop: RecordDrop) => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }

    Alert.alert(
      drop.title,
      `Reserve this ${drop.format.toLowerCase()} for ${drop.priceCredits} credits. Checkout can be connected next if you want to make these record drops fully purchasable.`
    );
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.65],
  });

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
        testID="credit-store-close"
      >
        <X size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroSection, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.View style={[styles.heroGlow, { opacity: glowOpacity }]} />
          <View style={styles.heroBadgeRow}>
            <View style={styles.marketBadge}>
              <ShoppingBag size={14} color="#07101F" />
              <Text style={styles.marketBadgeText}>Mind Marketplace</Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{plan.toUpperCase()} PLAN</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Store</Text>
          <Text style={styles.headerSub}>
            The Credit Vault, game rewards, premium tools, and LottoMind Record Store all live in one marketplace.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Available Now</Text>
              <Text style={styles.heroStatValue}>{totalAvailableCredits}</Text>
              <Text style={styles.heroStatHint}>Mind Credits ready to use</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Monthly Fuel</Text>
              <Text style={styles.heroStatValue}>
                {monthlyCreditsRemaining}/{monthlyCreditsTotal}
              </Text>
              <Text style={styles.heroStatHint}>{usagePercent}% charged this cycle</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Credit Vault Balance</Text>
              <Text style={styles.balanceValue}>{totalAvailableCredits}</Text>
            </View>
            <View style={styles.balanceChip}>
              <Coins size={16} color={Colors.gold} />
              <Text style={styles.balanceChipText}>Live wallet</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${usagePercent}%` }]} />
          </View>

          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Monthly credits</Text>
              <Text style={styles.balanceItemValue}>
                {monthlyCreditsRemaining}/{monthlyCreditsTotal}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Vault reserve</Text>
              <Text style={styles.balanceItemValue}>{purchasedCredits}</Text>
            </View>
          </View>

          {isLowCredits ? (
            <Text style={styles.warningText}>Low balance warning: grab a pack or earn more credits in the arcade.</Text>
          ) : (
            <Text style={styles.balanceSupportText}>Your wallet is healthy and ready for tools, games, and premium drops.</Text>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Marketplace Lanes</Text>
          <Text style={styles.sectionHint}>Jump into the area you need</Text>
        </View>

        {MARKETPLACE_LANES.map((lane) => {
          const Icon = lane.icon;
          const handlePress = lane.route
            ? () => handleOpenRoute(lane.route!)
            : handleOpenVaultLane;

          return (
            <TouchableOpacity
              key={lane.title}
              style={[styles.laneCard, { borderColor: `${lane.accent}33` }]}
              onPress={handlePress}
              activeOpacity={0.84}
            >
              <View style={[styles.laneIconWrap, { backgroundColor: `${lane.accent}14`, borderColor: `${lane.accent}30` }]}>
                <Icon size={22} color={lane.accent} />
              </View>
              <View style={styles.laneCopy}>
                <Text style={[styles.laneSubtitle, { color: lane.accent }]}>{lane.subtitle}</Text>
                <Text style={styles.laneTitle}>{lane.title}</Text>
                <Text style={styles.laneDetail}>{lane.detail}</Text>
                <Text style={styles.laneAction}>{lane.actionLabel}</Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Credit Vault</Text>
          <Text style={styles.sectionHint}>Top-up packs</Text>
        </View>

        {CREDIT_PACKS.map((pack) => {
          const perCredit = (pack.price / pack.credits).toFixed(3);
          const isBestValue = pack.id === 'credits_2000';

          return (
            <TouchableOpacity
              key={pack.id}
              style={[styles.packCard, isBestValue && styles.packCardBest]}
              onPress={() => handleBuyPack(pack.id)}
              activeOpacity={0.85}
              testID={`pack-${pack.id}`}
            >
              {isBestValue ? (
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
              ) : null}
              <View style={styles.packLeft}>
                <View style={styles.packIconWrap}>
                  <Zap size={22} color={Colors.gold} />
                </View>
                <View style={styles.packInfo}>
                  <Text style={styles.packName}>{pack.name}</Text>
                  <Text style={styles.packMeta}>${perCredit}/credit • Rollover credits</Text>
                </View>
              </View>
              <View style={styles.packPriceWrap}>
                <Text style={styles.packPrice}>${pack.price}</Text>
                <Text style={styles.packCredits}>{pack.credits} cr</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Free Ways To Earn</Text>
          <Text style={styles.sectionHint}>Daily boosts and play loops</Text>
        </View>

        {plan === 'free' ? (
          <>
            <TouchableOpacity
              style={styles.earnCard}
              onPress={handleWatchAd}
              activeOpacity={0.85}
              testID="watch-ad-btn"
            >
              <View style={[styles.earnIconWrap, { backgroundColor: 'rgba(46, 204, 113, 0.12)' }]}>
                <Gift size={22} color="#2ECC71" />
              </View>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Watch Ad For 3 Credits</Text>
                <Text style={styles.earnDetail}>Daily limit used: {rewardedAdsWatchedToday}/5</Text>
              </View>
              <Text style={[styles.earnBadge, { color: '#2ECC71' }]}>FREE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.earnCard}
              onPress={() => handleOpenRoute('/arcade')}
              activeOpacity={0.85}
              testID="trivia-credits-btn"
            >
              <View style={[styles.earnIconWrap, { backgroundColor: 'rgba(0, 229, 255, 0.12)' }]}>
                <Play size={22} color="#00E5FF" />
              </View>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Play LottoMind Arcade</Text>
                <Text style={styles.earnDetail}>Stack credits through cabinet play, trivia, and mobile challenges.</Text>
              </View>
              <Text style={styles.earnBadge}>PLAY</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.memberEarnCard}>
            <View style={[styles.earnIconWrap, { backgroundColor: 'rgba(255, 215, 0, 0.12)' }]}>
              <Crown size={22} color="#FFD700" />
            </View>
            <View style={styles.earnInfo}>
              <Text style={styles.earnTitle}>Member Priority Wallet</Text>
              <Text style={styles.earnDetail}>
                Your {plan.toUpperCase()} plan already includes monthly credits and access to higher-value workflows.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>LottoMind Record Store</Text>
          <Text style={styles.sectionHint}>Audio drops and branded music packs</Text>
        </View>

        {RECORD_DROPS.map((drop) => (
          <TouchableOpacity
            key={drop.title}
            style={[styles.recordCard, { borderColor: `${drop.accent}35` }]}
            onPress={() => handleRecordDrop(drop)}
            activeOpacity={0.86}
          >
            <View style={[styles.recordIconWrap, { backgroundColor: `${drop.accent}18`, borderColor: `${drop.accent}33` }]}>
              <Radio size={20} color={drop.accent} />
            </View>
            <View style={styles.recordInfo}>
              <Text style={[styles.recordFormat, { color: drop.accent }]}>{drop.format}</Text>
              <Text style={styles.recordTitle}>{drop.title}</Text>
              <Text style={styles.recordDetail}>{drop.detail}</Text>
              <View style={styles.recordTagRow}>
                {drop.tags.map((tag) => (
                  <View key={`${drop.title}-${tag}`} style={styles.recordTag}>
                    <Text style={styles.recordTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.recordPriceWrap}>
              <Ticket size={16} color={Colors.gold} />
              <Text style={styles.recordPrice}>{drop.priceCredits} cr</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.upgradePrompt}
          onPress={() => {
            router.back();
            setTimeout(() => router.push('/paywall' as never), 200);
          }}
          activeOpacity={0.85}
        >
          <Crown size={20} color="#FFD700" />
          <View style={styles.upgradePromptInfo}>
            <Text style={styles.upgradePromptTitle}>Want a bigger monthly vault?</Text>
            <Text style={styles.upgradePromptSub}>Upgrade your plan for up to 4,000 credits each month.</Text>
          </View>
          <ChevronRight size={18} color={Colors.gold} />
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Credits never expire. Monthly credits reset each billing cycle. Purchased credits roll over. LottoMind™ is for
          entertainment only. No results are guaranteed.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute' as const,
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  heroSection: {
    overflow: 'hidden',
    borderRadius: 28,
    padding: 20,
    gap: 14,
    backgroundColor: 'rgba(12, 17, 31, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  heroGlow: {
    position: 'absolute' as const,
    right: -36,
    top: -28,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  marketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.gold,
  },
  marketBadgeText: {
    color: '#07101F',
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planBadgeText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.6,
  },
  headerSub: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroStatCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: Colors.gold,
  },
  heroStatHint: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '800' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  balanceValue: {
    marginTop: 6,
    fontSize: 38,
    fontWeight: '900' as const,
    color: Colors.gold,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  balanceChipText: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: '800' as const,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.surfaceHighlight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.gold,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceItem: {
    flex: 1,
    gap: 4,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '700' as const,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  balanceDivider: {
    width: 1,
    height: 34,
    backgroundColor: Colors.border,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#F5A623',
    fontWeight: '700' as const,
  },
  balanceSupportText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  sectionHint: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  laneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
  },
  laneIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  laneCopy: {
    flex: 1,
    gap: 3,
  },
  laneSubtitle: {
    fontSize: 11,
    fontWeight: '900' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  laneTitle: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
  },
  laneDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  laneAction: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  packCardBest: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  bestValueBadge: {
    position: 'absolute' as const,
    top: -9,
    right: 14,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '900' as const,
    color: '#111111',
    letterSpacing: 0.6,
  },
  packLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  packIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packInfo: {
    flex: 1,
    gap: 2,
  },
  packName: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  packMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  packPriceWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  packPrice: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.gold,
  },
  packCredits: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  earnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberEarnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  earnIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnInfo: {
    flex: 1,
    gap: 3,
  },
  earnTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  earnDetail: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  earnBadge: {
    fontSize: 11,
    fontWeight: '900' as const,
    color: Colors.goldLight,
    letterSpacing: 0.8,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(11, 14, 24, 0.98)',
    borderWidth: 1,
  },
  recordIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  recordInfo: {
    flex: 1,
    gap: 4,
  },
  recordFormat: {
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.textPrimary,
  },
  recordDetail: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  recordTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  recordTag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  recordTagText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  recordPriceWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 74,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  recordPrice: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: '900' as const,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  upgradePromptInfo: {
    flex: 1,
    gap: 2,
  },
  upgradePromptTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  upgradePromptSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
    marginTop: 8,
  },
});
