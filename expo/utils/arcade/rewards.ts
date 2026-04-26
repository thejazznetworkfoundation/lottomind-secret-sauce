import { JUNGLE_CREDIT_REWARDS, JUNGLE_SCORING, getJungleStageConfig } from "@/constants/arcadeTheme";
import type { Ball, JungleStageId } from "@/types/arcade";

export function getBallPoints(ball: Pick<Ball, "rarity" | "points">, hotBoostActive = false): number {
  const base = ball.points;
  return hotBoostActive && ball.rarity === "hot" ? base * 2 : base;
}

export function calculateStageBonus(stageId: JungleStageId, perfect: boolean, bossWin: boolean): number {
  let bonus = 0;
  if (perfect) bonus += JUNGLE_SCORING.perfectStageBonus;
  if (bossWin) bonus += JUNGLE_SCORING.bossDefeatBonus;
  return bonus + getJungleStageConfig(stageId).credits * 10;
}

export function calculateCreditReward(options: {
  completed: boolean;
  dailyRun: boolean;
  perfect: boolean;
  bossWin: boolean;
}): number {
  let credits = 0;
  if (options.completed) credits += JUNGLE_CREDIT_REWARDS.completeStage;
  if (options.dailyRun) credits += JUNGLE_CREDIT_REWARDS.completeDailyRun;
  if (options.perfect) credits += JUNGLE_CREDIT_REWARDS.perfectRun;
  if (options.bossWin) credits += JUNGLE_CREDIT_REWARDS.bossWin;
  return credits;
}

