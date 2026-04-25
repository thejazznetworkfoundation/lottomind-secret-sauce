import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  BookOpen,
  Shirt,
  Download,
  ExternalLink,
  Star,
  FileText,
  ShoppingBag,
  Sparkles,
  Tag,
  Coins,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { EBOOKS, TSHIRTS, type EBook, type TShirt } from '@/mocks/shopData';
import { useMonetization } from '@/providers/MonetizationProvider';

type ShopTab = 'merch' | 'ebooks';
const EBOOK_REWARD_PREFIX = 'lottomind_ebook_download_rewarded_';
const MERCH_CREDITS_PER_DOLLAR = 25;
const MERCH_CREDIT_DISCOUNT = 0.9;
const MERCH_CASH_REWARD_RATE = 0.1;

function parseCashPrice(price: string): number {
  const numeric = Number(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function getMerchCreditCost(price: string): number {
  return Math.max(1, Math.round(parseCashPrice(price) * MERCH_CREDITS_PER_DOLLAR * MERCH_CREDIT_DISCOUNT));
}

function getMerchCashReward(price: string): number {
  return Math.max(1, Math.round(parseCashPrice(price) * MERCH_CREDITS_PER_DOLLAR * MERCH_CASH_REWARD_RATE));
}

function getDownloadUrl(downloadUrl: string): string {
  if (Platform.OS === 'web' && downloadUrl.startsWith('/') && typeof globalThis.location !== 'undefined') {
    return `${globalThis.location.origin}${downloadUrl}`;
  }
  return downloadUrl;
}

function EBookCard({
  book,
  onRewardCredits,
}: {
  book: EBook;
  onRewardCredits: (amount: number) => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [hasEarnedReward, setHasEarnedReward] = useState(!book.creditReward);

  useEffect(() => {
    let isMounted = true;

    if (!book.creditReward) {
      setHasEarnedReward(true);
      return () => {
        isMounted = false;
      };
    }

    AsyncStorage.getItem(`${EBOOK_REWARD_PREFIX}${book.id}`)
      .then((value) => {
        if (isMounted) {
          setHasEarnedReward(value === 'true');
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasEarnedReward(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [book.creditReward, book.id]);

  const handlePress = useCallback(async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      if (book.creditReward && !hasEarnedReward) {
        onRewardCredits(book.creditReward);
        setHasEarnedReward(true);
        await AsyncStorage.setItem(`${EBOOK_REWARD_PREFIX}${book.id}`, 'true');
        Alert.alert('Credits Earned', `Downloaded ${book.title} and earned +${book.creditReward} LottoMind Credits.`);
      }

      const downloadUrl = getDownloadUrl(book.downloadUrl);
      await Linking.openURL(downloadUrl);
    } catch {
      Alert.alert('Download Error', 'Unable to open the download link. Please try again.');
    }
  }, [book.creditReward, book.downloadUrl, book.id, book.title, hasEarnedReward, onRewardCredits, scaleAnim]);

  const rewardLabel = book.creditReward
    ? hasEarnedReward
      ? 'Reward claimed'
      : `Earn +${book.creditReward} cr`
    : null;

  return (
    <Animated.View style={[styles.ebookCard, { transform: [{ scale: scaleAnim }] }]}>
      <Image source={{ uri: book.coverImage }} style={styles.ebookCover} />
      <View style={styles.ebookContent}>
        <View style={styles.ebookTopRow}>
          <Text style={styles.ebookTitle} numberOfLines={1}>{book.title}</Text>
          {book.tag && (
            <View style={[
              styles.tagBadge,
              book.tag === 'BESTSELLER' && styles.tagBestseller,
              book.tag === 'NEW' && styles.tagNew,
            ]}>
              <Text style={[
                styles.tagText,
                book.tag === 'BESTSELLER' && styles.tagBestsellerText,
                book.tag === 'NEW' && styles.tagNewText,
              ]}>{book.tag}</Text>
            </View>
          )}
        </View>
        <Text style={styles.ebookSubtitle} numberOfLines={1}>{book.subtitle}</Text>
        <Text style={styles.ebookDesc} numberOfLines={2}>{book.description}</Text>
        <View style={styles.ebookFooter}>
          <View style={styles.ebookMeta}>
            <FileText size={12} color={Colors.textMuted} />
            <Text style={styles.ebookPages}>{book.pages} pages</Text>
          </View>
          <View style={styles.ebookPriceRow}>
            {book.originalPrice && (
              <Text style={styles.ebookOrigPrice}>{book.originalPrice}</Text>
            )}
            <Text style={styles.ebookPrice}>{book.price}</Text>
          </View>
        </View>
        {rewardLabel ? (
          <View style={[styles.ebookRewardBadge, hasEarnedReward && styles.ebookRewardBadgeClaimed]}>
            <Coins size={12} color={hasEarnedReward ? Colors.textMuted : '#FFD700'} />
            <Text style={[styles.ebookRewardText, hasEarnedReward && styles.ebookRewardTextClaimed]}>
              {rewardLabel}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={handlePress}
          activeOpacity={0.8}
          testID={`ebook-download-${book.id}`}
        >
          <Download size={14} color="#1A1200" />
          <Text style={styles.downloadBtnText}>
            {book.creditReward && !hasEarnedReward ? `Download PDF +${book.creditReward} cr` : 'Download PDF'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

function TShirtCard({
  shirt,
  totalAvailableCredits,
  onCashReward,
  onSpendCredits,
}: {
  shirt: TShirt;
  totalAvailableCredits: number;
  onCashReward: (amount: number) => void;
  onSpendCredits: (amount: number, reason: string) => boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const creditCost = getMerchCreditCost(shirt.price);
  const cashRewardCredits = getMerchCashReward(shirt.price);
  const canBuyWithCredits = totalAvailableCredits >= creditCost;

  const handleCashPress = useCallback(async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      onCashReward(cashRewardCredits);
      await Linking.openURL(shirt.purchaseUrl);
    } catch {
      Alert.alert('Shop Error', 'Unable to open the store link. Please try again.');
    }
  }, [cashRewardCredits, onCashReward, shirt.purchaseUrl, scaleAnim]);

  const handleCreditPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const paid = onSpendCredits(creditCost, `${shirt.name} merch purchase`);
    if (!paid) {
      Alert.alert('More Credits Needed', `${shirt.name} takes ${creditCost} credits. You have ${totalAvailableCredits}.`);
      return;
    }

    Alert.alert('Merch Bought With Credits', `${creditCost} credits were used for ${shirt.name}.`);
  }, [creditCost, onSpendCredits, scaleAnim, shirt.name, totalAvailableCredits]);

  return (
    <Animated.View style={[styles.shirtCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.shirtImageWrap}>
        <Image source={{ uri: shirt.image }} style={styles.shirtImage} />
        {shirt.tag && (
          <View style={[
            styles.shirtTagBadge,
            shirt.tag === 'POPULAR' && styles.tagBestseller,
            shirt.tag === 'NEW' && styles.tagNew,
          ]}>
            <Text style={[
              styles.tagText,
              shirt.tag === 'POPULAR' && styles.tagBestsellerText,
              shirt.tag === 'NEW' && styles.tagNewText,
            ]}>{shirt.tag}</Text>
          </View>
        )}
      </View>
      <View style={styles.shirtContent}>
        <Text style={styles.shirtName} numberOfLines={1}>{shirt.name}</Text>
        <Text style={styles.shirtDesc} numberOfLines={2}>{shirt.description}</Text>
        <View style={styles.shirtSizesRow}>
          {shirt.sizes.map((size) => (
            <View key={size} style={styles.sizeChip}>
              <Text style={styles.sizeChipText}>{size}</Text>
            </View>
          ))}
        </View>
        <View style={styles.shirtColorsRow}>
          {shirt.colors.map((color) => (
            <View key={color} style={styles.colorChip}>
              <View style={[
                styles.colorDot,
                { backgroundColor: color === 'Black' ? '#1A1A1A' : color === 'Navy' ? '#1B2838' : '#333' },
              ]} />
              <Text style={styles.colorChipText}>{color}</Text>
            </View>
          ))}
        </View>
        <View style={styles.merchPriceGrid}>
          <View style={styles.merchPriceBox}>
            <Text style={styles.merchPriceLabel}>Cash</Text>
            <Text style={styles.shirtPrice}>{shirt.price}</Text>
            <Text style={styles.cashRewardText}>Earn +{cashRewardCredits} cr</Text>
          </View>
          <View style={[styles.merchPriceBox, styles.creditPriceBox]}>
            <Text style={styles.merchPriceLabel}>Credits</Text>
            <Text style={styles.creditPrice}>{creditCost} cr</Text>
            <Text style={styles.creditDiscountText}>10% less value</Text>
          </View>
        </View>
        <View style={styles.shirtFooter}>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={handleCashPress}
            activeOpacity={0.8}
            testID={`shirt-buy-${shirt.id}`}
          >
            <ShoppingBag size={14} color="#1A1200" />
            <Text style={styles.buyBtnText}>Cash +{cashRewardCredits} cr</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.creditBuyBtn, !canBuyWithCredits && styles.creditBuyBtnDisabled]}
            onPress={handleCreditPress}
            activeOpacity={0.8}
            testID={`shirt-credit-buy-${shirt.id}`}
          >
            <Coins size={14} color={canBuyWithCredits ? '#1A1200' : Colors.textMuted} />
            <Text style={[styles.creditBuyBtnText, !canBuyWithCredits && styles.creditBuyBtnTextDisabled]}>
              Use {creditCost} cr
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ShopTab>('merch');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { totalAvailableCredits, addPurchasedCredits, spendCredits } = useMonetization();

  const awardCredits = useCallback(
    (amount: number) => {
      addPurchasedCredits(amount);
    },
    [addPurchasedCredits]
  );

  const switchTab = useCallback((tab: ShopTab) => {
    if (tab === activeTab) return;
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === 'merch' ? 0 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [activeTab, slideAnim]);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          testID="shop-back-btn"
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Sparkles size={18} color={Colors.gold} />
          <Text style={styles.headerTitle}>LottoMind Shop</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.walletPill}>
            <Coins size={13} color={Colors.gold} />
            <Text style={styles.walletPillText}>{totalAvailableCredits}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'merch' && styles.tabActive]}
          onPress={() => switchTab('merch')}
          activeOpacity={0.7}
          testID="tab-merch"
        >
          <Shirt size={16} color={activeTab === 'merch' ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'merch' && styles.tabTextActive]}>
            T-Shirts & Merch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ebooks' && styles.tabActive]}
          onPress={() => switchTab('ebooks')}
          activeOpacity={0.7}
          testID="tab-ebooks"
        >
          <BookOpen size={16} color={activeTab === 'ebooks' ? Colors.gold : Colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'ebooks' && styles.tabTextActive]}>
            E-Books
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'ebooks' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <BookOpen size={20} color={Colors.gold} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>E-Book Library</Text>
                <Text style={styles.sectionSubtitle}>
                  Download strategy guides, dream decoding manuals, and winning playbooks
                </Text>
              </View>
            </View>

            <View style={styles.promoBar}>
              <Tag size={14} color="#FFD700" />
              <Text style={styles.promoText}>PDF downloads: read offline and earn credits on free guides</Text>
            </View>

            {EBOOKS.map((book) => (
              <EBookCard key={book.id} book={book} onRewardCredits={awardCredits} />
            ))}

            <View style={styles.bundleCard}>
              <View style={styles.bundleGlow} />
              <Star size={20} color="#FFD700" />
              <Text style={styles.bundleTitle}>Complete Bundle — All {EBOOKS.length} E-Books</Text>
              <View style={styles.bundlePriceRow}>
                <Text style={styles.bundleOrigPrice}>$37.96</Text>
                <Text style={styles.bundlePrice}>$24.99</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 34%</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.bundleBtn}
                onPress={async () => {
                  if (Platform.OS !== 'web') {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  }
                  try {
                    await Linking.openURL('https://example.com/ebooks/complete-bundle');
                  } catch {
                    Alert.alert('Error', 'Unable to open the bundle link.');
                  }
                }}
                activeOpacity={0.85}
                testID="bundle-download-btn"
              >
                <Download size={16} color="#1A1200" />
                <Text style={styles.bundleBtnText}>Get the Bundle</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Shirt size={20} color="#8B5CF6" />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Official Merch</Text>
                <Text style={styles.sectionSubtitle}>
                  Rep the LottoMind brand — premium tees, hoodies & gear
                </Text>
              </View>
            </View>

            <View style={styles.promoBar}>
              <ShoppingBag size={14} color="#FFD700" />
              <Text style={styles.promoText}>Cash buys earn credits. Credit buys are 10% less than cash value.</Text>
            </View>

            {TSHIRTS.map((shirt) => (
              <TShirtCard
                key={shirt.id}
                shirt={shirt}
                totalAvailableCredits={totalAvailableCredits}
                onCashReward={awardCredits}
                onSpendCredits={spendCredits}
              />
            ))}

            <View style={styles.merchNote}>
              <ExternalLink size={14} color={Colors.textMuted} />
              <Text style={styles.merchNoteText}>
                Purchases open in our secure merch store
              </Text>
            </View>
          </>
        )}

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
    paddingVertical: 14,
    gap: 12,
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: -0.3,
  },
  headerRight: {
    minWidth: 58,
    alignItems: 'flex-end',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  walletPillText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  tabText: {
    fontSize: 13,
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
    paddingTop: 20,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  sectionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  promoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.12)',
  },
  promoText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  ebookCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ebookCover: {
    width: 100,
    height: 160,
  },
  ebookContent: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  ebookTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ebookTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  ebookSubtitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  ebookDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  ebookFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  ebookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ebookPages: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  ebookPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ebookOrigPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'line-through' as const,
  },
  ebookPrice: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  ebookRewardBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.22)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ebookRewardBadgeClaimed: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.border,
  },
  ebookRewardText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  ebookRewardTextClaimed: {
    color: Colors.textMuted,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 4,
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  tagBestseller: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tagNew: {
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    borderColor: 'rgba(46, 204, 113, 0.25)',
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  tagBestsellerText: {
    color: '#FFD700',
  },
  tagNewText: {
    color: Colors.green,
  },
  bundleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    overflow: 'hidden',
  },
  bundleGlow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  bundleTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  bundlePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bundleOrigPrice: {
    fontSize: 16,
    color: Colors.textMuted,
    textDecorationLine: 'line-through' as const,
  },
  bundlePrice: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  saveBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.green,
    letterSpacing: 0.5,
  },
  bundleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  bundleBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  shirtCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shirtImageWrap: {
    position: 'relative' as const,
  },
  shirtImage: {
    width: '100%',
    height: 220,
  },
  shirtTagBadge: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shirtContent: {
    padding: 16,
    gap: 8,
  },
  shirtName: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  shirtDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  shirtSizesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sizeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sizeChipText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  shirtColorsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorChipText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  merchPriceGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  merchPriceBox: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  creditPriceBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderColor: Colors.goldBorder,
  },
  merchPriceLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
  },
  creditPrice: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  cashRewardText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.green,
  },
  creditDiscountText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  shirtFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  shirtPrice: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  buyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 11,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buyBtnText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  creditBuyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.45)',
  },
  creditBuyBtnDisabled: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.border,
  },
  creditBuyBtnText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  creditBuyBtnTextDisabled: {
    color: Colors.textMuted,
  },
  merchNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  merchNoteText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
});
