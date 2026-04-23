import { crosswordGame } from "@/games/crossword";
import { gemRushGame } from "@/games/gemRush";
import { gothtechnologyGame } from "@/games/gothtechnology";
import { jungleLottoGame } from "@/games/jungleLotto";
import { ludoDiceGame } from "@/games/ludoDice";
import { memoryGame } from "@/games/memory";
import { triviaGame } from "@/games/trivia";
import { vaultRunGame } from "@/games/vaultRun";
import { wordSearchGame } from "@/games/wordSearch";
import type { ArcadeGameCategoryId, ArcadeGameCatalogEntry } from "@/types/stage";

export const arcadeGameCatalog: readonly ArcadeGameCatalogEntry[] = [
  gemRushGame,
  vaultRunGame,
  jungleLottoGame,
  gothtechnologyGame,
  triviaGame,
  crosswordGame,
  wordSearchGame,
  ludoDiceGame,
  memoryGame,
] as const;

export const arcadeGameCategories: readonly { id: ArcadeGameCategoryId; label: string }[] = [
  { id: "quick-play", label: "Quick Play" },
  { id: "boss-chase", label: "Boss Chase" },
  { id: "classic-jungle", label: "Classic Jungle" },
  { id: "mind-credits", label: "Mind Credits" },
  { id: "classic-games", label: "Classic Games" },
] as const;

export function getArcadeGameById(gameId: string) {
  return arcadeGameCatalog.find((game) => game.id === gameId) ?? null;
}
