import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ResizeMode, Video } from 'expo-av';
import {
  Bell,
  Brain,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Gauge,
  HelpCircle,
  LineChart,
  Play,
  ScanLine,
  Search,
  Sparkles,
  Ticket,
  Trophy,
  Zap,
} from 'lucide-react-native';

import StatePicker from '@/components/StatePicker';
import { Colors } from '@/constants/colors';
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

const commandCoreVideo = require('@/assets/videos/lottomind-command-core.mp4');

function getNumbersPreview(numbers: number[], fallback: number[]) {
  const source = numbers.length > 0 ? numbers : fallback;
  return source.slice(0, 5).map((value) => String(value).padStart(2, '0'));
}

export default function LottoMindCommandCenter({
  onHelpPress,
  onGeneratePress,
}: LottoMindCommandCenterProps) {
  const router = useRouter();
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
      title: 'Credit Vault',
      detail: 'Buy or earn',
      icon: CircleDollarSign,
      color: '#F9C74F',
      route: '/credit-store',
      testID: 'command-credits',
    },
  ];

  const secondaryTools = [
    { label: 'Rewards', route: '/trivia-rewards', icon: Trophy },
  ] as const;

  const handleRoute = (route: string) => {
    router.push(route as never);
  };

  return (
    <View style={styles.shell}>
      <View style={styles.topBar}>
        <View style={styles.brandLockup}>
          <View style={styles.logoRing}>
            <Text style={styles.logoMark}>LM</Text>
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
          <TouchableOpacity style={styles.iconButton} onPress={onHelpPress} activeOpacity={0.72}>
            <HelpCircle size={18} color={Colors.goldLight} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => handleRoute('/profile')}
            activeOpacity={0.72}
          >
            <Text style={styles.avatarLevel}>{level.icon}</Text>
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

      <LinearGradient
        colors={['rgba(7, 19, 43, 0.98)', 'rgba(5, 11, 28, 0.96)', 'rgba(1, 9, 22, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.staticCircuitGlow} />
        <View style={styles.heroCopy}>
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
            <Pressable style={styles.primaryButton} onPress={() => handleRoute('/powertools')}>
              <Zap size={15} color="#07101F" />
              <Text style={styles.primaryButtonText}>Open Power Tools</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => handleRoute('/arcade')}>
              <Play size={15} color={Colors.goldLight} />
              <Text style={styles.secondaryButtonText}>Play Games</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.heroIntelligencePanel}>
          <Video
            source={commandCoreVideo}
            style={styles.heroVideo}
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

      <View style={styles.statePanel}>
        <View style={styles.stateCopy}>
          <Text style={styles.panelLabel}>Active Market</Text>
          <Text style={styles.panelValue}>{stateName}</Text>
          <Text style={styles.panelHint}>{stateGames.length} games tracked in this market</Text>
        </View>
        <StatePicker currentState={pickState} stateName={stateName} onSelect={setPickState} />
      </View>

      <View style={styles.statGrid}>
        <MetricCard icon={Ticket} label="Market Games" value={`${stateGames.length}`} accent="#00E5FF" />
        <MetricCard icon={Gauge} label="AI XP" value={`${xp}`} accent={level.color} />
        <MetricCard icon={CircleDollarSign} label="Credits" value={`${totalAvailableCredits}`} accent={Colors.gold} />
        <MetricCard icon={Bell} label="Alerts" value={alertsEnabled ? 'On' : 'Off'} accent="#31F7C8" />
      </View>

      <TouchableOpacity
        style={[styles.creditPanel, isLowCredits && styles.creditPanelLow]}
        onPress={() => handleRoute('/credit-store')}
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

      <View style={styles.commandGrid}>
        {commandActions.map((action) => {
          const Icon = action.icon;
          return (
            <TouchableOpacity
              key={action.title}
              style={styles.commandCard}
              onPress={() => {
                if (action.onPress) {
                  action.onPress();
                  return;
                }
                if (action.route) {
                  handleRoute(action.route);
                }
              }}
              activeOpacity={0.78}
              testID={action.testID}
            >
              <View style={[styles.commandIcon, { borderColor: `${action.color}66`, backgroundColor: `${action.color}14` }]}>
                <Icon size={21} color={action.color} />
              </View>
              <View style={styles.commandTextWrap}>
                <Text style={styles.commandTitle}>{action.title}</Text>
                <Text style={styles.commandDetail}>{action.detail}</Text>
              </View>
              <ChevronRight size={16} color="#7DB8D6" />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.insightGrid}>
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

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>{liveJackpot?.gameName ?? 'Jackpot Watch'}</Text>
          <Text style={styles.jackpotValue}>{liveJackpot?.currentJackpot ?? 'Syncing'}</Text>
          <Text style={styles.panelHint}>{liveJackpot?.nextDrawDate ?? 'Live jackpot feed warming up'}</Text>
        </View>
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

      <View style={styles.toolRail}>
        {secondaryTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <TouchableOpacity
              key={tool.label}
              style={styles.railButton}
              onPress={() => handleRoute(tool.route)}
              activeOpacity={0.78}
            >
              <Icon size={16} color={Colors.goldLight} />
              <Text style={styles.railText}>{tool.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { borderColor: `${accent}55`, backgroundColor: `${accent}12` }]}>
        <Icon size={17} color={accent} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  logoMark: {
    color: Colors.goldLight,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.8,
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
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.28)',
  },
  avatarLevel: {
    fontSize: 20,
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
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.24)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 9,
  },
  staticCircuitGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '48%',
    backgroundColor: 'rgba(0, 229, 255, 0.055)',
  },
  heroCopy: {
    width: '56%',
    gap: 9,
    zIndex: 2,
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
  heroVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
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
    padding: 10,
    backgroundColor: 'rgba(8, 20, 43, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.16)',
    gap: 5,
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
  commandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  commandCard: {
    width: '48.5%',
    minHeight: 102,
    borderRadius: 20,
    padding: 13,
    backgroundColor: 'rgba(8, 20, 43, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(100, 198, 255, 0.18)',
    gap: 10,
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
  insightGrid: {
    flexDirection: 'row',
    gap: 10,
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
  railButton: {
    flex: 1,
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
