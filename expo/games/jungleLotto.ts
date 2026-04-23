import type { WebArcadeGameCatalogEntry } from "@/types/stage";

export const jungleLottoGame: WebArcadeGameCatalogEntry = {
  id: "jungle-lotto-classic",
  kind: "web",
  title: "Lotto Minded",
  subtitle: "Classic Jungle Remix",
  description: "A mobile-friendly Classic Jungle vault challenge adapted for LottoMind credits.",
  categoryId: "classic-jungle",
  categoryLabel: "Classic Jungle",
  accentColor: "#7cff8b",
  ctaLabel: "Play Jungle Lotto",
  routePath: "/games/jungle-lotto",
  rewardLabel: "+25",
  launchRewardCredits: 25,
  embedPath: "/jungle-lotto/index.html",
  sourceUrl: "https://github.com/robjasper2084/Jungle-Lotto.git",
};
