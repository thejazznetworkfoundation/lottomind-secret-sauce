import { Lock, Play } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";
import type { JungleStageConfig } from "@/types/arcade";

interface StageCardProps {
  stage: JungleStageConfig;
  locked?: boolean;
  onPress: () => void;
}

export default function StageCard({ stage, locked = false, onPress }: StageCardProps) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={({ pressed }) => [styles.card, { borderColor: stage.accentColor }, locked && styles.locked, pressed && !locked && styles.pressed]}
    >
      <View style={[styles.badge, { backgroundColor: stage.accentColor }]}>
        <Text style={styles.badgeText}>{stage.order}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{stage.title}</Text>
        <Text style={styles.subtitle}>{stage.subtitle}</Text>
        <Text style={styles.reward}>+{stage.credits} credits</Text>
      </View>
      {locked ? <Lock size={20} color="rgba(255,255,255,0.42)" /> : <Play size={20} color={stage.accentColor} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(5, 5, 5, 0.78)",
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  locked: {
    opacity: 0.52,
  },
  badge: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  badgeText: {
    color: ARCADE_THEME.black,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: ARCADE_THEME.ivory,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
  },
  reward: {
    color: ARCADE_THEME.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
});

