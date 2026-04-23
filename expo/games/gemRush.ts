import { gemRushStage } from "@/stages/gemRushStage";
import type { NativeArcadeGameCatalogEntry } from "@/types/stage";

export const gemRushGame: NativeArcadeGameCatalogEntry = {
  id: "gem-rush-run",
  kind: "native",
  title: gemRushStage.title,
  subtitle: gemRushStage.subtitle,
  description: "A faster warm-up sprint with lighter pressure, quicker loops, and gem-heavy routing.",
  categoryId: "quick-play",
  categoryLabel: "Quick Play",
  accentColor: "#68ecff",
  ctaLabel: "Play Sprint",
  routePath: "/games/gem-rush",
  rewardLabel: "Score",
  launchRewardCredits: 25,
  stage: gemRushStage,
};
