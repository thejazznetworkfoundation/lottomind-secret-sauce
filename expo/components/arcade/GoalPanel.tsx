import { StyleSheet, Text, View } from "react-native";

import { ARCADE_COLORS } from "@/constants/arcade";

interface GoalPanelProps {
  checkpointLabel: string | null;
  distanceRemaining: number;
}

export function GoalPanel({ checkpointLabel, distanceRemaining }: GoalPanelProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>Reach The Vault</Text>
      <Text style={styles.title}>Before the boss catches you</Text>
      <Text style={styles.body}>{Math.max(0, Math.round(distanceRemaining))}m remaining</Text>
      <Text style={styles.meta}>{checkpointLabel ?? "Vault Corridor"} locked in as your next route marker.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(9, 10, 18, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(255, 201, 95, 0.38)",
  },
  kicker: {
    color: ARCADE_COLORS.gold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 4,
    color: ARCADE_COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  body: {
    marginTop: 6,
    color: ARCADE_COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    marginTop: 6,
    color: "rgba(246, 239, 223, 0.72)",
    fontSize: 12,
    lineHeight: 17,
  },
});
