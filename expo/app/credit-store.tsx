import React, { useCallback, useRef, useEffect } from 'react';
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
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMonetization } from '@/providers/MonetizationProvider';
import { CREDIT_PACKS } from '@/constants/monetization';
import AppBackground from '@/components/AppBackground';
import GlossyButton from '@/components/GlossyButton';

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

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [scaleAnim, glowAnim]);

  const handleBuyPack = useCallback((packId: string) => {
    const pack = CREDIT_PACKS.find(p => p.id === packId);
    if (!pack) return;

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      `Buy ${pack.name}`,
      `Purchase ${pack.credits} credits for $${pack.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: () => {
            buyCreditPack(pack);
            Alert.alert('Credits Added!', `${pack.credits} credits have been added to your account.`);
          },
        },
      ]
    );
  }, [buyCreditPack]);

  const handleWatchAd = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    const result = watchRewardedAd();
    if (result.success) {
      Alert.alert('Credits Earned!', result.message);
    } else {
      Alert.alert('Unavailable', result.message);
    }
  }, [watchRewardedAd]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
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
        <Animated.View style={[styles.headerSection, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.coinCircle}>
            <Animated.View style={[styles.coinGlow, { opacity: glowOpacity }]} />
            <Coins size={40} color={Colors.gold} />
          </View>
          <Text style={styles.headerTitle}>Credit Store</Text>
          <Text style={styles.headerSub}>Recharge anytime to keep using advanced tools</Text>
        </Animated.View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Credits</Text>
          <Text style={styles.balanceValue}>{totalAvailableCredits}</Text>
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Monthly</Text>
              <Text style={styles.balanceItemValue}>{monthlyCreditsRemaining}/{monthlyCreditsTotal}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Purchased</Text>
              <Text style={styles.balanceItemValue}>{purchasedCredits}</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${creditUsagePercent}%` }]} />
          </View>
          {isLowCredits && (
            <Text style={styles.warningText}>Running low on monthly credits!</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Credit Packs</Text>

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
              {isBestValue && (
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
              )}
              <View style={styles.packIconWrap}>
                <Zap size={22} color={Colors.gold} />
              </View>
              <View style={styles.packInfo}>
                <Text style={styles.packName}>{pack.name}</Text>
                <Text style={styles.packMeta}>${perCredit}/credit · Rollover credits</Text>
              </View>
              <View style={styles.packPriceWrap}>
                <Text style={styles.packPrice}>${pack.price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {plan === 'free' && (
          <>
            <Text style={styles.sectionTitle}>Free Credits</Text>
            <TouchableOpacity
              style={styles.rewardedAdCard}
              onPress={handleWatchAd}
              activeOpacity={0.85}
              testID="watch-ad-btn"
            >
              <View style={[styles.packIconWrap, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                <Play size={22} color="#2ECC71" />
              </View>
              <View style={styles.packInfo}>
                <Text style={styles.packName}>Watch Ad for 3 Credits</Text>
                <Text style={styles.packMeta}>Daily limit: {rewardedAdsWatchedToday}/5 used</Text>
              </View>
              <View style={[styles.packPriceWrap, { backgroundColor: 'rgba(46, 204, 113, 0.12)' }]}>
                <Text style={[styles.packPrice, { color: '#2ECC71' }]}>FREE</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rewardedAdCard}
              onPress={() => router.push('/arcade' as never)}
              activeOpacity={0.85}
              testID="trivia-credits-btn"
            >
              <View style={[styles.packIconWrap, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
                <Gift size={22} color="#FFD700" />
              </View>
              <View style={styles.packInfo}>
                <Text style={styles.packName}>Play LottoMind Arcade</Text>
                <Text style={styles.packMeta}>Earn credits through arcade, trivia & games</Text>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.upgradePrompt}
          onPress={() => {
            router.back();
            setTimeout(() => router.push('/paywall'), 200);
          }}
          activeOpacity={0.85}
        >
          <Crown size={20} color="#FFD700" />
          <View style={styles.upgradePromptInfo}>
            <Text style={styles.upgradePromptTitle}>Want more monthly credits?</Text>
            <Text style={styles.upgradePromptSub}>Upgrade your plan for up to 4,000 credits/month</Text>
          </View>
          <ChevronRight size={18} color={Colors.gold} />
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Credits never expire. Monthly credits reset each billing cycle. Purchased credits roll over.
          LottoMind™ is for entertainment only. No results are guaranteed.
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
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 16,
  },
  headerSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
  },
  coinCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.goldBorder,
    overflow: 'hidden',
  },
  coinGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 44,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.gold,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '700' as const,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: '#FFD700',
  },
  balanceBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  balanceItem: {
    alignItems: 'center',
    gap: 2,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceHighlight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  warningText: {
    fontSize: 13,
    color: '#F5A623',
    fontWeight: '700' as const,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  packCardBest: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  bestValueBadge: {
    position: 'absolute' as const,
    top: -8,
    right: 12,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '900' as const,
    color: '#1A1200',
  },
  packIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packInfo: {
    flex: 1,
    gap: 3,
  },
  packName: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  packMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  packPriceWrap: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  packPrice: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.gold,
  },
  rewardedAdCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.border,
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
    marginTop: 4,
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
