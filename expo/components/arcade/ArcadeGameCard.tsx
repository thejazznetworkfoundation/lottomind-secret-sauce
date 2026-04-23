import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { ARCADE_COLORS } from "@/constants/arcade";
import { arcadeUiArt } from "@/constants/arcadeAssets";
import type { ArcadeGameCatalogEntry } from "@/types/stage";

interface ArcadeGameCardProps {
  game: ArcadeGameCatalogEntry;
  bestScore?: number | null;
  totalRuns?: number;
  onPlay: () => void;
}

export function ArcadeGameCard({ game, bestScore, totalRuns = 0, onPlay }: ArcadeGameCardProps) {
  const backgroundSource =
    game.categoryId === "boss-chase"
      ? arcadeUiArt.bossStageReference.image.source
      : game.categoryId === "classic-jungle"
        ? arcadeUiArt.classicJungleBanner.image.source
        : game.categoryId === "mind-credits"
          ? arcadeUiArt.gothtechnologyBanner.image.source
        : game.categoryId === "quick-play"
          ? arcadeUiArt.quickPlayBanner.image.source
          : arcadeUiArt.promoBackdrop.image.source;
  const isWebGame = game.kind === "web";
  const isRouteGame = game.kind === "route";

  return (
    <Pressable onPress={onPlay} style={styles.card}>
      <Image source={backgroundSource} contentFit="cover" style={styles.heroImage} />
      <View
        style={[
          styles.overlay,
          {
            backgroundColor:
              game.categoryId === "classic-games"
                ? "rgba(7, 8, 18, 0.5)"
                : game.categoryId === "boss-chase"
                ? "rgba(10, 8, 18, 0.52)"
                : game.categoryId === "classic-jungle"
                  ? "rgba(3, 24, 11, 0.52)"
                  : game.categoryId === "mind-credits"
                    ? "rgba(6, 2, 14, 0.42)"
                    : "rgba(4, 16, 24, 0.46)",
          },
        ]}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.categoryPill, { borderColor: game.accentColor }]}>
            <Text style={[styles.categoryText, { color: game.accentColor }]}>{game.categoryLabel}</Text>
          </View>
          <View style={[styles.accentDot, { backgroundColor: game.accentColor }]} />
        </View>

        <Text style={styles.title}>{game.title}</Text>
        <Text style={styles.subtitle}>{game.subtitle}</Text>
        <Text style={styles.description}>{game.description}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>{isWebGame || isRouteGame ? "Mode" : "Best"}</Text>
            <Text style={styles.statValue}>
              {isRouteGame ? "In-App" : isWebGame ? "Mobile" : bestScore ? bestScore.toLocaleString() : "--"}
            </Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statLabel}>{isRouteGame ? "Reward" : isWebGame ? "Source" : "Runs"}</Text>
            <Text style={styles.statValue}>
              {isRouteGame ? game.rewardLabel : isWebGame ? "Bundled" : totalRuns}
            </Text>
          </View>
        </View>

        <View style={[styles.ctaButton, { backgroundColor: game.accentColor }]}>
          <Text style={styles.ctaText}>{game.ctaLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: "#07111c",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 18,
    bottom: 18,
    justifyContent: "flex-end",
  },
  topRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryPill: {
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(5, 12, 22, 0.74)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  title: {
    color: ARCADE_COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 6,
    color: "#d5c5ff",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    marginTop: 10,
    color: ARCADE_COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 420,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  statChip: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(6, 13, 25, 0.84)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statLabel: {
    color: ARCADE_COLORS.muted,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  statValue: {
    marginTop: 5,
    color: ARCADE_COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  ctaButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  ctaText: {
    color: "#241503",
    fontSize: 15,
    fontWeight: "800",
  },
});
