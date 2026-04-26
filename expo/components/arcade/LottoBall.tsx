import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";
import type { JungleBallRarity } from "@/types/arcade";

interface LottoBallProps {
  number: number;
  rarity: JungleBallRarity;
  size?: number;
  symbol?: string;
  style?: ViewStyle;
}

const rarityStyles: Record<JungleBallRarity, { backgroundColor: string; borderColor: string; shadowColor: string; textColor: string }> = {
  hot: {
    backgroundColor: ARCADE_THEME.amber,
    borderColor: ARCADE_THEME.gold,
    shadowColor: ARCADE_THEME.amber,
    textColor: ARCADE_THEME.black,
  },
  cold: {
    backgroundColor: ARCADE_THEME.coldBlue,
    borderColor: ARCADE_THEME.gold,
    shadowColor: ARCADE_THEME.coldBlue,
    textColor: ARCADE_THEME.black,
  },
  balanced: {
    backgroundColor: ARCADE_THEME.ivory,
    borderColor: ARCADE_THEME.gold,
    shadowColor: ARCADE_THEME.ivory,
    textColor: ARCADE_THEME.black,
  },
  jackpot: {
    backgroundColor: ARCADE_THEME.dangerRed,
    borderColor: ARCADE_THEME.gold,
    shadowColor: ARCADE_THEME.dangerRed,
    textColor: ARCADE_THEME.ivory,
  },
};

export default function LottoBall({ number, rarity, size = 34, symbol, style }: LottoBallProps) {
  const colors = rarityStyles[rarity];
  return (
    <View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          shadowColor: colors.shadowColor,
        },
        style,
      ]}
    >
      <Text style={[styles.number, { color: colors.textColor, fontSize: size > 36 ? 14 : 12 }]}>
        {symbol ? symbol.slice(0, 2).toUpperCase() : number}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 10,
    elevation: 6,
  },
  number: {
    fontWeight: "900",
    letterSpacing: 0,
  },
});

