import { StyleSheet, Text, View } from "react-native";

import { ARCADE_COLORS } from "@/constants/arcade";

interface BossThreatBarProps {
  threat: number;
}

export function BossThreatBar({ threat }: BossThreatBarProps) {
  const segments = 8;
  const filledSegments = Math.round(Math.max(0, Math.min(1, threat)) * segments);
  const tone = threat > 0.8 ? ARCADE_COLORS.danger : threat > 0.58 ? ARCADE_COLORS.gold : ARCADE_COLORS.purple;

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>Boss Threat</Text>
      <Text style={styles.title}>{threat > 0.8 ? "Critical Pursuit" : threat > 0.58 ? "Closing Fast" : "In Range"}</Text>
      <View style={styles.segmentRow}>
        {Array.from({ length: segments }, (_, index) => (
          <View
            key={`segment-${index}`}
            style={[
              styles.segment,
              index < filledSegments ? { backgroundColor: tone, borderColor: tone } : styles.segmentIdle,
            ]}
          />
        ))}
      </View>
      <Text style={styles.value}>{Math.round(threat * 100)}% pressure</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 4,
  },
  kicker: {
    color: ARCADE_COLORS.purple,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 4,
    color: ARCADE_COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  segmentRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    height: 14,
    marginRight: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  segmentIdle: {
    backgroundColor: "rgba(191, 115, 255, 0.06)",
    borderColor: "rgba(191, 115, 255, 0.18)",
  },
  value: {
    color: ARCADE_COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
});
