import React from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Brain, ChevronRight, Crown, Home, MoreHorizontal, Star, Wallet, Wrench } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { lottoDisclaimer } from '@/mocks/lottomindConcept';

export const LM = {
  bg: '#050505',
  card: '#101014',
  card2: '#15111A',
  gold: '#D4AF37',
  goldBright: '#F5C84B',
  purple: '#6D28D9',
  deepPurple: '#2D145C',
  red: '#C62828',
  text: '#F8F5E7',
  muted: '#9CA3AF',
  borderGold: 'rgba(212,175,55,0.65)',
};

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export function LottoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.logoWrap, compact && styles.logoWrapCompact]}>
      <View style={[styles.logoMark, compact && styles.logoMarkCompact]}>
        <View style={styles.logoOrbit} />
        <Brain size={compact ? 22 : 38} color={LM.goldBright} strokeWidth={1.8} />
        <Crown size={compact ? 13 : 18} color={LM.goldBright} style={styles.logoCrown} />
        <View style={styles.logoStarLeft} />
        <View style={styles.logoStarRight} />
      </View>
      <Text style={[styles.logoText, compact && styles.logoTextCompact]}>LottoMind</Text>
      {!compact ? <Text style={styles.logoTagline}>Play smart. Dream big. Win with mind.</Text> : null}
    </View>
  );
}

export function ScreenShell({
  children,
  title,
  subtitle,
  centered = false,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  centered?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.shell}>
      <LinearGradient colors={['#050505', '#13091F', '#050505']} style={StyleSheet.absoluteFill} />
      <View style={styles.auraTop} />
      <View style={styles.auraBottom} />
      <View style={styles.gridLayer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={`h-${index}`} style={[styles.gridH, { top: `${index * 14}%` }]} />
        ))}
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={`v-${index}`} style={[styles.gridV, { left: `${index * 20}%` }]} />
        ))}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.shellContent, { paddingTop: insets.top + 18 }, centered && styles.shellCentered]}
      >
        {title ? (
          <View style={styles.screenHeader}>
            <LottoLogo compact />
            <Text style={styles.screenTitle}>{title}</Text>
            {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </View>
  );
}

export function GoldCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.goldCard, style]}>{children}</View>;
}

export function GoldButton({ label, onPress, subtle = false }: { label: string; onPress: () => void; subtle?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.goldButton, subtle && styles.goldButtonSubtle, pressed && styles.pressed]}>
      <Text style={[styles.goldButtonText, subtle && styles.goldButtonTextSubtle]}>{label}</Text>
    </Pressable>
  );
}

export function NumberBall({ value, special = false, small = false }: { value: number | string; special?: boolean; small?: boolean }) {
  return (
    <View style={[styles.numberBall, special && styles.numberBallSpecial, small && styles.numberBallSmall]}>
      <Text style={[styles.numberBallText, special && styles.numberBallTextSpecial, small && styles.numberBallTextSmall]}>{value}</Text>
    </View>
  );
}

export function NumberRow({ numbers, special }: { numbers: number[]; special?: number }) {
  return (
    <View style={styles.numberRow}>
      {numbers.map((number, index) => (
        <NumberBall key={`${number}-${index}`} value={number} />
      ))}
      {special !== undefined ? <NumberBall value={special} special /> : null}
    </View>
  );
}

export function BottomTabs() {
  const router = useRouter();
  const tabs = [
    { label: 'Home', route: '/', icon: Home },
    { label: 'Games', route: '/games', icon: Star },
    { label: 'Tools', route: '/tools', icon: Wrench },
    { label: 'Wallet', route: '/wallet', icon: Wallet },
    { label: 'More', route: '/more', icon: MoreHorizontal },
  ] as const;
  return (
    <View style={styles.bottomTabs}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Pressable key={tab.label} style={styles.bottomTab} onPress={() => router.push(tab.route as never)}>
            <Icon size={17} color={LM.goldBright} />
            <Text style={styles.bottomTabText}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function EnergyMeter({ score, label = 'Rising', circular = false }: { score: number; label?: string; circular?: boolean }) {
  const safeScore = Math.max(0, Math.min(100, score));
  if (circular) {
    return (
      <View style={styles.energyCircleOuter}>
        <View style={[styles.energyCircleRing, { transform: [{ rotate: `${safeScore * 2.4}deg` }] }]} />
        <View style={styles.energyCircleInner}>
          <Text style={styles.energyCircleScore}>{safeScore}%</Text>
          <Text style={styles.energyCircleLabel}>Energy Level</Text>
        </View>
        <Text style={styles.energyCircleState}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.energyMeter}>
      <View style={styles.energyMeterTop}>
        <Text style={styles.energyLabel}>{label}</Text>
        <Text style={styles.energyScore}>{safeScore}%</Text>
      </View>
      <View style={styles.energyTrack}>
        <View style={[styles.energyFill, { width: `${safeScore}%` }]} />
      </View>
    </View>
  );
}

export function FeatureCard({
  title,
  subtitle,
  icon: Icon = SparkIcon,
  route,
  locked = false,
}: {
  title: string;
  subtitle: string;
  icon?: IconComponent;
  route?: string;
  locked?: boolean;
}) {
  const router = useRouter();
  return (
    <Pressable disabled={!route} onPress={() => route && router.push(route as never)} style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Icon size={20} color={LM.goldBright} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSubtitle}>{locked ? 'Hidden while AI Psychic Engine is off' : subtitle}</Text>
    </Pressable>
  );
}

export function ToolRow({ title, subtitle, icon: Icon = SparkIcon, route }: { title: string; subtitle: string; icon?: IconComponent; route?: string }) {
  const router = useRouter();
  return (
    <Pressable style={styles.toolRow} onPress={() => route && router.push(route as never)}>
      <View style={styles.toolIcon}>
        <Icon size={20} color={LM.goldBright} />
      </View>
      <View style={styles.toolCopy}>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={LM.muted} />
    </Pressable>
  );
}

export function ToggleRow({ title, subtitle, value, onToggle }: { title: string; subtitle: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#2A2020', true: 'rgba(109,40,217,0.72)' }}
        thumbColor={value ? LM.goldBright : LM.muted}
      />
    </View>
  );
}

export function ResultCard({ title, date, numbers, special }: { title: string; date: string; numbers: number[]; special?: number }) {
  return (
    <GoldCard>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardMeta}>{date}</Text>
      <NumberRow numbers={numbers} special={special} />
    </GoldCard>
  );
}

export function WalletCard({ title, subtitle, numbers, special }: { title: string; subtitle: string; numbers: number[]; special?: number }) {
  return (
    <GoldCard>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardMeta}>{subtitle}</Text>
      <NumberRow numbers={numbers} special={special} />
    </GoldCard>
  );
}

export function LeaderboardRow({ rank, name, points }: { rank: number; name: string; points: number }) {
  return (
    <View style={styles.leaderRow}>
      <NumberBall value={rank} small />
      <Text style={styles.leaderName}>{name}</Text>
      <Text style={styles.leaderPoints}>{points} pts</Text>
    </View>
  );
}

export function DisclaimerText() {
  return <Text style={styles.disclaimer}>{lottoDisclaimer}</Text>;
}

function SparkIcon({ size = 20, color = LM.goldBright }: { size?: number; color?: string }) {
  return <Star size={size} color={color} />;
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: LM.bg },
  shellContent: { paddingHorizontal: 18, paddingBottom: 112, gap: 16 },
  shellCentered: { minHeight: '100%', justifyContent: 'center' },
  auraTop: { position: 'absolute', top: -90, right: -80, width: 270, height: 270, borderRadius: 999, backgroundColor: 'rgba(109,40,217,0.25)' },
  auraBottom: { position: 'absolute', left: -100, bottom: 90, width: 260, height: 260, borderRadius: 999, backgroundColor: 'rgba(212,175,55,0.10)' },
  gridLayer: { ...StyleSheet.absoluteFillObject, opacity: 0.36 },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(212,175,55,0.04)' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(212,175,55,0.035)' },
  screenHeader: { gap: 8 },
  screenTitle: { color: LM.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  screenSubtitle: { color: LM.muted, lineHeight: 20 },
  logoWrap: { alignItems: 'center', gap: 8 },
  logoWrapCompact: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  logoMark: { width: 94, height: 94, borderRadius: 999, borderWidth: 1, borderColor: LM.borderGold, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(109,40,217,0.15)' },
  logoMarkCompact: { width: 48, height: 48 },
  logoOrbit: { position: 'absolute', width: '78%', height: '78%', borderRadius: 999, borderWidth: 2, borderColor: 'rgba(245,200,75,0.55)', transform: [{ rotate: '18deg' }] },
  logoCrown: { position: 'absolute', top: 15 },
  logoStarLeft: { position: 'absolute', left: 11, top: 24, width: 7, height: 7, borderRadius: 2, backgroundColor: LM.goldBright, transform: [{ rotate: '45deg' }] },
  logoStarRight: { position: 'absolute', right: 13, bottom: 22, width: 7, height: 7, borderRadius: 2, backgroundColor: LM.goldBright, transform: [{ rotate: '45deg' }] },
  logoText: { color: LM.goldBright, fontSize: 34, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase' },
  logoTextCompact: { fontSize: 18 },
  logoTagline: { color: LM.gold, textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', fontSize: 12 },
  goldCard: { backgroundColor: 'rgba(16,16,20,0.94)', borderRadius: 22, borderWidth: 1, borderColor: LM.borderGold, padding: 16, gap: 10, shadowColor: LM.gold, shadowOpacity: 0.25, shadowRadius: 15 },
  goldButton: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: LM.goldBright, borderWidth: 1, borderColor: LM.gold },
  goldButtonSubtle: { backgroundColor: 'rgba(109,40,217,0.22)', borderColor: 'rgba(212,175,55,0.45)' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  goldButtonText: { color: '#1A1200', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  goldButtonTextSubtle: { color: LM.goldBright },
  numberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  numberBall: { width: 38, height: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2B2B32', borderWidth: 1, borderColor: 'rgba(245,200,75,0.45)' },
  numberBallSmall: { width: 28, height: 28 },
  numberBallSpecial: { backgroundColor: LM.red, borderColor: '#FF7A7A' },
  numberBallText: { color: LM.text, fontWeight: '900' },
  numberBallTextSmall: { fontSize: 12 },
  numberBallTextSpecial: { color: '#FFEAEA' },
  bottomTabs: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(10,10,14,0.96)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.28)', borderRadius: 24, padding: 10 },
  bottomTab: { alignItems: 'center', gap: 3, minWidth: 54 },
  bottomTabText: { color: LM.muted, fontSize: 10, fontWeight: '800' },
  sectionHeader: { gap: 4 },
  sectionTitle: { color: LM.goldBright, fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
  sectionSubtitle: { color: LM.muted, lineHeight: 19 },
  energyMeter: { gap: 8 },
  energyMeterTop: { flexDirection: 'row', justifyContent: 'space-between' },
  energyLabel: { color: LM.text, fontWeight: '900' },
  energyScore: { color: LM.goldBright, fontWeight: '900' },
  energyTrack: { height: 10, borderRadius: 999, backgroundColor: '#241B33', overflow: 'hidden' },
  energyFill: { height: '100%', borderRadius: 999, backgroundColor: LM.goldBright },
  energyCircleOuter: { alignSelf: 'center', width: 178, height: 178, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(109,40,217,0.18)', borderWidth: 1, borderColor: LM.borderGold },
  energyCircleRing: { position: 'absolute', width: 150, height: 150, borderRadius: 999, borderWidth: 10, borderTopColor: LM.goldBright, borderRightColor: LM.purple, borderBottomColor: 'rgba(245,200,75,0.12)', borderLeftColor: 'rgba(109,40,217,0.38)' },
  energyCircleInner: { width: 112, height: 112, borderRadius: 999, backgroundColor: '#09090C', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)' },
  energyCircleScore: { color: LM.goldBright, fontSize: 32, fontWeight: '900' },
  energyCircleLabel: { color: LM.muted, fontSize: 10, textTransform: 'uppercase', fontWeight: '800' },
  energyCircleState: { color: LM.goldBright, marginTop: 10, fontWeight: '900', textTransform: 'uppercase' },
  featureCard: { flex: 1, minWidth: '46%', backgroundColor: 'rgba(21,17,26,0.95)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.28)', borderRadius: 18, padding: 14, gap: 8 },
  featureIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(109,40,217,0.22)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.28)', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { color: LM.text, fontWeight: '900' },
  featureSubtitle: { color: LM.muted, fontSize: 12, lineHeight: 17 },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(16,16,20,0.9)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', padding: 13 },
  toolIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(109,40,217,0.18)' },
  toolCopy: { flex: 1, gap: 3 },
  toolTitle: { color: LM.text, fontWeight: '900' },
  toolSubtitle: { color: LM.muted, fontSize: 12, lineHeight: 17 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(16,16,20,0.9)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', padding: 13 },
  toggleCopy: { flex: 1 },
  cardTitle: { color: LM.text, fontSize: 17, fontWeight: '900' },
  cardMeta: { color: LM.muted, fontSize: 12 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  leaderName: { flex: 1, color: LM.text, fontWeight: '800' },
  leaderPoints: { color: LM.goldBright, fontWeight: '900' },
  disclaimer: { color: LM.muted, fontSize: 12, lineHeight: 18 },
});
