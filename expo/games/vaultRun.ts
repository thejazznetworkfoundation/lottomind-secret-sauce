import { jackpotChaseStage } from "@/stages/jackpotChaseStage";
import type { NativeArcadeGameCatalogEntry } from "@/types/stage";

export const vaultRunGame: NativeArcadeGameCatalogEntry = {
  id: "vault-run",
  kind: "native",
  title: jackpotChaseStage.title,
  subtitle: jackpotChaseStage.subtitle,
  description: "The full cyber-jungle boss chase. Outrun the croc, survive the hazards, and reach the LM vault.",
  categoryId: "boss-chase",
  categoryLabel: "Boss Chase",
  accentColor: "#ffc95f",
  ctaLabel: "Play Vault Run",
  routePath: "/games/vault-run",
  rewardLabel: "Score",
  launchRewardCredits: 25,
  stage: jackpotChaseStage,
};
