import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";

const JUNGLE_BG = require("@/assets/arcade/branded/jungle-biome-background.jpg");

interface ParallaxJungleBackgroundProps {
  cameraX: number;
  progress?: number;
}

export default function ParallaxJungleBackground({ cameraX, progress = 0 }: ParallaxJungleBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <ImageBackground source={JUNGLE_BG} resizeMode="cover" style={StyleSheet.absoluteFill}>
        <View style={styles.blackWash} />
        <View style={[styles.moonGlow, { transform: [{ translateX: -cameraX * 0.015 }] }]} />
        <View style={[styles.farLeaves, { transform: [{ translateX: -cameraX * 0.04 }] }]} />
        <View style={[styles.midLeaves, { transform: [{ translateX: -cameraX * 0.08 }] }]} />
        <View style={[styles.goldHaze, { opacity: 0.18 + progress * 0.12 }]} />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  blackWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 5, 5, 0.62)",
  },
  moonGlow: {
    position: "absolute",
    right: 28,
    top: 30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(212, 175, 55, 0.18)",
  },
  farLeaves: {
    position: "absolute",
    left: -40,
    right: -40,
    top: 58,
    height: 120,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    backgroundColor: "rgba(11, 61, 46, 0.52)",
  },
  midLeaves: {
    position: "absolute",
    left: -80,
    right: -80,
    bottom: 68,
    height: 96,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    backgroundColor: "rgba(9, 48, 37, 0.72)",
  },
  goldHaze: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ARCADE_THEME.goldWash,
  },
});
