import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";

interface OxygenMeterProps {
  oxygen: number;
}

export default function OxygenMeter({ oxygen }: OxygenMeterProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>O2</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, oxygen))}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 110,
  },
  label: {
    color: ARCADE_THEME.coldBlue,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  track: {
    flex: 1,
    height: 9,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(108, 215, 255, 0.52)",
    backgroundColor: "rgba(108, 215, 255, 0.12)",
  },
  fill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: ARCADE_THEME.coldBlue,
  },
});

