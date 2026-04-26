import type { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import type { ArcadeGameCatalogEntry } from "@/types/stage";

const spriteSources: Partial<Record<string, ImageSourcePropType>> = {
  "gem-rush-run": require("@/assets/arcade/branded/blue-gem.png") as ImageSourcePropType,
  "jackpot-jungle-chase": require("@/assets/arcade/branded/vine-gold.png") as ImageSourcePropType,
  "vault-run": require("@/assets/arcade/branded/hero-run1.png") as ImageSourcePropType,
  "jungle-lotto-classic": require("@/assets/arcade/branded/vine-green.png") as ImageSourcePropType,
  gothtechnology: require("@/assets/arcade/gothtechnology-hero-sheet.png") as ImageSourcePropType,
  trivia: require("@/assets/arcade/branded/treasure-chest.png") as ImageSourcePropType,
};

const pixelArtImageStyle =
  Platform.OS === "web"
    ? ({
        imageRendering: "pixelated",
      } as never)
    : null;

interface ArcadeGameSpriteProps {
  game: ArcadeGameCatalogEntry;
  size?: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ArcadeGameSprite({ game, size = 64, compact = false, style }: ArcadeGameSpriteProps) {
  const source = spriteSources[game.id];
  const accentShadow = `${game.accentColor}44`;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderColor: `${game.accentColor}88`,
          shadowColor: game.accentColor,
        },
        compact && styles.frameCompact,
        style,
      ]}
    >
      <View style={[styles.scanline, { backgroundColor: accentShadow }]} />
      <View style={[styles.pixelCorner, styles.pixelCornerTop, { backgroundColor: game.accentColor }]} />
      <View style={[styles.pixelCorner, styles.pixelCornerBottom, { backgroundColor: game.accentColor }]} />
      {source ? (
        <Image
          source={source}
          contentFit={game.id === "gothtechnology" ? "cover" : "contain"}
          style={[
            styles.spriteImage,
            game.id === "jungle-lotto-classic" && styles.vineSprite,
            game.id === "jackpot-jungle-chase" && styles.vineSprite,
            game.id === "gothtechnology" && styles.sheetSprite,
            pixelArtImageStyle,
          ]}
        />
      ) : (
        <FallbackSprite game={game} />
      )}
    </View>
  );
}

function FallbackSprite({ game }: { game: ArcadeGameCatalogEntry }) {
  if (game.id === "crossword" || game.id === "word-search") {
    return (
      <View style={styles.gridSprite}>
        {Array.from({ length: 16 }).map((_, index) => (
          <View
            key={`${game.id}-${index}`}
            style={[
              styles.gridPixel,
              {
                backgroundColor: index % (game.id === "crossword" ? 5 : 3) === 0 ? game.accentColor : "#13253f",
              },
            ]}
          />
        ))}
      </View>
    );
  }

  if (game.id === "ludo") {
    return (
      <View style={styles.diceSprite}>
        {[0, 1, 2, 3, 4].map((dot) => (
          <View key={dot} style={[styles.diceDot, { backgroundColor: game.accentColor }]} />
        ))}
      </View>
    );
  }

  if (game.id === "memory") {
    return (
      <View style={styles.cardStack}>
        <View style={[styles.memoryCard, styles.memoryCardBack, { borderColor: game.accentColor }]} />
        <View style={[styles.memoryCard, { borderColor: game.accentColor }]}>
          <View style={[styles.memoryGem, { backgroundColor: game.accentColor }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.questionSprite}>
      <Text style={[styles.questionText, { color: game.accentColor }]}>?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: "#050b17",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  frameCompact: {
    borderRadius: 8,
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  scanline: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "48%",
    height: 2,
    opacity: 0.45,
  },
  pixelCorner: {
    position: "absolute",
    width: 6,
    height: 6,
    opacity: 0.9,
  },
  pixelCornerTop: {
    top: 5,
    left: 5,
  },
  pixelCornerBottom: {
    right: 5,
    bottom: 5,
  },
  spriteImage: {
    width: "78%",
    height: "78%",
  },
  vineSprite: {
    width: "58%",
    height: "90%",
  },
  sheetSprite: {
    width: "120%",
    height: "120%",
  },
  gridSprite: {
    width: "62%",
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  gridPixel: {
    width: "20%",
    aspectRatio: 1,
    borderRadius: 1,
  },
  diceSprite: {
    width: "62%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#f8f2da",
    backgroundColor: "#101827",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "space-between",
    justifyContent: "space-between",
    padding: 7,
  },
  diceDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  cardStack: {
    width: "68%",
    height: "62%",
  },
  memoryCard: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: "68%",
    height: "76%",
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: "#101827",
    alignItems: "center",
    justifyContent: "center",
  },
  memoryCardBack: {
    left: 0,
    top: 0,
    right: undefined,
    bottom: undefined,
    opacity: 0.68,
  },
  memoryGem: {
    width: 14,
    height: 14,
    transform: [{ rotate: "45deg" }],
  },
  questionSprite: {
    width: "62%",
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#101827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#24344f",
  },
  questionText: {
    fontSize: 28,
    fontWeight: "900",
  },
});
