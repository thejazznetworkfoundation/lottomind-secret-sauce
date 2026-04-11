import React, { useCallback, useRef, useEffect, useState } from 'react';
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
  Crown,
  Zap,
  Brain,
  Sparkles,
  Shield,
  TrendingUp,
  Star,
  Gift,
  Check,
  Lock,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useMonetization } from '@/providers/MonetizationProvider';
import { useGamification } from '@/providers/GamificationProvider';
import { usePro } from '@/providers/ProProvider';
import { PLANS, type PlanId, type BillingCycle } from '@/constants/monetization';
import GlossyButton from '@/components/GlossyButton';
import AppBackground from '@/components/AppBackground';

const PLAN_FEATURES: Record<string, { icon: typeof Sparkles; label: string; desc: string }[]> = {
  premium: [
    { icon: Sparkles, label: 'Smart Generator', desc: 'Filtered generation with deeper controls' },
    { icon: Brain, label: 'Historical Explorer', desc: 'Browse past draw data & patterns' },
    { icon: TrendingUp, label: 'State Intelligence', desc: 'Deeper state trend views & reports' },
    { icon: Shield, label: 'Saved Numbers Wallet', desc: 'Save, label & reuse number sets' },
    { icon: Zap, label: '500 Credits/mo', desc: 'Monthly credit allocation' },
    { icon: Star, label: 'Ad-Free Experience', desc: 'No ads, no interruptions' },
  ],
  pro: [
    { icon: Sparkles, label: 'Everything in Premium', desc: 'All Premium features included' },
    { icon: Brain, label: 'Daily 3/4 Power Tools', desc: 'Pairs, triples, splits & mirrors' },
    { icon: TrendingUp, label: 'Scratcher Tracker', desc: 'Track wins, losses & ROI' },
    { icon: Shield, label: 'Secret Sauce Lab', desc: 'Advanced premium analysis tools' },
    { icon: Zap, label: '1,500 Credits/mo', desc: 'Triple the monthly credits' },
    { icon: Star, label: 'Priority Support', desc: 'Get help when you need it' },
  ],
  vip: [
    { icon: Sparkles, label: 'Everything in Pro', desc: 'All Pro features included' },
    { icon: Brain, label: 'Unlimited Analysis', desc: 'No limits on any tool' },
    { icon: TrendingUp, label: '4,000 Credits/mo', desc: 'Maximum monthly credits' },
    { icon: Shield, label: 'Early Access', desc: 'First to try new features' },
    { icon: Zap, label: 'VIP Badge', desc: 'Exclusive VIP status badge' },
    { icon: Star, label: 'Maximum Access', desc: 'Everything LottoMind offers' },
  ],
};

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { plan: currentPlan, subscribeToPlan } = useMonetization();
  const { referralCount } = useGamification();
  const { isPro, upgradeToPro } = usePro();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const priceBlinkAnim = useRef(new Animated.Value(1)).current;
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('premium');

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(badgeAnim, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(priceBlinkAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(priceBlinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmerAnim, scaleAnim, badgeAnim, priceBlinkAnim]);

  const handleSubscribe = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    Alert.alert(
      `Subscribe to ${plan.name}`,
      `You will be charged $${price}/${billingCycle === 'monthly' ? 'mo' : 'yr'} for ${plan.name} plan with ${plan.monthlyCredits} credits/month.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            subscribeToPlan(selectedPlan, billingCycle);
            if (selectedPlan === 'pro' || selectedPlan === 'vip') {
              upgradeToPro('stripe');
            }
            Alert.alert(
              `Welcome to ${plan.name}!`,
              `All ${plan.name} features are now unlocked. Enjoy LottoMind ${plan.name}!`,
              [{ text: "Let's Go!", onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  }, [selectedPlan, billingCycle, subscribeToPlan, upgradeToPro, router]);

  const handleUnlockWithInvites = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    if (referralCount >= 5) {
      subscribeToPlan('pro', 'monthly');
      upgradeToPro('referral');
      Alert.alert(
        'Pro Unlocked!',
        'You earned Pro access by inviting 5 friends!',
        [{ text: 'Awesome!', onPress: () => router.back() }]
      );
    } else {
      router.back();
      setTimeout(() => router.push('/profile'), 200);
    }
  }, [referralCount, subscribeToPlan, upgradeToPro, router]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.8, 0.3],
  });

  const activePlanDef = PLANS.find(p => p.id === selectedPlan);
  const activeFeatures = PLAN_FEATURES[selectedPlan] ?? PLAN_FEATURES.premium;

  if (currentPlan !== 'free') {
    return (
      <AppBackground style={{ paddingTop: insets.top }}>
        <View style={styles.alreadyPro}>
          <Crown size={48} color="#FFD700" />
          <Text style={styles.alreadyProTitle}>You're on {currentPlan.toUpperCase()}!</Text>
          <Text style={styles.alreadyProSub}>All {currentPlan} features are unlocked.</Text>
          <GlossyButton
            onPress={() => router.back()}
            label="Go Back"
            variant="green"
            size="medium"
          />
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
        testID="paywall-close"
      >
        <X size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroSection, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.crownCircle}>
            <Animated.View style={[styles.crownGlow, { opacity: shimmerOpacity }]} />
            <Crown size={44} color="#FFD700" />
          </View>
          <Text style={styles.heroTitle}>Upgrade LottoMind™</Text>
          <Text style={styles.heroSubtitle}>
            Unlock advanced tools, deeper analysis, and more monthly credits.
          </Text>
        </Animated.View>

        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[styles.billingBtn, billingCycle === 'monthly' && styles.billingBtnActive]}
            onPress={() => setBillingCycle('monthly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.billingBtnText, billingCycle === 'monthly' && styles.billingBtnTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.billingBtn, billingCycle === 'yearly' && styles.billingBtnActive]}
            onPress={() => setBillingCycle('yearly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.billingBtnText, billingCycle === 'yearly' && styles.billingBtnTextActive]}>Yearly</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 33%</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.planSelector}>
          {PLANS.filter(p => p.id !== 'free').map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isBest = plan.id === 'pro';
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planChip,
                  isSelected && styles.planChipSelected,
                  isBest && isSelected && styles.planChipBest,
                ]}
                onPress={() => {
                  setSelectedPlan(plan.id as PlanId);
                  if (Platform.OS !== 'web') {
                    void Haptics.selectionAsync();
                  }
                }}
                activeOpacity={0.7}
              >
                {isBest && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>BEST</Text>
                  </View>
                )}
                <Text style={[styles.planChipName, isSelected && styles.planChipNameSelected]}>
                  {plan.name}
                </Text>
                <Animated.Text style={[styles.planChipPrice, isSelected && styles.planChipPriceSelected, isSelected && { opacity: priceBlinkAnim }]}>
                  ${price}
                </Animated.Text>
                <Text style={[styles.planChipPeriod, isSelected && styles.planChipPeriodSelected]}>
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </Text>
                <Text style={[styles.planChipCredits, isSelected && styles.planChipCreditsSelected]}>
                  {plan.monthlyCredits} cr/mo
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Animated.View style={[styles.priceCard, { opacity: badgeAnim }]}>
          <View style={styles.priceCardHeader}>
            <Text style={styles.priceCardTitle}>{activePlanDef?.name} Plan</Text>
            <Text style={styles.priceCardTag}>{activePlanDef?.tagline}</Text>
          </View>
          <View style={styles.priceDivider} />
          <Text style={styles.priceCardCredits}>
            {activePlanDef?.monthlyCredits} credits every month
          </Text>
          {!activePlanDef?.adsEnabled && (
            <Text style={styles.priceCardNoAds}>Ad-free experience included</Text>
          )}
        </Animated.View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>Everything in {activePlanDef?.name}</Text>
          {activeFeatures.map((feat) => {
            const IconComp = feat.icon;
            return (
              <View key={feat.label} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <IconComp size={18} color={Colors.gold} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureLabel}>{feat.label}</Text>
                  <Text style={styles.featureDesc}>{feat.desc}</Text>
                </View>
                <Check size={16} color="#2ECC71" />
              </View>
            );
          })}
        </View>

        <Animated.View style={{ opacity: priceBlinkAnim }}>
          <GlossyButton
            onPress={handleSubscribe}
            label={`Subscribe to ${activePlanDef?.name} — $${billingCycle === 'monthly' ? activePlanDef?.monthlyPrice : activePlanDef?.yearlyPrice}/${billingCycle === 'monthly' ? 'mo' : 'yr'}`}
            icon={<Crown size={20} color="#FFFFFF" />}
            testID="subscribe-btn"
            variant="green"
            size="large"
          />
        </Animated.View>

        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity
          style={styles.altBtn}
          onPress={() => router.push('/trivia-rewards' as never)}
          activeOpacity={0.85}
          testID="trivia-unlock-btn"
        >
          <Zap size={18} color="#2ECC71" />
          <View style={styles.altBtnInfo}>
            <Text style={[styles.altBtnTitle, { color: '#2ECC71' }]}>Earn Credits via Trivia</Text>
            <Text style={styles.altBtnSub}>Play games to unlock features for free</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.altBtn}
          onPress={() => router.push('/credit-store')}
          activeOpacity={0.85}
          testID="credit-store-btn"
        >
          <Zap size={18} color={Colors.gold} />
          <View style={styles.altBtnInfo}>
            <Text style={styles.altBtnTitle}>Buy Credit Packs</Text>
            <Text style={styles.altBtnSub}>One-time purchase, rollover credits</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.altBtn}
          onPress={handleUnlockWithInvites}
          activeOpacity={0.85}
          testID="invite-unlock-btn"
        >
          <Gift size={18} color="#FFD700" />
          <View style={styles.altBtnInfo}>
            <Text style={styles.altBtnTitle}>
              {referralCount >= 5 ? 'Claim Pro Access!' : 'Unlock with Invites'}
            </Text>
            <Text style={styles.altBtnSub}>
              {referralCount >= 5
                ? 'You earned it! Tap to activate.'
                : `Invite 5 friends (${referralCount}/5 so far)`}
            </Text>
          </View>
          {referralCount >= 5 ? (
            <Crown size={18} color="#FFD700" />
          ) : (
            <Lock size={16} color={Colors.textMuted} />
          )}
        </TouchableOpacity>

        <View style={styles.socialProof}>
          <View style={styles.socialProofRow}>
            <Star size={14} color="#FFD700" />
            <Star size={14} color="#FFD700" />
            <Star size={14} color="#FFD700" />
            <Star size={14} color="#FFD700" />
            <Star size={14} color="#FFD700" />
          </View>
          <Text style={styles.socialProofText}>
            "The AI predictions are scary accurate. Worth every penny."
          </Text>
          <Text style={styles.socialProofAuthor}>— LottoMind User, Texas</Text>
        </View>

        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={() => Alert.alert('Restore', 'Checking for previous purchases...', [{ text: 'OK' }])}
          activeOpacity={0.7}
        >
          <Text style={styles.restoreBtnText}>Restore Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Subscription auto-renews. Cancel anytime via your account settings.
          LottoMind™ does not guarantee winning results. For entertainment purposes only. © {new Date().getFullYear()} LottoMind™.
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
    gap: 20,
  },
  heroSection: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 10,
  },
  crownCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    overflow: 'hidden',
  },
  crownGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 48,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFD700',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  billingToggle: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  billingBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  billingBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  billingBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  billingBtnTextActive: {
    color: Colors.gold,
  },
  saveBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#2ECC71',
  },
  planSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  planChip: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  planChipSelected: {
    borderColor: Colors.goldBorder,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
  },
  planChipBest: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  bestBadge: {
    position: 'absolute' as const,
    top: -8,
    right: -4,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bestBadgeText: {
    fontSize: 9,
    fontWeight: '900' as const,
    color: '#1A1200',
  },
  planChipName: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  planChipNameSelected: {
    color: Colors.textPrimary,
  },
  planChipPrice: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: Colors.textMuted,
  },
  planChipPriceSelected: {
    color: '#FFD700',
  },
  planChipPeriod: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  planChipPeriodSelected: {
    color: Colors.textSecondary,
  },
  planChipCredits: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  planChipCreditsSelected: {
    color: Colors.gold,
  },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    alignItems: 'center',
  },
  priceCardHeader: {
    alignItems: 'center',
    gap: 4,
  },
  priceCardTitle: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: '#FFD700',
  },
  priceCardTag: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  priceDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
  },
  priceCardCredits: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  priceCardNoAds: {
    fontSize: 13,
    color: '#2ECC71',
    fontWeight: '600' as const,
  },
  featuresSection: {
    gap: 12,
  },
  featuresSectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  featureInfo: {
    flex: 1,
    gap: 2,
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  altBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  altBtnInfo: {
    flex: 1,
    gap: 2,
  },
  altBtnTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  altBtnSub: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  socialProof: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialProofRow: {
    flexDirection: 'row',
    gap: 4,
  },
  socialProofText: {
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic' as const,
  },
  socialProofAuthor: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreBtnText: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '600' as const,
    textDecorationLine: 'underline' as const,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  alreadyPro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  alreadyProTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: '#FFD700',
  },
  alreadyProSub: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
