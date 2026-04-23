import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Zap,
  Heart,
  Radio,
  Brain,
  TriangleAlert,
  ScanLine,
  ChevronRight,
  Hash,
  MapPin,
  Bell,
  BellOff,
  Trophy,
  DollarSign,
  Share2,
  Crown,
  Ticket,
  User,
  BarChart3,
  ShoppingBag,
  Sun,
  HelpCircle,
  Lock,
  Play,
  ChevronDown,
  CloudLightning,
  Grid3x3,
  Shield,
  BookOpen,
  X,
} from 'lucide-react-native';
import { useTrivia } from '@/providers/TriviaProvider';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { GAME_CONFIGS } from '@/constants/games';
import { getGameDisplayName, getGameColor } from '@/constants/stateGameNames';
import { useLotto } from '@/providers/LottoProvider';
import { useJackpot } from '@/providers/JackpotProvider';
import { useGamification } from '@/providers/GamificationProvider';
import { usePro } from '@/providers/ProProvider';
import { useMonetization } from '@/providers/MonetizationProvider';
import { getDrawDaysLabel, getGameTypeColor, type NosyGame } from '@/utils/nosyApi';

import { StrategyType, GeneratedSet, GameType } from '@/types/lottery';

import { shareNumbers } from '@/utils/share';
import { getStateConfig } from '@/config/states';
import GameSwitcher from '@/components/GameSwitcher';
import StrategyPicker from '@/components/StrategyPicker';
import LottoBall from '@/components/LottoBall';
import WinFeed from '@/components/WinFeed';
import StatePicker from '@/components/StatePicker';
import GlossyButton from '@/components/GlossyButton';
import AnimatedCard from '@/components/AnimatedCard';
import PulsingDot from '@/components/PulsingDot';
import EmailCollector from '@/components/EmailCollector';
import LottoMindCommandCenter from '@/components/LottoMindCommandCenter';


const DONATION_URL = 'http://thejazznetworkfoundation.org';
const DONATION_LABEL = 'The Jazz Network Foundation';

export default function GeneratorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    currentGame,
    switchGame,
    generate,
    hotNumbers,
    coldNumbers,
    latestDraw,
    isLiveDataLoading,
    liveDataError,
    liveDraws,
    stateName,
    stateGames,
    pickState,
    setPickState,
    nosyGames,
    isNosyGamesLoading,
    gameDrawResults,
  } = useLotto();
  const { jackpots, alertsEnabled, toggleAlerts } = useJackpot();
  const { level, xp, credits, trackGeneration, trackShare, streakDays } = useGamification();
  const { isFeatureUnlocked } = useTrivia();
  const { isPro } = usePro();
  const { plan, monthlyCreditsRemaining, monthlyCreditsTotal, purchasedCredits, totalAvailableCredits, creditUsagePercent, isLowCredits, canAccessFeature } = useMonetization();

  const [helpMenuOpen, setHelpMenuOpen] = useState<boolean>(false);
  const [legalDisclaimerOpen, setLegalDisclaimerOpen] = useState<boolean>(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<StrategyType>('balanced');
  const [result, setResult] = useState<GeneratedSet | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedStateGame, setSelectedStateGame] = useState<string | null>(null);
  const [selectedNosyGame, setSelectedNosyGame] = useState<NosyGame | null>(null);
  const [toolsExpanded, setToolsExpanded] = useState<boolean>(false);
  const [toolsRotateState, setToolsRotateState] = useState<number>(0);
  const [alertsExpanded, setAlertsExpanded] = useState<boolean>(false);
  const [alertsRotateState, setAlertsRotateState] = useState<number>(0);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const toggleToolsDropdown = useCallback(() => {
    const nextExpanded = !toolsExpanded;
    setToolsExpanded(nextExpanded);
    setToolsRotateState(nextExpanded ? 1 : 0);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, [toolsExpanded]);

  const toggleAlertsDropdown = useCallback(() => {
    const nextExpanded = !alertsExpanded;
    setAlertsExpanded(nextExpanded);
    setAlertsRotateState(nextExpanded ? 1 : 0);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, [alertsExpanded]);

  const config = GAME_CONFIGS[currentGame];
  const latestDrawLabel = useMemo(() => {
    if (!latestDraw?.drawDate) {
      return 'Waiting for live draws';
    }

    return new Date(latestDraw.drawDate).toLocaleDateString();
  }, [latestDraw?.drawDate]);

  const handleGenerate = useCallback(() => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setResult(null);

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.94, duration: 90, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      { iterations: 2 }
    ).start();

    setTimeout(() => {
      const newResult = generate(strategy);
      setResult(newResult);
      setIsGenerating(false);
      trackGeneration();

      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 700);
  }, [buttonScale, generate, glowAnim, isGenerating, strategy, trackGeneration]);

  const handleShareResult = useCallback(async (set: GeneratedSet) => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    const shared = await shareNumbers(set);
    if (shared) {
      trackShare();
    }
  }, [trackShare]);

  const handleBuyTicket = useCallback(async () => {
    const stateConfig = getStateConfig(pickState);
    const url = stateConfig?.lotteryUrl ?? 'https://www.michiganlottery.com';
    try {
      if (Platform.OS !== 'web') {
        void Haptics.selectionAsync();
      }
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#D4AF37',
        toolbarColor: '#0A0A0A',
      });
    } catch (e) {
      console.log('[Home] Failed to open lottery URL', e);
    }
  }, [pickState]);

  const handleDonate = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        void Haptics.selectionAsync();
      }
      await WebBrowser.openBrowserAsync(DONATION_URL, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#D4AF37',
        toolbarColor: '#0A0A0A',
      });
    } catch (error) {
      console.log('Failed to open donation link', error);
      Alert.alert('Unable to open donation page', 'Please try again in a moment.');
    }
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.82],
  });

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LottoMindCommandCenter
          onHelpPress={() => setHelpMenuOpen(true)}
          onGeneratePress={handleGenerate}
        />

        {false ? (
        <View style={styles.toolsSection}>
          <TouchableOpacity
            style={styles.toolsDropdownHeader}
            onPress={toggleToolsDropdown}
            activeOpacity={0.7}
            testID="tools-dropdown-toggle"
          >
            <Text style={styles.toolsSectionTitle}>Power Tools</Text>
            <View style={{ transform: [{ rotate: toolsRotateState ? '180deg' : '0deg' }] }}>
              <ChevronDown size={20} color={Colors.gold} />
            </View>
          </TouchableOpacity>
          {toolsExpanded && (
          <View style={styles.toolsGrid}>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/horoscope')}
              activeOpacity={0.7}
              testID="tool-horoscope"
            >
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(255, 183, 77, 0.08)', borderColor: 'rgba(255, 183, 77, 0.15)' }]}>
                <Sun size={22} color="#FFB74D" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Daily Horoscope</Text>
                <Text style={styles.toolDesc}>Zodiac lucky numbers & insights</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/store-locator')}
              activeOpacity={0.7}
              testID="tool-store-locator"
            >
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(212, 175, 55, 0.08)', borderColor: 'rgba(212, 175, 55, 0.15)' }]}>
                <MapPin size={22} color={Colors.gold} />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Store Locator</Text>
                <Text style={styles.toolDesc}>Find lottery retailers nearby</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolCard, !isPro && !isFeatureUnlocked('exclusive_set') && styles.toolCardLocked]}
              onPress={() => {
                if (isPro || isFeatureUnlocked('exclusive_set')) {
                  router.push('/scanner');
                } else {
                  Alert.alert('Locked', 'Unlock "Exclusive Number Set" in Trivia Rewards to access Ticket Scanner, or subscribe to Pro.', [
                    { text: 'Go Pro', onPress: () => router.push('/paywall') },
                    { text: 'Earn Credits', onPress: () => router.push('/trivia-rewards' as never) },
                    { text: 'OK' },
                  ]);
                }
              }}
              activeOpacity={0.7}
              testID="tool-scanner"
            >
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(0, 230, 118, 0.08)', borderColor: 'rgba(0, 230, 118, 0.15)' }]}>
                <ScanLine size={22} color="#00E676" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Ticket Scanner</Text>
                <Text style={styles.toolDesc}>Scan & check tickets</Text>
              </View>
              {!isPro && !isFeatureUnlocked('exclusive_set') ? (
                <View style={styles.lockedBadge}>
                  <Lock size={12} color="#FF6B35" />
                  <Text style={styles.lockedBadgeText}>250</Text>
                </View>
              ) : (
                <ChevronRight size={16} color={Colors.textMuted} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolCard, !isPro && !isFeatureUnlocked('live_data') && styles.toolCardLocked]}
              onPress={() => {
                if (isPro || isFeatureUnlocked('live_data')) {
                  router.push('/live-data');
                } else {
                  Alert.alert('Locked', 'Unlock "Live Draw Data" in Trivia Rewards to access Live Data (150 credits), or subscribe to Pro.', [
                    { text: 'Go Pro', onPress: () => router.push('/paywall') },
                    { text: 'Earn Credits', onPress: () => router.push('/trivia-rewards' as never) },
                    { text: 'OK' },
                  ]);
                }
              }}
              activeOpacity={0.7}
              testID="tool-live-data"
            >
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(255, 107, 53, 0.08)', borderColor: 'rgba(255, 107, 53, 0.15)' }]}>
                <Radio size={22} color="#FF6B35" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Live Data</Text>
                <Text style={styles.toolDesc}>Real-time draw results</Text>
              </View>
              {!isPro && !isFeatureUnlocked('live_data') ? (
                <View style={styles.lockedBadge}>
                  <Lock size={12} color="#FF6B35" />
                  <Text style={styles.lockedBadgeText}>150</Text>
                </View>
              ) : (
                <ChevronRight size={16} color={Colors.textMuted} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/pick-games')}
              activeOpacity={0.7}
              testID="tool-pick-games"
            >
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(0, 230, 118, 0.08)', borderColor: 'rgba(0, 230, 118, 0.15)' }]}>
                <Hash size={22} color="#00E676" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Pick 3 & Pick 4</Text>
                <Text style={styles.toolDesc}>Live results, prizes & odds</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/shop')}
              activeOpacity={0.7}
              testID="tool-shop"
            >
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(212, 175, 55, 0.08)', borderColor: 'rgba(212, 175, 55, 0.15)' }]}>
                <ShoppingBag size={22} color={Colors.gold} />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Shop</Text>
                <Text style={styles.toolDesc}>E-books, merch & gear</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/viral-studio')}
              activeOpacity={0.7}
              testID="tool-viral-studio"
            >
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(255, 69, 0, 0.08)', borderColor: 'rgba(255, 69, 0, 0.15)' }]}>
                <Share2 size={22} color="#FF4500" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Viral Studio</Text>
                <Text style={styles.toolDesc}>TikTok & social media scripts</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/lucky-weather')}
              activeOpacity={0.7}
              testID="tool-lucky-weather"
            >
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <CloudLightning size={22} color="#F59E0B" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>Lucky Weather</Text>
                <Text style={styles.toolDesc}>Weather-powered lucky numbers</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.usLotteryToolCard}
              onPress={() => router.push('/us-lottery')}
              activeOpacity={0.85}
              testID="tool-us-lottery"
            >
              <View style={styles.usLotteryToolGlow} />
              <View style={[styles.toolIconWrap, { backgroundColor: 'rgba(52, 152, 219, 0.12)', borderColor: 'rgba(52, 152, 219, 0.25)' }]}>
                <BarChart3 size={22} color="#3498DB" />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>US Lottery Results</Text>
                <Text style={styles.toolDesc}>48 states · jackpots · prizes</Text>
              </View>
              <View style={styles.usLotteryHotBadge}>
                <Text style={styles.usLotteryHotText}>HOT</Text>
              </View>
              <ChevronRight size={16} color="#3498DB" />
            </TouchableOpacity>

          </View>
          )}
        </View>
        ) : null}

        <GameSwitcher currentGame={currentGame} onSwitch={switchGame} onPickGames={() => router.push('/pick-games')} />

        <AnimatedCard style={styles.jackpotBanner} delay={400} depth="deep" glowColor="rgba(255, 215, 0, 0.2)">
          <View style={styles.jackpotBannerHeader}>
            <Trophy size={16} color="#FFD700" />
            <Text style={styles.jackpotBannerTitle}>{stateName} Games</Text>
            <TouchableOpacity onPress={toggleAlerts} style={styles.alertToggle} activeOpacity={0.7}>
              {alertsEnabled ? (
                <Bell size={16} color={Colors.gold} />
              ) : (
                <BellOff size={16} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          {jackpots.length > 0 && (
            <View style={styles.jackpotRow}>
              {jackpots.map((jp) => (
                <TouchableOpacity
                  key={jp.game}
                  style={[
                    styles.jackpotCard,
                    jp.isHuge && styles.jackpotCardHuge,
                    selectedStateGame === jp.game && styles.jackpotCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedStateGame(jp.game);
                    setSelectedNosyGame(null);
                    if (jp.game === 'powerball' || jp.game === 'megamillions') {
                      switchGame(jp.game as GameType);
                    }
                    if (Platform.OS !== 'web') {
                      void Haptics.selectionAsync();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.jackpotGameName}>{jp.gameName}</Text>
                  <View style={styles.jackpotAmountRow}>
                    <DollarSign size={14} color={jp.isHuge ? '#FFD700' : Colors.gold} />
                    <Text style={[styles.jackpotAmount, jp.isHuge && styles.jackpotAmountHuge]}>
                      {jp.currentJackpot}
                    </Text>
                  </View>
                  {jp.cashValue && (
                    <Text style={styles.jackpotCash}>Cash: {jp.cashValue}</Text>
                  )}
                  <Text style={styles.jackpotDate}>Next: {jp.nextDrawDate}</Text>
                  {jp.isHuge && (
                    <View style={styles.hugeBadge}>
                      <Text style={styles.hugeBadgeText}>MASSIVE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.nosyGamesHeader}>
            <Text style={styles.stateGamesLabel}>All {stateName} Games</Text>
            {isNosyGamesLoading && <ActivityIndicator size="small" color={Colors.gold} />}
            {nosyGames.length > 0 && (
              <Text style={styles.nosyGamesCount}>{nosyGames.length} live</Text>
            )}
          </View>

          {nosyGames.length > 0 ? (
            <View style={styles.nosyGamesGrid}>
              {nosyGames.map((game) => {
                const isSelected = selectedNosyGame?.id === game.id;
                const gameColor = getGameTypeColor(game);
                const drawDays = getDrawDaysLabel(game.drawDays);
                const isPowerball = game.gameName.toLowerCase().includes('powerball');
                const isMega = game.gameName.toLowerCase().includes('mega millions');
                return (
                  <TouchableOpacity
                    key={game.id}
                    style={[
                      styles.nosyGameCard,
                      isSelected && { borderColor: gameColor, backgroundColor: `${gameColor}12` },
                    ]}
                    onPress={() => {
                      setSelectedNosyGame(isSelected ? null : game);
                      setSelectedStateGame(null);
                      if (isPowerball) switchGame('powerball');
                      if (isMega) switchGame('megamillions');
                      if (Platform.OS !== 'web') {
                        void Haptics.selectionAsync();
                      }
                    }}
                    activeOpacity={0.7}
                    testID={`nosy-game-${game.id}`}
                  >
                    <View style={styles.nosyGameTop}>
                      <View style={[styles.nosyGameDot, { backgroundColor: gameColor }]} />
                      <Text
                        style={[
                          styles.nosyGameName,
                          isSelected && { color: gameColor },
                        ]}
                        numberOfLines={1}
                      >
                        {game.gameName}
                      </Text>
                      {(isPowerball || isMega) && (
                        <View style={[styles.nosyLiveDot, { backgroundColor: Colors.green }]} />
                      )}
                    </View>
                    <View style={styles.nosyGameMeta}>
                      <Text style={styles.nosyGameDetail}>
                        {game.drawnNumbers} balls · {game.minBall}-{game.maxBall}
                      </Text>
                      <Text style={styles.nosyGameDays}>{drawDays}</Text>
                    </View>
                    {game.bonusNumbers.length > 0 && (
                      <View style={styles.nosyBonusRow}>
                        {game.bonusNumbers.map((bn) => (
                          <View key={bn.abbreviation} style={[styles.nosyBonusBadge, { borderColor: `${gameColor}40` }]}>
                            <Text style={[styles.nosyBonusText, { color: gameColor }]}>{bn.abbreviation}</Text>
                          </View>
                        ))}
                        {game.prizeMultipliers.map((pm) => (
                          <View key={pm.abbreviation} style={[styles.nosyMultiBadge, { borderColor: 'rgba(245, 166, 35, 0.3)' }]}>
                            <Text style={styles.nosyMultiText}>{pm.abbreviation}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.stateGamesGrid}>
              {stateGames.map((gameId) => {
                const isSelected = selectedStateGame === gameId;
                const gameColor = getGameColor(gameId);
                const isMainGame = gameId === 'powerball' || gameId === 'megamillions';
                const isCurrentMain = gameId === currentGame;
                return (
                  <TouchableOpacity
                    key={gameId}
                    style={[
                      styles.stateGameChip,
                      isSelected && { borderColor: gameColor, backgroundColor: `${gameColor}15` },
                      isCurrentMain && !isSelected && styles.stateGameChipActive,
                    ]}
                    onPress={() => {
                      setSelectedStateGame(gameId);
                      if (isMainGame) {
                        switchGame(gameId as GameType);
                      }
                      if (Platform.OS !== 'web') {
                        void Haptics.selectionAsync();
                      }
                    }}
                    activeOpacity={0.7}
                    testID={`state-game-${gameId}`}
                  >
                    <View style={[styles.stateGameDot, { backgroundColor: gameColor }]} />
                    <Text
                      style={[
                        styles.stateGameChipText,
                        isSelected && { color: gameColor },
                        isCurrentMain && !isSelected && styles.stateGameChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {getGameDisplayName(gameId)}
                    </Text>
                    {isMainGame && (
                      <View style={[styles.stateGameLiveDot, { backgroundColor: Colors.green }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {selectedNosyGame && (
            <View style={styles.nosyGameDetail_card}>
              <View style={styles.nosyDetailHeader}>
                <View style={[styles.nosyDetailDot, { backgroundColor: getGameTypeColor(selectedNosyGame) }]} />
                <Text style={styles.nosyDetailTitle}>{selectedNosyGame.gameName}</Text>
              </View>
              <View style={styles.nosyDetailGrid}>
                <View style={styles.nosyDetailItem}>
                  <Text style={styles.nosyDetailLabel}>Balls Drawn</Text>
                  <Text style={styles.nosyDetailValue}>{selectedNosyGame.drawnNumbers}</Text>
                </View>
                <View style={styles.nosyDetailItem}>
                  <Text style={styles.nosyDetailLabel}>Range</Text>
                  <Text style={styles.nosyDetailValue}>{selectedNosyGame.minBall}–{selectedNosyGame.maxBall}</Text>
                </View>
                <View style={styles.nosyDetailItem}>
                  <Text style={styles.nosyDetailLabel}>Draw Time</Text>
                  <Text style={styles.nosyDetailValue}>{selectedNosyGame.drawTime.slice(0, 5)}</Text>
                </View>
                <View style={styles.nosyDetailItem}>
                  <Text style={styles.nosyDetailLabel}>Duplicates</Text>
                  <Text style={styles.nosyDetailValue}>{selectedNosyGame.allowDuplicates ? 'Yes' : 'No'}</Text>
                </View>
              </View>
              {selectedNosyGame.additionalNumbers.length > 0 && (
                <View style={styles.nosyAdditionalSection}>
                  <Text style={styles.nosyAdditionalLabel}>Bonus Balls</Text>
                  {selectedNosyGame.additionalNumbers.filter(an => an.playerPicked).map((an) => (
                    <Text key={an.name} style={styles.nosyAdditionalText}>
                      {an.name.replace(/_/g, ' ')} ({an.minBall}–{an.maxBall})
                    </Text>
                  ))}
                </View>
              )}
              <View style={styles.nosyDrawDaysRow}>
                {Object.entries(selectedNosyGame.drawDays).map(([day, active]) => (
                  <View
                    key={day}
                    style={[
                      styles.nosyDayChip,
                      active && styles.nosyDayChipActive,
                    ]}
                  >
                    <Text style={[styles.nosyDayText, active && styles.nosyDayTextActive]}>
                      {day.slice(0, 2)}
                    </Text>
                  </View>
                ))}
              </View>
              {selectedNosyGame.state && (
                <Text style={styles.nosyTaxInfo}>
                  Tax: {selectedNosyGame.state.taxRate} · Age: {selectedNosyGame.state.minimumLegalAge}+ · Claim: {selectedNosyGame.claimDeadline} days
                </Text>
              )}
            </View>
          )}
        </AnimatedCard>

        {false ? (
        <AnimatedCard style={styles.liveCard} delay={500} depth="medium" glowColor="rgba(212, 175, 55, 0.18)">
          <View style={styles.liveCardTop}>
            <View style={styles.liveStatusRow}>
              <PulsingDot color={Colors.green} size={10} />
              <Text style={styles.liveLabel}>Nationwide lottery engine</Text>
            </View>
            {isLiveDataLoading || isNosyGamesLoading ? <ActivityIndicator size="small" color={Colors.gold} /> : <Radio size={16} color={Colors.gold} />}
          </View>

          {liveDataError ? (
            <View style={styles.errorRow}>
              <TriangleAlert size={16} color={Colors.red} />
              <Text style={styles.errorText}>{liveDataError}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.liveHeadline}>
                {gameDrawResults.length > 0
                  ? `${gameDrawResults.length} ${stateName} games · Latest results`
                  : liveDraws.length > 0
                    ? `${liveDraws.length} ${config.shortName} draws · ${stateName}`
                    : 'Building fallback model'}
              </Text>
              <Text style={styles.liveSubheadline}>
                Latest draw {latestDrawLabel}
                {latestDraw?.jackpot ? ` · Jackpot ${latestDraw?.jackpot}` : ''}
              </Text>
            </>
          )}

          {gameDrawResults.length > 0 ? (
            <View style={styles.engineResultsList}>
              {gameDrawResults.map((dr) => {
                const nosyGame = nosyGames.find(g => g.id === dr.gameId);
                const gameColor = nosyGame ? getGameTypeColor(nosyGame) : Colors.gold;
                const isSelected = selectedNosyGame?.id === dr.gameId;
                return (
                  <TouchableOpacity
                    key={dr.gameId}
                    style={[
                      styles.engineResultCard,
                      isSelected && { borderColor: gameColor, backgroundColor: `${gameColor}10` },
                    ]}
                    onPress={() => {
                      const game = nosyGames.find(g => g.id === dr.gameId) ?? null;
                      setSelectedNosyGame(isSelected ? null : game);
                      setSelectedStateGame(null);
                      const isPowerball = dr.gameName.toLowerCase().includes('powerball');
                      const isMega = dr.gameName.toLowerCase().includes('mega millions');
                      if (isPowerball) switchGame('powerball');
                      if (isMega) switchGame('megamillions');
                      if (Platform.OS !== 'web') {
                        void Haptics.selectionAsync();
                      }
                    }}
                    activeOpacity={0.7}
                    testID={`engine-result-${dr.gameId}`}
                  >
                    <View style={styles.engineResultHeader}>
                      <View style={[styles.engineResultDot, { backgroundColor: gameColor }]} />
                      <Text style={[styles.engineResultName, isSelected && { color: gameColor }]} numberOfLines={1}>
                        {dr.gameName}
                      </Text>
                      {dr.source === 'live' && (
                        <View style={styles.engineLiveBadge}>
                          <Text style={styles.engineLiveBadgeText}>LIVE</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.engineNumbersRow}>
                      {dr.numbers.map((num, idx) => (
                        <View key={`eng-${dr.gameId}-m-${idx}`} style={[styles.engineBall, { borderColor: `${gameColor}40` }]}>
                          <Text style={styles.engineBallText}>{num}</Text>
                        </View>
                      ))}
                      {dr.bonusNumbers.length > 0 && (
                        <>
                          <Text style={styles.enginePlusText}>+</Text>
                          {dr.bonusNumbers.map((bn, idx) => (
                            <View key={`eng-${dr.gameId}-b-${idx}`} style={[styles.engineBall, styles.engineBonusBall, { borderColor: `${gameColor}60` }]}>
                              <Text style={[styles.engineBallText, { color: gameColor }]}>{bn}</Text>
                            </View>
                          ))}
                        </>
                      )}
                      {dr.multiplier != null && (
                        <View style={[styles.engineMultiBadge, { borderColor: `${gameColor}30` }]}>
                          <Text style={[styles.engineMultiText, { color: gameColor }]}>x{dr.multiplier}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.engineResultMeta}>
                      <Text style={styles.engineResultDate}>{dr.drawDate}</Text>
                      <Text style={styles.engineResultTime}>{dr.drawTime.slice(0, 5)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <>
              {latestDraw ? (
                <View style={styles.latestBallsRow}>
                  {latestDraw?.numbers.map((num) => (
                    <View key={`latest-${num}`} style={styles.latestBall}>
                      <Text style={styles.latestBallText}>{num}</Text>
                    </View>
                  ))}
                  <Text style={styles.plusText}>+</Text>
                  <View style={[styles.latestBall, styles.latestBonusBall]}>
                    <Text style={[styles.latestBallText, styles.latestBonusText]}>{latestDraw?.bonusNumber}</Text>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </AnimatedCard>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strategy</Text>
          <StrategyPicker selected={strategy} onSelect={setStrategy} />
        </View>

        <GlossyButton
          onPress={handleGenerate}
          label={isGenerating ? 'Running prediction model...' : `Generate ${config.name}`}
          icon={<Zap size={22} color="#FFFFFF" />}
          disabled={isGenerating}
          testID="generate-button"
          variant="green"
          size="large"
          blink={!isGenerating}
        />

        {result ? (
          <AnimatedCard style={styles.resultCard} delay={0} depth="deep" glowColor="rgba(212, 175, 55, 0.3)">
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Predicted Set</Text>
              <View style={styles.modelBadge}>
                <Brain size={14} color={Colors.gold} />
                <Text style={styles.modelBadgeText}>{result.prediction.confidence}% confidence</Text>
              </View>
            </View>
            <View style={styles.ballsRow}>
              {result.numbers.map((num, index) => (
                <LottoBall key={`main-${result.id}-${num}`} number={num} delay={index * 120} />
              ))}
              <Text style={styles.plusText}>+</Text>
              <LottoBall
                number={result.bonusNumber}
                isBonus
                delay={result.numbers.length * 120}
              />
            </View>
            <Text style={styles.resultMeta}>
              {config.name} · {strategy.charAt(0).toUpperCase() + strategy.slice(1)} strategy · {result.prediction.source === 'live-ml' ? 'Live ML blend' : 'Fallback model'}
            </Text>
            <View style={styles.reasonList}>
              {result.prediction.reasons.map((reason) => (
                <Text key={reason} style={styles.reasonText}>
                  • {reason}
                </Text>
              ))}
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.shareResultBtn}
                onPress={() => { void handleShareResult(result); }}
                activeOpacity={0.7}
                testID="share-result-btn"
              >
                <Share2 size={16} color="#1A1200" />
                <Text style={styles.shareResultText}>Share Picks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buyTicketResultBtn}
                onPress={() => { void handleBuyTicket(); }}
                activeOpacity={0.7}
                testID="buy-ticket-result-btn"
              >
                <Ticket size={16} color={Colors.gold} />
                <Text style={styles.buyTicketResultText}>Buy Ticket</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        ) : null}


        <View style={styles.alertsSection}>
          <TouchableOpacity
            style={styles.alertsDropdownHeader}
            onPress={toggleAlertsDropdown}
            activeOpacity={0.7}
            testID="alerts-dropdown-toggle"
          >
            <View style={styles.alertsDropdownLeft}>
              <Bell size={18} color="#FFD700" />
              <Text style={styles.alertsDropdownTitle}>Winning Edge Alerts</Text>
            </View>
            <View style={styles.alertsDropdownRight}>
              <TouchableOpacity
                onPress={toggleAlerts}
                style={styles.alertToggleSmall}
                activeOpacity={0.7}
                testID="alerts-toggle-btn"
              >
                {alertsEnabled ? (
                  <Bell size={14} color={Colors.gold} />
                ) : (
                  <BellOff size={14} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
              <View style={{ transform: [{ rotate: alertsRotateState ? '180deg' : '0deg' }] }}>
                <ChevronDown size={18} color="#FFD700" />
              </View>
            </View>
          </TouchableOpacity>
          {alertsExpanded && (
            <View style={styles.alertsDropdownContent}>
              <Text style={styles.alertsDropdownSub}>
                {alertsEnabled ? 'Jackpot spike notifications are ON' : 'Alerts are turned off'}
              </Text>
              {jackpots.length > 0 && (
                <View style={styles.alertsJackpotRow}>
                  {jackpots.map((jp) => (
                    <View key={`alert-${jp.game}`} style={[styles.alertJackpotChip, jp.isHuge && styles.alertJackpotChipHuge]}>
                      <View style={[styles.alertJackpotDot, { backgroundColor: jp.game === 'powerball' ? '#E74C3C' : '#F5A623' }]} />
                      <Text style={styles.alertJackpotName}>{jp.gameName}</Text>
                      <View style={styles.alertJackpotAmountRow}>
                        <DollarSign size={11} color={jp.isHuge ? '#FFD700' : Colors.gold} />
                        <Text style={[styles.alertJackpotAmount, jp.isHuge && styles.alertJackpotAmountHuge]}>{jp.currentJackpot}</Text>
                      </View>
                      {jp.isHuge && (
                        <View style={styles.alertHugeBadge}>
                          <Text style={styles.alertHugeBadgeText}>HOT</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.inviteCard}
          onPress={() => router.push('/profile')}
          activeOpacity={0.85}
          testID="invite-card"
        >
          <View style={styles.inviteCardLeft}>
            <Crown size={20} color="#FFD700" />
            <View style={styles.inviteCardInfo}>
              <Text style={styles.inviteCardTitle}>Invite Friends, Earn Rewards</Text>
              <Text style={styles.inviteCardSub}>+100 XP & +5 credits per invite</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#FFD700" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.creditStoreCard}
          onPress={() => router.push('/credit-store')}
          activeOpacity={0.85}
          testID="credit-store-link"
        >
          <View style={styles.inviteCardLeft}>
            <Zap size={20} color={Colors.gold} />
            <View style={styles.inviteCardInfo}>
              <Text style={styles.inviteCardTitle}>Credit Store</Text>
              <Text style={styles.inviteCardSub}>Buy credit packs or earn free credits</Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.gold} />
        </TouchableOpacity>

        <AnimatedCard style={styles.donateCard} delay={150} depth="medium" glowColor="rgba(212, 175, 55, 0.15)">
          <View style={styles.donateHeader}>
            <Image
              source={require('@/assets/images/jazz-network-logo.jpeg')}
              style={styles.donateLogo}
              resizeMode="cover"
            />
            <View style={styles.donateCopy}>
              <Text style={styles.donateTitle}>Support {DONATION_LABEL}</Text>
              <Text style={styles.donateDescription}>
                Enjoying the app? Help fund the mission with a quick donation.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.donateButton}
            onPress={() => {
              void handleDonate();
            }}
            activeOpacity={0.85}
            testID="donate-button"
          >
            <Heart size={16} color={Colors.background} fill={Colors.background} />
            <Text style={styles.donateButtonText}>Donate now</Text>
          </TouchableOpacity>
        </AnimatedCard>

        <GlossyButton
          onPress={() => { void handleBuyTicket(); }}
          label="Buy Official Tickets"
          icon={<Ticket size={20} color="#FFFFFF" />}
          testID="buy-ticket-btn"
          variant="green"
          size="medium"
        />

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal
        visible={helpMenuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setHelpMenuOpen(false)}
      >
        <Pressable style={styles.helpMenuOverlay} onPress={() => setHelpMenuOpen(false)}>
          <View style={[styles.helpMenuCard, { marginTop: insets.top + 50 }]}>
            <TouchableOpacity
              style={styles.helpMenuItem}
              onPress={() => {
                setHelpMenuOpen(false);
                router.push('/help');
              }}
              activeOpacity={0.7}
              testID="help-menu-howto"
            >
              <BookOpen size={18} color={Colors.gold} />
              <Text style={styles.helpMenuItemText}>How to Use</Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.helpMenuDivider} />
            <TouchableOpacity
              style={styles.helpMenuItem}
              onPress={() => {
                setHelpMenuOpen(false);
                setLegalDisclaimerOpen(true);
              }}
              activeOpacity={0.7}
              testID="help-menu-legal"
            >
              <Shield size={18} color="#E74C3C" />
              <Text style={styles.helpMenuItemText}>Legal Disclaimer</Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.helpMenuDivider} />
            <TouchableOpacity
              style={styles.helpMenuItem}
              onPress={() => {
                setHelpMenuOpen(false);
                setPrivacyPolicyOpen(true);
              }}
              activeOpacity={0.7}
              testID="help-menu-privacy"
            >
              <Shield size={18} color="#00E5FF" />
              <Text style={styles.helpMenuItemText}>Privacy Policy</Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={privacyPolicyOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPrivacyPolicyOpen(false)}
      >
        <View style={styles.legalOverlay}>
          <View style={[styles.legalContainer, { paddingTop: insets.top + 10 }]}>
            <View style={styles.legalHeader}>
              <View style={styles.legalHeaderLeft}>
                <Shield size={20} color="#00E5FF" />
                <Text style={styles.legalHeaderTitle}>Privacy Policy</Text>
              </View>
              <TouchableOpacity
                style={styles.legalCloseBtn}
                onPress={() => setPrivacyPolicyOpen(false)}
                activeOpacity={0.7}
                testID="privacy-close-btn"
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.legalScroll}
              contentContainerStyle={styles.legalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.legalLogo}>LottoMind™</Text>
              <Text style={styles.legalTagline}>Privacy Policy</Text>
              <View style={styles.legalDivider} />
              <Text style={styles.legalText}>
                LOTTOMIND PRIVACY POLICY
              </Text>
              <Text style={styles.legalText}>
                ("LottoMind," "we," "us," or "our") collects, uses, discloses, and protects information when you use the LottoMind app, website, and related services (the "Service").
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>1. Information We Collect</Text>
              <Text style={[styles.legalText, { fontWeight: '600' as const, color: Colors.gold, marginTop: 8 }]}>A. Information You Provide</Text>
              <Text style={styles.legalText}>
                We may collect information you provide directly, such as: name or display name; email address; account login details; profile information; messages you send to us; content you enter into app tools, such as names, dream entries, lucky numbers, preferences, prompts, or notes; payment-related information processed through third-party payment providers; any other information you choose to provide.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '600' as const, color: Colors.gold, marginTop: 8 }]}>B. Information Collected Automatically</Text>
              <Text style={styles.legalText}>
                When you use the Service, we may automatically collect: device type; operating system; app version; browser type; IP address; approximate location derived from IP or device settings; usage activity; session data; crash logs; diagnostics; identifiers used for analytics, fraud prevention, or notifications.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '600' as const, color: Colors.gold, marginTop: 8 }]}>C. Information From Third Parties</Text>
              <Text style={styles.legalText}>
                We may receive information from: analytics providers; authentication providers; payment processors; app stores; advertising or attribution partners; third-party data providers or APIs used to power lottery-related informational features.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>2. How We Use Information</Text>
              <Text style={styles.legalText}>
                We may use personal information to: provide, maintain, and improve the Service; create and manage accounts; personalize features and content; power AI or recommendation features; process transactions and subscriptions; send service messages, security alerts, and support responses; analyze usage and performance; prevent fraud, abuse, and unauthorized access; comply with legal obligations; enforce our Terms and protect our rights.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>3. Legal Bases</Text>
              <Text style={styles.legalText}>
                If applicable under laws in your jurisdiction, we process personal information based on one or more of the following: your consent; performance of a contract with you; compliance with legal obligations; our legitimate interests in operating, securing, and improving the Service.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>4. How We Share Information</Text>
              <Text style={styles.legalText}>
                We may share information: with vendors and service providers who help us operate the Service; with payment processors and app platforms; with analytics, hosting, cloud storage, customer support, authentication, and security providers; if required by law, subpoena, court order, or legal process; to protect rights, safety, and security; in connection with a merger, acquisition, asset sale, financing, or restructuring; with your direction or consent.
              </Text>
              <Text style={styles.legalText}>
                We do not sell lottery tickets or share your information with a lottery authority for ticket purchase fulfillment unless we explicitly offer such a feature and disclose it separately.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>5. Data Retention</Text>
              <Text style={styles.legalText}>
                We retain personal information for as long as reasonably necessary to: provide the Service; maintain your account; comply with legal obligations; resolve disputes; enforce agreements; protect against fraud and abuse. We may delete or de-identify information when it is no longer needed.
              </Text>
              <Text style={styles.legalText}>
                The FTC recommends collecting and keeping only the information a business actually needs, and limiting retention where possible.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>6. Security</Text>
              <Text style={styles.legalText}>
                We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.
              </Text>
              <Text style={styles.legalText}>
                The FTC's business guidance emphasizes data minimization and reasonable security practices for personal information.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>7. Children's Privacy</Text>
              <Text style={styles.legalText}>
                The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If we learn we collected such information, we will take reasonable steps to delete it.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>8. Your Choices</Text>
              <Text style={styles.legalText}>
                Depending on your location, you may be able to: access or update account information; request deletion of your account or data; opt out of certain marketing communications; manage device permissions such as notifications or location; adjust cookie settings where applicable.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>9. State Privacy Rights</Text>
              <Text style={styles.legalText}>
                Depending on where you live, you may have additional rights under applicable U.S. state privacy laws, such as the right to know, access, delete, correct, or opt out of certain data processing activities.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>10. International Users</Text>
              <Text style={styles.legalText}>
                If you access the Service from outside the United States, your information may be transferred to and processed in the United States or other countries where our providers operate.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>11. Third-Party Links and Services</Text>
              <Text style={styles.legalText}>
                The Service may contain links to third-party websites, platforms, or services. We are not responsible for their privacy practices or content.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>12. App Tracking / Analytics Disclosure</Text>
              <Text style={styles.legalText}>
                We may use analytics, attribution, or diagnostics tools to understand app performance and user engagement. If we use advertising identifiers, cross-app tracking, or similar technologies, we will provide any disclosures and permissions required by applicable law and platform rules.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>13. Changes to This Policy</Text>
              <Text style={styles.legalText}>
                We may update this Privacy Policy from time to time. We will post the updated version with a revised "Last Updated" date. Continued use of the Service after changes means the updated policy applies, to the extent permitted by law.
              </Text>
              <Text style={[styles.legalText, { fontWeight: '700' as const, color: '#FFFFFF', marginTop: 12 }]}>14. Contact Us</Text>
              <Text style={styles.legalText}>
                If you have questions or requests about this Privacy Policy, please contact us through the app's support channels.
              </Text>
              <View style={styles.legalResponsibleBox}>
                <Text style={styles.legalResponsibleTitle}>Your Privacy Matters</Text>
                <Text style={styles.legalResponsibleText}>
                  LottoMind is committed to protecting your personal information and being transparent about how we use it.
                </Text>
              </View>
              <Text style={styles.legalCopyright}>
                © {new Date().getFullYear()} LottoMind™. All rights reserved.{"\n"}
                LottoMind™, Dream Oracle℠, and Sequence Engine℠ are proprietary marks.
              </Text>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={legalDisclaimerOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setLegalDisclaimerOpen(false)}
      >
        <View style={styles.legalOverlay}>
          <View style={[styles.legalContainer, { paddingTop: insets.top + 10 }]}>
            <View style={styles.legalHeader}>
              <View style={styles.legalHeaderLeft}>
                <Shield size={20} color={Colors.gold} />
                <Text style={styles.legalHeaderTitle}>Legal Disclaimer</Text>
              </View>
              <TouchableOpacity
                style={styles.legalCloseBtn}
                onPress={() => setLegalDisclaimerOpen(false)}
                activeOpacity={0.7}
                testID="legal-close-btn"
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.legalScroll}
              contentContainerStyle={styles.legalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.legalLogo}>LottoMind™</Text>
              <Text style={styles.legalTagline}>AI-Powered Lottery Intelligence</Text>
              <View style={styles.legalDivider} />
              <Text style={styles.legalText}>
                LottoMind is an independent informational and entertainment app.
              </Text>
              <Text style={styles.legalText}>
                LottoMind is not affiliated with, endorsed by, sponsored by, or operated by any state lottery, the Multi-State Lottery Association (MUSL), Powerball, Mega Millions, or any other lottery operator, regulator, or governmental entity.
              </Text>
              <Text style={styles.legalText}>
                LottoMind does not sell lottery tickets, process wagers, accept bets, pay prizes, or guarantee winnings. Any numbers, predictions, patterns, insights, statistics, or recommendations provided by the app are for informational and entertainment purposes only and should not be relied upon as a promise, representation, or guarantee of success. Past results do not predict future outcomes.
              </Text>
              <Text style={styles.legalText}>
                All lottery drawings are games of chance. Use of LottoMind does not increase a user's odds of winning except as may be specifically stated in official published lottery rules by the applicable lottery authority. Users are solely responsible for verifying all draw results, game rules, deadlines, eligibility requirements, and ticket information with the official lottery source in their jurisdiction before making any purchase or claim.
              </Text>
              <Text style={styles.legalText}>
                Users must comply with all local laws, age restrictions, and location-based requirements applicable to lottery participation in their state or jurisdiction. LottoMind is intended only for users who are legally permitted to participate in lottery-related activities where they are located.
              </Text>
              <Text style={styles.legalText}>
                Powerball®, Mega Millions®, and other game names, logos, and marks are the property of their respective owners. Any references within LottoMind are used solely for nominative, descriptive, and informational purposes. LottoMind claims no ownership in third-party trademarks, logos, game names, or official draw data.
              </Text>
              <Text style={styles.legalText}>
                By using LottoMind, you agree that LottoMind and its owners, developers, affiliates, licensors, and service providers shall not be liable for any loss, damage, claim, or expense arising from reliance on app content, user decisions, ticket purchases, missed deadlines, inaccurate third-party data, or participation in any lottery or similar game.
              </Text>
              <View style={styles.legalResponsibleBox}>
                <Text style={styles.legalResponsibleTitle}>Play Responsibly</Text>
                <Text style={styles.legalResponsibleText}>
                  If lottery play is causing financial or emotional harm, do not use this app for decision-making.
                </Text>
              </View>
              <Text style={styles.legalCopyright}>
                © {new Date().getFullYear()} LottoMind™. All rights reserved.{"\n"}
                LottoMind™, Dream Oracle℠, and Sequence Engine℠ are proprietary marks.
              </Text>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: -0.5,
  },
  titleAI: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: -0.5,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#0A0A0A',
    backgroundColor: '#FF3B3B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  commercialCard: {
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.5)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  commercialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commercialTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  commercialVideoWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  commercialThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 14,
  },
  commercialPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 14,
  },
  commercialPlayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 183, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 183, 0, 0.7)',
    shadowColor: '#FFB700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  commercialLabel: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  commercialLabelText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  userBarCredits: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  liveCard: {
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  liveCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  liveLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  liveHeadline: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  liveSubheadline: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.red,
  },
  latestBallsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  latestBall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  latestBonusBall: {
    backgroundColor: Colors.redMuted,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  latestBallText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  latestBonusText: {
    color: Colors.red,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  generateButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  generateGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  generateText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  donateCard: {
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 18,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  donateHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  donateLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  donateCopy: {
    flex: 1,
    gap: 4,
  },
  donateTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  donateDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  donateButton: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  donateButtonText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.background,
  },
  resultCard: {
    backgroundColor: 'rgba(8, 18, 40, 0.9)',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  resultHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  modelBadge: {
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
  modelBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  ballsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  plusText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  resultMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  reasonList: {
    width: '100%',
    gap: 6,
    backgroundColor: 'rgba(10, 20, 45, 0.6)',
    borderRadius: 14,
    padding: 14,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(8, 18, 40, 0.8)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statBalls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniGoldBall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  miniBlueBall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blueMuted,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.25)',
  },
  miniBallText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  toolsSection: {
    gap: 12,
  },
  toolsDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  toolsSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  toolsGrid: {
    gap: 10,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(8, 18, 40, 0.8)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    shadowColor: 'rgba(0, 229, 255, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  toolCardLocked: {
    opacity: 0.7,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.25)',
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FF6B35',
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toolInfo: {
    flex: 1,
    gap: 2,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  toolDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  jackpotBanner: {
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  jackpotBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jackpotBannerTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFD700',
    flex: 1,
  },
  alertToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(10, 20, 45, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  jackpotRow: {
    flexDirection: 'row',
    gap: 10,
  },
  jackpotCard: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 45, 0.8)',
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    shadowColor: 'rgba(0, 229, 255, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  jackpotCardHuge: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  jackpotGameName: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  jackpotAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  jackpotAmount: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  jackpotAmountHuge: {
    color: '#FFD700',
    fontSize: 22,
  },
  jackpotCash: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  jackpotDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  hugeBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  hugeBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: 1,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(8, 18, 40, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginLeft: 'auto' as const,
  },
  profileLevel: {
    fontSize: 14,
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(8, 18, 40, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    flexWrap: 'wrap',
    shadowColor: 'rgba(0, 229, 255, 0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  userBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userBarText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  userBarDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
  },
  streakEmoji: {
    fontSize: 12,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  shareResultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
  },
  shareResultText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  buyTicketResultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.goldMuted,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  buyTicketResultText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  buyTicketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.gold,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buyTicketCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(26, 18, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyTicketCardInfo: {
    flex: 1,
    gap: 2,
  },
  buyTicketCardTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  buyTicketCardSub: {
    fontSize: 12,
    color: 'rgba(26, 18, 0, 0.5)',
    fontWeight: '600' as const,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(8, 18, 40, 0.8)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  inviteCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteCardInfo: {
    flex: 1,
    gap: 2,
  },
  inviteCardTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  inviteCardSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  jackpotCardSelected: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  stateGamesLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  stateGamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stateGameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 20, 45, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
  },
  stateGameChipActive: {
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldMuted,
  },
  stateGameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stateGameChipText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  stateGameChipTextActive: {
    color: Colors.gold,
  },
  stateGameLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nationwideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    overflow: 'hidden',
  },
  nationwideBtnGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
  },
  nationwideBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nationwideBtnInfo: {
    flex: 1,
    gap: 3,
  },
  nationwideBtnTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  nationwideBtnSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  nosyGamesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  nosyGamesCount: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.green,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  nosyGamesGrid: {
    gap: 8,
  },
  nosyGameCard: {
    backgroundColor: 'rgba(10, 20, 45, 0.8)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
    shadowColor: 'rgba(0, 229, 255, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  nosyGameTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nosyGameDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nosyGameName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  nosyLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  nosyGameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nosyGameDetail: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  nosyGameDays: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  nosyBonusRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  nosyBonusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(52, 152, 219, 0.06)',
  },
  nosyBonusText: {
    fontSize: 10,
    fontWeight: '800' as const,
  },
  nosyMultiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(245, 166, 35, 0.06)',
  },
  nosyMultiText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.amber,
  },
  nosyGameDetail_card: {
    backgroundColor: 'rgba(10, 20, 45, 0.85)',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  nosyDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nosyDetailDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nosyDetailTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  nosyDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nosyDetailItem: {
    backgroundColor: 'rgba(8, 18, 40, 0.7)',
    borderRadius: 10,
    padding: 10,
    minWidth: '22%' as unknown as number,
    flex: 1,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
  },
  nosyDetailLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  nosyDetailValue: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  nosyAdditionalSection: {
    gap: 4,
  },
  nosyAdditionalLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  nosyAdditionalText: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  nosyDrawDaysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  nosyDayChip: {
    width: 32,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 18, 40, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.1)',
  },
  nosyDayChipActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  nosyDayText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  nosyDayTextActive: {
    color: Colors.gold,
  },
  nosyTaxInfo: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  engineResultsList: {
    gap: 10,
    marginTop: 4,
  },
  engineResultCard: {
    backgroundColor: 'rgba(10, 20, 45, 0.8)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
    shadowColor: 'rgba(0, 229, 255, 0.15)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  engineResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engineResultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  engineResultName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  engineLiveBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  engineLiveBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.green,
    letterSpacing: 0.8,
  },
  engineNumbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  engineBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  engineBallText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  enginePlusText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  engineBonusBall: {
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
  },
  engineMultiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
  },
  engineMultiText: {
    fontSize: 11,
    fontWeight: '800' as const,
  },
  engineResultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  engineResultDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  engineResultTime: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  triviaBanner: {
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(176, 38, 255, 0.45)',
    overflow: 'hidden',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  triviaBannerGlow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(176, 38, 255, 0.06)',
  },
  triviaBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triviaBannerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(176, 38, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(176, 38, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triviaBannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  triviaBannerBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: 0.8,
  },
  triviaBannerTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  triviaBannerDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  triviaBannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(176, 38, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(176, 38, 255, 0.2)',
  },
  triviaBannerStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  triviaBannerStatValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  triviaBannerStatLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  triviaBannerStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(176, 38, 255, 0.25)',
  },
  triviaBannerCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(176, 38, 255, 0.2)',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  triviaBannerCTAText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  usLotteryToolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(52, 152, 219, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 152, 219, 0.2)',
    overflow: 'hidden',
  },
  usLotteryToolGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(52, 152, 219, 0.03)',
  },
  usLotteryHotBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  usLotteryHotText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#E74C3C',
    letterSpacing: 0.8,
  },
  crosswordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(155, 89, 182, 0.06)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(155, 89, 182, 0.2)',
    overflow: 'hidden',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  crosswordCardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(155, 89, 182, 0.03)',
  },
  crosswordIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(155, 89, 182, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(155, 89, 182, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosswordCardInfo: {
    flex: 1,
    gap: 3,
  },
  crosswordCardTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#9B59B6',
  },
  crosswordCardDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  crosswordNewBadge: {
    backgroundColor: 'rgba(155, 89, 182, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.3)',
  },
  crosswordNewText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#9B59B6',
    letterSpacing: 0.8,
  },

  alertsSection: {
    gap: 0,
  },
  alertsDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  alertsDropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertsDropdownTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  alertsDropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertToggleSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  alertsDropdownContent: {
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  alertsDropdownSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  alertsJackpotRow: {
    flexDirection: 'row',
    gap: 10,
  },
  alertJackpotChip: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 45, 0.8)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
  },
  alertJackpotChipHuge: {
    borderColor: 'rgba(255, 215, 0, 0.35)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  alertJackpotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertJackpotName: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  alertJackpotAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  alertJackpotAmount: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  alertJackpotAmountHuge: {
    color: '#FFD700',
    fontSize: 17,
  },
  alertHugeBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  alertHugeBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: 1,
  },
  helpMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  helpMenuCard: {
    marginHorizontal: 20,
    alignSelf: 'flex-start' as const,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    minWidth: 220,
  },
  helpMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  helpMenuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  helpMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    marginHorizontal: 16,
  },
  legalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  legalContainer: {
    flex: 1,
    backgroundColor: '#111111',
  },
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.15)',
  },
  legalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  legalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  legalScroll: {
    flex: 1,
  },
  legalScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  legalLogo: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.gold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  legalTagline: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  legalDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    marginVertical: 20,
  },
  legalText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  legalResponsibleBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  legalResponsibleTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
    marginBottom: 6,
  },
  legalResponsibleText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  legalCopyright: {
    fontSize: 11,
    lineHeight: 18,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.1)',
  },
  creditMeterCard: {
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  creditMeterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creditMeterLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  creditMeterValue: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  creditMeterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    overflow: 'hidden',
  },
  creditMeterFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  creditMeterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creditMeterPurchased: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  creditMeterWarning: {
    fontSize: 12,
    color: '#F5A623',
    fontWeight: '700' as const,
  },
  creditStoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(8, 18, 40, 0.85)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: 'rgba(0, 229, 255, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
});
