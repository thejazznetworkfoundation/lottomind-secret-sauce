import type {
  JunglePathChoice,
  JunglePowerUpId,
  JungleStageConfig,
  JungleStageId,
} from "@/types/arcade";

export const JACKPOT_JUNGLE_TITLE = "LottoMind: Jackpot Jungle Chase";

export const ARCADE_LEGAL_DISCLAIMER =
  "LottoMind Arcade is for entertainment only. Gameplay rewards do not affect lottery outcomes. Lottery results are random.";

export const ARCADE_THEME = {
  black: "#050505",
  blackPanel: "#0B0B0B",
  gold: "#D4AF37",
  amber: "#FFB000",
  emerald: "#0B3D2E",
  emeraldBright: "#20C77A",
  purple: "#5A2D82",
  dangerRed: "#D43F3A",
  ivory: "#FFF4D1",
  coldBlue: "#6CD7FF",
  shadow: "rgba(0, 0, 0, 0.55)",
  goldWash: "rgba(212, 175, 55, 0.18)",
  emeraldWash: "rgba(11, 61, 46, 0.72)",
  redWash: "rgba(212, 63, 58, 0.2)",
} as const;

export const JUNGLE_SCORING = {
  normalBall: 10,
  hotBall: 25,
  coldBall: 20,
  balancedBall: 15,
  jackpotBall: 100,
  perfectStageBonus: 500,
  bossDefeatBonus: 1000,
} as const;

export const JUNGLE_CREDIT_REWARDS = {
  completeStage: 5,
  completeDailyRun: 15,
  perfectRun: 25,
  bossWin: 50,
} as const;

export const JACKPOT_JUNGLE_STAGES: readonly JungleStageConfig[] = [
  {
    id: "golden-vine-swing",
    order: 1,
    title: "Golden Vine Swing",
    shortTitle: "Vines",
    subtitle: "Charge, release, and land on glowing jackpot branches.",
    objective: "Collect lottery balls while timing gold vine releases.",
    mechanic: "swing",
    accentColor: ARCADE_THEME.gold,
    credits: JUNGLE_CREDIT_REWARDS.completeStage,
    perfectCredits: JUNGLE_CREDIT_REWARDS.perfectRun,
  },
  {
    id: "lucky-river-dive",
    order: 2,
    title: "Lucky River Dive",
    shortTitle: "River",
    subtitle: "Swim through emerald currents before oxygen runs out.",
    objective: "Collect number pearls and keep the oxygen meter alive.",
    mechanic: "swim",
    accentColor: ARCADE_THEME.coldBlue,
    credits: JUNGLE_CREDIT_REWARDS.completeStage,
    perfectCredits: JUNGLE_CREDIT_REWARDS.perfectRun,
  },
  {
    id: "temple-boulder-run",
    order: 3,
    title: "Temple Boulder Run",
    shortTitle: "Temple",
    subtitle: "Jump, slide, and chain Pick 3 and Pick 4 token combos.",
    objective: "Dodge jackpot boulders while building matching digit streaks.",
    mechanic: "runner",
    accentColor: ARCADE_THEME.amber,
    credits: JUNGLE_CREDIT_REWARDS.completeStage,
    perfectCredits: JUNGLE_CREDIT_REWARDS.perfectRun,
  },
  {
    id: "dream-oracle-cavern",
    order: 4,
    title: "Dream Oracle Cavern",
    shortTitle: "Oracle",
    subtitle: "Choose Fire, Water, or Gold Path for different risk rewards.",
    objective: "Turn dream symbols into number collectibles.",
    mechanic: "oracle",
    accentColor: ARCADE_THEME.purple,
    credits: JUNGLE_CREDIT_REWARDS.completeStage,
    perfectCredits: JUNGLE_CREDIT_REWARDS.perfectRun,
  },
  {
    id: "jackpot-beast-boss-chase",
    order: 5,
    title: "Jackpot Beast Boss Chase",
    shortTitle: "Boss",
    subtitle: "Outrun the Probability Beast and open the vault.",
    objective: "Carry five gold or white balls and one red jackpot ball to the vault.",
    mechanic: "boss",
    accentColor: ARCADE_THEME.dangerRed,
    credits: JUNGLE_CREDIT_REWARDS.bossWin,
    perfectCredits: JUNGLE_CREDIT_REWARDS.perfectRun,
  },
] as const;

export const DREAM_SYMBOL_MAPPINGS = {
  snake: 7,
  dog: 4,
  crown: 11,
  river: 22,
  gold: 8,
  moon: 9,
  fire: 13,
  key: 21,
} as const;

export const DREAM_PATHS: Record<JunglePathChoice, { label: string; hazardMultiplier: number; rewardMultiplier: number; color: string }> = {
  fire: {
    label: "Fire Path",
    hazardMultiplier: 1.25,
    rewardMultiplier: 1.25,
    color: ARCADE_THEME.dangerRed,
  },
  water: {
    label: "Water Path",
    hazardMultiplier: 0.8,
    rewardMultiplier: 0.9,
    color: ARCADE_THEME.coldBlue,
  },
  gold: {
    label: "Gold Path",
    hazardMultiplier: 1.05,
    rewardMultiplier: 1.45,
    color: ARCADE_THEME.gold,
  },
};

export const JUNGLE_POWERUPS: Record<JunglePowerUpId, { label: string; durationMs?: number; description: string }> = {
  dreamShield: {
    label: "Dream Shield",
    description: "Blocks one hit.",
  },
  frequencyMagnet: {
    label: "Frequency Magnet",
    durationMs: 8000,
    description: "Pulls nearby balls toward the player for 8 seconds.",
  },
  hotNumberBoost: {
    label: "Hot Number Boost",
    durationMs: 8000,
    description: "Doubles hot ball score values.",
  },
  oracleSlowTime: {
    label: "Oracle Slow Time",
    durationMs: 5000,
    description: "Slows hazards for 5 seconds.",
  },
  vaultKey: {
    label: "Vault Key",
    description: "Unlocks the secret bonus room hook.",
  },
  goldOxygenOrb: {
    label: "Gold Oxygen Orb",
    description: "Restores oxygen in Lucky River Dive.",
  },
};

export function getJungleStageConfig(stageId: JungleStageId): JungleStageConfig {
  return JACKPOT_JUNGLE_STAGES.find((stage) => stage.id === stageId) ?? JACKPOT_JUNGLE_STAGES[0];
}
