import { Brain } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";

interface HealthMeterProps {
  health: number;
  max?: number;
}

export default function HealthMeter({ health, max = 3 }: HealthMeterProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: max }, (_, index) => (
        <View key={index} style={[styles.heart, index >= health && styles.empty]}>
          <Brain size={15} color={index < health ? ARCADE_THEME.gold : "rgba(255,255,255,0.28)"} strokeWidth={2.8} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 5,
  },
  heart: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: ARCADE_THEME.gold,
    backgroundColor: "rgba(212, 175, 55, 0.14)",
  },
  empty: {
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});

