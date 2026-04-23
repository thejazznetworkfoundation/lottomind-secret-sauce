import type { ArcadeRewardGrant, ArcadeRunSummary } from "@/types/arcade";

function createBonusNumbers(seed: number, total = 3) {
  const values = new Set<number>();
  let rolling = seed;

  while (values.size < total) {
    rolling = (rolling * 9301 + 49297) % 233280;
    values.add((rolling % 59) + 1);
  }

  return [...values].sort((left, right) => left - right);
}

export function buildArcadeRewards(summary: ArcadeRunSummary): ArcadeRewardGrant {
  const credits =
    60 +
    summary.gems * 6 +
    summary.rings * 30 +
    summary.treasureTriggers * 48 +
    Math.floor(summary.score / 180);

  const clearBonus = summary.victory ? Math.floor(summary.stageClearBonus / 12) : 0;
  const lifeBonus = summary.victory ? summary.livesRemaining * 20 : 0;
  const timeBonus = Math.max(0, Math.floor(summary.timeRemaining));
  const dreamHints = [
    `Vault route stabilized for ${Math.max(1, Math.floor(summary.gems / 2) + summary.treasureTriggers)} dream sectors.`,
    summary.victory
      ? "LM vault resonance says your next lucky streak starts with bold moves and clean timing."
      : "The chase logged a near-miss path. Retry the route and protect your speed through the long puddle stretch.",
  ];

  const unlocks = summary.victory
    ? ["jackpot-chase-replay", summary.rings > 0 ? "diamond-magnet-hook" : "bonus-trail-hook", "vault-run-summary-hook"]
    : ["boss-threat-recap"];

  return {
    credits: credits + timeBonus + clearBonus + lifeBonus,
    dreamHints,
    bonusNumbers: createBonusNumbers(
      summary.score + summary.gems * 13 + summary.rings * 29 + summary.stageClearBonus + timeBonus + summary.livesRemaining * 11
    ),
    unlocks,
  };
}
