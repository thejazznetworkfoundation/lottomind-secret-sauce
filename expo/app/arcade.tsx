import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';

import AppBackground from '@/components/AppBackground';
import { ArcadeGameCard } from '@/components/arcade/ArcadeGameCard';
import { ArcadeHUD } from '@/components/arcade/ArcadeHUD';
import { StageRenderer } from '@/components/game/StageRenderer';
import { ARCADE_COLORS } from '@/constants/arcade';
import { Colors } from '@/constants/colors';
import { useGamification } from '@/providers/GamificationProvider';
import { arcadeGameCatalog, arcadeGameCategories, gemRushStage } from '@/stages';
import { useArcadeEngine } from '@/systems/arcadeEngine';
import type { ArcadeGameCatalogEntry } from '@/types/stage';

function formatCredits(value: number) {
  return value.toLocaleString();
}

function getRunCreditReward(game: ArcadeGameCatalogEntry, score: number, victory: boolean) {
  const base = game.kind === 'native' ? 18 : 12;
  const scoreBonus = Math.floor(score / (game.kind === 'native' ? 220 : 80));
  const winBonus = victory ? 45 : 0;

  return Math.max(10, Math.min(260, base + scoreBonus + winBonus));
}

const GITHUB_PAGES_BASE_PATH = '/lottomind-secret-sauce';

function getHostedGamePath(path: string) {
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

function ActionButton({
  label,
  onPressIn,
  onPressOut,
  accent = ARCADE_COLORS.panelSoft,
  wide = false,
}: {
  label: string;
  onPressIn: () => void;
  onPressOut?: () => void;
  accent?: string;
  wide?: boolean;
}) {
  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.actionButton, wide && styles.actionButtonWide, { backgroundColor: accent }]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

function MobileCreditChallenge({
  game,
  onAward,
}: {
  game: ArcadeGameCatalogEntry;
  onAward: (credits: number, title: string) => void;
}) {
  const [status, setStatus] = useState<'ready' | 'running' | 'complete'>('ready');
  const [timeLeft, setTimeLeft] = useState(24);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const awardedRef = useRef(false);
  const isGoth = game.id === 'gothtechnology';

  useEffect(() => {
    if (status !== 'running') {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setStatus('complete');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== 'complete' || awardedRef.current) {
      return;
    }

    awardedRef.current = true;
    onAward(getRunCreditReward(game, score, true), game.title);
  }, [game, onAward, score, status]);

  const start = () => {
    awardedRef.current = false;
    setScore(0);
    setCombo(1);
    setTimeLeft(24);
    setStatus('running');
  };

  const tapTarget = () => {
    if (status !== 'running') {
      return;
    }

    const nextCombo = Math.min(9, combo + 1);
    setCombo(nextCombo);
    setScore((current) => current + (isGoth ? 35 : 28) * nextCombo);

    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  };

  const challengeLabel = isGoth ? 'Fire Neon Pulse' : 'Collect Jungle Vault';

  return (
    <View style={[styles.challengeCard, { borderColor: `${game.accentColor}66` }]}>
      <View style={[styles.challengeGlow, { backgroundColor: game.accentColor }]} />
      <Text style={[styles.challengeKicker, { color: game.accentColor }]}>{game.categoryLabel} Mobile Mode</Text>
      <Text style={styles.challengeTitle}>{game.title}</Text>
      <Text style={styles.challengeBody}>
        {isGoth
          ? 'Tap fast to fire neon shots, stack combos, and convert your score into Mind Credits.'
          : 'Tap the vault target to collect treasures before the timer expires and bank Mind Credits.'}
      </Text>

      <View style={styles.challengeStatsRow}>
        <View style={styles.challengeStat}>
          <Text style={styles.challengeStatLabel}>Score</Text>
          <Text style={styles.challengeStatValue}>{score}</Text>
        </View>
        <View style={styles.challengeStat}>
          <Text style={styles.challengeStatLabel}>Time</Text>
          <Text style={styles.challengeStatValue}>{timeLeft}s</Text>
        </View>
        <View style={styles.challengeStat}>
          <Text style={styles.challengeStatLabel}>Combo</Text>
          <Text style={styles.challengeStatValue}>x{combo}</Text>
        </View>
      </View>

      <Pressable
        onPress={status === 'running' ? tapTarget : start}
        style={[styles.challengeTarget, { backgroundColor: game.accentColor }]}
      >
        <Text style={styles.challengeTargetIcon}>{isGoth ? 'ZAP' : 'GEM'}</Text>
        <Text style={styles.challengeTargetText}>
          {status === 'running' ? challengeLabel : status === 'complete' ? 'Run Again' : 'Start Mobile Run'}
        </Text>
      </Pressable>
    </View>
  );
}

function WebArcadeCabinet({
  game,
  onAward,
}: {
  game: Extract<ArcadeGameCatalogEntry, { kind: 'web' }>;
  onAward: (credits: number, title: string) => void;
}) {
  const { width, height } = useWindowDimensions();
  const [frameKey, setFrameKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const awardedLaunchRef = useRef(false);
  const frameHeight = Math.round(Math.max(430, Math.min(760, height * (width < 430 ? 0.72 : 0.66))));
  const hostedEmbedPath = useMemo(() => getHostedGamePath(game.embedPath), [game.embedPath]);
  const frameSrc = `${hostedEmbedPath}${hostedEmbedPath.includes('?') ? '&' : '?'}arcade=1`;

  useEffect(() => {
    setIsLoaded(false);
    awardedLaunchRef.current = false;
  }, [game.id, frameKey]);

  const handleFrameLoad = useCallback(() => {
    setIsLoaded(true);
    if (!awardedLaunchRef.current && game.launchRewardCredits) {
      awardedLaunchRef.current = true;
      onAward(game.launchRewardCredits, game.title);
    }
  }, [game.launchRewardCredits, game.title, onAward]);

  const openStandalone = useCallback(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(hostedEmbedPath, '_blank', 'noopener,noreferrer');
      return;
    }

    void Linking.openURL(hostedEmbedPath);
  }, [hostedEmbedPath]);

  if (Platform.OS !== 'web') {
    return <MobileCreditChallenge game={game} onAward={onAward} />;
  }

  const iframeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 0,
    display: 'block',
    background: '#020610',
  };

  return (
    <View style={[styles.webCabinet, { borderColor: `${game.accentColor}66` }]}>
      <View style={styles.webCabinetHeader}>
        <View style={styles.webCabinetTitleWrap}>
          <Text style={[styles.webCabinetKicker, { color: game.accentColor }]}>{game.categoryLabel} Cabinet</Text>
          <Text style={styles.webCabinetTitle}>{game.title}</Text>
          <Text style={styles.webCabinetHint}>Playable in this arcade window. Use touch controls inside the cabinet.</Text>
        </View>
        <View style={styles.webCabinetActions}>
          <Pressable style={styles.webCabinetButton} onPress={() => setFrameKey((current) => current + 1)}>
            <Text style={styles.webCabinetButtonText}>Restart</Text>
          </Pressable>
          <Pressable style={[styles.webCabinetButton, { borderColor: `${game.accentColor}66` }]} onPress={openStandalone}>
            <Text style={[styles.webCabinetButtonText, { color: game.accentColor }]}>Full Screen</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.webFrameShell, { height: frameHeight }]}>
        {!isLoaded ? (
          <View style={styles.webLoadingOverlay}>
            <Text style={[styles.webLoadingText, { color: game.accentColor }]}>Booting cabinet...</Text>
          </View>
        ) : null}
        {React.createElement('iframe', {
          key: `${game.id}-${frameKey}`,
          src: frameSrc,
          title: game.title,
          style: iframeStyle,
          allow: 'autoplay; fullscreen; gamepad',
          allowFullScreen: true,
          sandbox: 'allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups',
          onLoad: handleFrameLoad,
        })}
      </View>
    </View>
  );
}

export default function ArcadeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { credits, addCredits } = useGamification();
  const [activeGameId, setActiveGameId] = useState(arcadeGameCatalog[0]?.id ?? null);
  const [lastAward, setLastAward] = useState<{ credits: number; title: string } | null>(null);
  const awardedRunKeyRef = useRef<string | null>(null);

  const activeGame = useMemo<ArcadeGameCatalogEntry>(
    () => arcadeGameCatalog.find((game) => game.id === activeGameId) ?? arcadeGameCatalog[0]!,
    [activeGameId]
  );
  const fallbackNativeGame = arcadeGameCatalog.find(
    (game): game is Extract<ArcadeGameCatalogEntry, { kind: 'native' }> => game.kind === 'native'
  );
  const activeNativeGame = activeGame.kind === 'native' ? activeGame : null;
  const activeWebGame = activeGame.kind === 'web' ? activeGame : null;
  const stage = activeNativeGame?.stage ?? fallbackNativeGame?.stage ?? gemRushStage;

  const { snapshot, controls } = useArcadeEngine(stage);
  const stageScale = useMemo(() => {
    const widthScale = Math.min(1, (width - 24) / snapshot.viewportWidth);
    const heightScale = Math.min(1, (height * 0.46) / snapshot.viewportHeight);

    return Math.max(0.38, Math.min(widthScale, heightScale));
  }, [height, snapshot.viewportHeight, snapshot.viewportWidth, width]);
  const scaledWidth = snapshot.viewportWidth * stageScale;
  const scaledHeight = snapshot.viewportHeight * stageScale;
  const innerOffsetX = (scaledWidth - snapshot.viewportWidth) / 2;
  const innerOffsetY = (scaledHeight - snapshot.viewportHeight) / 2;

  const awardCredits = useCallback(
    (amount: number, title: string) => {
      addCredits(amount);
      setLastAward({ credits: amount, title });
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    [addCredits]
  );

  useEffect(() => {
    awardedRunKeyRef.current = null;
    controls.resetRun();
  }, [activeGameId, controls]);

  useEffect(() => {
    if (!activeNativeGame || (snapshot.status !== 'victory' && snapshot.status !== 'gameOver')) {
      return;
    }

    const key = `${activeNativeGame.id}-${snapshot.status}-${snapshot.summary.score}-${snapshot.summary.timeRemaining.toFixed(1)}`;

    if (awardedRunKeyRef.current === key) {
      return;
    }

    awardedRunKeyRef.current = key;
    awardCredits(getRunCreditReward(activeNativeGame, snapshot.summary.score, snapshot.status === 'victory'), activeNativeGame.title);
  }, [activeNativeGame, awardCredits, snapshot.status, snapshot.summary.score, snapshot.summary.timeRemaining]);

  const selectGame = (game: ArcadeGameCatalogEntry) => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }

    if (game.kind === 'route') {
      router.push(game.routePath as never);
      return;
    }

    setActiveGameId(game.id);
  };

  const groupedGames = arcadeGameCategories.map((category) => ({
    ...category,
    games: arcadeGameCatalog.filter((game) => game.categoryId === category.id),
  }));

  const utilityLabel =
    snapshot.status === 'running'
      ? 'Pause'
      : snapshot.status === 'paused'
        ? 'Resume'
        : snapshot.status === 'ready'
          ? 'Reset'
          : 'Restart';
  const utilityAction =
    snapshot.status === 'running'
      ? controls.pauseRun
      : snapshot.status === 'paused'
        ? controls.resumeRun
        : controls.resetRun;

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.75}>
        <X size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>LottoMind™ Games</Text>
          <Text style={styles.heroTitle}>Play Arcade Games & Earn Mind Credits</Text>
          <Text style={styles.heroBody}>
            Gem Rush, Jackpot Chase, Classic Jungle, Gothtechnology, and the original LottoMind games now live inside
            one LottoMind™ rewards loop. Complete runs, puzzles, trivia, and card challenges to grow your Mind Credits balance.
          </Text>
          <View style={styles.balancePill}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>{formatCredits(credits)} Credits</Text>
          </View>
          {lastAward ? (
            <View style={styles.awardToast}>
              <Text style={styles.awardText}>+{lastAward.credits} credits from {lastAward.title}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.quickLaunchPanel}>
          <View style={styles.quickLaunchHeader}>
            <Text style={styles.sectionTitle}>Choose A Game</Text>
            <Text style={styles.quickLaunchHint}>Tap a cabinet to load it below</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickLaunchRail}
          >
            {arcadeGameCatalog.map((game) => {
              const isActive = activeGame.id === game.id;
              return (
                <Pressable
                  key={`quick-${game.id}`}
                  onPress={() => selectGame(game)}
                  style={[
                    styles.quickLaunchChip,
                    isActive && styles.quickLaunchChipActive,
                    { borderColor: isActive ? game.accentColor : 'rgba(255,255,255,0.1)' },
                  ]}
                >
                  <Text style={[styles.quickLaunchMode, { color: game.accentColor }]}>
                    {game.kind === 'native' ? 'Native' : game.kind === 'web' ? 'Web Play' : 'App Game'}
                  </Text>
                  <Text style={styles.quickLaunchTitle}>{game.title}</Text>
                  <Text style={styles.quickLaunchCta}>{isActive ? 'Loaded' : game.ctaLabel}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.selectedHeader}>
          <View>
            <Text style={styles.sectionTitle}>Now Playing</Text>
            <Text style={styles.nowPlayingTitle}>{activeGame.title}</Text>
          </View>
          <Text style={[styles.selectedBadge, { color: activeGame.accentColor }]}>{activeGame.categoryLabel}</Text>
        </View>

        {activeGame.kind === 'native' && activeNativeGame ? (
          <>
            <View style={[styles.stageShell, { width: scaledWidth, height: scaledHeight }]}>
              <View
                style={{
                  position: 'absolute',
                  left: innerOffsetX,
                  top: innerOffsetY,
                  width: snapshot.viewportWidth,
                  height: snapshot.viewportHeight,
                  transform: [{ scale: stageScale }],
                }}
              >
                <StageRenderer stage={activeNativeGame.stage} snapshot={snapshot} />
                <ArcadeHUD snapshot={snapshot} />
              </View>
            </View>

            <View style={styles.nativeActions}>
              <Pressable
                style={[styles.primaryButton, { backgroundColor: activeGame.accentColor }]}
                onPress={snapshot.status === 'ready' ? controls.startRun : utilityAction}
              >
                <Text style={styles.primaryButtonText}>{snapshot.status === 'ready' ? activeGame.ctaLabel : utilityLabel}</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={controls.resetRun}>
                <Text style={styles.secondaryButtonText}>Reset Run</Text>
              </Pressable>
            </View>

            <View style={styles.controlsRow}>
              <View style={styles.controlsCluster}>
                <ActionButton label="Left" onPressIn={() => controls.setInput({ left: true })} onPressOut={() => controls.setInput({ left: false })} />
                <ActionButton label="Down" onPressIn={() => controls.setInput({ down: true })} onPressOut={() => controls.setInput({ down: false })} />
                <ActionButton label="Right" onPressIn={() => controls.setInput({ right: true })} onPressOut={() => controls.setInput({ right: false })} />
              </View>
              <View style={styles.controlsCluster}>
                <ActionButton label="Up" onPressIn={() => controls.setInput({ up: true })} onPressOut={() => controls.setInput({ up: false })} />
                <ActionButton
                  label="Jump"
                  wide
                  accent={activeGame.accentColor}
                  onPressIn={() => controls.setInput({ jumpPressed: true, jumpHeld: true })}
                  onPressOut={() => controls.setInput({ jumpHeld: false })}
                />
              </View>
            </View>
          </>
        ) : activeWebGame ? (
          <WebArcadeCabinet game={activeWebGame} onAward={awardCredits} />
        ) : (
          <MobileCreditChallenge game={activeGame} onAward={awardCredits} />
        )}

        <View style={styles.libraryHeader}>
          <Text style={styles.sectionTitle}>Arcade Library</Text>
          <Pressable
            onPress={() => Alert.alert('Credits', 'Native runs, mobile challenges, trivia, puzzles, dice, and card games can award Mind Credits.')}
          >
            <Text style={styles.infoLink}>How credits work</Text>
          </Pressable>
        </View>

        {groupedGames.map((group) => (
          <View key={group.id} style={styles.librarySection}>
            <Text style={styles.groupTitle}>{group.label}</Text>
            {group.games.map((game) => (
              <ArcadeGameCard
                key={game.id}
                game={game}
                bestScore={null}
                totalRuns={0}
                onPlay={() => selectGame(game)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: 36,
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(7, 10, 24, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 201, 95, 0.24)',
  },
  eyebrow: {
    color: ARCADE_COLORS.teal,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: ARCADE_COLORS.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
  },
  heroBody: {
    marginTop: 10,
    color: ARCADE_COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  balancePill: {
    alignSelf: 'flex-start',
    marginTop: 16,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 201, 95, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 201, 95, 0.28)',
  },
  balanceLabel: {
    color: ARCADE_COLORS.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceValue: {
    marginTop: 4,
    color: ARCADE_COLORS.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  awardToast: {
    marginTop: 12,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(130, 234, 107, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(130, 234, 107, 0.28)',
  },
  awardText: {
    color: ARCADE_COLORS.green,
    fontSize: 13,
    fontWeight: '800',
  },
  quickLaunchPanel: {
    marginTop: 18,
    borderRadius: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(7, 12, 27, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickLaunchHeader: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickLaunchHint: {
    color: ARCADE_COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  quickLaunchRail: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 10,
  },
  quickLaunchChip: {
    width: 166,
    minHeight: 104,
    borderRadius: 20,
    padding: 13,
    backgroundColor: 'rgba(4, 9, 21, 0.9)',
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  quickLaunchChipActive: {
    backgroundColor: 'rgba(255, 201, 95, 0.1)',
  },
  quickLaunchMode: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quickLaunchTitle: {
    color: ARCADE_COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  quickLaunchCta: {
    color: ARCADE_COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: ARCADE_COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  nowPlayingTitle: {
    marginTop: 3,
    color: ARCADE_COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  selectedBadge: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stageShell: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: 'rgba(1, 5, 15, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  webCabinet: {
    overflow: 'hidden',
    borderRadius: 28,
    padding: 14,
    backgroundColor: 'rgba(5, 8, 20, 0.94)',
    borderWidth: 1,
  },
  webCabinetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  webCabinetTitleWrap: {
    flex: 1,
  },
  webCabinetKicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  webCabinetTitle: {
    marginTop: 4,
    color: ARCADE_COLORS.text,
    fontSize: 23,
    fontWeight: '900',
  },
  webCabinetHint: {
    marginTop: 5,
    color: ARCADE_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  webCabinetActions: {
    gap: 8,
  },
  webCabinetButton: {
    minWidth: 92,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  webCabinetButtonText: {
    color: ARCADE_COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },
  webFrameShell: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#020610',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  webLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 6, 16, 0.92)',
  },
  webLoadingText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nativeActions: {
    flexDirection: 'row',
    marginTop: 14,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#241503',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    marginLeft: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: ARCADE_COLORS.panel,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryButtonText: {
    color: ARCADE_COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  controlsRow: {
    marginTop: 14,
  },
  controlsCluster: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionButtonWide: {
    flex: 1.55,
  },
  actionButtonText: {
    color: ARCADE_COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  challengeCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    padding: 18,
    backgroundColor: 'rgba(6, 7, 18, 0.92)',
    borderWidth: 1,
  },
  challengeGlow: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.2,
  },
  challengeKicker: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  challengeTitle: {
    marginTop: 6,
    color: ARCADE_COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  challengeBody: {
    marginTop: 8,
    color: ARCADE_COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  challengeStatsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  challengeStat: {
    flex: 1,
    marginRight: 8,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  challengeStatLabel: {
    color: ARCADE_COLORS.muted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  challengeStatValue: {
    marginTop: 4,
    color: ARCADE_COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  challengeTarget: {
    marginTop: 18,
    minHeight: 112,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeTargetIcon: {
    fontSize: 34,
  },
  challengeTargetText: {
    marginTop: 8,
    color: '#210b2d',
    fontSize: 17,
    fontWeight: '900',
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  infoLink: {
    color: ARCADE_COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  librarySection: {
    marginBottom: 8,
  },
  groupTitle: {
    marginBottom: 10,
    color: ARCADE_COLORS.teal,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
