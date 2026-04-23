import type { RouteArcadeGameCatalogEntry } from "@/types/stage";

export const ludoDiceGame: RouteArcadeGameCatalogEntry = {
  id: "ludo",
  kind: "route",
  title: "Ludo Dice",
  subtitle: "Roll & Score",
  description: "Take turns around the dice board, chase the high score, and earn a completion credit bonus.",
  categoryId: "classic-games",
  categoryLabel: "Classic Games",
  accentColor: "#e74c3c",
  ctaLabel: "Roll Dice",
  routePath: "/ludo",
  rewardLabel: "+15",
  launchRewardCredits: 25,
};
