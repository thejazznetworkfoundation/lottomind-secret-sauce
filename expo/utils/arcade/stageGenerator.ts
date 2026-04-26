import {
  DREAM_PATHS,
  DREAM_SYMBOL_MAPPINGS,
  JUNGLE_SCORING,
  getJungleStageConfig,
} from "@/constants/arcadeTheme";
import type {
  JungleBallGameType,
  JungleBallRarity,
  JungleCollectible,
  JungleHazard,
  JungleHazardKind,
  JunglePathChoice,
  JunglePlatform,
  JunglePowerUp,
  JunglePowerUpId,
  JungleStageId,
  JungleStagePattern,
  JungleVine,
} from "@/types/arcade";
import { createSeededRandom, seededPick, seededRange } from "@/utils/arcade/dailySeed";

const GAME_TYPES: readonly JungleBallGameType[] = ["powerball", "megaMillions", "daily3", "daily4", "dream"];
const RARITIES: readonly JungleBallRarity[] = ["hot", "cold", "balanced", "balanced", "hot"];

const RARITY_POINTS: Record<JungleBallRarity, number> = {
  hot: JUNGLE_SCORING.hotBall,
  cold: JUNGLE_SCORING.coldBall,
  balanced: JUNGLE_SCORING.balancedBall,
  jackpot: JUNGLE_SCORING.jackpotBall,
};

function makeBall(
  random: () => number,
  id: string,
  x: number,
  y: number,
  overrides: Partial<JungleCollectible> = {},
): JungleCollectible {
  const rarity = overrides.rarity ?? (random() > 0.92 ? "jackpot" : seededPick(random, RARITIES));
  const gameType = overrides.gameType ?? seededPick(random, GAME_TYPES);
  return {
    id,
    x,
    y,
    width: rarity === "jackpot" ? 34 : 30,
    height: rarity === "jackpot" ? 34 : 30,
    number: overrides.number ?? Math.max(1, Math.round(seededRange(random, 1, gameType === "daily3" ? 9 : 69))),
    gameType,
    rarity,
    points: overrides.points ?? RARITY_POINTS[rarity],
    collected: false,
    symbol: overrides.symbol,
  };
}

function makeHazard(
  id: string,
  kind: JungleHazardKind,
  x: number,
  y: number,
  width: number,
  height: number,
  speed: number,
  label: string,
): JungleHazard {
  return { id, kind, x, y, width, height, speed, damage: 1, label };
}

function makePowerUp(id: string, type: JunglePowerUpId, x: number, y: number): JunglePowerUp {
  return { id, type, x, y, width: 34, height: 34, collected: false };
}

function basePlatforms(stageLength: number): JunglePlatform[] {
  return [
    { id: "ground", kind: "landing", x: 0, y: 326, width: stageLength + 420, height: 64 },
    { id: "mid-branch-1", kind: "branch", x: 620, y: 246, width: 170, height: 24 },
    { id: "mid-branch-2", kind: "branch", x: 1320, y: 228, width: 180, height: 24 },
    { id: "vault-approach", kind: "vault", x: stageLength - 260, y: 288, width: 220, height: 42 },
  ];
}

function generateBalls(
  random: () => number,
  stageId: JungleStageId,
  count: number,
  stageLength: number,
  rewardMultiplier = 1,
): JungleCollectible[] {
  const dreamSymbols = Object.entries(DREAM_SYMBOL_MAPPINGS);
  const total = Math.round(count * rewardMultiplier);
  return Array.from({ length: total }, (_, index) => {
    const x = 220 + index * (stageLength - 520) / Math.max(1, total - 1) + seededRange(random, -36, 42);
    const y = seededRange(random, stageId === "lucky-river-dive" ? 92 : 118, stageId === "lucky-river-dive" ? 280 : 246);
    if (stageId === "dream-oracle-cavern") {
      const [symbol, number] = seededPick(random, dreamSymbols);
      return makeBall(random, `${stageId}-symbol-${index}`, x, y, {
        number,
        gameType: "dream",
        rarity: symbol === "gold" ? "hot" : "balanced",
        symbol,
      });
    }
    if (stageId === "temple-boulder-run" && index % 3 === 0) {
      const number = Math.floor(seededRange(random, 1, 5));
      return makeBall(random, `${stageId}-combo-${index}`, x, y, {
        number,
        gameType: index % 4 === 0 ? "daily4" : "daily3",
        rarity: "hot",
      });
    }
    if (stageId === "jackpot-beast-boss-chase" && index === total - 3) {
      return makeBall(random, `${stageId}-jackpot`, x, y, {
        number: 26,
        gameType: "powerball",
        rarity: "jackpot",
      });
    }
    return makeBall(random, `${stageId}-ball-${index}`, x, y);
  });
}

function generateHazards(
  random: () => number,
  stageId: JungleStageId,
  count: number,
  stageLength: number,
  hazardMultiplier = 1,
): JungleHazard[] {
  const total = Math.round(count * hazardMultiplier);
  const kindsByStage: Record<JungleStageId, readonly [JungleHazardKind, string][]> = {
    "golden-vine-swing": [
      ["thornVine", "Thorn Vine"],
      ["fallingCoconut", "Falling Goldnut"],
      ["crackedBranch", "Cracked Branch"],
      ["numberGhost", "Number Ghost"],
    ],
    "lucky-river-dive": [
      ["crocShadow", "Lucky Croc Shadow"],
      ["electricEel", "Electric Number Eel"],
      ["spinningCoin", "Spinning Coin"],
      ["bubbleTrap", "Bubble Trap"],
    ],
    "temple-boulder-run": [
      ["jackpotBoulder", "Jackpot Boulder"],
      ["templeGate", "Temple Gate"],
      ["crackedBranch", "Loose Stone"],
      ["spinningCoin", "Spinning Coin"],
    ],
    "dream-oracle-cavern": [
      ["oracleFlare", "Oracle Flare"],
      ["numberGhost", "Number Ghost"],
      ["thornVine", "Dream Thorn"],
      ["bubbleTrap", "Echo Bubble"],
    ],
    "jackpot-beast-boss-chase": [
      ["beastClaw", "Beast Claw"],
      ["jackpotBoulder", "Vault Boulder"],
      ["numberGhost", "Probability Echo"],
      ["templeGate", "Vault Gate"],
    ],
  };

  return Array.from({ length: total }, (_, index) => {
    const [kind, label] = seededPick(random, kindsByStage[stageId]);
    const x = 360 + index * (stageLength - 640) / Math.max(1, total - 1) + seededRange(random, -48, 54);
    const width = kind === "jackpotBoulder" ? 54 : 42;
    const height = kind === "templeGate" ? 72 : 46;
    const y = stageId === "lucky-river-dive"
      ? seededRange(random, 98, 272)
      : kind === "templeGate"
        ? 256
        : seededRange(random, 274, 312);
    return makeHazard(`${stageId}-hazard-${index}`, kind, x, y, width, height, seededRange(random, 18, 46), label);
  });
}

function generateVines(stageId: JungleStageId): JungleVine[] {
  if (stageId !== "golden-vine-swing") return [];
  return Array.from({ length: 6 }, (_, index) => ({
    id: `gold-vine-${index}`,
    anchorX: 360 + index * 360,
    anchorY: 62 + (index % 2) * 22,
    length: 142,
    angle: index % 2 === 0 ? -0.32 : 0.28,
    angularVelocity: 0.8,
  }));
}

function generatePowerUps(stageId: JungleStageId, stageLength: number): JunglePowerUp[] {
  const byStage: Record<JungleStageId, JunglePowerUpId[]> = {
    "golden-vine-swing": ["dreamShield", "frequencyMagnet"],
    "lucky-river-dive": ["goldOxygenOrb", "frequencyMagnet", "dreamShield"],
    "temple-boulder-run": ["hotNumberBoost", "vaultKey"],
    "dream-oracle-cavern": ["oracleSlowTime", "vaultKey"],
    "jackpot-beast-boss-chase": ["dreamShield", "hotNumberBoost"],
  };
  return byStage[stageId].map((type, index) => makePowerUp(`${stageId}-power-${type}`, type, 520 + index * (stageLength / 3), 184 + index * 32));
}

export function generateStagePattern(
  stageId: JungleStageId,
  seed: number,
  pathChoice: JunglePathChoice = "gold",
): JungleStagePattern {
  const config = getJungleStageConfig(stageId);
  const random = createSeededRandom(seed + config.order * 997);
  const stageLength = config.mechanic === "boss" ? 3100 : config.mechanic === "runner" ? 2600 : 2300;
  const path = stageId === "dream-oracle-cavern" ? DREAM_PATHS[pathChoice] : { hazardMultiplier: 1, rewardMultiplier: 1 };

  return {
    stageId,
    seed,
    balls: generateBalls(random, stageId, config.mechanic === "boss" ? 24 : 18, stageLength, path.rewardMultiplier),
    hazards: generateHazards(random, stageId, config.mechanic === "boss" ? 16 : 12, stageLength, path.hazardMultiplier),
    powerUps: generatePowerUps(stageId, stageLength),
    platforms: basePlatforms(stageLength),
    vines: generateVines(stageId),
    stageLength,
  };
}
