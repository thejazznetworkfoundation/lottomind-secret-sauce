import type { RouteArcadeGameCatalogEntry } from "@/types/stage";

export const memoryGame: RouteArcadeGameCatalogEntry = {
  id: "memory",
  kind: "route",
  title: "Memory",
  subtitle: "Card Matching",
  description: "Flip cards, match pairs, race the timer, and keep the original LottoMind memory game in rotation.",
  categoryId: "classic-games",
  categoryLabel: "Classic Games",
  accentColor: "#f1c40f",
  ctaLabel: "Match Cards",
  routePath: "/card-game",
  rewardLabel: "Match",
  launchRewardCredits: 25,
};
