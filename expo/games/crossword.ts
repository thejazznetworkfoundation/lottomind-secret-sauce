import type { RouteArcadeGameCatalogEntry } from "@/types/stage";

export const crosswordGame: RouteArcadeGameCatalogEntry = {
  id: "crossword",
  kind: "route",
  title: "Crossword",
  subtitle: "25 Lotto Word Puzzles",
  description: "Solve classic LottoMind crossword boards and bank credits when each puzzle is completed.",
  categoryId: "classic-games",
  categoryLabel: "Classic Games",
  accentColor: "#9b59b6",
  ctaLabel: "Solve Crossword",
  routePath: "/crossword",
  rewardLabel: "Puzzle",
  launchRewardCredits: 25,
};
