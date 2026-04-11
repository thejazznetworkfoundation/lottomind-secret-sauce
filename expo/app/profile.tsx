import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Crown,
  Share2,
  Gift,
  Zap,
  Target,
  Flame,
  Copy,
  ChevronLeft,
  Star,
  Users,
  TrendingUp,
  Award,
  Ticket,
  Sun,
  Moon,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { useGamification } from '@/providers/GamificationProvider';
import { usePro } from '@/providers/ProProvider';
import { useMonetization } from '@/providers/MonetizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { LEVELS, REFERRAL_TIERS, XP_REWARDS } from '@/constants/gamification';
import { shareReferral } from '@/utils/share';
import { useLotto } from '@/providers/LottoProvider';
import { getStateConfig } from '@/config/states';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    xp,
    credits,
    level,
    nextLevel,
    progress,
    referralCode,
    referralCount,
    totalGenerations,
    totalShares,
    streakDays,
    trackShare,
    applyReferral,
  } = useGamification();
  const { pickState } = useLotto();
  const { isPro } = usePro();
  const {
    plan, planName, planTagline,
    billingCycle, renewalDate,
    monthlyCreditsRemaining, monthlyCreditsTotal,
    purchasedCredits, totalAvailableCredits,
    creditUsagePercent, isLowCredits,
  } = useMonetization();
  const { isDark, toggleTheme } = useTheme();
  const [referralInput, setReferralInput] = useState<string>('');
  const [showReferralInput, setShowReferralInput] = useState<boolean>(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const priceBlinkAnim = useRef(new Animated.Value(1)).current;
  const unlockBlinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    const priceBlink = Animated.loop(
      Animated.sequence([
        Animated.timing(priceBlinkAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(priceBlinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    priceBlink.start();
    const unlockBlink = Animated.loop(
      Animated.sequence([
        Animated.timing(unlockBlinkAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(unlockBlinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    unlockBlink.start();
    return () => { priceBlink.stop(); unlockBlink.stop(); };
  }, [priceBlinkAnim, unlockBlinkAnim]);

  const handleCopyCode = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    Alert.alert('Copied!', `Your referral code ${referralCode} has been copied.`);
  }, [referralCode]);

  const handleShareReferral = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    const shared = await shareReferral(referralCode);
    if (shared) {
      trackShare();
    }
  }, [referralCode, trackShare]);

  const handleApplyReferral = useCallback(() => {
    const code = referralInput.trim().toUpperCase();
    if (!code) return;
    const success = applyReferral(code);
    if (success) {
      Alert.alert('Referral Applied!', 'You earned 5 credits and 100 XP!');
      setReferralInput('');
      setShowReferralInput(false);
    } else {
      Alert.alert('Invalid Code', 'This code is invalid or you already used a referral.');
    }
  }, [referralInput, applyReferral]);

  const handleBuyTicket = useCallback(async () => {
    const stateConfig = getStateConfig(pickState);
    const url = stateConfig?.lotteryUrl ?? 'https://www.michiganlottery.com';
    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#D4AF37',
        toolbarColor: '#0A0A0A',
      });
    } catch (e) {
      console.log('[Profile] Failed to open lottery URL', e);
    }
  }, [pickState]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
        <Text style={styles.headerTitle}>Profile & Rewards</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.planInfoCard}>
          <View style={styles.planInfoHeader}>
            <Crown size={22} color="#FFD700" />
            <View style={styles.planInfoHeaderText}>
              <Text style={styles.planInfoTitle}>{planName} Plan</Text>
              <Text style={styles.planInfoTagline}>{planTagline}</Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{plan.toUpperCase()}</Text>
            </View>
          </View>
          {billingCycle && (
            <View style={styles.planBillingRow}>
              <Text style={styles.planBillingLabel}>Billing: {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</Text>
              <Text style={styles.planBillingLabel}>Renewal: {renewalDate ?? 'N/A'}</Text>
            </View>
          )}
          <View style={styles.planCreditsSection}>
            <Text style={styles.planCreditsLabel}>Credits</Text>
            <Text style={styles.planCreditsValue}>{totalAvailableCredits} available</Text>
            <View style={styles.planCreditsBreakdown}>
              <Text style={styles.planCreditsDetail}>Monthly: {monthlyCreditsRemaining}/{monthlyCreditsTotal}</Text>
              <Text style={styles.planCreditsDetail}>Purchased: {purchasedCredits}</Text>
            </View>
            <View style={styles.planCreditTrack}>
              <View style={[styles.planCreditFill, { width: `${Math.min(100, creditUsagePercent)}%` }]} />
            </View>
            {isLowCredits && <Text style={styles.planCreditWarning}>Running low on monthly credits!</Text>}
          </View>
          <View style={styles.planActions}>
            {plan === 'free' ? (
              <Animated.View style={{ opacity: unlockBlinkAnim, flex: 1 }}>
                <TouchableOpacity
                  style={styles.upgradeActionBtn}
                  onPress={() => router.push('/paywall')}
                  activeOpacity={0.85}
                  testID="upgrade-btn"
                >
                  <Crown size={16} color="#1A1200" />
                  <Text style={styles.upgradeActionBtnText}>Upgrade Plan</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => router.push('/paywall')}
                activeOpacity={0.85}
              >
                <Text style={styles.manageBtnText}>Manage Plan</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.creditStoreBtn}
              onPress={() => router.push('/credit-store')}
              activeOpacity={0.85}
              testID="credit-store-btn"
            >
              <Zap size={16} color={Colors.gold} />
              <Text style={styles.creditStoreBtnText}>Buy Credits</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.levelCard}>
          <View style={styles.levelIconWrap}>
            <Text style={styles.levelEmoji}>{level.icon}</Text>
          </View>
          <Text style={[styles.levelTitle, { color: level.color }]}>{level.title}</Text>
          <Text style={styles.levelSubtitle}>Level {level.level}</Text>

          <View style={styles.xpRow}>
            <Text style={styles.xpText}>{xp} XP</Text>
            {nextLevel && (
              <Text style={styles.xpGoal}>{nextLevel.minXP} XP to next</Text>
            )}
          </View>

          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: level.color },
              ]}
            />
          </View>

          <View style={styles.levelPreview}>
            {LEVELS.map((l) => (
              <View
                key={l.level}
                style={[
                  styles.levelDot,
                  xp >= l.minXP && styles.levelDotActive,
                  { borderColor: l.color },
                ]}
              >
                <Text style={styles.levelDotText}>{l.icon}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
              <Zap size={18} color={Colors.gold} />
            </View>
            <Text style={styles.statValue}>{credits}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(255, 107, 53, 0.1)' }]}>
              <Flame size={18} color="#FF6B35" />
            </View>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
              <Target size={18} color="#2ECC71" />
            </View>
            <Text style={styles.statValue}>{totalGenerations}</Text>
            <Text style={styles.statLabel}>Picks</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
              <Share2 size={18} color="#3498DB" />
            </View>
            <Text style={styles.statValue}>{totalShares}</Text>
            <Text style={styles.statLabel}>Shares</Text>
          </View>
        </View>

        <View style={styles.referralCard}>
          <View style={styles.referralHeader}>
            <Gift size={20} color="#FFD700" />
            <Text style={styles.referralTitle}>Invite & Earn</Text>
          </View>
          <Text style={styles.referralDesc}>
            Share your code with friends. Both of you earn credits and XP!
          </Text>

          <View style={styles.codeRow}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={handleCopyCode}
              activeOpacity={0.7}
            >
              <Copy size={18} color={Colors.gold} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shareReferralBtn}
            onPress={() => { void handleShareReferral(); }}
            activeOpacity={0.85}
            testID="share-referral-btn"
          >
            <Share2 size={16} color="#1A1200" />
            <Text style={styles.shareReferralText}>Share Invite Link</Text>
          </TouchableOpacity>

          <View style={styles.referralStats}>
            <Users size={14} color={Colors.textMuted} />
            <Text style={styles.referralStatsText}>
              {referralCount} friends invited
            </Text>
          </View>

          <TouchableOpacity
            style={styles.enterCodeBtn}
            onPress={() => setShowReferralInput(!showReferralInput)}
            activeOpacity={0.7}
          >
            <Text style={styles.enterCodeText}>Have a code? Enter it here</Text>
          </TouchableOpacity>

          {showReferralInput && (
            <View style={styles.referralInputRow}>
              <TextInput
                style={styles.referralInput}
                placeholder="LM-XXXXXX"
                placeholderTextColor={Colors.textMuted}
                value={referralInput}
                onChangeText={setReferralInput}
                autoCapitalize="characters"
                testID="referral-input"
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyReferral}
                activeOpacity={0.7}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.tiersCard}>
          <View style={styles.tiersHeader}>
            <Award size={18} color={Colors.gold} />
            <Text style={styles.tiersTitle}>Referral Rewards</Text>
          </View>
          {REFERRAL_TIERS.map((tier) => (
            <View
              key={tier.count}
              style={[
                styles.tierRow,
                referralCount >= tier.count && styles.tierRowCompleted,
              ]}
            >
              <View style={[
                styles.tierCheck,
                referralCount >= tier.count && styles.tierCheckDone,
              ]}>
                {referralCount >= tier.count ? (
                  <Star size={12} color="#FFD700" />
                ) : (
                  <Text style={styles.tierCheckText}>{tier.count}</Text>
                )}
              </View>
              <View style={styles.tierInfo}>
                <Text style={[
                  styles.tierReward,
                  referralCount >= tier.count && styles.tierRewardDone,
                ]}>
                  {tier.reward}
                </Text>
                <Text style={styles.tierGoal}>
                  Invite {tier.count} friend{tier.count > 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.tierCredits}>+{tier.credits}</Text>
            </View>
          ))}
        </View>

        <View style={styles.xpBreakdown}>
          <View style={styles.xpBreakdownHeader}>
            <TrendingUp size={18} color={Colors.gold} />
            <Text style={styles.xpBreakdownTitle}>How to Earn XP</Text>
          </View>
          {Object.entries(XP_REWARDS).map(([action, amount]) => (
            <View key={action} style={styles.xpItem}>
              <Text style={styles.xpAction}>
                {action.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              </Text>
              <Text style={styles.xpAmount}>+{amount} XP</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.themeToggleCard}
          onPress={() => {
            toggleTheme();
            if (Platform.OS !== 'web') {
              void Haptics.selectionAsync();
            }
          }}
          activeOpacity={0.7}
          testID="theme-toggle"
        >
          <View style={[styles.themeToggleIconWrap, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
            {isDark ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#6366F1" />}
          </View>
          <View style={styles.themeToggleInfo}>
            <Text style={styles.themeToggleTitle}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
            <Text style={styles.themeToggleSub}>Tap to switch to {isDark ? 'light' : 'dark'} mode</Text>
          </View>
          <View style={[styles.themeTogglePill, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)' }]}>
            <View style={[
              styles.themeToggleDot,
              { backgroundColor: isDark ? '#F59E0B' : '#6366F1', alignSelf: isDark ? 'flex-end' as const : 'flex-start' as const },
            ]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyTicketBtn}
          onPress={() => { void handleBuyTicket(); }}
          activeOpacity={0.85}
          testID="buy-ticket-btn"
        >
          <Ticket size={20} color="#1A1200" />
          <View style={styles.buyTicketInfo}>
            <Text style={styles.buyTicketText}>Buy Official Tickets</Text>
            <Text style={styles.buyTicketSub}>Opens your state lottery site</Text>
          </View>
          <Crown size={18} color="#1A1200" />
        </TouchableOpacity>

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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  levelCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  levelIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.goldBorder,
  },
  levelEmoji: {
    fontSize: 32,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  levelSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  xpGoal: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceHighlight,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelPreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  levelDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    opacity: 0.4,
  },
  levelDotActive: {
    opacity: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  levelDotText: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  referralCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  referralDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeBox: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: 2,
  },
  copyBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  shareReferralBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shareReferralText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  referralStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  referralStatsText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  enterCodeBtn: {
    alignItems: 'center',
  },
  enterCodeText: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '600' as const,
    textDecorationLine: 'underline',
  },
  referralInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  referralInput: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  applyBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  tiersCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tiersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tiersTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  tierRowCompleted: {
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  tierCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tierCheckDone: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tierCheckText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  tierInfo: {
    flex: 1,
    gap: 2,
  },
  tierReward: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  tierRewardDone: {
    color: '#FFD700',
  },
  tierGoal: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  tierCredits: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  xpBreakdown: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  xpBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  xpBreakdownTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  xpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  xpAction: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  xpAmount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  buyTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.gold,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  buyTicketInfo: {
    flex: 1,
    gap: 2,
  },
  buyTicketText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  buyTicketSub: {
    fontSize: 12,
    color: 'rgba(26, 18, 0, 0.6)',
    fontWeight: '600' as const,
  },
  planInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  planInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planInfoHeaderText: {
    flex: 1,
    gap: 2,
  },
  planInfoTitle: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: '#FFD700',
  },
  planInfoTagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  planBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '900' as const,
    color: '#FFD700',
  },
  planBillingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
  },
  planBillingLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  planCreditsSection: {
    gap: 8,
  },
  planCreditsLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '700' as const,
  },
  planCreditsValue: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFD700',
  },
  planCreditsBreakdown: {
    flexDirection: 'row',
    gap: 16,
  },
  planCreditsDetail: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  planCreditTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceHighlight,
    overflow: 'hidden',
  },
  planCreditFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  planCreditWarning: {
    fontSize: 12,
    color: '#F5A623',
    fontWeight: '700' as const,
  },
  planActions: {
    flexDirection: 'row',
    gap: 10,
  },
  upgradeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  upgradeActionBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  manageBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  manageBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  creditStoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.goldMuted,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  creditStoreBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  themeToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  themeToggleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleInfo: {
    flex: 1,
    gap: 2,
  },
  themeToggleTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  themeToggleSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  themeTogglePill: {
    width: 48,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  themeToggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
