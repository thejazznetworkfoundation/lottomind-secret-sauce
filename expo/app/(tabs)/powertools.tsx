import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BarChart3,
  Brain,
  CloudLightning,
  Grid3x3,
  Hash,
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
import EmailCollector from '@/components/EmailCollector';
import { Colors } from '@/constants/colors';
import { usePro } from '@/providers/ProProvider';
import { useTrivia } from '@/providers/TriviaProvider';

interface PowerTool {
  title: string;
  detail: string;
  route: string;
  accent: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  locked?: boolean;
  lockMessage?: string;
}

interface PowerSection {
  title: string;
  subtitle: string;
  tools: PowerTool[];
}

export default function PowerToolsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro } = usePro();
  const { isFeatureUnlocked } = useTrivia();
  const scannerLocked = !isPro && !isFeatureUnlocked('exclusive_set');
  const liveDataLocked = !isPro && !isFeatureUnlocked('live_data');

  const sections: PowerSection[] = [
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
          detail: 'See hot and cold number movement.',
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
          detail: 'Play Vault Run, Jungle Lotto, Gothtechnology, and more.',
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
          title: 'Pick 3 & Pick 4',
          detail: 'Live results, prizes, odds, and play patterns.',
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
          title: 'Store Locator',
          detail: 'Find nearby lottery retailers.',
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
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Power Tools</Text>
          <Text style={styles.heroTitle}>Every LottoMind™ tool in one place.</Text>
          <Text style={styles.heroBody}>
            Use this bottom tab as the clean control room for AI picks, scans, arcade credits, live data, and daily helpers.
          </Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
            <View style={styles.toolGrid}>
              {section.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Pressable
                    key={tool.title}
                    onPress={() => openTool(tool)}
                    style={[styles.toolCard, tool.locked && styles.toolCardLocked]}
                  >
                    <View style={[styles.iconWrap, { borderColor: `${tool.accent}55`, backgroundColor: `${tool.accent}12` }]}>
                      <Icon size={22} color={tool.accent} />
                    </View>
                    <View style={styles.toolCopy}>
                      <View style={styles.toolTitleRow}>
                        <Text style={styles.toolTitle}>{tool.title}</Text>
                        {tool.locked ? <Text style={styles.lockedPill}>LOCKED</Text> : null}
                      </View>
                      <Text style={styles.toolDetail}>{tool.detail}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <EmailCollector />
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
    borderRadius: 22,
    padding: 18,
    backgroundColor: 'rgba(6, 15, 31, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
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
    flexWrap: 'wrap',
    gap: 10,
  },
  toolCard: {
    width: '48.4%',
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
});
