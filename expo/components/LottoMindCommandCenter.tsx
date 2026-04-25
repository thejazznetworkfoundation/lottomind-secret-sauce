import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';
import { unstable_createElement } from 'react-native-web';
import {
  Bell,
  Brain,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Gauge,
  Gamepad2,
  HelpCircle,
  LineChart,
  Play,
  Radio,
  ScanLine,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Ticket,
  Zap,
} from 'lucide-react-native';

import StatePicker from '@/components/StatePicker';
import SwipeableActionCard from '@/components/SwipeableActionCard';
import { Colors } from '@/constants/colors';
import { FEATURED_RECORD_DROP } from '@/constants/lottomindRecords';
import { TSHIRTS } from '@/mocks/shopData';
import { useGamification } from '@/providers/GamificationProvider';
import { useJackpot } from '@/providers/JackpotProvider';
import { useLotto } from '@/providers/LottoProvider';
import { useMonetization } from '@/providers/MonetizationProvider';
import { usePro } from '@/providers/ProProvider';

interface LottoMindCommandCenterProps {
  onHelpPress: () => void;
  onGeneratePress: () => void;
}

interface CommandAction {
  title: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  testID: string;
  route?: string;
  onPress?: () => void;
}

type MetricVariant = 'market' | 'xp' | 'credits' | 'alerts';

const commandCoreVideo = require('@/assets/videos/lottomind-command-core.mp4');
const powerToolsButtonImage = require('@/assets/images/dashboard-power-tools-action-sheet.png');
const commandLogoImage = require('@/assets/images/lottomind-brain-logo.png');
const dashboardHeroImage = require('@/assets/images/dashboard-dream-analyze-win-bg.webp');
const dashboardMascotImage = require('@/assets/images/lottomind-dashboard-mascot.png');
const dashboardMetricEmblemImage = require('@/assets/images/dashboard-metric-emblem.png');
const PLAY_ARCADE_VIDEO_PATH = '/videos/play-arcade-button-loop.mp4';
const POWER_TOOLS_VIDEO_PATH = '/videos/power-tools-dashboard-box.mp4';
const GITHUB_PAGES_BASE_PATH = '/lottomind-secret-sauce';

const METRIC_CARD_VARIANTS: Record<
  MetricVariant,
  {
    borderColor: string;
    colors: readonly [string, string, string];
    iconBackground: string;
    labelColor: string;
    shadowColor: string;
    valueColor: string;
  }
> = {
  market: {
    borderColor: 'rgba(0, 229, 255, 0.46)',
    colors: ['rgba(0, 229, 255, 0.42)', 'rgba(5, 11, 25, 0.7)', 'rgba(212, 175, 55, 0.22)'],
    iconBackground: 'rgba(0, 229, 255, 0.2)',
    labelColor: '#B9F7FF',
    shadowColor: '#00E5FF',
    valueColor: '#FFFFFF',
  },
  xp: {
    borderColor: 'rgba(166, 91, 255, 0.48)',
    colors: ['rgba(125, 71, 255, 0.42)', 'rgba(9, 5, 25, 0.74)', 'rgba(212, 175, 55, 0.2)'],
    iconBackground: 'rgba(166, 91, 255, 0.22)',
    labelColor: '#D8C4FF',
    shadowColor: '#8B5CF6',
    valueColor: '#FFFFFF',
  },
  credits: {
    borderColor: 'rgba(245, 166, 35, 0.56)',
    colors: ['rgba(245, 166, 35, 0.38)', 'rgba(8, 6, 15, 0.76)', 'rgba(212, 175, 55, 0.32)'],
    iconBackground: 'rgba(212, 175, 55, 0.24)',
    labelColor: '#FFE7A6',
    shadowColor: '#D4AF37',
    valueColor: Colors.goldLight,
  },
  alerts: {
    borderColor: 'rgba(49, 247, 200, 0.48)',
    colors: ['rgba(49, 247, 200, 0.34)', 'rgba(3, 14, 18, 0.76)', 'rgba(212, 175, 55, 0.2)'],
    iconBackground: 'rgba(49, 247, 200, 0.2)',
    labelColor: '#B9FFE8',
    shadowColor: '#31F7C8',
    valueColor: '#FFFFFF',
  },
};

const arcadeVideoStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'contain',
  maxWidth: '100%',
  maxHeight: '100%',
  backgroundColor: '#030812',
  pointerEvents: 'none',
};

const powerToolsVideoStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
  objectFit: 'contain',
  backgroundColor: '#030812',
  pointerEvents: 'none',
};

function getHostedAssetPath(path: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const isGitHubPagesPreview = window.location.pathname.startsWith(GITHUB_PAGES_BASE_PATH);

  if (!isGitHubPagesPreview || normalizedPath.startsWith(`${GITHUB_PAGES_BASE_PATH}/`)) {
    return normalizedPath;
  }

  return `${GITHUB_PAGES_BASE_PATH}${normalizedPath}`;
}

function PlayArcadePreviewVideo() {
  return unstable_createElement('video', {
    src: getHostedAssetPath(PLAY_ARCADE_VIDEO_PATH),
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: 'auto',
    style: arcadeVideoStyle,
    'aria-label': 'Play Arcade preview loop',
  });
}

function PowerToolsPreviewVideo() {
  return unstable_createElement('video', {
    src: getHostedAssetPath(POWER_TOOLS_VIDEO_PATH),
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: 'auto',
    style: powerToolsVideoStyle,
    'aria-label': 'Power Tools preview loop',
  });
}

function getNumbersPreview(numbers: number[], fallback: number[]) {
  const source = numbers.length > 0 ? numbers : fallback;
  return source.slice(0, 5).map((value) => String(value).padStart(2, '0'));
}

export default function LottoMindCommandCenter({
  onHelpPress,
  onGeneratePress,
}: LottoMindCommandCenterProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    currentGame,
    hotNumbers,
    coldNumbers,
    stateName,
    stateGames,
    pickState,
    setPickState,
  } = useLotto();
  const { level, xp, credits, streakDays } = useGamification();
  const {
    plan,
    monthlyCreditsRemaining,
    monthlyCreditsTotal,
    totalAvailableCredits,
    creditUsagePercent,
    isLowCredits,
  } = useMonetization();
  const { isPro } = usePro();
  const { jackpots, alertsEnabled } = useJackpot();

  const liveJackpot = useMemo(() => {
    return jackpots.find((jackpot) => jackpot.isHuge) ?? jackpots[0] ?? null;
  }, [jackpots]);

  const hotPreview = useMemo(
    () => getNumbersPreview(hotNumbers, [9, 17, 23, 34, 46]),
    [hotNumbers]
  );
  const coldPreview = useMemo(
    () => getNumbersPreview(coldNumbers, [2, 11, 28, 3, 15]),
    [coldNumbers]
  );
  const isCompactHero = width < 520;
  const isUltraCompactHero = width < 430;
  const merchSlides = useMemo(() => TSHIRTS.slice(0, 4), []);
  const [merchSlideIndex, setMerchSlideIndex] = useState(0);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const currentMerchSlide = merchSlides[merchSlideIndex % merchSlides.length] ?? merchSlides[0];
  const commandCardWidth = Math.min(194, Math.max(154, width * 0.43));

  useEffect(() => {
    if (merchSlides.length < 2) {
      return undefined;
    }

    const interval = setInterval(() => {
      setMerchSlideIndex((index) => (index + 1) % merchSlides.length);
    }, 2600);

    return () => clearInterval(interval);
  }, [merchSlides.length]);

  const commandActions: CommandAction[] = [
    {
      title: 'Play Arcade',
      detail: 'Earn credits',
      icon: Play,
      color: '#00E5FF',
      route: '/arcade',
      testID: 'command-arcade',
    },
    {
      title: 'Power Tools',
      detail: 'Daily AI tools',
      icon: Zap,
      color: Colors.gold,
      route: '/powertools',
      testID: 'command-power-tools',
    },
    {
      title: 'LottoMind Records',
      detail: `${FEATURED_RECORD_DROP.title} • ${FEATURED_RECORD_DROP.format}`,
      icon: Radio,
      color: FEATURED_RECORD_DROP.accent,
      route: '/lottomind-records',
      testID: 'command-lottomind-records',
    },
  ];

  const secondaryTools = [
    { label: 'Mind Games', route: '/games-hub', icon: Gamepad2 },
  ] as const;

  const handleRoute = (route: string) => {
    setHelpMenuOpen(false);
    router.push(route as never);
  };

  const handleHelpPress = () => {
    setHelpMenuOpen(false);
    onHelpPress();
  };

  return (
    <View style={styles.shell}>
      <View style={styles.topBar}>
        <View style={styles.brandLockup}>
          <View style={styles.logoRing}>
            <Image source={commandLogoImage} style={styles.logoImage} resizeMode="cover" />
          </View>
          <View>
            <Text style={styles.brandName}>LottoMind™</Text>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AI intelligence</Text>
            </View>
          </View>
        </View>
        <View style={styles.topActions}>
          <View style={styles.helpMenuAnchor}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setHelpMenuOpen((open) => !open)}
              activeOpacity={0.72}
              testID="dashboard-question-menu"
            >
              <HelpCircle size={18} color={Colors.goldLight} />
            </TouchableOpacity>
            {helpMenuOpen ? (
              <View style={styles.helpQuickMenu} testID="dashboard-question-options">
                <TouchableOpacity
                  style={styles.helpQuickItem}
                  onPress={() => handleRoute('/settings')}
                  activeOpacity={0.78}
                  testID="dashboard-question-settings"
                >
                  <Settings size={17} color={Colors.goldLight} />
                  <View style={styles.helpQuickCopy}>
                    <Text style={styles.helpQuickTitle}>Settings</Text>
                    <Text style={styles.helpQuickSub}>App controls</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.helpQuickDivider} />
                <TouchableOpacity
                  style={styles.helpQuickItem}
                  onPress={handleHelpPress}
                  activeOpacity={0.78}
                  testID="dashboard-question-help"
                >
                  <HelpCircle size={17} color="#7DE8FF" />
                  <View style={styles.helpQuickCopy}>
                    <Text style={styles.helpQuickTitle}>Help</Text>
                    <Text style={styles.helpQuickSub}>Guide and legal</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => handleRoute('/profile')}
            activeOpacity={0.72}
          >
            <Image source={dashboardMascotImage} style={styles.avatarImage} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => handleRoute('/intelligence')}
        activeOpacity={0.76}
      >
        <Search size={17} color="#7DB8D6" />
        <Text style={styles.searchText}>Search numbers, dreams, tickets, tools...</Text>
        <View style={styles.searchChip}>
          <Text style={styles.searchChipText}>AI</Text>
        </View>
      </TouchableOpacity>

      <ImageBackground
        source={dashboardHeroImage}
        resizeMode="cover"
        style={[styles.heroCard, isCompactHero && styles.heroCardCompact]}
        imageStyle={styles.heroCardImage}
      >
      <LinearGradient
        colors={['rgba(1, 6, 14, 0.82)', 'rgba(3, 12, 26, 0.46)', 'rgba(1, 7, 18, 0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroScrim}
      >
        <View style={[styles.staticCircuitGlow, isCompactHero && styles.staticCircuitGlowCompact]} />
        <View
          style={[
            styles.heroCopy,
            isCompactHero && styles.heroCopyCompact,
            isUltraCompactHero && styles.heroCopyUltraCompact,
          ]}
        >
          <View style={styles.heroBadge}>
            <Crown size={13} color="#1A1200" />
            <Text style={styles.heroBadgeText}>{isPro ? 'PRO MEMBER' : `${plan.toUpperCase()} MODE`}</Text>
          </View>
          <Text style={styles.heroKicker}>Welcome back, LottoMaster</Text>
          <Text style={styles.heroTitle}>Dream. Analyze. Win.</Text>
          <Text style={styles.heroSub}>
            A cleaner LottoMind™ command center for picks, games, credits, and ticket tools.
          </Text>
          <View style={styles.heroButtons}>
            <Pressable
              style={styles.arcadeImageButton}
              onPress={() => handleRoute('/shop')}
              testID="dashboard-merch-slideshow-hero"
            >
              <View style={styles.arcadeImage}>
                {currentMerchSlide ? (
                  <>
                    <Image
                      source={{ uri: currentMerchSlide.image }}
                      style={styles.commandMerchImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['rgba(2, 6, 14, 0.08)', 'rgba(2, 6, 14, 0.76)']}
                      style={styles.commandMerchOverlay}
                    >
                      <View style={styles.commandMerchPill}>
                        <ShoppingBag size={14} color="#07101F" />
                        <Text style={styles.commandMerchPillText}>Merch Store</Text>
                      </View>
                      <Text style={styles.commandMerchCaption} numberOfLines={1}>
                        {currentMerchSlide.name}
                      </Text>
                      <View style={styles.commandMerchDots}>
                        {merchSlides.map((slide, index) => (
                          <View
                            key={slide.id}
                            style={[
                              styles.commandMerchDot,
                              index === merchSlideIndex % merchSlides.length && styles.commandMerchDotActive,
                            ]}
                          />
                        ))}
                      </View>
                    </LinearGradient>
                  </>
                ) : (
                  <View style={styles.arcadeImageOverlay}>
                    <View style={styles.arcadeLabelPill}>
                      <ShoppingBag size={14} color="#07101F" />
                      <Text style={styles.arcadeLabelText}>Merch Store</Text>
                    </View>
                  </View>
                )}
              </View>
            </Pressable>
          </View>
        </View>
        <View
          style={[
            styles.heroIntelligencePanel,
            isCompactHero && styles.heroIntelligencePanelCompact,
            isUltraCompactHero && styles.heroIntelligencePanelUltraCompact,
          ]}
        >
          <Video
            source={commandCoreVideo}
            style={[
              styles.heroVideo,
              isCompactHero && styles.heroVideoCompact,
              isUltraCompactHero && styles.heroVideoUltraCompact,
            ]}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            isMuted
            useNativeControls={false}
            pointerEvents="none"
          />
          <View style={styles.heroVideoOverlay} />
        </View>
      </LinearGradient>
      </ImageBackground>

      <View style={styles.statePanel}>
        <View style={styles.stateCopy}>
          <Text style={styles.panelLabel}>Active Market</Text>
          <Text style={styles.panelValue}>{stateName}</Text>
          <Text style={styles.panelHint}>{stateGames.length} games tracked in this market</Text>
        </View>
        <StatePicker currentState={pickState} stateName={stateName} onSelect={setPickState} />
      </View>

      <View style={styles.statGrid}>
        <MetricCard icon={Ticket} label="Market Games" value={`${stateGames.length}`} accent="#00E5FF" variant="market" />
        <MetricCard icon={Gauge} label="AI XP" value={`${xp}`} accent={level.color} variant="xp" />
        <MetricCard icon={CircleDollarSign} label="Credits" value={`${totalAvailableCredits}`} accent={Colors.gold} variant="credits" />
        <MetricCard icon={Bell} label="Alerts" value={alertsEnabled ? 'On' : 'Off'} accent="#31F7C8" variant="alerts" />
      </View>

      <TouchableOpacity
        style={[styles.creditPanel, isLowCredits && styles.creditPanelLow]}
        onPress={() => handleRoute('/arcade')}
        activeOpacity={0.8}
      >
        <View style={styles.creditHeader}>
          <Text style={styles.panelLabel}>Mind Credits</Text>
          <Text style={styles.creditValue}>{monthlyCreditsRemaining}/{monthlyCreditsTotal}</Text>
        </View>
        <View style={styles.creditTrack}>
          <View style={[styles.creditFill, { width: `${Math.min(100, creditUsagePercent)}%` }]} />
        </View>
        <Text style={styles.panelHint}>
          {credits} earned arcade credits. {streakDays > 0 ? `${streakDays} day streak active.` : 'Play to build a streak.'}
        </Text>
      </TouchableOpacity>

      <View style={styles.toolRail}>
        {secondaryTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <SwipeableActionCard
              key={tool.label}
              style={styles.railSwipeItem}
              onPress={() => handleRoute(tool.route)}
              onSwipeLeft={() => handleRoute(tool.route)}
              onSwipeRight={() => handleRoute(tool.route)}
            >
            <TouchableOpacity
              style={styles.railButton}
              onPress={() => handleRoute(tool.route)}
              activeOpacity={0.78}
            >
              <Icon size={16} color={Colors.goldLight} />
              <Text style={styles.railText}>{tool.label}</Text>
            </TouchableOpacity>
            </SwipeableActionCard>
          );
        })}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled
        nestedScrollEnabled
        snapToInterval={commandCardWidth + 10}
        decelerationRate="fast"
        contentContainerStyle={styles.commandCarousel}
      >
        {commandActions.filter((action) => action.route !== '/lottomind-records').map((action) => {
          const Icon = action.icon;
          const isArcadeAction = action.route === '/arcade';
          const isPowerToolsAction = action.route === '/powertools';
          const isRecordAction = false;
          const activateAction = () => {
            if (action.onPress) {
              action.onPress();
              return;
            }
            if (action.route) {
              handleRoute(action.route);
            }
          };
          return (
            <SwipeableActionCard
              key={action.title}
              style={[styles.commandSwipeItem, { width: commandCardWidth }]}
              onPress={activateAction}
              onSwipeLeft={activateAction}
              onSwipeRight={activateAction}
            >
            <TouchableOpacity
              style={[
                styles.commandCard,
                isArcadeAction && styles.commandArcadeCard,
                isPowerToolsAction && styles.commandPowerToolsCard,
                isRecordAction && styles.commandRecordCard,
              ]}
              onPress={activateAction}
              activeOpacity={0.78}
              testID={action.testID}
            >
              {isArcadeAction ? (
                <>
                  <PowerToolsPreviewVideo />
                  <View style={styles.commandArcadeOverlay}>
                    <View style={styles.commandArcadePill}>
                      <Icon size={14} color="#07101F" />
                      <Text style={styles.commandArcadePillText}>{action.title}</Text>
                    </View>
                  </View>
                </>
              ) : isPowerToolsAction ? (
                <>
                  {Platform.OS === 'web' ? (
                    <PlayArcadePreviewVideo />
                  ) : (
                    <ImageBackground
                      source={powerToolsButtonImage}
                      style={styles.arcadeFallbackImage}
                      imageStyle={styles.arcadeImageStyle}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.commandArcadeOverlay}>
                    <View style={styles.commandArcadePill}>
                      <Icon size={14} color="#07101F" />
                      <Text style={styles.commandArcadePillText}>Power Tools</Text>
                    </View>
                  </View>
                </>
              ) : isRecordAction ? (
                <>
                  <View style={styles.commandRecordAccent} />
                  <View style={styles.commandRecordPill}>
                    <Icon size={14} color="#07101F" />
                    <Text style={styles.commandRecordPillText}>Records</Text>
                  </View>
                  <View style={styles.commandRecordCopy}>
                    <Text style={styles.commandRecordKicker}>LottoMind Records</Text>
                    <Text style={styles.commandRecordTitle} numberOfLines={1}>
                      {FEATURED_RECORD_DROP.title}
                    </Text>
                    <Text style={styles.commandRecordFormat} numberOfLines={1}>
                      {FEATURED_RECORD_DROP.format}
                    </Text>
                  </View>
                  <View style={styles.commandRecordTags}>
                    {FEATURED_RECORD_DROP.tags.slice(0, 2).map((tag) => (
                      <View key={tag} style={styles.commandRecordTag}>
                        <Text style={styles.commandRecordTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.commandIcon, { borderColor: `${action.color}66`, backgroundColor: `${action.color}14` }]}>
                    <Icon size={21} color={action.color} />
                  </View>
                  <View style={styles.commandTextWrap}>
                    <Text style={styles.commandTitle}>{action.title}</Text>
                    <Text style={styles.commandDetail}>{action.detail}</Text>
                  </View>
                  <ChevronRight size={16} color="#7DB8D6" />
                </>
              )}
            </TouchableOpacity>
            </SwipeableActionCard>
          );
        })}
      </ScrollView>

      <SwipeableActionCard
        onPress={() => handleRoute('/lottomind-records')}
        onSwipeLeft={() => handleRoute('/lottomind-records')}
        onSwipeRight={() => handleRoute('/lottomind-records')}
      >
      <TouchableOpacity
        style={styles.recordDropCard}
        onPress={() => handleRoute('/lottomind-records')}
        activeOpacity={0.8}
        testID="dashboard-lottomind-records"
      >
        <View style={styles.recordAccentStrip} />
        <View style={styles.recordHeader}>
          <View style={styles.recordIconWrap}>
            <Radio size={18} color={FEATURED_RECORD_DROP.accent} />
          </View>
          <View style={styles.recordCopy}>
            <Text style={styles.recordEyebrow}>LottoMind Records</Text>
            <Text style={styles.recordTitle}>{FEATURED_RECORD_DROP.title}</Text>
            <Text style={styles.recordDetail} numberOfLines={2}>
              {FEATURED_RECORD_DROP.detail}
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.goldLight} />
        </View>
        <View style={styles.recordFooter}>
          <Text style={styles.recordFormat}>{FEATURED_RECORD_DROP.format}</Text>
          <View style={styles.recordTagRow}>
            {FEATURED_RECORD_DROP.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.recordTag}>
                <Text style={styles.recordTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
      </SwipeableActionCard>

      <View style={styles.insightGrid}>
        <SwipeableActionCard
          style={styles.insightSwipeItem}
          onPress={() => handleRoute('/lottomind-ai')}
          onSwipeLeft={() => handleRoute('/lottomind-ai')}
          onSwipeRight={() => handleRoute('/lottomind-ai')}
        >
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Recommended Numbers</Text>
          <View style={styles.numberRow}>
            {hotPreview.map((number) => (
              <View key={`hot-${number}`} style={styles.numberBall}>
                <Text style={styles.numberText}>{number}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.panelHint}>Hot trend set for {currentGame}</Text>
        </View>
        </SwipeableActionCard>

        <SwipeableActionCard
          style={styles.insightSwipeItem}
          onPress={() => handleRoute('/live-data')}
          onSwipeLeft={() => handleRoute('/live-data')}
          onSwipeRight={() => handleRoute('/live-data')}
        >
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>{liveJackpot?.gameName ?? 'Jackpot Watch'}</Text>
          <Text style={styles.jackpotValue}>{liveJackpot?.currentJackpot ?? 'Syncing'}</Text>
          <Text style={styles.panelHint}>{liveJackpot?.nextDrawDate ?? 'Live jackpot feed warming up'}</Text>
        </View>
        </SwipeableActionCard>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.hotColdHeader}>
          <Text style={styles.insightTitle}>Signal Split</Text>
          <Text style={styles.panelHint}>Hot vs cold movement</Text>
        </View>
        <View style={styles.splitRow}>
          <View style={styles.splitColumn}>
            <Text style={styles.hotLabel}>Hot</Text>
            <View style={styles.numberRow}>
              {hotPreview.slice(0, 4).map((number) => (
                <View key={`split-hot-${number}`} style={[styles.numberBall, styles.hotBall]}>
                  <Text style={styles.numberText}>{number}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitColumn}>
            <Text style={styles.coldLabel}>Cold</Text>
            <View style={styles.numberRow}>
              {coldPreview.slice(0, 4).map((number) => (
                <View key={`split-cold-${number}`} style={[styles.numberBall, styles.coldBall]}>
                  <Text style={styles.numberText}>{number}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

    </View>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  variant,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  accent: string;
  variant: MetricVariant;
}) {
  const palette = METRIC_CARD_VARIANTS[variant];

  return (
    <ImageBackground
      source={dashboardMetricEmblemImage}
      resizeMode="cover"
      style={[styles.metricCard, { borderColor: palette.borderColor, shadowColor: palette.shadowColor }]}
      imageStyle={styles.metricCardImage}
    >
      <LinearGradient colors={palette.colors} style={styles.metricCardGradient}>
        <View style={[styles.metricIcon, { borderColor: `${accent}66`, backgroundColor: palette.iconBackground }]}>
          <Icon size={17} color={accent} />
        </View>
        <Text style={[styles.metricLabel, { color: palette.labelColor }]} numberOfLines={2}>
          {label}
        </Text>
        <Text style={[styles.metricValue, { color: palette.valueColor }]} numberOfLines={1}>
          {value}
        </Text>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 14,
    position: 'relative',
  },
  topBar: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 80,
    elevation: 20,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.66)',
    backgroundColor: 'rgba(4, 16, 34, 0.86)',
    overflow: 'hidden',
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#31F7C8',
    shadowColor: '#31F7C8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  liveText: {
    color: '#7DE8FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  helpMenuAnchor: {
    position: 'relative',
    zIndex: 30,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9, 22, 46, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.25)',
  },
  helpQuickMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    zIndex: 999,
    width: 196,
    borderRadius: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(8, 20, 43, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.32)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.34,
    shadowRadius: 18,
    elevation: 16,
  },
  helpQuickItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  helpQuickCopy: {
    flex: 1,
    gap: 2,
  },
  helpQuickTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  helpQuickSub: {
    color: '#8FA6BA',
    fontSize: 11,
    fontWeight: '700',
  },
  helpQuickDivider: {
    height: 1,
    marginHorizontal: 10,
    backgroundColor: 'rgba(230, 194, 96, 0.14)',
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.28)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 42,
    height: 42,
  },
  searchBar: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(5, 18, 38, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.2)',
  },
  searchText: {
    flex: 1,
    color: '#9BB3C9',
    fontSize: 13,
    fontWeight: '600',
  },
  searchChip: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.24)',
  },
  searchChipText: {
    color: '#84F4FF',
    fontSize: 10,
    fontWeight: '900',
  },
  heroCard: {
    minHeight: 264,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(125, 232, 255, 0.32)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 9,
  },
  heroCardCompact: {
    minHeight: 242,
  },
  heroCardImage: {
    borderRadius: 28,
  },
  heroScrim: {
    flex: 1,
    padding: 20,
  },
  staticCircuitGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '58%',
    backgroundColor: 'rgba(1, 8, 20, 0.42)',
  },
  staticCircuitGlowCompact: {
    width: '40%',
  },
  heroCopy: {
    width: '56%',
    gap: 9,
    zIndex: 2,
  },
  heroCopyCompact: {
    width: '62%',
  },
  heroCopyUltraCompact: {
    width: '66%',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.goldLight,
  },
  heroBadgeText: {
    color: '#1A1200',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  heroKicker: {
    color: '#9BB3C9',
    fontSize: 13,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  heroSub: {
    color: '#B4C7D8',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  heroButtons: {
    gap: 8,
    marginTop: 4,
  },
  primaryButton: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: Colors.goldLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#07101F',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.35)',
    backgroundColor: 'rgba(230, 194, 96, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: Colors.goldLight,
    fontSize: 13,
    fontWeight: '900',
  },
  arcadeImageButton: {
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.62)',
    backgroundColor: 'rgba(11, 7, 24, 0.88)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  arcadeImage: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: 'rgba(3, 8, 18, 0.92)',
  },
  arcadeFallbackImage: {
    ...StyleSheet.absoluteFillObject,
  },
  arcadeImageStyle: {
    borderRadius: 16,
  },
  arcadeImageOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 9,
    backgroundColor: 'rgba(4, 3, 12, 0.18)',
  },
  arcadeLabelPill: {
    alignSelf: 'flex-start',
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  arcadeLabelText: {
    color: '#07101F',
    fontSize: 12,
    fontWeight: '900',
  },
  heroIntelligencePanel: {
    position: 'absolute',
    right: 12,
    top: 18,
    bottom: 18,
    width: '40%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(1, 8, 20, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(135, 247, 255, 0.32)',
    overflow: 'hidden',
  },
  heroIntelligencePanelCompact: {
    right: 10,
    top: 24,
    bottom: 24,
    width: '32%',
    borderRadius: 20,
  },
  heroIntelligencePanelUltraCompact: {
    right: 8,
    top: 30,
    bottom: 30,
    width: '26%',
    borderRadius: 18,
  },
  heroVideo: {
    width: '88%',
    height: '82%',
  },
  heroVideoCompact: {
    width: '82%',
    height: '74%',
  },
  heroVideoUltraCompact: {
    width: '76%',
    height: '66%',
  },
  heroVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 8, 20, 0.08)',
  },
  statePanel: {
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(8, 20, 43, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.18)',
  },
  stateCopy: {
    flex: 1,
    gap: 2,
  },
  panelLabel: {
    color: '#7DB8D6',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  panelValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  panelHint: {
    color: '#8FA6BA',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 20, 43, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.16)',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  metricCardImage: {
    opacity: 0.54,
  },
  metricCardGradient: {
    flex: 1,
    padding: 10,
    gap: 5,
    justifyContent: 'space-between',
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  metricLabel: {
    color: '#8FA6BA',
    fontSize: 10,
    fontWeight: '800',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  creditPanel: {
    borderRadius: 20,
    padding: 14,
    gap: 9,
    backgroundColor: 'rgba(8, 20, 43, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.24)',
  },
  creditPanelLow: {
    borderColor: 'rgba(245, 166, 35, 0.62)',
  },
  creditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creditValue: {
    color: Colors.goldLight,
    fontSize: 16,
    fontWeight: '900',
  },
  creditTrack: {
    height: 9,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: 'rgba(230, 194, 96, 0.12)',
  },
  creditFill: {
    height: '100%',
    borderRadius: 9,
    backgroundColor: Colors.goldLight,
  },
  commandCarousel: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 10,
  },
  commandSwipeItem: {
    flexShrink: 0,
  },
  commandCard: {
    flex: 1,
    minHeight: 102,
    borderRadius: 20,
    padding: 13,
    backgroundColor: 'rgba(8, 20, 43, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.18)',
    gap: 10,
  },
  commandArcadeCard: {
    position: 'relative',
    minHeight: 0,
    aspectRatio: 16 / 9,
    width: '100%',
    padding: 0,
    overflow: 'hidden',
    borderColor: 'rgba(212, 175, 55, 0.62)',
    backgroundColor: '#030812',
  },
  commandPowerToolsCard: {
    position: 'relative',
    minHeight: 0,
    aspectRatio: 16 / 9,
    width: '100%',
    padding: 0,
    overflow: 'hidden',
    borderColor: 'rgba(212, 175, 55, 0.62)',
    backgroundColor: 'rgba(3, 8, 18, 0.92)',
  },
  commandArcadeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 8,
    backgroundColor: 'rgba(0, 8, 20, 0.04)',
  },
  commandArcadePill: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  commandArcadePillText: {
    color: '#07101F',
    fontSize: 11,
    fontWeight: '900',
  },
  commandMerchCard: {
    position: 'relative',
    minHeight: 0,
    aspectRatio: 16 / 9,
    width: '100%',
    padding: 0,
    overflow: 'hidden',
    borderColor: 'rgba(249, 199, 79, 0.56)',
    backgroundColor: '#030812',
  },
  commandMerchImage: {
    width: '100%',
    height: '100%',
  },
  commandMerchOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 8,
  },
  commandMerchPill: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  commandMerchPillText: {
    color: '#07101F',
    fontSize: 11,
    fontWeight: '900',
  },
  commandMerchCaption: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.72)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  commandMerchDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  commandMerchDot: {
    width: 12,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
  },
  commandMerchDotActive: {
    width: 18,
    backgroundColor: Colors.goldLight,
  },
  commandRecordCard: {
    position: 'relative',
    minHeight: 0,
    aspectRatio: 16 / 9,
    width: '100%',
    padding: 9,
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderColor: 'rgba(230, 194, 96, 0.42)',
    backgroundColor: 'rgba(8, 20, 43, 0.94)',
  },
  commandRecordAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.goldLight,
  },
  commandRecordPill: {
    alignSelf: 'flex-start',
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  commandRecordPillText: {
    color: '#07101F',
    fontSize: 10,
    fontWeight: '900',
  },
  commandRecordCopy: {
    gap: 1,
  },
  commandRecordKicker: {
    color: Colors.goldLight,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  commandRecordTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  commandRecordFormat: {
    color: '#9BB3C9',
    fontSize: 10,
    fontWeight: '700',
  },
  commandRecordTags: {
    flexDirection: 'row',
    gap: 4,
  },
  commandRecordTag: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(230, 194, 96, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.22)',
  },
  commandRecordTagText: {
    color: Colors.goldLight,
    fontSize: 9,
    fontWeight: '900',
  },
  commandIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  commandTextWrap: {
    flex: 1,
  },
  commandTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  commandDetail: {
    color: '#8FA6BA',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  recordDropCard: {
    position: 'relative',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 20, 43, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.3)',
  },
  recordAccentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.goldLight,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 199, 79, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 199, 79, 0.3)',
  },
  recordCopy: {
    flex: 1,
    gap: 3,
  },
  recordEyebrow: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  recordTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  recordDetail: {
    color: '#9BB3C9',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  recordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  recordFormat: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  recordTagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  recordTag: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(230, 194, 96, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.22)',
  },
  recordTagText: {
    color: Colors.goldLight,
    fontSize: 10,
    fontWeight: '900',
  },
  insightGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  insightSwipeItem: {
    flex: 1,
  },
  insightCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
    backgroundColor: 'rgba(8, 20, 43, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.18)',
  },
  insightTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  numberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  numberBall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.28)',
  },
  hotBall: {
    backgroundColor: 'rgba(255, 98, 64, 0.16)',
    borderColor: 'rgba(255, 98, 64, 0.36)',
  },
  coldBall: {
    backgroundColor: 'rgba(41, 121, 255, 0.17)',
    borderColor: 'rgba(41, 121, 255, 0.38)',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  jackpotValue: {
    color: Colors.goldLight,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  hotColdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  splitColumn: {
    flex: 1,
    gap: 8,
  },
  splitDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(100, 198, 255, 0.18)',
  },
  hotLabel: {
    color: '#FF9E81',
    fontSize: 12,
    fontWeight: '900',
  },
  coldLabel: {
    color: '#77B4FF',
    fontSize: 12,
    fontWeight: '900',
  },
  toolRail: {
    flexDirection: 'row',
    gap: 8,
  },
  railSwipeItem: {
    flex: 1,
  },
  railButton: {
    minHeight: 46,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(230, 194, 96, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(230, 194, 96, 0.22)',
  },
  railText: {
    color: Colors.goldLight,
    fontSize: 11,
    fontWeight: '900',
  },
});
