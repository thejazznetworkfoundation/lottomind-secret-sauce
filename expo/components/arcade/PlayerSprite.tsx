import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View, type ImageSourcePropType, type ImageStyle, type StyleProp, type ViewStyle } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";
import type { JunglePlayerAnimationState } from "@/types/arcade";

const HERO_SOURCES: Record<JunglePlayerAnimationState, ImageSourcePropType> = {
  idle: require("@/assets/arcade/branded/hero-idle.png"),
  run: require("@/assets/arcade/branded/hero-run1.png"),
  jump: require("@/assets/arcade/branded/hero-jump.png"),
  swing: require("@/assets/arcade/branded/hero-climb.png"),
  swim: require("@/assets/arcade/branded/hero-run2.png"),
  slide: require("@/assets/arcade/branded/hero-crouch.png"),
  hit: require("@/assets/arcade/branded/hero-hurt.png"),
  victory: require("@/assets/arcade/branded/hero-celebrate.png"),
};

interface PlayerSpriteProps {
  state: JunglePlayerAnimationState;
  width?: number;
  height?: number;
  facing?: "left" | "right";
  style?: StyleProp<ImageStyle>;
  forceFallback?: boolean;
}

function FallbackHero({ width, height }: { width: number; height: number }) {
  return (
    <View style={[styles.fallback, { width, height }]}>
      <View style={styles.heroHead} />
      <View style={styles.heroBody} />
      <View style={styles.heroBelt} />
    </View>
  );
}

export default function PlayerSprite({
  state,
  width = 58,
  height = 78,
  facing = "right",
  style,
  forceFallback = false,
}: PlayerSpriteProps) {
  const transform = [{ scaleX: facing === "left" ? -1 : 1 }];
  if (forceFallback) {
    return (
      <View style={[style as StyleProp<ViewStyle>, { transform }]}>
        <FallbackHero width={width} height={height} />
      </View>
    );
  }

  return (
    <Image
      source={HERO_SOURCES[state] ?? HERO_SOURCES.idle}
      contentFit="contain"
      style={[{ width, height, transform }, style]}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  heroHead: {
    width: "46%",
    height: "26%",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: ARCADE_THEME.gold,
    backgroundColor: ARCADE_THEME.ivory,
  },
  heroBody: {
    marginTop: -2,
    width: "62%",
    height: "48%",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ARCADE_THEME.gold,
    backgroundColor: ARCADE_THEME.emerald,
  },
  heroBelt: {
    width: "68%",
    height: 7,
    marginTop: -14,
    borderRadius: 4,
    backgroundColor: ARCADE_THEME.amber,
  },
});
