import type { RouteArcadeGameCatalogEntry } from "@/types/stage";

export const jackpotJungleChaseGame: RouteArcadeGameCatalogEntry = {
  id: "jackpot-jungle-chase",
  kind: "route",
  title: "Jackpot Jungle Chase",
  subtitle: "LottoMind arcade adventure",
  description:
    "Swing, swim, slide, and outrun the original Probability Beast across five LottoMind-branded jungle stages.",
  categoryId: "boss-chase",
  categoryLabel: "Jackpot Jungle",
  accentColor: "#D4AF37",
  ctaLabel: "Enter Jungle",
  routePath: "/arcade/stage-map",
  rewardLabel: "+50 Lotto Credits boss win",
  launchRewardCredits: 5,
};

