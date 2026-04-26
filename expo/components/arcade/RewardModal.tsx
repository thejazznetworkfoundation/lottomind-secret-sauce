import { Trophy } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ARCADE_THEME } from "@/constants/arcadeTheme";

interface RewardModalProps {
  visible: boolean;
  title: string;
  score: number;
  credits: number;
  onContinue: () => void;
  onRestart?: () => void;
}

export default function RewardModal({ visible, title, score, credits, onContinue, onRestart }: RewardModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.icon}>
            <Trophy color={ARCADE_THEME.gold} size={30} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.score}>{score.toLocaleString()} pts</Text>
          <Text style={styles.credits}>+{credits} Lotto Credits</Text>
          <View style={styles.row}>
            {onRestart ? (
              <Pressable style={styles.secondaryButton} onPress={onRestart}>
                <Text style={styles.secondaryText}>Restart</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.primaryButton} onPress={onContinue}>
              <Text style={styles.primaryText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.76)",
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.5)",
    backgroundColor: ARCADE_THEME.blackPanel,
    padding: 22,
  },
  icon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    backgroundColor: "rgba(212, 175, 55, 0.14)",
  },
  title: {
    color: ARCADE_THEME.ivory,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0,
  },
  score: {
    color: ARCADE_THEME.gold,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  credits: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    minWidth: 128,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: ARCADE_THEME.gold,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryText: {
    color: ARCADE_THEME.black,
    fontWeight: "900",
    letterSpacing: 0,
  },
  secondaryButton: {
    minWidth: 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.42)",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryText: {
    color: ARCADE_THEME.gold,
    fontWeight: "900",
    letterSpacing: 0,
  },
});

