import type { LadderEntity } from "@/types/arcade";

export interface StageCheckpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  bossResetDistance?: number;
  timerBonusSeconds?: number;
}

export type StageTheme = "cyber-jungle";

export type StagePlatformKind = "ground" | "ledge" | "safe" | "goal" | "climb";

export interface StagePlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind?: StagePlatformKind;
  sprite?: "ground" | "platform";
  depth?: number;
}

export type StageHazardType = "circuitLog" | "dreamPuddle" | "jackpotPuddle" | "scorpion";

export interface StageHazard {
  id: string;
  type: StageHazardType;
  x: number;
  y: number;
  width: number;
  height: number;
  config?: Record<string, number | string | boolean>;
}

export type StagePickupType = "blueGem" | "diamondRing" | "treasureChest" | "jackpotTrigger";

export interface StagePickup {
  id: string;
  type: StagePickupType;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: number;
  config?: Record<string, number | string | boolean>;
}

export interface BossStageConfig {
  startDistance: number;
  baseSpeed: number;
  pressureRampPerSecond: number;
  catchThreshold: number;
  dangerThreshold: number;
  criticalThreshold: number;
  maxSpeed: number;
  minGap: number;
  maxGap: number;
  activationDelaySeconds: number;
  hitSpeedBonus: number;
  slowSpeedBonus: number;
  recoveryGapBonus: number;
  pressurePulseThresholds: [number, number];
}

export type BossPhaseId = "pursuit" | "aggression" | "finalChase";

export type BossAttackType = "roarShockwave" | "snapLunge" | "tailSlam" | "panicSurge";

export interface BossAttackConfig {
  type: BossAttackType;
  cooldownMin: number;
  cooldownMax: number;
  warningMs: number;
  enabledInPhases: BossPhaseId[];
}

export interface BossPhaseConfig {
  id: BossPhaseId;
  triggerProgress?: number;
  triggerDistanceToGoal?: number;
  triggerTimeRemaining?: number;
  speedMultiplier: number;
  pressureMultiplier: number;
  attacks: BossAttackType[];
}

export type StageIntroStep =
  | { type: "showTitle"; durationMs: number }
  | { type: "showBossWarning"; durationMs: number }
  | { type: "cameraPan"; durationMs: number }
  | { type: "pauseBeforeControl"; durationMs: number };

export interface BossStageSequenceConfig {
  introEnabled: boolean;
  introSteps: StageIntroStep[];
  phases: BossPhaseConfig[];
  attacks: BossAttackConfig[];
  panicZoneStartX: number;
}

export interface StageGoal {
  id: string;
  type: "vault";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface StageRewardHooks {
  creditsBonus: number;
  dreamHintTag?: string;
  bonusNumbersTag?: string;
}

export interface ArcadeStageDefinition {
  id: string;
  title: string;
  subtitle: string;
  theme: StageTheme;
  timerSeconds: number;
  startingLives: number;
  targetScore?: number;
  playerStartX: number;
  worldWidth: number;
  worldHeight: number;
  groundY: number;
  rewardHooks?: StageRewardHooks;
  platforms: StagePlatform[];
  ladders: LadderEntity[];
  hazards: StageHazard[];
  pickups: StagePickup[];
  boss: BossStageConfig;
  sequence: BossStageSequenceConfig;
  goal: StageGoal;
  checkpoints: StageCheckpoint[];
}

export type JackpotChaseStageDefinition = ArcadeStageDefinition;

export type ArcadeGameCategoryId = "quick-play" | "boss-chase" | "classic-jungle" | "mind-credits" | "classic-games";

interface ArcadeGameCatalogEntryBase {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  categoryId: ArcadeGameCategoryId;
  categoryLabel: string;
  accentColor: string;
  ctaLabel: string;
  routePath: string;
  rewardLabel: string;
  launchRewardCredits?: number;
}

export interface NativeArcadeGameCatalogEntry extends ArcadeGameCatalogEntryBase {
  kind: "native";
  stage: ArcadeStageDefinition;
}

export interface WebArcadeGameCatalogEntry extends ArcadeGameCatalogEntryBase {
  kind: "web";
  embedPath: string;
  sourceUrl?: string;
}

export interface RouteArcadeGameCatalogEntry extends ArcadeGameCatalogEntryBase {
  kind: "route";
}

export type ArcadeGameCatalogEntry = NativeArcadeGameCatalogEntry | WebArcadeGameCatalogEntry | RouteArcadeGameCatalogEntry;
