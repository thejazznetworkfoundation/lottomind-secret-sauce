import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LottoDraw } from "@/lib/lottoMindApi";

interface Props {
  title: string;
  draws: LottoDraw[];
}

export function LiveGameSection({ title, draws }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>

      {draws.length === 0 ? (
        <Text style={styles.empty}>No results available.</Text>
      ) : (
        draws.map((draw) => (
          <View key={`${draw.id}-${draw.drawDate}`} style={styles.card}>
            <Text style={styles.game}>{draw.gameName}</Text>
            <Text style={styles.date}>{draw.drawDate || "No draw date"}</Text>
            <Text style={styles.numbers}>{draw.numbers.join(" - ")}</Text>
            {!!draw.bonusNumbers?.length && (
              <Text style={styles.bonus}>Bonus: {draw.bonusNumbers.join(" - ")}</Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 10,
  },
  empty: {
    color: "#9CA3AF",
  },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  game: {
    color: "white",
    fontWeight: "700" as const,
    fontSize: 15,
  },
  date: {
    color: "#9CA3AF",
    marginTop: 2,
    marginBottom: 8,
  },
  numbers: {
    color: "#34D399",
    fontWeight: "800" as const,
    fontSize: 18,
  },
  bonus: {
    color: "#FBBF24",
    marginTop: 4,
  },
});
