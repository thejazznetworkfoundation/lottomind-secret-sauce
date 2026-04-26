import { router } from "expo-router";
import { Crown, ShoppingBag, Trophy, UserRound, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import LegalDisclaimerBar from "@/components/arcade/LegalDisclaimerBar";
import StageCard from "@/components/arcade/StageCard";
import { ARCADE_THEME, JACKPOT_JUNGLE_STAGES, JACKPOT_JUNGLE_TITLE } from "@/constants/arcadeTheme";
import { arcadeStorage } from "@/services/arcadeStorage";
import type { JungleStageId } from "@/types/arcade";

export default function StageMapScreen() {
  const [completedStages, setCompletedStages] = useState<JungleStageId[]>([]);

  useEffect(() => {
    arcadeStorage.getCompletedStages().then(setCompletedStages);
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Close stage map">
            <X color={ARCADE_THEME.gold} size={20} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>Stage Map</Text>
            <Text style={styles.title}>{JACKPOT_JUNGLE_TITLE}</Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          <Pressable style={styles.quickButton} onPress={() => router.push("/arcade/character-select" as never)}>
            <UserRound size={18} color={ARCADE_THEME.gold} />
            <Text style={styles.quickText}>Hero</Text>
          </Pressable>
          <Pressable style={styles.quickButton} onPress={() => router.push("/arcade/leaderboard" as never)}>
            <Trophy size={18} color={ARCADE_THEME.gold} />
            <Text style={styles.quickText}>Board</Text>
          </Pressable>
          <Pressable style={styles.quickButton} onPress={() => router.push("/arcade/store" as never)}>
            <ShoppingBag size={18} color={ARCADE_THEME.gold} />
            <Text style={styles.quickText}>Store</Text>
          </Pressable>
        </View>

        <View style={styles.dailyCard}>
          <Crown size={26} color={ARCADE_THEME.gold} />
          <View style={styles.dailyText}>
            <Text style={styles.dailyTitle}>Daily Jackpot Run</Text>
            <Text style={styles.dailyBody}>Same seed for everyone today. Entertainment only, never lottery prediction.</Text>
          </View>
          <Pressable
            style={styles.dailyButton}
            onPress={() => router.push({ pathname: "/arcade/game", params: { stage: "golden-vine-swing", daily: "1" } } as never)}
          >
            <Text style={styles.dailyButtonText}>Run</Text>
          </Pressable>
        </View>

        <View style={styles.stageList}>
          {JACKPOT_JUNGLE_STAGES.map((stage) => {
            const previousStage = JACKPOT_JUNGLE_STAGES[stage.order - 2];
            const locked = Boolean(previousStage && !completedStages.includes(previousStage.id));
            return (
              <StageCard
                key={stage.id}
                stage={stage}
                locked={false && locked}
                onPress={() => router.push({ pathname: "/arcade/game", params: { stage: stage.id } } as never)}
              />
            );
          })}
        </View>

        <LegalDisclaimerBar />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ARCADE_THEME.black,
  },
  content: {
    gap: 14,
    padding: 16,
    paddingTop: 56,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.34)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    color: ARCADE_THEME.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: ARCADE_THEME.ivory,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickButton: {
    flex: 1,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.34)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
  },
  quickText: {
    color: ARCADE_THEME.ivory,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  dailyCard: {
    minHeight: 110,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.42)",
    backgroundColor: "rgba(11, 61, 46, 0.72)",
    padding: 14,
  },
  dailyText: {
    flex: 1,
    gap: 4,
  },
  dailyTitle: {
    color: ARCADE_THEME.ivory,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  dailyBody: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    letterSpacing: 0,
  },
  dailyButton: {
    borderRadius: 18,
    backgroundColor: ARCADE_THEME.gold,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  dailyButtonText: {
    color: ARCADE_THEME.black,
    fontWeight: "900",
    letterSpacing: 0,
  },
  stageList: {
    gap: 10,
  },
});
