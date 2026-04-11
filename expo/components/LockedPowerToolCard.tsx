import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { HistoricalInsights } from "@/lib/lottoMindApi";

interface Props {
  locked: boolean;
  unlockCostCredits: number;
  insights: HistoricalInsights | null;
  earnedCredits: number;
  onEarnCreditsPress?: () => void;
}

export function LockedPowerToolCard({
  locked,
  unlockCostCredits,
  insights,
  earnedCredits,
  onEarnCreditsPress,
}: Props) {
  if (locked) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Historical Power Tool</Text>
        <Text style={styles.locked}>🔒 Locked</Text>
        <Text style={styles.body}>
          Unlock with {unlockCostCredits} earned credits.
        </Text>
        <Text style={styles.subtle}>You currently have {earnedCredits} credits.</Text>

        <Pressable style={styles.button} onPress={onEarnCreditsPress}>
          <Text style={styles.buttonText}>Earn More Credits</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Historical Power Tool</Text>
      <Text style={styles.subtle}>Draws analyzed: {insights?.totalDraws ?? 0}</Text>

      <Text style={styles.section}>Hot Digits</Text>
      <Text style={styles.value}>{insights?.hotDigits.join(", ") || "-"}</Text>

      <Text style={styles.section}>Cold Digits</Text>
      <Text style={styles.value}>{insights?.coldDigits.join(", ") || "-"}</Text>

      <Text style={styles.section}>Most Common Pairs</Text>
      <Text style={styles.value}>
        {insights?.mostCommonPairs?.slice(0, 5).map((p) => `${p.pair} (${p.count})`).join(" • ") || "-"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  locked: {
    color: "#FBBF24",
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 6,
  },
  body: {
    color: "#E5E7EB",
    marginBottom: 6,
  },
  subtle: {
    color: "#9CA3AF",
    marginBottom: 10,
  },
  section: {
    color: "#D1D5DB",
    fontWeight: "700" as const,
    marginTop: 10,
    marginBottom: 4,
  },
  value: {
    color: "white",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  buttonText: {
    color: "white",
    fontWeight: "700" as const,
  },
});
