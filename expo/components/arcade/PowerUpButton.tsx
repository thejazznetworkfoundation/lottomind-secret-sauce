import { Shield, Sparkles, Timer, Waves, Zap } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ARCADE_THEME, JUNGLE_POWERUPS } from "@/constants/arcadeTheme";
import type { JunglePowerUpId } from "@/types/arcade";

interface PowerUpButtonProps {
  type: JunglePowerUpId;
  count: number;
  active?: boolean;
  onPress: () => void;
}

function Icon({ type, color }: { type: JunglePowerUpId; color: string }) {
  if (type === "dreamShield") return <Shield size={17} color={color} />;
  if (type === "frequencyMagnet") return <Waves size={17} color={color} />;
  if (type === "hotNumberBoost") return <Zap size={17} color={color} />;
  if (type === "oracleSlowTime") return <Timer size={17} color={color} />;
  if (type === "goldOxygenOrb") return <Sparkles size={17} color={color} />;
  return <Sparkles size={17} color={color} />;
}

export default function PowerUpButton({ type, count, active = false, onPress }: PowerUpButtonProps) {
  const enabled = count > 0 || type === "dreamShield";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={JUNGLE_POWERUPS[type].label}
      onPress={enabled ? onPress : undefined}
      style={({ pressed }) => [styles.button, active && styles.active, !enabled && styles.disabled, pressed && enabled && styles.pressed]}
    >
      <Icon type={type} color={enabled ? ARCADE_THEME.gold : "rgba(255,255,255,0.28)"} />
      <View style={styles.countBadge}>
        <Text style={styles.count}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.48)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
  },
  active: {
    borderColor: ARCADE_THEME.amber,
    backgroundColor: "rgba(255, 176, 0, 0.18)",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  countBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: ARCADE_THEME.purple,
    borderWidth: 1,
    borderColor: ARCADE_THEME.gold,
  },
  count: {
    color: ARCADE_THEME.ivory,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0,
  },
});

