import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  BookOpen,
  Brain,
  Camera,
  ChevronRight,
  Crown,
  Gamepad2,
  Gift,
  Grid3x3,
  History,
  Languages,
  Lock,
  MessageCircle,
  Moon,
  ScanLine,
  Settings,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  WandSparkles,
  Wallet,
  X,
  Zap,
} from 'lucide-react-native';
import { useSettings } from '@/providers/SettingsProvider';
import {
  achievements,
  communityPosts,
  dailyTools,
  drawHistory,
  games,
  generatedSets,
  heatmapNumbers,
  historyItems,
  intelligenceCards,
  leaderboard,
  lottoDisclaimer,
  luckyNumbers,
  notifications,
  transactions,
  walletCards,
} from '@/mocks/lottomindConcept';
import {
  BottomTabs,
  DisclaimerText,
  EnergyMeter,
  FeatureCard,
  GoldButton,
  GoldCard,
  LeaderboardRow,
  LM,
  LottoLogo,
  NumberBall,
  NumberRow,
  ResultCard,
  ScreenShell,
  SectionHeader,
  ToggleRow,
  ToolRow,
  WalletCard,
} from '@/components/lottomind-ui';

function useMockReading(prompt: string) {
  return useMemo(() => {
    const seed = prompt.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 3), 47);
    const score = 40 + (seed % 55);
    return {
      title: score > 70 ? 'Rising Gold Signal' : 'Neutral Purple Signal',
      message: 'A symbolic pattern reflection suggests patient timing, calm focus, and number inspiration only.',
      score,
      numbers: [11, 19, 26, 33, 47],
      special: 8,
    };
  }, [prompt]);
}

function PsychicOffCard() {
  const router = useRouter();
  return (
    <GoldCard>
      <SectionHeader title="AI Psychic Engine is Off" subtitle="Turn it on in Settings to reveal mystical features." />
      <GoldButton label="Open Settings" onPress={() => router.push('/settings' as never)} />
    </GoldCard>
  );
}

export function SplashScreen() {
  return (
    <ScreenShell centered>
      <LottoLogo />
      <GoldCard>
        <Text style={styles.centerTitle}>Play smart. Dream big. Win with mind.</Text>
        <View style={styles.centerBalls}>
          <NumberRow numbers={[7, 18, 27, 34, 42]} special={11} />
        </View>
        <DisclaimerText />
      </GoldCard>
    </ScreenShell>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  return (
    <ScreenShell title="Welcome to LottoMind" subtitle="The world’s most advanced lottery intelligence app. AI powered, dream inspired, and designed to elevate your game.">
      <GoldCard style={styles.mysticArt}>
        <LottoLogo />
        <EnergyMeter score={86} label="Luck Level" circular />
      </GoldCard>
      <GoldButton label="Get Started" onPress={() => router.replace('/' as never)} />
      <DisclaimerText />
    </ScreenShell>
  );
}

export function HomeDashboardScreen() {
  const router = useRouter();
  const { isPsychicEnabled } = useSettings();
  return (
    <ScreenShell>
      <View style={styles.homeTop}>
        <LottoLogo compact />
        <View style={styles.homeIcons}>
          <Bell size={18} color={LM.goldBright} />
          <Crown size={18} color={LM.goldBright} />
        </View>
      </View>

      <GoldCard>
        <Text style={styles.greeting}>Good evening, Dreamer</Text>
        <Text style={styles.muted}>Let’s unlock your fortune.</Text>
        {isPsychicEnabled ? (
          <View style={styles.fortunePreview}>
            <SectionHeader title="AI Daily Fortune" subtitle="Your energy is rising. Great time to play mindfully." />
            <EnergyMeter score={86} label="Luck Level" circular />
          </View>
        ) : (
          <Text style={styles.muted}>Psychic features are hidden. Standard LottoMind tools remain active.</Text>
        )}
      </GoldCard>

      <GoldCard>
        <SectionHeader title="Lucky Numbers" />
        <NumberRow numbers={luckyNumbers.slice(0, 5)} special={luckyNumbers[5]} />
      </GoldCard>

      <View style={styles.featureGrid}>
        <FeatureCard title="Dream Oracle" subtitle="Interpret your dreams" icon={Moon} route="/dream-oracle" />
        {isPsychicEnabled ? <FeatureCard title="AI Psychic Engine" subtitle="Unlock mystical insights" icon={Sparkles} route="/psychic" /> : null}
        <FeatureCard title="Live Results" subtitle="Check latest draws" icon={Ticket} route="/live-results" />
        <FeatureCard title="Lotto Intelligence" subtitle="Stats, trends, patterns" icon={Brain} route="/lotto-intelligence" />
      </View>

      <BottomTabs />
    </ScreenShell>
  );
}

export function GamesHubScreen() {
  return (
    <ScreenShell title="Mind Games" subtitle="Popular games, live lanes, and daily tools.">
      <GoldCard>
        {games.map((game) => (
          <ToolRow key={game.title} title={game.title} subtitle={game.subtitle} icon={Gamepad2} route={game.route} />
        ))}
      </GoldCard>
    </ScreenShell>
  );
}

export function LiveResultsScreen() {
  return (
    <ScreenShell title="Powerball" subtitle="Latest results and draw history.">
      <GoldCard>
        <Text style={styles.centerTitle}>May 22, 2025</Text>
        <NumberRow numbers={[12, 17, 23, 44, 61]} special={15} />
        <Text style={styles.goldLine}>Power Play: 2X</Text>
      </GoldCard>
      {drawHistory.map((draw) => (
        <ResultCard key={draw.date} title={draw.date} date={`Power Play: ${draw.multiplier}`} numbers={draw.numbers} special={draw.special} />
      ))}
      <GoldButton label="View All Results" onPress={() => undefined} />
    </ScreenShell>
  );
}

export function NumberGeneratorScreen() {
  return (
    <ScreenShell title="Number Generator" subtitle="Generate entertainment-based number inspiration.">
      <GoldCard>
        <SectionHeader title="Powerball" subtitle="Number of lines" />
        <View style={styles.strategyRow}>
          <GoldButton label="Balanced" onPress={() => undefined} subtle />
          <GoldButton label="Hot & Cold" onPress={() => undefined} subtle />
          <GoldButton label="Avoid Repeats" onPress={() => undefined} subtle />
        </View>
        <GoldButton label="Generate Numbers" onPress={() => undefined} />
      </GoldCard>
      {generatedSets.map((set) => (
        <ResultCard key={set.label} title={set.label} date="Generated numbers" numbers={set.numbers} special={set.special} />
      ))}
      <DisclaimerText />
    </ScreenShell>
  );
}

export function HeatmapAnalyticsScreen() {
  return (
    <ScreenShell title="Powerball Heatmap" subtitle="Hot/cold number movement with matrix-aware windows.">
      <View style={styles.filterRow}>
        <GoldButton label="Last 10" onPress={() => undefined} subtle />
        <GoldButton label="Last 30" onPress={() => undefined} subtle />
        <GoldButton label="Last 100" onPress={() => undefined} subtle />
      </View>
      <GoldCard style={styles.heatGrid}>
        {heatmapNumbers.map((item) => (
          <View
            key={item.value}
            style={[
              styles.heatCell,
              {
                backgroundColor: item.heat > 0.7 ? 'rgba(198,40,40,0.72)' : item.heat > 0.35 ? 'rgba(212,175,55,0.22)' : 'rgba(30,30,36,0.9)',
              },
            ]}
          >
            <Text style={styles.heatText}>{item.value}</Text>
          </View>
        ))}
      </GoldCard>
    </ScreenShell>
  );
}

export function DreamOracleScreen() {
  const { isPsychicEnabled } = useSettings();
  return (
    <ScreenShell title="Dream Oracle" subtitle="Describe your dream and receive symbolic number inspiration.">
      <GoldCard>
        <TextInput
          defaultValue="I dreamed I was flying over water and saw gold coins..."
          multiline
          placeholderTextColor={LM.muted}
          style={styles.input}
        />
      </GoldCard>
      <GoldCard>
        <SectionHeader title="Interpretation" subtitle="Your dream reflects abundance, freedom, and incoming luck. Focus on opportunities that bring long-term rewards." />
        <Text style={styles.cardLabel}>Suggested Numbers</Text>
        <NumberRow numbers={[9, 16, 28, 37, 45]} special={12} />
        <GoldButton label="Save To Wallet" onPress={() => undefined} />
      </GoldCard>
      {isPsychicEnabled ? (
        <GoldCard>
          <SectionHeader title="Dream + Psychic Fusion" subtitle="Symbolic reading blended with your dream text." />
          <EnergyMeter score={78} label="Rising" />
          <NumberRow numbers={[11, 19, 26, 33, 47]} special={8} />
        </GoldCard>
      ) : null}
      <DisclaimerText />
    </ScreenShell>
  );
}

export function PsychicEngineScreen() {
  const { isPsychicEnabled } = useSettings();
  const [prompt, setPrompt] = useState('What is my number energy today?');
  const reading = useMockReading(prompt);

  if (!isPsychicEnabled) {
    return (
      <ScreenShell title="AI Psychic Engine">
        <PsychicOffCard />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="AI Psychic Engine" subtitle="Ask your question and receive a symbolic entertainment reading.">
      <GoldCard>
        <TextInput value={prompt} onChangeText={setPrompt} multiline placeholderTextColor={LM.muted} style={styles.input} />
      </GoldCard>
      <GoldCard>
        <SectionHeader title="Psychic Reading" subtitle={reading.message} />
        <EnergyMeter score={reading.score} label={reading.score > 70 ? 'Rising' : 'Neutral'} />
        <Text style={styles.cardLabel}>Psychic Numbers</Text>
        <NumberRow numbers={reading.numbers} special={reading.special} />
        <GoldButton label="Unlock Deep Reading - 25 Credits" onPress={() => undefined} />
      </GoldCard>
      <DisclaimerText />
    </ScreenShell>
  );
}

export function DailyFortuneScreen() {
  const { isPsychicEnabled } = useSettings();
  if (!isPsychicEnabled) {
    return (
      <ScreenShell title="Daily Fortune Drop">
        <PsychicOffCard />
      </ScreenShell>
    );
  }
  return (
    <ScreenShell title="Today’s Fortune" subtitle="May 25, 2025">
      <GoldCard style={styles.mysticArt}>
        <EnergyMeter score={86} label="Rising" circular />
        <Text style={styles.cardLabel}>Energy: High</Text>
        <Text style={styles.muted}>Focus: Patience</Text>
        <Text style={styles.muted}>Avoid: Impulsive plays</Text>
        <Text style={styles.muted}>Lucky color: Purple</Text>
        <NumberRow numbers={[3, 14, 22, 29, 41]} special={7} />
        <GoldButton label="Refresh - 10 Credits" onPress={() => undefined} subtle />
      </GoldCard>
      <DisclaimerText />
    </ScreenShell>
  );
}

export function DailyToolsScreen() {
  return (
    <ScreenShell title="Daily 3 Tools" subtitle="Quick power tools for Daily 3 and Daily 4.">
      <GoldCard>
        {dailyTools.map((tool) => (
          <ToolRow key={tool} title={tool} subtitle="Analyze number structures" icon={Grid3x3} route="/sequence" />
        ))}
      </GoldCard>
      <View style={styles.filterRow}>
        <GoldButton label="Daily 3" onPress={() => undefined} subtle />
        <GoldButton label="Daily 4" onPress={() => undefined} subtle />
      </View>
    </ScreenShell>
  );
}

export function LottoIntelligenceScreen() {
  return (
    <ScreenShell title="Powerball Intelligence" subtitle="Stats, trends, and patterns.">
      <View style={styles.filterRow}>
        <GoldButton label="Stats" onPress={() => undefined} subtle />
        <GoldButton label="Trends" onPress={() => undefined} subtle />
        <GoldButton label="Patterns" onPress={() => undefined} subtle />
      </View>
      {intelligenceCards.map((card) => (
        <ResultCard key={card.title} title={card.title} date="Pattern reflection" numbers={card.numbers} />
      ))}
      <GoldButton label="Detailed Report" onPress={() => undefined} />
      <DisclaimerText />
    </ScreenShell>
  );
}

export function SavedWalletScreen() {
  const { isPsychicEnabled } = useSettings();
  return (
    <ScreenShell title="Saved Numbers Wallet" subtitle="My Numbers, Groups, and Tickets.">
      <View style={styles.filterRow}>
        <GoldButton label="My Numbers" onPress={() => undefined} subtle />
        <GoldButton label="Groups" onPress={() => undefined} subtle />
        <GoldButton label="Tickets" onPress={() => undefined} subtle />
      </View>
      {walletCards.filter((card) => isPsychicEnabled || !card.psychic).map((card) => (
        <WalletCard key={card.title} title={card.title} subtitle={card.subtitle} numbers={card.numbers} special={card.special} />
      ))}
      <GoldButton label="+ Add New Set" onPress={() => undefined} />
    </ScreenShell>
  );
}

export function TicketScannerScreen() {
  return (
    <ScreenShell title="Scan Your Ticket" subtitle="Hold steady to scan your ticket.">
      <GoldCard style={styles.scannerCard}>
        <View style={styles.scanFrame}>
          <Ticket size={82} color={LM.goldBright} />
          <Text style={styles.muted}>Camera preview placeholder</Text>
        </View>
        <View style={styles.filterRow}>
          <GoldButton label="Flash" onPress={() => undefined} subtle />
          <GoldButton label="Scan" onPress={() => undefined} />
          <GoldButton label="History" onPress={() => undefined} subtle />
        </View>
      </GoldCard>
    </ScreenShell>
  );
}

export function ContestsScreen() {
  return (
    <ScreenShell title="LottoMind Contests" subtitle="Credits, badges, and unlocks only. No cash prizes.">
      <GoldCard>
        <SectionHeader title="Dream Oracle Challenge" subtitle="Predict & win badges." />
        <Text style={styles.goldLine}>Ends in: 2D 14H 22M</Text>
      </GoldCard>
      <GoldCard>
        <SectionHeader title="Top Predictors" />
        {leaderboard.map((item) => (
          <LeaderboardRow key={item.rank} rank={item.rank} name={item.name} points={item.points} />
        ))}
      </GoldCard>
      <GoldButton label="View All Contests" onPress={() => undefined} />
      <DisclaimerText />
    </ScreenShell>
  );
}

export function CreditsWalletScreen() {
  return (
    <ScreenShell title="My Wallet" subtitle="Credits power unlocks, entries, and premium tools.">
      <GoldCard>
        <Text style={styles.balance}>1,250</Text>
        <Text style={styles.muted}>Current Balance</Text>
        <GoldButton label="Earn Credits" onPress={() => undefined} />
      </GoldCard>
      <GoldCard>
        {transactions.map((item) => (
          <View key={item.title} style={styles.transactionRow}>
            <Text style={styles.toolTitle}>{item.title}</Text>
            <Text style={item.amount.startsWith('+') ? styles.creditPlus : styles.creditMinus}>{item.amount}</Text>
          </View>
        ))}
      </GoldCard>
    </ScreenShell>
  );
}

export function VipScreen() {
  return (
    <ScreenShell title="LottoMind VIP" subtitle="Unlock premium features.">
      <View style={styles.filterRow}>
        <GoldCard style={styles.priceCard}><Text style={styles.cardLabel}>VIP Monthly</Text><Text style={styles.price}>$12.99</Text></GoldCard>
        <GoldCard style={styles.priceCard}><Text style={styles.cardLabel}>VIP Yearly</Text><Text style={styles.price}>$79.99</Text></GoldCard>
      </View>
      <GoldCard>
        {['Unlimited readings', 'Advanced analytics', 'Exclusive contests', 'Ad-free experience', 'Priority support'].map((item) => (
          <Text key={item} style={styles.muted}>✓ {item}</Text>
        ))}
      </GoldCard>
      <GoldButton label="Upgrade Now" onPress={() => undefined} />
    </ScreenShell>
  );
}

export function AchievementsScreen() {
  const { isPsychicEnabled } = useSettings();
  return (
    <ScreenShell title="Achievements" subtitle="Your progress.">
      {achievements.filter((item) => isPsychicEnabled || !item.psychic).map((item) => (
        <GoldCard key={item.title}>
          <SectionHeader title={item.title} subtitle={item.subtitle} />
          <Text style={styles.goldLine}>{item.progress}</Text>
        </GoldCard>
      ))}
    </ScreenShell>
  );
}

export function NotificationsScreen() {
  const { isPsychicEnabled } = useSettings();
  return (
    <ScreenShell title="Notifications">
      <View style={styles.filterRow}>
        {['All', 'Results', 'Contests', 'System'].map((tab) => <GoldButton key={tab} label={tab} onPress={() => undefined} subtle />)}
      </View>
      <GoldCard>
        {notifications.filter((item) => isPsychicEnabled || !item.psychic).map((item) => (
          <ToolRow key={item.title} title={item.title} subtitle={`${item.type} • ${item.time}`} icon={Bell} />
        ))}
      </GoldCard>
    </ScreenShell>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const { isPsychicEnabled, toggleFeatureFlag } = useSettings();
  return (
    <ScreenShell>
      <View style={styles.settingsHeader}>
        <View style={styles.settingsHeaderTitle}>
          <LottoLogo compact />
          <Text style={styles.settingsTitle}>Settings</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsCloseButton}
          onPress={() => router.back()}
          activeOpacity={0.72}
          testID="settings-exit-button"
        >
          <X size={21} color={LM.goldBright} />
        </TouchableOpacity>
      </View>
      <GoldCard>
        <SectionHeader
          title="AI Features"
          subtitle="Turn mystical readings, daily fortunes, energy meters, and psychic number insights on or off."
        />
        <ToggleRow
          title="AI Psychic Engine"
          subtitle={
            isPsychicEnabled
              ? 'Psychic features are active for entertainment-based readings and number inspiration.'
              : 'Psychic features are hidden. Dream Oracle and standard LottoMind tools remain available.'
          }
          value={isPsychicEnabled}
          onToggle={() => void toggleFeatureFlag('aiPsychicEngine')}
        />
      </GoldCard>
      <GoldCard>
        <ToolRow title="Push Notifications" subtitle="Results, contests, and system alerts" icon={Bell} />
        <ToolRow title="Default Game" subtitle="Powerball" icon={Ticket} />
        <ToolRow title="Theme" subtitle="Dark luxury" icon={Moon} />
        <ToolRow title="Language" subtitle="English" icon={Languages} />
        <ToolRow title="Privacy Policy" subtitle="Read privacy terms" icon={Lock} />
        <ToolRow title="Terms of Service" subtitle="Read app terms" icon={BookOpen} />
        <ToolRow title="Help & Support" subtitle="Contact LottoMind support" icon={MessageCircle} />
        <Text style={styles.logout}>Logout</Text>
      </GoldCard>
    </ScreenShell>
  );
}

export function EnergyMeterScreen() {
  const { isPsychicEnabled } = useSettings();
  if (!isPsychicEnabled) {
    return (
      <ScreenShell title="Energy Meter">
        <PsychicOffCard />
      </ScreenShell>
    );
  }
  return (
    <ScreenShell title="Energy Meter">
      <GoldCard>
        <EnergyMeter score={78} label="Rising" circular />
        <Text style={styles.goldLine}>Good time to play mindfully. Keep your energy high.</Text>
      </GoldCard>
      <DisclaimerText />
    </ScreenShell>
  );
}

export function DetailedReportScreen() {
  return (
    <ScreenShell title="Powerball Report" subtitle="Overview, frequency, and patterns.">
      <GoldCard>
        <Text style={styles.balance}>150</Text>
        <Text style={styles.muted}>Total draws analyzed</Text>
      </GoldCard>
      <ResultCard title="Hot Numbers" date="Most frequent" numbers={[8, 18, 24, 47, 67]} />
      <ResultCard title="Overdue Numbers" date="Watch list" numbers={[7, 19, 28, 46, 91]} />
      <View style={styles.filterRow}>
        <GoldButton label="Share Report" onPress={() => undefined} subtle />
        <GoldButton label="Download PDF" onPress={() => undefined} subtle />
      </View>
      <DisclaimerText />
    </ScreenShell>
  );
}

export function HistoryScreen() {
  const { isPsychicEnabled } = useSettings();
  return (
    <ScreenShell title="History">
      <View style={styles.filterRow}>
        {['Readings', 'Numbers', 'Tickets'].map((tab) => <GoldButton key={tab} label={tab} onPress={() => undefined} subtle />)}
      </View>
      <GoldCard>
        {historyItems.filter((item) => isPsychicEnabled || !item.psychic).map((item) => (
          <ToolRow key={item.title} title={item.title} subtitle={item.detail} icon={History} />
        ))}
      </GoldCard>
    </ScreenShell>
  );
}

export function CommunityScreen() {
  return (
    <ScreenShell title="LottoMind Community" subtitle="Coming soon.">
      <View style={styles.filterRow}>
        {['Feed', 'Discussions', 'Tips'].map((tab) => <GoldButton key={tab} label={tab} onPress={() => undefined} subtle />)}
      </View>
      <GoldCard>
        {communityPosts.map((post) => (
          <ToolRow key={post.name} title={post.name} subtitle={`${post.body} • ${post.time}`} icon={MessageCircle} />
        ))}
      </GoldCard>
    </ScreenShell>
  );
}

export function ThankYouScreen() {
  return (
    <ScreenShell centered>
      <LottoLogo />
      <GoldCard>
        <Text style={styles.centerTitle}>Thank you for being a part of the LottoMind family.</Text>
        <NumberRow numbers={[7, 18, 27, 34, 42]} special={11} />
      </GoldCard>
    </ScreenShell>
  );
}

export function ToolsTabScreen() {
  const { isPsychicEnabled } = useSettings();
  return (
    <ScreenShell title="Tools" subtitle="All major LottoMind tools in one hub.">
      <GoldCard>
        <ToolRow title="Number Generator" subtitle="Generate number inspiration" icon={Sparkles} route="/number-generator" />
        <ToolRow title="Heatmap Analytics" subtitle="Hot/cold number trends" icon={Grid3x3} route="/heatmap-analytics" />
        <ToolRow title="Dream Oracle" subtitle="Interpret dream symbols" icon={Moon} route="/dream-oracle" />
        {isPsychicEnabled ? <ToolRow title="AI Psychic Engine" subtitle="Symbolic reading engine" icon={WandSparkles} route="/psychic" /> : null}
        {isPsychicEnabled ? <ToolRow title="Daily Fortune Drop" subtitle="Daily energy and lucky color" icon={Star} route="/daily-fortune" /> : null}
        <ToolRow title="Daily 3 / Daily 4 Tools" subtitle="Straight, box, sums, pairs" icon={Grid3x3} route="/daily-tools" />
        <ToolRow title="Lotto Intelligence" subtitle="Stats, trends, patterns" icon={Brain} route="/lotto-intelligence" />
        <ToolRow title="Detailed Report" subtitle="Powerball analytics report" icon={BookOpen} route="/detailed-report" />
      </GoldCard>
    </ScreenShell>
  );
}

export function WalletTabScreen() {
  return (
    <ScreenShell title="Wallet" subtitle="Saved numbers, credits, tickets, and VIP.">
      <GoldCard>
        <ToolRow title="Saved Numbers Wallet" subtitle="My Numbers, Groups, Tickets" icon={Wallet} route="/saved-wallet" />
        <ToolRow title="Credits Wallet" subtitle="Balance and transactions" icon={Gift} route="/credits-wallet" />
        <ToolRow title="Subscription / VIP" subtitle="Premium unlocks" icon={Crown} route="/vip" />
        <ToolRow title="Ticket Scanner" subtitle="Scan ticket placeholder" icon={Camera} route="/ticket-scanner" />
      </GoldCard>
    </ScreenShell>
  );
}

export function MoreTabScreen() {
  return (
    <ScreenShell title="More" subtitle="Profile, contests, notifications, settings, and community.">
      <GoldCard>
        <ToolRow title="Contests & Leaderboard" subtitle="Credits, badges, unlocks only" icon={Trophy} route="/contests" />
        <ToolRow title="Achievements" subtitle="Track progress rings" icon={Star} route="/achievements" />
        <ToolRow title="Notifications" subtitle="Results, contests, system" icon={Bell} route="/notifications" />
        <ToolRow title="History" subtitle="Readings, numbers, tickets" icon={History} route="/history-ui" />
        <ToolRow title="Community Coming Soon" subtitle="Feed, discussions, tips" icon={MessageCircle} route="/community" />
        <ToolRow title="Settings" subtitle="Toggle AI Psychic Engine" icon={Settings} route="/settings" />
        <ToolRow title="Final Brand Screen" subtitle="Thank you message" icon={Crown} route="/thank-you" />
      </GoldCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  centerTitle: { color: LM.goldBright, fontSize: 20, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', lineHeight: 28 },
  centerBalls: { alignItems: 'center' },
  mysticArt: { alignItems: 'center' },
  homeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  homeIcons: { flexDirection: 'row', gap: 12 },
  greeting: { color: LM.text, fontWeight: '900', fontSize: 16 },
  muted: { color: LM.muted, lineHeight: 20 },
  fortunePreview: { gap: 12 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  goldLine: { color: LM.goldBright, fontWeight: '900', marginTop: 6 },
  strategyRow: { gap: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heatCell: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)' },
  heatText: { color: LM.text, fontWeight: '900', fontSize: 12 },
  input: { minHeight: 118, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.28)', backgroundColor: '#08080A', padding: 14, color: LM.text, textAlignVertical: 'top' },
  cardLabel: { color: LM.goldBright, fontWeight: '900', textTransform: 'uppercase' },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  settingsHeaderTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsTitle: { color: LM.text, fontSize: 24, fontWeight: '900' },
  settingsCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.32)',
  },
  scannerCard: { gap: 18 },
  scanFrame: { height: 280, borderWidth: 2, borderColor: 'rgba(248,245,231,0.6)', borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.04)' },
  balance: { color: LM.goldBright, fontSize: 34, fontWeight: '900', textAlign: 'center' },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  toolTitle: { color: LM.text, fontWeight: '900' },
  creditPlus: { color: '#65D58A', fontWeight: '900' },
  creditMinus: { color: '#FCA5A5', fontWeight: '900' },
  priceCard: { flex: 1, minWidth: '42%' },
  price: { color: LM.goldBright, fontSize: 22, fontWeight: '900' },
  logout: { color: LM.red, fontWeight: '900', paddingVertical: 10 },
});
