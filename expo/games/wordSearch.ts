import type { RouteArcadeGameCatalogEntry } from "@/types/stage";

export const wordSearchGame: RouteArcadeGameCatalogEntry = {
  id: "word-search",
  kind: "route",
  title: "Word Search",
  subtitle: "Hidden Lottery Terms",
  description: "Find every hidden word in the grid and collect Mind Credits as you clear each puzzle.",
  categoryId: "classic-games",
  categoryLabel: "Classic Games",
  accentColor: "#3498db",
  ctaLabel: "Find Words",
  routePath: "/word-search",
  rewardLabel: "Puzzle",
  launchRewardCredits: 25,
};
