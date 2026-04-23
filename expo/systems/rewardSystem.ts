import { ARCADE_CONFIG } from "@/constants/arcadeConfig";
import type { ArcadeRewardGrant, ArcadeRunSummary } from "@/types/arcade";

import { buildArcadeRewards } from "@/utils/rewards";

export function calculateStageClearBonus(timeRemaining: number, livesRemaining: number) {
  return (
    Math.max(0, Math.floor(timeRemaining)) * ARCADE_CONFIG.rewards.stageClearTimeBonusPerSecond +
    Math.max(0, livesRemaining) * ARCADE_CONFIG.rewards.stageClearLifeBonus
  );
}

export function buildVictoryReward(summary: ArcadeRunSummary): ArcadeRewardGrant {
  return buildArcadeRewards({
    ...summary,
    victory: true,
  });
}
