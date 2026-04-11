import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Database, Zap, ScanLine, BarChart3, Radio } from "lucide-react-native";
import { useLottoMindData } from "@/hooks/useLottoMindData";
import { GeneratorMode } from "@/lib/lottoMindApi";
import { LockedPowerToolCard } from "@/components/LockedPowerToolCard";
import { LiveGameSection } from "@/components/LiveGameSection";
import { Colors } from "@/constants/colors";

function normalizeTicketInput(value: string): string[] {
  return value
    .split(/[,\s-]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.modeBtn, active && styles.modeBtnActive]}
    >
      <Text style={[styles.modeText, active && styles.modeTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function LottoMindHistoricalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stateName, setStateName] = useState<string>("Michigan");
  const [gameId, setGameId] = useState<string>("9");
  const [earnedCredits, setEarnedCredits] = useState<number>(80);
  const [includeHistory, setIncludeHistory] = useState<boolean>(true);
  const [historyDepth] = useState<number>(15);
  const [ticketInput, setTicketInput] = useState<string>("5 2 7 1");
  const [generatorLength] = useState<number>(4);
  const [generatorMode, setGeneratorMode] = useState<GeneratorMode>("hot");

  const scannerTicketNumbers = useMemo(
    () => normalizeTicketInput(ticketInput),
    [ticketInput]
  );

  const { data, loading, error, refresh } = useLottoMindData({
    stateName,
    gameId,
    earnedCredits,
    includeHistory,
    historyDepth,
    scannerTicketNumbers,
    generatorLength,
    generatorMode,
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <ArrowLeft size={22} color={Colors.gold} />
        </Pressable>
        <Database size={20} color={Colors.gold} />
        <Text style={styles.headerTitle}>Historical Engine</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subheader}>
          Scanner + Sequence Generator + Intelligence + Live Data
        </Text>

        <View style={styles.panel}>
          <Text style={styles.label}>State</Text>
          <TextInput
            value={stateName}
            onChangeText={setStateName}
            style={styles.input}
            placeholder="Michigan"
            placeholderTextColor="#6B7280"
            testID="state-input"
          />

          <Text style={styles.label}>Historical Game ID</Text>
          <TextInput
            value={gameId}
            onChangeText={setGameId}
            style={styles.input}
            placeholder="9"
            placeholderTextColor="#6B7280"
            testID="game-id-input"
          />

          <Text style={styles.label}>Earned Credits</Text>
          <TextInput
            value={String(earnedCredits)}
            onChangeText={(v) => setEarnedCredits(Number(v || 0))}
            keyboardType="numeric"
            style={styles.input}
            placeholder="80"
            placeholderTextColor="#6B7280"
            testID="credits-input"
          />

          <Text style={styles.label}>Ticket Scanner Input</Text>
          <TextInput
            value={ticketInput}
            onChangeText={setTicketInput}
            style={styles.input}
            placeholder="5 2 7 1"
            placeholderTextColor="#6B7280"
            testID="ticket-input"
          />

          <View style={styles.row}>
            <Text style={styles.label}>Show Historical Data</Text>
            <Switch
              value={includeHistory}
              onValueChange={setIncludeHistory}
              trackColor={{ false: "#374151", true: Colors.gold }}
              thumbColor="#FFFFFF"
              testID="history-toggle"
            />
          </View>

          <View style={styles.rowWrap}>
            <ModeButton
              active={generatorMode === "hot"}
              label="Hot"
              onPress={() => setGeneratorMode("hot")}
            />
            <ModeButton
              active={generatorMode === "cold"}
              label="Cold"
              onPress={() => setGeneratorMode("cold")}
            />
            <ModeButton
              active={generatorMode === "balanced"}
              label="Balanced"
              onPress={() => setGeneratorMode("balanced")}
            />
          </View>

          <Pressable style={styles.refreshBtn} onPress={refresh} testID="refresh-btn">
            <Zap size={16} color="#FFFFFF" />
            <Text style={styles.refreshText}>Refresh Data</Text>
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.loadingText}>Loading LottoMind data...</Text>
          </View>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {data && (
          <>
            <LockedPowerToolCard
              locked={data.lottoIntelligence.locked}
              unlockCostCredits={data.lottoIntelligence.unlockCostCredits}
              insights={data.lottoIntelligence.historyPowerTool}
              earnedCredits={earnedCredits}
              onEarnCreditsPress={() => setEarnedCredits((prev) => prev + 100)}
            />

            <View style={styles.panel}>
              <View style={styles.sectionHeaderRow}>
                <BarChart3 size={18} color={Colors.gold} />
                <Text style={styles.sectionHeader}>Historical Generator</Text>
              </View>
              <Text style={styles.value}>
                Generated: {data.generator?.generated.join(" - ") || "-"}
              </Text>
              <Text style={styles.meta}>
                Strategy: {data.generator?.strategy || "-"}
              </Text>
              <Text style={styles.meta}>
                Based on draws: {data.generator?.basedOnDraws || 0}
              </Text>
            </View>

            <View style={styles.panel}>
              <View style={styles.sectionHeaderRow}>
                <ScanLine size={18} color="#00E676" />
                <Text style={styles.sectionHeader}>Ticket Scanner History</Text>
              </View>
              <Text style={styles.meta}>
                Appeared Before: {data.ticketScanner?.appearedBefore ? "Yes" : "No"}
              </Text>
              <Text style={styles.meta}>
                Exact Matches: {data.ticketScanner?.exactMatches.length || 0}
              </Text>
              <Text style={styles.meta}>
                Partial Matches: {data.ticketScanner?.partialMatches.length || 0}
              </Text>

              {!!data.ticketScanner?.partialMatches?.length && (
                <View style={styles.matchesContainer}>
                  {data.ticketScanner.partialMatches.slice(0, 5).map((m, idx) => (
                    <View key={idx} style={styles.miniCard}>
                      <Text style={styles.miniTitle}>{m.draw.gameName}</Text>
                      <Text style={styles.meta}>
                        {m.draw.drawDate} · Match Count: {m.matchedCount}
                      </Text>
                      <Text style={styles.value}>
                        Matched: {m.matchedNumbers.join(" - ")}
                      </Text>
                      <Text style={styles.meta}>
                        Draw: {m.draw.numbers.join(" - ")}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.panel}>
              <View style={styles.sectionHeaderRow}>
                <Database size={18} color="#60A5FA" />
                <Text style={styles.sectionHeader}>History Menu</Text>
              </View>
              <Text style={styles.meta}>
                Dates loaded: {data.historyMenu.pastDrawDates.length}
              </Text>

              {!!data.historyMenu.pastDrawDates.length && (
                <Text style={styles.value}>
                  {data.historyMenu.pastDrawDates.slice(0, 8).join(" · ")}
                </Text>
              )}
            </View>

            <View style={styles.panel}>
              <View style={styles.sectionHeaderRow}>
                <Radio size={18} color="#F87171" />
                <Text style={styles.sectionHeader}>Live Data by State</Text>
              </View>
            </View>

            <LiveGameSection title="Current 3 Digit" draws={data.liveData.pick3} />
            <LiveGameSection title="Current 4 Digit" draws={data.liveData.pick4} />
            <LiveGameSection title="Jackpot Games" draws={data.liveData.jackpots} />
            <LiveGameSection title="Daily Games" draws={data.liveData.dailyGames} />
            <LiveGameSection title="Other Games" draws={data.liveData.otherGames} />
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
  },
  headerBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.12)",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800" as const,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subheader: {
    color: "#9CA3AF",
    marginBottom: 16,
    fontSize: 13,
  },
  panel: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.08)",
  },
  label: {
    color: "#D1D5DB",
    fontWeight: "700" as const,
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    backgroundColor: "#1F2937",
    color: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
    fontSize: 15,
  },
  row: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  rowWrap: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  modeBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  modeText: {
    color: "#D1D5DB",
    fontWeight: "700" as const,
  },
  modeTextActive: {
    color: "#1A1200",
  },
  refreshBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center" as const,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  refreshText: {
    color: "#1A1200",
    fontWeight: "800" as const,
    fontSize: 15,
  },
  loader: {
    marginVertical: 24,
    alignItems: "center" as const,
  },
  loadingText: {
    color: "#9CA3AF",
    marginTop: 10,
  },
  error: {
    color: "#F87171",
    marginBottom: 12,
    backgroundColor: "rgba(248, 113, 113, 0.08)",
    padding: 12,
    borderRadius: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    color: "white",
    fontWeight: "800" as const,
    fontSize: 18,
  },
  value: {
    color: "#34D399",
    fontWeight: "800" as const,
    fontSize: 16,
  },
  meta: {
    color: "#D1D5DB",
    marginTop: 6,
    fontSize: 13,
  },
  matchesContainer: {
    marginTop: 10,
  },
  miniCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.06)",
  },
  miniTitle: {
    color: "white",
    fontWeight: "700" as const,
    marginBottom: 6,
  },
  bottomSpacer: {
    height: 40,
  },
});
