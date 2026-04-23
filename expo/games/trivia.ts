import type { RouteArcadeGameCatalogEntry } from "@/types/stage";

export const triviaGame: RouteArcadeGameCatalogEntry = {
  id: "trivia",
  kind: "route",
  title: "Trivia",
  subtitle: "Lottery Brain Challenge",
  description: "Answer lottery-themed questions, build streaks, and earn Mind Credits by difficulty.",
  categoryId: "classic-games",
  categoryLabel: "Classic Games",
  accentColor: "#2ecc71",
  ctaLabel: "Play Trivia",
  routePath: "/trivia-play",
  rewardLabel: "5-25/Q",
  launchRewardCredits: 25,
};
