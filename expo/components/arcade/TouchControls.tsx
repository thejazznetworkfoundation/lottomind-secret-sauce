import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Shield, Zap } from "lucide-react-native";
import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";
import type { JungleStageConfig } from "@/types/arcade";

interface TouchControlsProps {
  stage: JungleStageConfig;
  onMove: (direction: -1 | 0 | 1) => void;
  onJump: () => void;
  onSlide: () => void;
  onSwim: (direction: -1 | 0 | 1) => void;
  onSpecial: () => void;
  onSwingPressIn: () => void;
  onSwingPressOut: () => void;
}

export default function TouchControls({
  stage,
  onMove,
  onJump,
  onSlide,
  onSwim,
  onSpecial,
  onSwingPressIn,
  onSwingPressOut,
}: TouchControlsProps) {
  const touchY = useRef(0);
  const isSwim = stage.mechanic === "swim";
  const isSwing = stage.mechanic === "swing";

  return (
    <View
      style={styles.wrap}
      onTouchStart={(event) => {
        touchY.current = event.nativeEvent.pageY;
      }}
      onTouchEnd={(event) => {
        const dy = event.nativeEvent.pageY - touchY.current;
        if (Math.abs(dy) > 18) {
          onSwim(dy < 0 ? -1 : 1);
        }
      }}
    >
      <View style={styles.cluster}>
        <Pressable
          style={styles.roundButton}
          onPressIn={() => onMove(-1)}
          onPressOut={() => onMove(0)}
          accessibilityLabel="Move left"
        >
          <ArrowLeft size={22} color={ARCADE_THEME.gold} />
        </Pressable>
        <Pressable
          style={styles.roundButton}
          onPressIn={() => onMove(1)}
          onPressOut={() => onMove(0)}
          accessibilityLabel="Move right"
        >
          <ArrowRight size={22} color={ARCADE_THEME.gold} />
        </Pressable>
      </View>

      <View style={styles.cluster}>
        {isSwim ? (
          <>
            <Pressable style={styles.roundButton} onPress={() => onSwim(-1)} accessibilityLabel="Swim up">
              <ChevronUp size={23} color={ARCADE_THEME.coldBlue} />
            </Pressable>
            <Pressable style={styles.roundButton} onPress={() => onSwim(1)} accessibilityLabel="Swim down">
              <ChevronDown size={23} color={ARCADE_THEME.coldBlue} />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={[styles.actionButton, isSwing && styles.swingButton]}
              onPress={isSwing ? undefined : onJump}
              onPressIn={isSwing ? onSwingPressIn : undefined}
              onPressOut={isSwing ? onSwingPressOut : undefined}
              accessibilityLabel={isSwing ? "Charge swing release" : "Jump"}
            >
              <Zap size={18} color={ARCADE_THEME.black} />
              <Text style={styles.actionText}>{isSwing ? "Swing" : "Jump"}</Text>
            </Pressable>
            {(stage.mechanic === "runner" || stage.mechanic === "boss") && (
              <Pressable style={styles.actionButton} onPress={onSlide} accessibilityLabel="Slide">
                <ChevronDown size={18} color={ARCADE_THEME.black} />
                <Text style={styles.actionText}>Slide</Text>
              </Pressable>
            )}
          </>
        )}
        <Pressable style={[styles.roundButton, styles.special]} onPress={onSpecial} accessibilityLabel="Dream Shield">
          <Shield size={20} color={ARCADE_THEME.gold} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  roundButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.46)",
    backgroundColor: "rgba(5, 5, 5, 0.82)",
  },
  actionButton: {
    minWidth: 72,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 26,
    backgroundColor: ARCADE_THEME.gold,
    paddingHorizontal: 14,
  },
  swingButton: {
    backgroundColor: ARCADE_THEME.amber,
  },
  actionText: {
    color: ARCADE_THEME.black,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  special: {
    borderColor: ARCADE_THEME.purple,
    backgroundColor: "rgba(90, 45, 130, 0.58)",
  },
});
