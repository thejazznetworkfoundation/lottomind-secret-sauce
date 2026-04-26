import React, { useCallback } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { unstable_createElement } from 'react-native-web';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import {
  BarChart3,
  Brain,
  CalendarDays,
  ChevronRight,
  CloudLightning,
  Grid3x3,
  Hash,
  Heart,
  MapPin,
  Radio,
  ScanLine,
  ShoppingBag,
  Sparkles,
  Sun,
  Ticket,
  Trophy,
  WandSparkles,
  Zap,
} from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';
import { ArcadeGameSprite } from '@/components/arcade/ArcadeGameSprite';
import SwipeableActionCard from '@/components/SwipeableActionCard';
import { Colors } from '@/constants/colors';
import { arcadeGameCatalog } from '@/games/registry';
import { usePro } from '@/providers/ProProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { useTrivia } from '@/providers/TriviaProvider';
import type { ArcadeGameCatalogEntry } from '@/types/stage';

const powerToolsHeroImage = require('@/assets/images/powertools-hero-bg.png');
const playArcadeButtonImage = require('@/assets/arcade/play-arcade-coin-button-transparent.png');
const DONATION_URL = 'http://thejazznetworkfoundation.org';
const DONATION_LABEL = 'The Jazz Network Foundation';
const PLAY_ARCADE_VIDEO_PATH = '/videos/play-arcade-button-loop.mp4';
const GITHUB_PAGES_BASE_PATH = '/lottomind-secret-sauce';

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

function ArcadeToolMedia() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.arcadeToolVideoFrame}>
        <PlayArcadePreviewVideo />
        <View style={styles.arcadeToolOverlay}>
          <View style={styles.arcadeToolPill}>
            <Trophy size={14} color="#07101F" />
            <Text style={styles.arcadeToolPillText}>Play Arcade</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ImageBackground
      source={playArcadeButtonImage}
      resizeMode="contain"
      style={styles.arcadeToolImage}
      imageStyle={styles.arcadeToolImageStyle}
    >
      <View style={styles.arcadeToolOverlay}>
        <View style={styles.arcadeToolPill}>
          <Trophy size={14} color="#07101F" />
          <Text style={styles.arcadeToolPillText}>Play Arcade</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

interface PowerTool {
  title: string;
  detail: string;
  route: string;
  accent: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  locked?: boolean;
  lockMessage?: string;
  game?: ArcadeGameCatalogEntry;
}

interface PowerSection {
  title: string;
  subtitle: string;
  tools: PowerTool[];
}

function getGamePowerToolRoute(game: ArcadeGameCatalogEntry) {
  if (game.kind === 'route') {
    return game.routePath;
  }

  return `/arcade?game=${encodeURIComponent(game.id)}`;
}

function getGamePowerToolIcon(game: ArcadeGameCatalogEntry) {
  if (game.kind === 'web') {
    return Zap;
  }

  if (game.kind === 'native') {
    return Trophy;
  }

  return Sparkles;
}

const fixedGameTools: PowerTool[] = arcadeGameCatalog.map((game) => ({
  title: game.title,
  detail: `${game.subtitle}. 16/32-bit 2D cabinet ready.`,
  route: getGamePowerToolRoute(game),
  accent: game.accentColor,
  icon: getGamePowerToolIcon(game),
  game,
}));

export default function PowerToolsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro } = usePro();
  const { isPsychicEnabled } = useSettings();
  const { isFeatureUnlocked } = useTrivia();
  const scannerLocked = !isPro && !isFeatureUnlocked('exclusive_set');
  const liveDataLocked = !isPro && !isFeatureUnlocked('live_data');

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
      console.log('[PowerTools] Failed to open donation link', error);
      Alert.alert('Unable to open donation page', 'Please try again in a moment.');
    }
  }, []);

  const sections: PowerSection[] = [
    {
      title: 'Fixed Games',
      subtitle: 'Every repaired LottoMind game build, ready from Power Tools.',
      tools: fixedGameTools,
    },
    {
      title: 'AI Intelligence',
      subtitle: 'Analyze signals, dreams, sequences, and number heat.',
      tools: [
        {
          title: 'Dream Oracle',
          detail: 'Turn dream symbols into lucky number sets.',
          route: '/dreams',
          accent: '#9B8CE8',
          icon: WandSparkles,
        },
        ...(isPsychicEnabled
          ? [
              {
                title: 'AI Psychic Engine',
                detail: 'Entertainment readings, energy score, and number inspiration.',
                route: '/psychic',
                accent: '#8B5CF6',
                icon: Sparkles,
              },
              {
                title: 'Future Read Mode',
                detail: 'Ask timing questions and get symbolic next-draw strategy.',
                route: '/future-read',
                accent: '#A78BFA',
                icon: CalendarDays,
              },
              {
                title: 'Daily Fortune Drop',
                detail: 'Daily energy, lucky color, focus, and suggested numbers.',
                route: '/daily-fortune',
                accent: '#F59E0B',
                icon: Sun,
              },
              {
                title: 'Personal Luck Profile',
                detail: 'Build your evolving fingerprint from name, birthdate, behavior, and picks.',
                route: '/luck-profile',
                accent: '#C4B5FD',
                icon: Brain,
              },
            ]
          : []),
        {
          title: 'Run AI Picks',
          detail: 'Generate LottoMind™ number insights.',
          route: '/lottomind-ai',
          accent: '#00E5FF',
          icon: Brain,
        },
        {
          title: 'Nationwide Number Analysis',
          detail: 'Compare national number trends and draw behavior.',
          route: '/nationwide-analysis',
          accent: '#2ECC71',
          icon: BarChart3,
        },
        {
          title: 'Heatmap',
          detail: 'See matrix-aware hot and cold number movement.',
          route: '/heatmap',
          accent: '#FF6B35',
          icon: Grid3x3,
        },
        {
          title: 'Sequence Engine',
          detail: 'Detect patterns, mirrors, and repeats.',
          route: '/sequence',
          accent: '#31F7C8',
          icon: Sparkles,
        },
      ],
    },
    {
      title: 'Play, Scan, Earn',
      subtitle: 'Fast paths for games, tickets, live draws, and credits.',
      tools: [
        {
          title: 'LottoMind™ Arcade',
          detail: 'Play Jackpot Jungle Chase, Vault Run, Jungle Lotto, Gothtechnology, and more.',
          route: '/arcade',
          accent: Colors.gold,
          icon: Trophy,
        },
        {
          title: 'Ticket Scanner',
          detail: 'Scan and check tickets.',
          route: '/scanner',
          accent: '#00E676',
          icon: ScanLine,
          locked: scannerLocked,
          lockMessage: 'Unlock Ticket Scanner with Pro or 250 Mind Credits in Trivia Rewards.',
        },
        {
          title: 'Live Data',
          detail: 'Real-time draw results and jackpot updates.',
          route: '/live-data',
          accent: '#FF6B35',
          icon: Radio,
          locked: liveDataLocked,
          lockMessage: 'Unlock Live Draw Data with Pro or 150 Mind Credits in Trivia Rewards.',
        },
        {
          title: 'News Radar',
          detail: 'Rule-change, jackpot, and saved-game alert feed.',
          route: '/live-data',
          accent: '#31F7C8',
          icon: Radio,
          locked: liveDataLocked,
          lockMessage: 'Unlock Live Draw Data to use News Radar alerts.',
        },
        {
          title: 'Credit Vault',
          detail: 'Buy, earn, and manage Mind Credits.',
          route: '/credit-store',
          accent: '#F9C74F',
          icon: Ticket,
        },
      ],
    },
    {
      title: 'Daily Helpers',
      subtitle: 'Location, weather, Pick games, shop, and social tools.',
      tools: [
        {
          title: 'Daily 3 / Daily 4 Power Lab',
          detail: 'Straight, box, sum, root, pair, and mirror tools.',
          route: '/pick-games',
          accent: '#00E676',
          icon: Hash,
        },
        {
          title: 'Daily Horoscope',
          detail: 'Zodiac lucky numbers and daily energy.',
          route: '/horoscope',
          accent: '#FFB74D',
          icon: Sun,
        },
        {
          title: 'Lucky Weather',
          detail: 'Weather-powered lucky number ideas.',
          route: '/lucky-weather',
          accent: '#F59E0B',
          icon: CloudLightning,
        },
        {
          title: 'Retailer Intelligence',
          detail: 'Find retailers, save favorites, route stops, and scratcher stock signals.',
          route: '/store-locator',
          accent: Colors.gold,
          icon: MapPin,
        },
        {
          title: 'US Lottery Results',
          detail: 'State results, jackpots, and draw data.',
          route: '/us-lottery',
          accent: '#3498DB',
          icon: BarChart3,
        },
        {
          title: 'Shop',
          detail: 'E-books, merch, and LottoMind™ gear.',
          route: '/shop',
          accent: '#D4AF37',
          icon: ShoppingBag,
        },
        {
          title: 'Viral Studio',
          detail: 'Create social posts and short-form scripts.',
          route: '/viral-studio',
          accent: '#FF4500',
          icon: Zap,
        },
      ],
    },
  ];

  const openTool = (tool: PowerTool) => {
    if (tool.locked) {
      Alert.alert('Power Tool Locked', tool.lockMessage ?? 'Unlock this tool with Pro or Mind Credits.', [
        { text: 'Go Pro', onPress: () => router.push('/paywall' as never) },
        { text: 'Earn Credits', onPress: () => router.push('/trivia-rewards' as never) },
        { text: 'OK' },
      ]);
      return;
    }

    router.push(tool.route as never);
  };

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={powerToolsHeroImage}
          resizeMode="cover"
          style={styles.heroCard}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroScrim}>
          <Text style={styles.eyebrow}>Power Tools</Text>
          <Text style={styles.heroTitle}>Every LottoMind™ tool in one place.</Text>
          <Text style={styles.heroBody}>
            Use this bottom tab as the clean control room for AI picks, scans, arcade credits, live data, and daily helpers.
          </Text>
          </View>
        </ImageBackground>

        <TouchableOpacity
          style={styles.intelligenceCard}
          onPress={() => router.push('/intelligence' as never)}
          activeOpacity={0.85}
          testID="powertools-intelligence"
        >
          <View style={styles.intelligenceIcon}>
            <Brain size={22} color="#8B5CF6" />
          </View>
          <View style={styles.intelligenceInfo}>
            <Text style={styles.intelligenceTitle}>Intelligence Analysis</Text>
            <Text style={styles.intelligenceSub}>Context-aware pattern analysis & smart picks</Text>
          </View>
          <ChevronRight size={18} color="#8B5CF6" />
        </TouchableOpacity>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              directionalLockEnabled
              nestedScrollEnabled
              contentContainerStyle={styles.toolGrid}
            >
              {section.tools.map((tool) => {
                const Icon = tool.icon;
                const isArcadeTool = tool.route === '/arcade';
                const isGameTool = Boolean(tool.game);
                return (
                  <SwipeableActionCard
                    key={tool.title}
                    style={styles.swipeColumn}
                    onPress={() => openTool(tool)}
                    onSwipeLeft={() => openTool(tool)}
                    onSwipeRight={() => openTool(tool)}
                  >
                  <Pressable
                    onPress={() => openTool(tool)}
                    style={[
                      styles.toolCard,
                      isArcadeTool && styles.arcadeToolCard,
                      isGameTool && styles.gameToolCard,
                      tool.locked && styles.toolCardLocked,
                    ]}
                  >
                    {isArcadeTool ? (
                      <ArcadeToolMedia />
                    ) : (
                      <>
                        {tool.game ? (
                          <View style={styles.gameToolHeader}>
                            <ArcadeGameSprite game={tool.game} size={52} compact />
                            <View style={styles.gameToolMeta}>
                              <Text style={[styles.gameToolMode, { color: tool.accent }]}>
                                {tool.game.kind === 'native' ? 'Native' : tool.game.kind === 'web' ? 'Web Play' : 'App Game'}
                              </Text>
                              <Text style={styles.gameToolReward}>{tool.game.rewardLabel}</Text>
                            </View>
                          </View>
                        ) : (
                          <View style={[styles.iconWrap, { borderColor: `${tool.accent}55`, backgroundColor: `${tool.accent}12` }]}>
                            <Icon size={22} color={tool.accent} />
                          </View>
                        )}
                        <View style={styles.toolCopy}>
                          <View style={styles.toolTitleRow}>
                            <Text style={styles.toolTitle}>{tool.title}</Text>
                            {tool.locked ? <Text style={styles.lockedPill}>LOCKED</Text> : null}
                          </View>
                          <Text style={styles.toolDetail}>{tool.detail}</Text>
                          <Text style={styles.swipeHint}>Swipe to open</Text>
                        </View>
                      </>
                    )}
                    {isArcadeTool && tool.locked ? (
                      <View style={styles.arcadeLockedBadge}>
                        <Text style={styles.lockedPill}>LOCKED</Text>
                      </View>
                    ) : null}
                  </Pressable>
                  </SwipeableActionCard>
                );
              })}
            </ScrollView>
          </View>
        ))}

        <View style={styles.donateCard}>
          <View style={styles.donateHeader}>
            <Image
              source={require('@/assets/images/jazz-network-logo.jpeg')}
              style={styles.donateLogo}
              resizeMode="cover"
            />
            <View style={styles.donateCopy}>
              <Text style={styles.donateTitle}>Support {DONATION_LABEL}</Text>
              <Text style={styles.donateDescription}>
                Enjoying LottoMind? Help fund the mission from the Power Tools hub.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.donateButton}
            onPress={() => {
              void handleDonate();
            }}
            activeOpacity={0.85}
            testID="powertools-donate-button"
          >
            <Heart size={16} color={Colors.background} fill={Colors.background} />
            <Text style={styles.donateButtonText}>Donate now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 112,
    gap: 16,
  },
  heroCard: {
    width: '100%',
    borderRadius: 22,
    height: 255,
    backgroundColor: 'rgba(6, 15, 31, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    borderRadius: 22,
  },
  heroScrim: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
    backgroundColor: 'rgba(3, 8, 18, 0.24)',
  },
  eyebrow: {
    color: '#7DE8FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroBody: {
    marginTop: 10,
    color: '#AFC4D7',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  intelligenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 18, 36, 0.92)',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.24)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
  },
  intelligenceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.26)',
  },
  intelligenceInfo: {
    flex: 1,
    gap: 3,
  },
  intelligenceTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#A78BFA',
  },
  intelligenceSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  section: {
    gap: 10,
    borderRadius: 20,
    padding: 12,
    backgroundColor: 'rgba(7, 16, 33, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: '#8FA6BA',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  toolGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 12,
  },
  swipeColumn: {
    width: 228,
  },
  toolCard: {
    flex: 1,
    minHeight: 132,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    backgroundColor: 'rgba(10, 22, 40, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  toolCardLocked: {
    opacity: 0.72,
    borderColor: 'rgba(255, 107, 53, 0.28)',
  },
  arcadeToolCard: {
    height: 128,
    minHeight: 128,
    padding: 0,
    overflow: 'hidden',
    borderColor: 'rgba(212, 175, 55, 0.52)',
    backgroundColor: 'rgba(3, 8, 18, 0.96)',
  },
  gameToolCard: {
    minHeight: 164,
    backgroundColor: 'rgba(5, 12, 26, 0.94)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  gameToolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gameToolMeta: {
    flex: 1,
    gap: 5,
  },
  gameToolMode: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  gameToolReward: {
    alignSelf: 'flex-start',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
  },
  arcadeToolVideoFrame: {
    position: 'relative',
    flex: 1,
    height: 128,
    minHeight: 128,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3, 8, 18, 0.96)',
  },
  arcadeToolImage: {
    position: 'relative',
    flex: 1,
    minHeight: 128,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3, 8, 18, 0.96)',
  },
  arcadeToolImageStyle: {
    borderRadius: 16,
  },
  arcadeToolOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: 'rgba(0, 8, 20, 0.02)',
  },
  arcadeToolPill: {
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
  arcadeToolPillText: {
    color: '#07101F',
    fontSize: 12,
    fontWeight: '900',
  },
  arcadeLockedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toolCopy: {
    flex: 1,
    gap: 5,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  toolTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  lockedPill: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 107, 53, 0.14)',
    color: '#FF9D75',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  toolDetail: {
    color: '#8FA6BA',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  swipeHint: {
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
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
});
