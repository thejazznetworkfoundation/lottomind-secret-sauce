import { router } from "expo-router";
import { Trophy, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";
import { getTopScores } from "@/services/leaderboardService";
import type { LeaderboardEntry } from "@/types/arcade";

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    getTopScores(20).then(setEntries);
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Close leaderboard">
            <X size={20} color={ARCADE_THEME.gold} />
          </Pressable>
          <View>
            <Text style={styles.kicker}>Local Leaderboard</Text>
            <Text style={styles.title}>Jackpot Jungle Scores</Text>
          </View>
        </View>

        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Trophy size={34} color={ARCADE_THEME.gold} />
            <Text style={styles.emptyTitle}>No runs yet</Text>
            <Text style={styles.emptyBody}>Finish a stage to post a local arcade score.</Text>
          </View>
        ) : (
          entries.map((entry, index) => (
            <View key={entry.id} style={styles.row}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={styles.rowText}>
                <Text style={styles.player}>{entry.playerName}</Text>
                <Text style={styles.stage}>{entry.stageId.replaceAll("-", " ")}</Text>
              </View>
              <Text style={styles.score}>{entry.score.toLocaleString()}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ARCADE_THEME.black },
  content: { gap: 12, padding: 16, paddingTop: 56, paddingBottom: 32 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.34)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
  },
  kicker: { color: ARCADE_THEME.gold, fontSize: 11, fontWeight: "900", letterSpacing: 0, textTransform: "uppercase" },
  title: { color: ARCADE_THEME.ivory, fontSize: 22, fontWeight: "900", letterSpacing: 0 },
  empty: {
    alignItems: "center",
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(5, 5, 5, 0.78)",
    padding: 24,
  },
  emptyTitle: { color: ARCADE_THEME.ivory, fontSize: 18, fontWeight: "900", letterSpacing: 0 },
  emptyBody: { color: "rgba(255,255,255,0.68)", fontSize: 13, fontWeight: "700", letterSpacing: 0 },
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.26)",
    backgroundColor: "rgba(5, 5, 5, 0.76)",
    padding: 12,
  },
  rank: { width: 32, color: ARCADE_THEME.gold, fontSize: 18, fontWeight: "900", letterSpacing: 0 },
  rowText: { flex: 1, gap: 3 },
  player: { color: ARCADE_THEME.ivory, fontSize: 14, fontWeight: "900", letterSpacing: 0 },
  stage: { color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: "700", letterSpacing: 0, textTransform: "capitalize" },
  score: { color: ARCADE_THEME.gold, fontSize: 14, fontWeight: "900", letterSpacing: 0 },
});

