import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";

const BOSS_SOURCE = require("@/assets/arcade/branded/villain-mask-keeper.png");

interface BossSpriteProps {
  width?: number;
  height?: number;
  distance?: number;
  style?: StyleProp<ImageStyle>;
  forceFallback?: boolean;
}

export default function BossSprite({ width = 118, height = 118, distance = 72, style, forceFallback = false }: BossSpriteProps) {
  const dangerScale = 1 + Math.max(0, 80 - distance) / 250;
  if (forceFallback) {
    return (
      <View style={[styles.fallback, { width, height, transform: [{ scale: dangerScale }] }, style as StyleProp<ViewStyle>]}>
        <Text style={styles.fallbackText}>PB</Text>
      </View>
    );
  }
  return (
    <Image
      source={BOSS_SOURCE}
      contentFit="contain"
      style={[{ width, height, transform: [{ scale: dangerScale }] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 3,
    borderColor: ARCADE_THEME.dangerRed,
    backgroundColor: "rgba(90, 45, 130, 0.85)",
    shadowColor: ARCADE_THEME.dangerRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
  },
  fallbackText: {
    color: ARCADE_THEME.ivory,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
