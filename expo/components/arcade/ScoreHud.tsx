import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";
import type { JungleStageConfig } from "@/types/arcade";
import HealthMeter from "@/components/arcade/HealthMeter";
import OxygenMeter from "@/components/arcade/OxygenMeter";

interface ScoreHudProps {
  score: number;
  creditsEarned: number;
  health: number;
  oxygen: number;
  bossDistance: number;
  comboGoldWhite: number;
  comboJackpot: number;
  stage: JungleStageConfig;
}

export default function ScoreHud({
  score,
  creditsEarned,
  health,
  oxygen,
  bossDistance,
  comboGoldWhite,
  comboJackpot,
  stage,
}: ScoreHudProps) {
  return (
    <View style={styles.hud}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.stage}>{stage.shortTitle}</Text>
          <Text style={styles.score}>{score.toLocaleString()} pts</Text>
        </View>
        <HealthMeter health={health} />
      </View>
      <View style={styles.bottomRow}>
        {stage.mechanic === "swim" ? <OxygenMeter oxygen={oxygen} /> : <Text style={styles.mini}>Credits +{creditsEarned}</Text>}
        {stage.mechanic === "boss" ? (
          <Text style={styles.boss}>Beast {Math.round(bossDistance)}m</Text>
        ) : (
          <Text style={styles.mini}>Combo {comboGoldWhite}/5 {comboJackpot}/1</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    padding: 12,
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.34)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  stage: {
    color: ARCADE_THEME.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  score: {
    color: ARCADE_THEME.ivory,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
  },
  mini: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
  },
  boss: {
    color: ARCADE_THEME.dangerRed,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
});

