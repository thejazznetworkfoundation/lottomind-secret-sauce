import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Lock, Unlock, Zap, Gift, Star, ShoppingBag, Sparkles, ChevronRight, Crown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { useGamification } from '@/providers/GamificationProvider';
import { useTrivia } from '@/providers/TriviaProvider';
import { UNLOCKABLE_FEATURES, CREDIT_PACKS, type UnlockableFeature } from '@/mocks/triviaQuestions';
import { TSHIRTS } from '@/mocks/shopData';

const NEON_CYAN = '#00E5FF';
const NEON_GREEN = '#00E676';
const NEON_PINK = '#FF4081';
const GOLD_BRIGHT = '#FFD700';
const CARD_BG = 'rgba(12, 18, 28, 0.92)';
const SURFACE_DARK = 'rgba(16, 24, 38, 0.95)';

interface ShopItem {
  id: string;
  name: string;
  price: string;
  image: string;
  tag?: string;
  tagColor?: string;
}

const SHOP_ITEMS: ShopItem[] = TSHIRTS.slice(0, 4).map((t) => ({
  id: t.id,
  name: t.name,
  price: t.price,
  image: t.image,
  tag: t.tag,
  tagColor: t.tag === 'POPULAR' ? NEON_CYAN : t.tag === 'NEW' ? NEON_GREEN : undefined,
}));

export default function TriviaRedeemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { credits, addCredits, streakDays, level } = useGamification();
  const { unlockFeature, isFeatureUnlocked } = useTrivia();
  const [unlockedAnimation, setUnlockedAnimation] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'features' | 'shop' | 'credits'>('features');
  const unlockScale = useRef(new Animated.Value(1)).current;
  const headerGlow = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerGlow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(headerGlow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [headerGlow]);

  const handleUnlock = useCallback((feature: UnlockableFeature) => {
    if (isFeatureUnlocked(feature.id)) {
      Alert.alert('Already Unlocked', `${feature.name} is already unlocked!`);
      return;
    }
    if (credits < feature.cost) {
      Alert.alert('Not Enough Credits', `You need ${feature.cost - credits} more credits. Earn more by playing games!`);
      return;
    }

    Alert.alert(
      'Unlock Feature',
      `Spend ${feature.cost} credits to unlock ${feature.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock!',
          onPress: () => {
            const success = unlockFeature(feature.id);
            if (success) {
              setUnlockedAnimation(feature.id);
              if (Platform.OS !== 'web') {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Animated.sequence([
                Animated.timing(unlockScale, { toValue: 1.15, duration: 150, useNativeDriver: true }),
                Animated.timing(unlockScale, { toValue: 1, duration: 200, useNativeDriver: true }),
              ]).start();
              setTimeout(() => setUnlockedAnimation(null), 2000);
            }
          },
        },
      ],
    );
  }, [credits, isFeatureUnlocked, unlockFeature, unlockScale]);

  const handleBuyCredits = useCallback((packCredits: number, price: string) => {
    Alert.alert(
      'Purchase Credits',
      `Buy ${packCredits} credits for ${price}?\n\n(This is a demo — credits will be added for free)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: () => {
            addCredits(packCredits);
            if (Platform.OS !== 'web') {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert('Credits Added!', `+${packCredits} credits have been added to your balance.`);
          },
        },
      ],
    );
  }, [addCredits]);

  const handleShopPress = useCallback((item: ShopItem) => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    router.push('/shop');
  }, [router]);

  const glowOpacity = headerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          testID="redeem-close"
        >
          <X size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <ShoppingBag size={18} color={NEON_CYAN} />
          <Text style={styles.topBarTitle}>Lucky Number Shop</Text>
        </View>
        <View style={styles.creditsChip}>
          <Zap size={12} color={GOLD_BRIGHT} />
          <Text style={styles.creditsChipText}>{credits}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Animated.View style={[styles.heroGlow, { opacity: glowOpacity }]} />
          <View style={styles.heroTop}>
            <View style={styles.heroBalanceWrap}>
              <Text style={styles.heroBalanceLabel}>BALANCE</Text>
              <View style={styles.heroBalanceRow}>
                <Text style={styles.heroBalanceAmount}>{credits}</Text>
                <Text style={styles.heroBalanceCoin}>🪙</Text>
              </View>
            </View>
            <View style={styles.heroStatsCol}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{streakDays > 0 ? `${streakDays}d` : '—'}</Text>
                <Text style={styles.heroStatLabel}>Streak</Text>
              </View>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{level.icon}</Text>
                <Text style={styles.heroStatLabel}>Rank</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroProgressBar}>
            <View style={[styles.heroProgressFill, { width: `${Math.min((credits / 500) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.heroProgressText}>
            {credits >= 500 ? 'Max tier reached!' : `${500 - credits} credits to next tier`}
          </Text>
        </View>

        <View style={styles.sectionTabs}>
          {(['features', 'shop', 'credits'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.sectionTab, activeSection === tab && styles.sectionTabActive]}
              onPress={() => {
                setActiveSection(tab);
                if (Platform.OS !== 'web') void Haptics.selectionAsync();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionTabText, activeSection === tab && styles.sectionTabTextActive]}>
                {tab === 'features' ? 'Unlocks' : tab === 'shop' ? 'Merch' : 'Top Up'}
              </Text>
              {activeSection === tab && <View style={styles.sectionTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {activeSection === 'features' && (
          <View style={styles.featuresSection}>
            <View style={styles.sectionHeaderRow}>
              <Gift size={18} color={NEON_CYAN} />
              <Text style={styles.sectionTitle}>Unlockable Features</Text>
            </View>

            {UNLOCKABLE_FEATURES.map((feature) => {
              const unlocked = isFeatureUnlocked(feature.id);
              const canAfford = credits >= feature.cost;
              const justUnlocked = unlockedAnimation === feature.id;
              return (
                <Animated.View
                  key={feature.id}
                  style={[
                    styles.featureCard,
                    unlocked && styles.featureCardUnlocked,
                    justUnlocked && { transform: [{ scale: unlockScale }] },
                  ]}
                >
                  <View style={styles.featureIconWrap}>
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={[styles.featureName, unlocked && styles.featureNameUnlocked]}>
                      {feature.name}
                    </Text>
                    <Text style={styles.featureDesc}>{feature.description}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.featureAction,
                      unlocked && styles.featureActionUnlocked,
                      !unlocked && !canAfford && styles.featureActionDisabled,
                    ]}
                    onPress={() => handleUnlock(feature)}
                    activeOpacity={0.7}
                    disabled={unlocked}
                    testID={`unlock-${feature.id}`}
                  >
                    {unlocked ? (
                      <View style={styles.featureActionInner}>
                        <Unlock size={13} color={NEON_GREEN} />
                        <Text style={styles.featureActionUnlockedText}>Done</Text>
                      </View>
                    ) : (
                      <View style={styles.featureActionInner}>
                        <Lock size={13} color={canAfford ? '#0A0E14' : 'rgba(255,255,255,0.35)'} />
                        <Text style={[
                          styles.featureActionText,
                          !canAfford && styles.featureActionTextDisabled,
                        ]}>
                          {feature.cost}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

        {activeSection === 'shop' && (
          <View style={styles.shopSection}>
            <View style={styles.sectionHeaderRow}>
              <ShoppingBag size={18} color={NEON_PINK} />
              <Text style={styles.sectionTitle}>Lucky Number Merch</Text>
            </View>

            <View style={styles.shopGrid}>
              {SHOP_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.shopCard}
                  onPress={() => handleShopPress(item)}
                  activeOpacity={0.85}
                  testID={`shop-${item.id}`}
                >
                  <View style={styles.shopImageWrap}>
                    <Image source={{ uri: item.image }} style={styles.shopImage} resizeMode="cover" />
                    {item.tag && (
                      <View style={[styles.shopTagBadge, { backgroundColor: item.tagColor ?? NEON_CYAN }]}>
                        <Text style={styles.shopTagText}>{item.tag}</Text>
                      </View>
                    )}
                    <View style={styles.shopImageOverlay} />
                  </View>
                  <View style={styles.shopCardContent}>
                    <Text style={styles.shopItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.shopItemPrice}>{item.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.browseCollectionBtn}
              onPress={() => router.push('/shop')}
              activeOpacity={0.8}
              testID="browse-collection"
            >
              <View style={styles.browseCollectionGlow} />
              <Sparkles size={16} color={NEON_CYAN} />
              <Text style={styles.browseCollectionText}>Browse Full Collection</Text>
              <ChevronRight size={16} color={NEON_CYAN} />
            </TouchableOpacity>

            <View style={styles.limitedEditionCard}>
              <View style={styles.limitedEditionGlow} />
              <Crown size={20} color={GOLD_BRIGHT} />
              <Text style={styles.limitedEditionTitle}>LIMITED EDITION</Text>
              <Text style={styles.limitedEditionSub}>Jackpot Streak Collection — Coming Soon</Text>
              <View style={styles.limitedEditionBar}>
                <View style={styles.limitedEditionFill} />
              </View>
              <Text style={styles.limitedEditionProgress}>72% funded</Text>
            </View>
          </View>
        )}

        {activeSection === 'credits' && (
          <View style={styles.creditsSection}>
            <View style={styles.sectionHeaderRow}>
              <Zap size={18} color={GOLD_BRIGHT} />
              <Text style={styles.sectionTitle}>Top Up Credits</Text>
            </View>

            <View style={styles.packsGrid}>
              {CREDIT_PACKS.map((pack) => (
                <TouchableOpacity
                  key={pack.id}
                  style={[styles.packCard, pack.popular && styles.packCardPopular]}
                  onPress={() => handleBuyCredits(pack.credits, pack.price)}
                  activeOpacity={0.8}
                  testID={`pack-${pack.id}`}
                >
                  {pack.popular && (
                    <View style={styles.popularBadge}>
                      <Star size={10} color="#0A0E14" />
                      <Text style={styles.popularBadgeText}>BEST</Text>
                    </View>
                  )}
                  <Text style={styles.packCredits}>{pack.credits}</Text>
                  <Text style={styles.packCreditsLabel}>Credits</Text>
                  <View style={styles.packPriceWrap}>
                    <Text style={styles.packPrice}>{pack.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.earnInfoCard}>
              <View style={styles.earnInfoIcon}>
                <Zap size={18} color={GOLD_BRIGHT} />
              </View>
              <View style={styles.earnInfoContent}>
                <Text style={styles.earnInfoTitle}>Earn Free Credits</Text>
                <Text style={styles.earnInfoDesc}>
                  Play games daily, build streaks, and earn bonus credits. Streaks multiply your earnings!
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  creditsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  creditsChipText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 4,
  },
  heroCard: {
    backgroundColor: SURFACE_DARK,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    overflow: 'hidden',
    shadowColor: NEON_CYAN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  heroGlow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0, 229, 255, 0.04)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroBalanceWrap: {
    gap: 4,
  },
  heroBalanceLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
  },
  heroBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBalanceAmount: {
    fontSize: 42,
    fontWeight: '900' as const,
    color: GOLD_BRIGHT,
    letterSpacing: -1,
  },
  heroBalanceCoin: {
    fontSize: 28,
  },
  heroStatsCol: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  heroStatItem: {
    alignItems: 'center',
    gap: 3,
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  heroProgressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: NEON_CYAN,
  },
  heroProgressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center' as const,
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: SURFACE_DARK,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 11,
  },
  sectionTabActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  sectionTabText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.4)',
  },
  sectionTabTextActive: {
    color: NEON_CYAN,
  },
  sectionTabIndicator: {
    position: 'absolute' as const,
    bottom: 4,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: NEON_CYAN,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  featuresSection: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  featureCardUnlocked: {
    borderColor: 'rgba(0, 230, 118, 0.2)',
    backgroundColor: 'rgba(0, 230, 118, 0.04)',
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureInfo: {
    flex: 1,
    gap: 3,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  featureNameUnlocked: {
    color: NEON_GREEN,
  },
  featureDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.35)',
    fontWeight: '500' as const,
    lineHeight: 15,
  },
  featureAction: {
    backgroundColor: NEON_CYAN,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  featureActionUnlocked: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
  },
  featureActionDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureActionText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#0A0E14',
  },
  featureActionTextDisabled: {
    color: 'rgba(255, 255, 255, 0.35)',
  },
  featureActionUnlockedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: NEON_GREEN,
  },
  shopSection: {
    gap: 14,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shopCard: {
    width: '48%' as unknown as number,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  shopImageWrap: {
    position: 'relative' as const,
    overflow: 'hidden',
  },
  shopImage: {
    width: '100%',
    height: 140,
  },
  shopImageOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(12, 18, 28, 0.6)',
  },
  shopTagBadge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shopTagText: {
    fontSize: 8,
    fontWeight: '800' as const,
    color: '#0A0E14',
    letterSpacing: 0.8,
  },
  shopCardContent: {
    padding: 12,
    gap: 4,
  },
  shopItemName: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  shopItemPrice: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  browseCollectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    overflow: 'hidden',
  },
  browseCollectionGlow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.03)',
  },
  browseCollectionText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: NEON_CYAN,
  },
  limitedEditionCard: {
    backgroundColor: SURFACE_DARK,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    overflow: 'hidden',
  },
  limitedEditionGlow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.03)',
  },
  limitedEditionTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
    letterSpacing: 2,
  },
  limitedEditionSub: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
  },
  limitedEditionBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  limitedEditionFill: {
    width: '72%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: GOLD_BRIGHT,
  },
  limitedEditionProgress: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'rgba(255, 215, 0, 0.6)',
  },
  creditsSection: {
    gap: 14,
  },
  packsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  packCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  packCardPopular: {
    borderColor: NEON_CYAN,
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    shadowColor: NEON_CYAN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: NEON_CYAN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#0A0E14',
    letterSpacing: 0.5,
  },
  packCredits: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: GOLD_BRIGHT,
  },
  packCreditsLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  packPriceWrap: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    marginTop: 4,
  },
  packPrice: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: NEON_GREEN,
  },
  earnInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: SURFACE_DARK,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.12)',
  },
  earnInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  earnInfoContent: {
    flex: 1,
    gap: 4,
  },
  earnInfoTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: GOLD_BRIGHT,
  },
  earnInfoDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
