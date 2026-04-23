import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Trophy, ChevronRight, Rocket, Zap, Star, Award, X, Grid3x3, Search, Gamepad2, Share2, ShoppingBag, Dice5, Layers, HelpCircle, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import GlossyButton from '@/components/GlossyButton';
import { useGamification } from '@/providers/GamificationProvider';
import { useTrivia } from '@/providers/TriviaProvider';
import {
  DAILY_STREAK_BONUS_THRESHOLD,
  DAILY_STREAK_BONUS_CREDITS,
  WEEKLY_STREAK_BONUS_THRESHOLD,
} from '@/mocks/triviaQuestions';

const EMERALD_DARK = '#0D3B12';
const EMERALD_BG = '#0A2E0F';
const GOLD_BRIGHT = '#FFD700';
const CARD_BG = 'rgba(13, 59, 18, 0.85)';
const CARD_BORDER = 'rgba(212, 175, 55, 0.35)';

export default function TriviaRewardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { credits } = useGamification();
  const { data, getStreakBonusInfo, hasPlayedToday } = useTrivia();
  const [helpExpanded, setHelpExpanded] = useState<boolean>(false);
  const helpRotate = useRef(new Animated.Value(0)).current;

  const streakInfo = useMemo(() => getStreakBonusInfo(), [getStreakBonusInfo]);

  const coinPulse = useRef(new Animated.Value(1)).current;
  const bannerGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(coinPulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(coinPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bannerGlow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(bannerGlow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [coinPulse, bannerGlow]);

  const glowOpacity = bannerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15],
  });

  const dailyChecks = useMemo(() => {
    const checks: boolean[] = [];
    for (let i = 0; i < DAILY_STREAK_BONUS_THRESHOLD; i++) {
      checks.push(i < streakInfo.dailyProgress);
    }
    return checks;
  }, [streakInfo.dailyProgress]);

  const weeklyChecks = useMemo(() => {
    const checks: boolean[] = [];
    for (let i = 0; i < WEEKLY_STREAK_BONUS_THRESHOLD; i++) {
      checks.push(i < streakInfo.weeklyProgress);
    }
    return checks;
  }, [streakInfo.weeklyProgress]);

  const handlePlayTrivia = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/trivia-play' as never);
  };

  const handlePlayArcade = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/arcade' as never);
  };

  const handlePlayCrossword = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/crossword' as never);
  };

  const handlePlayWordSearch = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/word-search' as never);
  };

  const handlePlayLudo = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/ludo' as never);
  };

  const handlePlayCardGame = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/card-game' as never);
  };

  const toggleHelp = () => {
    setHelpExpanded(prev => !prev);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  };

  const handleRedeemCredits = () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    router.push('/trivia-redeem' as never);
  };

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <Animated.View style={[styles.bgGlow, { opacity: glowOpacity }]} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            testID="trivia-close"
          >
            <X size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerIcon}>🧠</Text>
            <Text style={styles.headerTitle}>LottoMind</Text>
          </View>
          <View style={styles.headerBadge}>
            <Trophy size={14} color={GOLD_BRIGHT} />
          </View>
        </View>

        <View style={styles.subHeader}>
          <Gamepad2 size={18} color={GOLD_BRIGHT} />
          <Text style={styles.subHeaderTitle}>Games & Rewards</Text>
          <Gamepad2 size={18} color={GOLD_BRIGHT} />
        </View>
        <Text style={styles.subHeaderSub}>Play Games, Earn Mind Credits!</Text>

        <View style={styles.mainCard}>
          <View style={styles.cardGlowBorder} />
          <Text style={styles.cardSectionTitle}>Trivia Rewards</Text>
          <View style={styles.creditsPerDifficultyRow}>
            <View style={styles.difficultyChip}>
              <Text style={styles.difficultyChipLabel}>Easy</Text>
              <Text style={[styles.difficultyChipValue, { color: '#2ECC71' }]}>+5</Text>
            </View>
            <View style={styles.difficultyChip}>
              <Text style={styles.difficultyChipLabel}>Medium</Text>
              <Text style={[styles.difficultyChipValue, { color: GOLD_BRIGHT }]}>+10</Text>
            </View>
            <View style={styles.difficultyChip}>
              <Text style={styles.difficultyChipLabel}>Hard</Text>
              <Text style={[styles.difficultyChipValue, { color: '#FF6B35' }]}>+25</Text>
            </View>
          </View>

          <View style={styles.streakRow}>
            <View style={styles.streakBox}>
              <Text style={styles.streakBoxTitle}>Daily Streak</Text>
              <View style={styles.checksRow}>
                {dailyChecks.map((checked, i) => (
                  <View key={`d-${i}`} style={[styles.checkCircle, checked && styles.checkCircleActive]}>
                    {checked ? (
                      <Text style={styles.checkMark}>✓</Text>
                    ) : (
                      <Text style={styles.checkEmpty}>○</Text>
                    )}
                  </View>
                ))}
              </View>
              <Text style={styles.streakCount}>{data.dailyStreak} Day Streak</Text>
            </View>

            <View style={styles.streakBox}>
              <Text style={styles.streakBoxTitle}>Weekly Streak</Text>
              <View style={styles.checksRow}>
                {weeklyChecks.slice(0, 4).map((checked, i) => (
                  <View key={`w-${i}`} style={[styles.checkCircle, checked && styles.checkCircleWeekly]}>
                    {checked ? (
                      <Text style={styles.checkMarkGreen}>✓</Text>
                    ) : (
                      <Text style={styles.checkEmpty}>○</Text>
                    )}
                  </View>
                ))}
              </View>
              <Text style={styles.streakCount}>{data.weeklyStreak} / 7 Days</Text>
            </View>
          </View>
        </View>

        <View style={styles.creditsDisplay}>
          <View style={styles.creditsInner}>
            <Text style={styles.creditsLabel}>You have: </Text>
            <Animated.Text style={[styles.creditsAmount, { transform: [{ scale: coinPulse }] }]}>
              {credits}
            </Animated.Text>
            <Text style={styles.creditsLabel}> Credits</Text>
            <Text style={styles.coinsEmoji}> 🪙</Text>
          </View>
        </View>

        <GlossyButton
          onPress={handleRedeemCredits}
          label="Redeem Credits"
          icon={<Award size={18} color="#FFFFFF" />}
          testID="redeem-credits-btn"
          variant="green"
          size="medium"
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Streak Rewards</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.bonusRow}>
          <View style={styles.bonusCard}>
            <View style={styles.bonusCardGlow} />
            <View style={styles.bonusHeader}>
              <Star size={14} color={GOLD_BRIGHT} />
              <Text style={styles.bonusTitle}>{DAILY_STREAK_BONUS_THRESHOLD} Day Bonus</Text>
            </View>
            <Text style={styles.bonusAmount}>+{DAILY_STREAK_BONUS_CREDITS} Credits</Text>
            <Text style={styles.bonusEmoji}>🎁</Text>
            {streakInfo.dailyBonusEarned && (
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedBadgeText}>EARNED!</Text>
              </View>
            )}
          </View>

          <View style={styles.bonusCardSuper}>
            <View style={styles.bonusCardSuperGlow} />
            <View style={styles.bonusHeader}>
              <Rocket size={14} color="#FF6B35" />
              <Text style={styles.bonusTitleSuper}>7 Day Super Bonus</Text>
            </View>
            <Text style={styles.bonusAmountSuper}>1 FREE</Text>
            <Text style={styles.bonusAmountSuperLabel}>BOOSTER</Text>
            <Text style={styles.bonusSubtext}>Boost your streak!</Text>
            {streakInfo.weeklyBonusEarned && (
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedBadgeText}>EARNED!</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Play Games</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.helpSection}>
          <TouchableOpacity
            style={styles.helpDropdownHeader}
            onPress={toggleHelp}
            activeOpacity={0.7}
            testID="help-dropdown-toggle"
          >
            <View style={styles.helpDropdownLeft}>
              <HelpCircle size={18} color={GOLD_BRIGHT} />
              <Text style={styles.helpDropdownTitle}>How Rewards Work</Text>
            </View>
            <View style={{ transform: [{ rotate: helpExpanded ? '180deg' : '0deg' }] }}>
              <ChevronDown size={18} color={GOLD_BRIGHT} />
            </View>
          </TouchableOpacity>
          {helpExpanded && (
            <View style={styles.helpContent}>
              <View style={styles.helpItem}>
                <Text style={styles.helpEmoji}>🎮</Text>
                <View style={styles.helpItemText}>
                  <Text style={styles.helpItemTitle}>Play Games</Text>
                  <Text style={styles.helpItemDesc}>Every game earns Mind Credits. Trivia gives +5 (Easy), +10 (Medium), or +25 (Hard) per correct answer. Arcade runs can earn larger score-based rewards.</Text>
                </View>
              </View>
              <View style={styles.helpItem}>
                <Text style={styles.helpEmoji}>🔥</Text>
                <View style={styles.helpItemText}>
                  <Text style={styles.helpItemTitle}>Daily Streak</Text>
                  <Text style={styles.helpItemDesc}>Play every day to build your streak. Hit 3 days for a bonus! 7 days earns a FREE booster.</Text>
                </View>
              </View>
              <View style={styles.helpItem}>
                <Text style={styles.helpEmoji}>🪙</Text>
                <View style={styles.helpItemText}>
                  <Text style={styles.helpItemTitle}>Earn Credits</Text>
                  <Text style={styles.helpItemDesc}>Credits unlock premium features like Live Data (150), Horoscope (100), Ticket Scanner (250), and more.</Text>
                </View>
              </View>
              <View style={styles.helpItem}>
                <Text style={styles.helpEmoji}>🛍️</Text>
                <View style={styles.helpItemText}>
                  <Text style={styles.helpItemTitle}>Shop & Earn</Text>
                  <Text style={styles.helpItemDesc}>Buy merchandise in the Shop and earn bonus Mind Credits with every purchase!</Text>
                </View>
              </View>
              <View style={styles.helpItem}>
                <Text style={styles.helpEmoji}>📤</Text>
                <View style={styles.helpItemText}>
                  <Text style={styles.helpItemTitle}>Share & Post</Text>
                  <Text style={styles.helpItemDesc}>Every time you post or share content in Viral Studio, you earn +5 Mind Credits.</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.viralStudioCard}
          onPress={handlePlayArcade}
          activeOpacity={0.85}
          testID="play-lottomind-arcade-btn"
        >
          <View style={styles.viralStudioGlow} />
          <View style={[styles.gameIconWrap, { backgroundColor: 'rgba(191, 115, 255, 0.12)', borderColor: 'rgba(191, 115, 255, 0.3)' }]}>
            <Gamepad2 size={24} color="#BF73FF" />
          </View>
          <View style={styles.viralStudioInfo}>
            <Text style={styles.viralStudioTitle}>LottoMind Arcade</Text>
            <Text style={styles.viralStudioDesc}>Gem Rush, Jackpot Chase, Classic Jungle & Gothtechnology</Text>
          </View>
          <View style={[styles.gameCardBadge, { backgroundColor: 'rgba(191, 115, 255, 0.15)', borderColor: 'rgba(191, 115, 255, 0.3)' }]}>
            <Text style={[styles.gameCardBadgeText, { color: '#BF73FF' }]}>EARN</Text>
          </View>
          <ChevronRight size={16} color="#BF73FF" />
        </TouchableOpacity>

        <View style={styles.gamesGrid}>
          <TouchableOpacity
            style={styles.gameCard}
            onPress={handlePlayTrivia}
            activeOpacity={0.85}
            testID="play-trivia-btn"
          >
            <View style={styles.gameCardGlow} />
            <View style={[styles.gameIconWrap, { backgroundColor: 'rgba(46, 204, 113, 0.12)', borderColor: 'rgba(46, 204, 113, 0.3)' }]}>
              <Zap size={24} color="#2ECC71" />
            </View>
            <Text style={styles.gameCardTitle}>Trivia</Text>
            <Text style={styles.gameCardDesc}>Answer questions</Text>
            <View style={[styles.gameCardBadge, { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderColor: 'rgba(46, 204, 113, 0.3)' }]}>
              <Text style={[styles.gameCardBadgeText, { color: '#2ECC71' }]}>5-25 per Q</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={handlePlayCrossword}
            activeOpacity={0.85}
            testID="play-crossword-btn"
          >
            <View style={styles.gameCardGlow} />
            <View style={[styles.gameIconWrap, { backgroundColor: 'rgba(155, 89, 182, 0.12)', borderColor: 'rgba(155, 89, 182, 0.3)' }]}>
              <Grid3x3 size={24} color="#9B59B6" />
            </View>
            <Text style={styles.gameCardTitle}>Crossword</Text>
            <Text style={styles.gameCardDesc}>25 puzzles</Text>
            <View style={[styles.gameCardBadge, { backgroundColor: 'rgba(155, 89, 182, 0.15)', borderColor: 'rgba(155, 89, 182, 0.3)' }]}>
              <Text style={[styles.gameCardBadgeText, { color: '#9B59B6' }]}>10-30 🪙</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={handlePlayWordSearch}
            activeOpacity={0.85}
            testID="play-wordsearch-btn"
          >
            <View style={styles.gameCardGlow} />
            <View style={[styles.gameIconWrap, { backgroundColor: 'rgba(52, 152, 219, 0.12)', borderColor: 'rgba(52, 152, 219, 0.3)' }]}>
              <Search size={24} color="#3498DB" />
            </View>
            <Text style={styles.gameCardTitle}>Word Search</Text>
            <Text style={styles.gameCardDesc}>Find hidden words</Text>
            <View style={[styles.gameCardBadge, { backgroundColor: 'rgba(52, 152, 219, 0.15)', borderColor: 'rgba(52, 152, 219, 0.3)' }]}>
              <Text style={[styles.gameCardBadgeText, { color: '#3498DB' }]}>10-30 🪙</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.gamesGrid}>
          <TouchableOpacity
            style={styles.gameCard}
            onPress={handlePlayLudo}
            activeOpacity={0.85}
            testID="play-ludo-btn"
          >
            <View style={styles.gameCardGlow} />
            <View style={[styles.gameIconWrap, { backgroundColor: 'rgba(231, 76, 60, 0.12)', borderColor: 'rgba(231, 76, 60, 0.3)' }]}>
              <Dice5 size={24} color="#E74C3C" />
            </View>
            <Text style={styles.gameCardTitle}>Ludo Dice</Text>
            <Text style={styles.gameCardDesc}>Roll & score</Text>
            <View style={[styles.gameCardBadge, { backgroundColor: 'rgba(231, 76, 60, 0.15)', borderColor: 'rgba(231, 76, 60, 0.3)' }]}>
              <Text style={[styles.gameCardBadgeText, { color: '#E74C3C' }]}>+15 🪙</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameCard}
            onPress={handlePlayCardGame}
            activeOpacity={0.85}
            testID="play-card-game-btn"
          >
            <View style={styles.gameCardGlow} />
            <View style={[styles.gameIconWrap, { backgroundColor: 'rgba(241, 196, 15, 0.12)', borderColor: 'rgba(241, 196, 15, 0.3)' }]}>
              <Layers size={24} color="#F1C40F" />
            </View>
            <Text style={styles.gameCardTitle}>Memory</Text>
            <Text style={styles.gameCardDesc}>Card matching</Text>
            <View style={[styles.gameCardBadge, { backgroundColor: 'rgba(241, 196, 15, 0.15)', borderColor: 'rgba(241, 196, 15, 0.3)' }]}>
              <Text style={[styles.gameCardBadgeText, { color: '#F1C40F' }]}>15-25 🪙</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.gameCardPlaceholder} />
        </View>

        <TouchableOpacity
          style={styles.viralStudioCard}
          onPress={() => {
            if (Platform.OS !== 'web') {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            router.push('/viral-studio' as never);
          }}
          activeOpacity={0.85}
          testID="play-viral-studio-btn"
        >
          <View style={styles.viralStudioGlow} />
          <View style={[styles.gameIconWrap, { backgroundColor: 'rgba(255, 69, 0, 0.12)', borderColor: 'rgba(255, 69, 0, 0.3)' }]}>
            <Share2 size={24} color="#FF4500" />
          </View>
          <View style={styles.viralStudioInfo}>
            <Text style={styles.viralStudioTitle}>Viral Studio</Text>
            <Text style={styles.viralStudioDesc}>Post & share to earn Mind Credits</Text>
          </View>
          <View style={[styles.gameCardBadge, { backgroundColor: 'rgba(255, 69, 0, 0.15)', borderColor: 'rgba(255, 69, 0, 0.3)' }]}>
            <Text style={[styles.gameCardBadgeText, { color: '#FF4500' }]}>+5 🪙</Text>
          </View>
          <ChevronRight size={16} color="#FF4500" />
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Shop & Earn</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.shopCard}
          onPress={() => {
            if (Platform.OS !== 'web') {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            router.push('/shop' as never);
          }}
          activeOpacity={0.85}
          testID="shop-card-btn"
        >
          <View style={styles.shopCardGlow} />
          <View style={[styles.gameIconWrap, { backgroundColor: 'rgba(212, 175, 55, 0.12)', borderColor: 'rgba(212, 175, 55, 0.3)' }]}>
            <ShoppingBag size={24} color={GOLD_BRIGHT} />
          </View>
          <View style={styles.shopCardInfo}>
            <Text style={styles.shopCardTitle}>LottoMind Shop</Text>
            <Text style={styles.shopCardDesc}>Buy merch & earn bonus Mind Credits with every purchase</Text>
          </View>
          <View style={[styles.gameCardBadge, { backgroundColor: 'rgba(212, 175, 55, 0.15)', borderColor: 'rgba(212, 175, 55, 0.3)' }]}>
            <Text style={[styles.gameCardBadgeText, { color: GOLD_BRIGHT }]}>EARN 🪙</Text>
          </View>
          <ChevronRight size={16} color={GOLD_BRIGHT} />
        </TouchableOpacity>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Game Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.totalCorrect}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.totalAttempted}</Text>
              <Text style={styles.statLabel}>Attempted</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {data.totalAttempted > 0 ? Math.round((data.totalCorrect / data.totalAttempted) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.totalPointsEarned}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.leaderboardCard}
          onPress={handleRedeemCredits}
          activeOpacity={0.7}
          testID="unlock-menu-btn"
        >
          <View style={styles.leaderboardLeft}>
            <Award size={20} color={GOLD_BRIGHT} />
            <View>
              <Text style={styles.leaderboardTitle}>Credits & Unlock Menu</Text>
              <Text style={styles.leaderboardSub}>Spend credits on premium features</Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.gold} />
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
  bgGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 94, 32, 0.3)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
    letterSpacing: -0.3,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  subHeaderTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  subHeaderSub: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 215, 0, 0.8)',
    textAlign: 'center',
    marginTop: -8,
  },
  mainCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    overflow: 'hidden',
  },
  cardGlowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.08)',
  },
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  creditsPerAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsPerAnswerGold: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  creditsPerAnswerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  creditsPerDifficultyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  difficultyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  difficultyChipLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  difficultyChipValue: {
    fontSize: 14,
    fontWeight: '900' as const,
  },
  streakRow: {
    flexDirection: 'row',
    gap: 10,
  },
  streakBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  streakBoxTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checksRow: {
    flexDirection: 'row',
    gap: 6,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  checkCircleActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: GOLD_BRIGHT,
  },
  checkCircleWeekly: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    borderColor: '#2ECC71',
  },
  checkMark: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  checkMarkGreen: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#2ECC71',
  },
  checkEmpty: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.2)',
  },
  streakCount: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  creditsDisplay: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  creditsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  creditsAmount: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: GOLD_BRIGHT,
  },
  coinsEmoji: {
    fontSize: 22,
  },
  redeemButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  redeemButtonText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  bonusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bonusCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  bonusCardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bonusTitle: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  bonusAmount: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: GOLD_BRIGHT,
  },
  bonusEmoji: {
    fontSize: 28,
  },
  bonusCardSuper: {
    flex: 1,
    backgroundColor: 'rgba(13, 30, 59, 0.85)',
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  bonusCardSuperGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 107, 53, 0.04)',
  },
  bonusTitleSuper: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FF6B35',
  },
  bonusAmountSuper: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  bonusAmountSuperLabel: {
    fontSize: 14,
    fontWeight: '900' as const,
    color: '#FF6B35',
    marginTop: -2,
  },
  bonusSubtext: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  earnedBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.4)',
    marginTop: 4,
  },
  earnedBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#2ECC71',
    letterSpacing: 0.5,
  },
  playButton: {
    backgroundColor: GOLD_BRIGHT,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
    shadowColor: GOLD_BRIGHT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  playButtonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: EMERALD_DARK,
  },
  statsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: GOLD_BRIGHT,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  leaderboardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  leaderboardSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600' as const,
  },
  gamesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  gameCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  gameCardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.02)',
  },
  gameIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  gameCardTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  gameCardDesc: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  gameCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  gameCardBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
  },
  viralStudioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 69, 0, 0.3)',
    overflow: 'hidden',
  },
  viralStudioGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 69, 0, 0.03)',
  },
  viralStudioInfo: {
    flex: 1,
    gap: 2,
  },
  viralStudioTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FF4500',
  },
  viralStudioDesc: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  gameCardPlaceholder: {
    flex: 1,
  },
  helpSection: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    backgroundColor: CARD_BG,
  },
  helpDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  helpDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  helpDropdownTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  helpContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  helpEmoji: {
    fontSize: 20,
    marginTop: 2,
  },
  helpItemText: {
    flex: 1,
    gap: 2,
  },
  helpItemTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  helpItemDesc: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 17,
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    overflow: 'hidden',
  },
  shopCardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.03)',
  },
  shopCardInfo: {
    flex: 1,
    gap: 2,
  },
  shopCardTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  shopCardDesc: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
