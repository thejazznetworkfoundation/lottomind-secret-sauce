import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ARCADE_LEGAL_DISCLAIMER, ARCADE_THEME } from "@/constants/arcadeTheme";

export default function LegalDisclaimerBar() {
  return (
    <View style={styles.bar}>
      <Text style={styles.text}>{ARCADE_LEGAL_DISCLAIMER}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.32)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  text: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
    letterSpacing: 0,
    textAlign: "center",
  },
});

