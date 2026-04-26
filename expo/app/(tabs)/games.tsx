import { router } from "expo-router";
import { ChevronRight, Crown, Gamepad2, ShoppingBag, Trophy } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ArcadeGameSprite } from "@/components/arcade/ArcadeGameSprite";
import LegalDisclaimerBar from "@/components/arcade/LegalDisclaimerBar";
import { ARCADE_THEME, JACKPOT_JUNGLE_TITLE } from "@/constants/arcadeTheme";
import { arcadeGameCatalog } from "@/games/registry";
import type { ArcadeGameCatalogEntry } from "@/types/stage";

function launchGame(game: ArcadeGameCatalogEntry) {
  if (game.kind === "route") {
    router.push(game.routePath as never);
    return;
  }
  router.push(`/arcade?game=${encodeURIComponent(game.id)}` as never);
}

export default function ArcadeHomeScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Gamepad2 size={27} color={ARCADE_THEME.black} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>LottoMind Arcade</Text>
              <Text style={styles.heroTitle}>{JACKPOT_JUNGLE_TITLE}</Text>
            </View>
          </View>
          <Text style={styles.heroBody}>
            A LottoMind-original luxury jungle arcade lobby with virtual credits, daily runs, rewards, and entertainment-only gameplay.
          </Text>
          <View style={styles.heroActions}>
            <Pressable style={styles.goldButton} onPress={() => router.push("/arcade/stage-map" as never)}>
              <Crown size={17} color={ARCADE_THEME.black} />
              <Text style={styles.goldButtonText}>Stage Map</Text>
            </Pressable>
            <Pressable style={styles.darkButton} onPress={() => router.push("/arcade/leaderboard" as never)}>
              <Trophy size={17} color={ARCADE_THEME.gold} />
              <Text style={styles.darkButtonText}>Leaderboard</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.shortcutRow}>
          <Pressable style={styles.shortcut} onPress={() => router.push("/arcade/character-select" as never)}>
            <Gamepad2 size={18} color={ARCADE_THEME.gold} />
            <Text style={styles.shortcutText}>Hero</Text>
          </Pressable>
          <Pressable style={styles.shortcut} onPress={() => router.push("/arcade/store" as never)}>
            <ShoppingBag size={18} color={ARCADE_THEME.gold} />
            <Text style={styles.shortcutText}>Store</Text>
          </Pressable>
          <Pressable
            style={styles.shortcut}
            onPress={() => router.push({ pathname: "/arcade/game", params: { stage: "golden-vine-swing", daily: "1" } } as never)}
          >
            <Crown size={18} color={ARCADE_THEME.gold} />
            <Text style={styles.shortcutText}>Daily</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Arcade Area</Text>
          <Text style={styles.sectionBody}>Original LottoMind games and repaired cabinet builds.</Text>
        </View>

        <View style={styles.gameList}>
          {arcadeGameCatalog.map((game) => (
            <Pressable key={game.id} style={styles.gameCard} onPress={() => launchGame(game)}>
              <ArcadeGameSprite game={game} size={58} compact />
              <View style={styles.gameText}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameSubtitle}>{game.description}</Text>
                <Text style={[styles.reward, { color: game.accentColor }]}>{game.rewardLabel}</Text>
              </View>
              <ChevronRight size={20} color={game.accentColor} />
            </Pressable>
          ))}
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
    paddingTop: 58,
    paddingBottom: 112,
  },
  hero: {
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.42)",
    backgroundColor: "rgba(11, 61, 46, 0.72)",
    padding: 18,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIcon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 27,
    backgroundColor: ARCADE_THEME.gold,
  },
  heroCopy: {
    flex: 1,
  },
  kicker: {
    color: ARCADE_THEME.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: ARCADE_THEME.ivory,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroBody: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    letterSpacing: 0,
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  goldButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 24,
    backgroundColor: ARCADE_THEME.gold,
  },
  goldButtonText: {
    color: ARCADE_THEME.black,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  darkButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.44)",
    backgroundColor: "rgba(5, 5, 5, 0.52)",
  },
  darkButtonText: {
    color: ARCADE_THEME.gold,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  shortcutRow: {
    flexDirection: "row",
    gap: 10,
  },
  shortcut: {
    flex: 1,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
  },
  shortcutText: {
    color: ARCADE_THEME.ivory,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  sectionHeader: {
    gap: 3,
  },
  sectionTitle: {
    color: ARCADE_THEME.ivory,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  sectionBody: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
  },
  gameList: {
    gap: 10,
  },
  gameCard: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.25)",
    backgroundColor: "rgba(5, 5, 5, 0.78)",
    padding: 13,
  },
  gameText: {
    flex: 1,
    gap: 4,
  },
  gameTitle: {
    color: ARCADE_THEME.ivory,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  gameSubtitle: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
    letterSpacing: 0,
  },
  reward: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
});

