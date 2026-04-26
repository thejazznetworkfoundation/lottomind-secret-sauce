import type { ImageSourcePropType } from "react-native";

export type HeroAnimationState =
  | "idle"
  | "run"
  | "jump"
  | "fall"
  | "land"
  | "crouch"
  | "climb"
  | "swing"
  | "hurt"
  | "celebrate"
  | "jackpotPower";

export type HeroPoseKey =
  | "idle"
  | "run1"
  | "run2"
  | "jump"
  | "fall"
  | "land"
  | "crouch"
  | "climb"
  | "swing"
  | "hurt"
  | "celebrate"
  | "jackpotPower";

export type HazardKind =
  | "circuitLog"
  | "purpleDreamPuddle"
  | "goldJackpotPuddle"
  | "scorpion";

export type PickupKind = "blueGem" | "diamondRing" | "treasureReward";

export type BossPhaseId = "pursuit" | "aggression" | "finalChase";

export type BossAttackType = "roarShockwave" | "snapLunge" | "tailSlam" | "panicSurge";

export type AudioCueId = "intro" | "run" | "bossPursuit" | "aggression" | "finalChase" | "victory" | "defeat";

export type SfxEventId =
  | "jump"
  | "pickupGem"
  | "pickupRing"
  | "checkpoint"
  | "hurt"
  | "bossRoar"
  | "shockwaveWarning"
  | "lungeWarning"
  | "debrisImpact"
  | "timerDanger"
  | "vaultReached"
  | "victory"
  | "defeat";

export type CameraEffectId = "lightShake" | "mediumShake" | "heavyShake" | "finalPulse" | "introDrift";

export type GameStatus = "ready" | "running" | "paused" | "victory" | "gameOver";

export type ArcadeRunPhase = "intro" | "active" | "victoryEnding" | "defeatEnding";

export type ArcadeSignalType = "jump" | "pickup" | "hurt" | "power" | "pressure" | "win" | "lose";

export type GoldPuddleMode = "boost" | "damage";

export type TutorialPromptId =
  | "jump"
  | "avoidPuddles"
  | "collectGems"
  | "watchBossWarnings"
  | "checkpoint"
  | "vaultGoal"
  | "useRewards";

export type AchievementId =
  | "firstRun"
  | "firstWin"
  | "bossEscape"
  | "gemCollector"
  | "ringHunter"
  | "checkpointSurvivor"
  | "dreamRunner"
  | "jackpotReached"
  | "dailyGrinder";

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  rewardCredits?: number;
  unlockFeature?: string;
}

export type DailyChallengeMetric = "gems" | "runs" | "wins" | "checkpoints" | "secondsSurvived";

export type DailyChallengeId = "daily-gems" | "daily-runs" | "daily-checkpoint";

export interface DailyChallengeDefinition {
  id: DailyChallengeId;
  title: string;
  description: string;
  metric: DailyChallengeMetric;
  target: number;
  rewardCredits: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArcadeImageAssetSource {
  source: ImageSourcePropType;
  width: number;
  height: number;
}

export type SpriteSheetDefinition = ArcadeImageAssetSource;

interface ArcadeAssetBase {
  placeholder?: boolean;
  swapHint?: string;
}

export interface ArcadeDirectSpriteAsset extends ArcadeAssetBase {
  renderMode: "direct";
  image: ArcadeImageAssetSource;
}

export interface ArcadeCroppedSpriteAsset extends ArcadeAssetBase {
  renderMode: "crop";
  sheet: SpriteSheetDefinition;
  crop: SpriteCrop;
}

export type ArcadeRenderableAsset = ArcadeDirectSpriteAsset | ArcadeCroppedSpriteAsset;

export interface ArcadeParallaxLayerAsset {
  id: string;
  asset: ArcadeRenderableAsset;
  parallax: number;
  opacity: number;
  verticalOffset?: number;
  scale?: number;
}

export interface BaseEntity extends Rect {
  id: string;
}

export interface PlatformEntity extends BaseEntity {
  sprite: "ground" | "platform";
  depth: number;
  kind?: "ground" | "ledge" | "safe" | "goal" | "climb";
}

export interface LadderEntity extends BaseEntity {
  rungCount: number;
}

export interface PlayerEntity extends BaseEntity {
  velocity: Vector2;
  facing: 1 | -1;
  animation: HeroAnimationState;
  onGround: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  landTimer: number;
  hurtTimer: number;
  invulnerableTimer: number;
  jackpotPowerTimer: number;
  slowTimer: number;
  crouching: boolean;
  climbing: boolean;
  activeLadderId: string | null;
  lives: number;
  score: number;
  gems: number;
  rings: number;
  treasureTriggers: number;
}

export interface BossEntity extends BaseEntity {
  speed: number;
  pressure: number;
  threat: number;
  phaseId: BossPhaseId;
  currentAttack: BossAttackType | null;
  attackCooldown: number;
  warningTimer: number;
  warningText: string | null;
  lungeTimer: number;
  roarPulseTimer: number;
  panicTimer: number;
  eyeGlow: number;
}

export interface HazardEntity extends BaseEntity {
  kind: HazardKind;
  damage: number;
  active: boolean;
  originX?: number;
  travelDistance?: number;
  moveSpeed?: number;
  phase?: number;
  ttl?: number;
}

export interface PickupEntity extends BaseEntity {
  kind: PickupKind;
  scoreValue: number;
  collected: boolean;
}

export interface GoalEntity extends BaseEntity {
  label: string;
  reached: boolean;
}

export interface ParticleEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface ArcadeInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
}

export interface ArcadeRewardGrant {
  credits: number;
  dreamHints: string[];
  bonusNumbers: number[];
  unlocks: string[];
}

export interface ArcadeRunSummary {
  stageId?: string;
  score: number;
  timeRemaining: number;
  gems: number;
  rings: number;
  treasureTriggers: number;
  livesRemaining: number;
  stageClearBonus: number;
  checkpointsReached?: number;
  runDurationSeconds?: number;
  maxThreat?: number;
  victory: boolean;
}

export interface ArcadeSignal {
  id: number;
  type: ArcadeSignalType;
}

export interface SfxEvent {
  id: number;
  type: SfxEventId;
}

export interface AudioRuntimeState {
  musicCue: AudioCueId;
  sfxEvents: SfxEvent[];
}

export interface CameraRuntimeState {
  activeEffect: CameraEffectId | null;
  offsetX: number;
  offsetY: number;
  scale: number;
  timeRemaining: number;
}

export interface BossWarningState {
  text: string;
  timerMs: number;
  severity: "warning" | "danger";
}

export interface CinematicOverlayState {
  active: boolean;
  variant: "intro" | "victory" | "defeat";
  title: string;
  subtitle?: string;
  detail?: string;
  currentStepType?: "showTitle" | "showBossWarning" | "cameraPan" | "pauseBeforeControl";
  stepIndex?: number;
  timeRemainingMs: number;
  skippable?: boolean;
}

export interface TutorialPromptDefinition {
  id: TutorialPromptId;
  title: string;
  body: string;
}

export interface TutorialPromptState extends TutorialPromptDefinition {
  accent: "gold" | "purple" | "teal" | "danger";
}

export interface DailyChallengeUiItem {
  id: string;
  title: string;
  progress: number;
  target: number;
  rewardCredits: number;
  completed: boolean;
  claimed?: boolean;
  description?: string;
}

export type MonetizationHookId =
  | "revive"
  | "rewardDoubler"
  | "premiumArcadeBoost"
  | "skinUnlock"
  | "extraChallengeSlot"
  | "dayUnlock";

export interface MonetizationHook {
  id: MonetizationHookId;
  enabled: boolean;
  label: string;
  description: string;
}

export interface ArcadePackagingState {
  onboardingSeen: boolean;
  tutorialCompleted: TutorialPromptId[];
  unlockedAchievements: AchievementId[];
  claimedAchievementRewards: AchievementId[];
}

export interface ArcadeLifetimeStats {
  totalRuns: number;
  totalWins: number;
  totalGems: number;
  totalRings: number;
  totalCheckpoints: number;
  totalCreditsEarned: number;
  bestScore: number;
  longestRunSeconds: number;
}

export interface DailyChallengeProgressState {
  dateKey: string;
  metrics: Record<DailyChallengeMetric, number>;
  claimedIds: string[];
}

export interface AchievementToastState {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
}

export interface MonetizationState {
  engagedHooks: MonetizationHookId[];
}

export interface OnboardingSlide {
  id: string;
  kicker: string;
  title: string;
  body: string;
}

export interface ArcadeSnapshot {
  status: GameStatus;
  phase: ArcadeRunPhase;
  elapsed: number;
  remainingTime: number;
  distanceRemaining: number;
  checkpointLabel: string | null;
  cameraX: number;
  viewportWidth: number;
  viewportHeight: number;
  player: PlayerEntity;
  boss: BossEntity;
  platforms: PlatformEntity[];
  ladders: LadderEntity[];
  hazards: HazardEntity[];
  pickups: PickupEntity[];
  goal: GoalEntity;
  particles: ParticleEntity[];
  signal: ArcadeSignal | null;
  bossWarning: BossWarningState | null;
  cinematic: CinematicOverlayState | null;
  cameraEffects: CameraRuntimeState;
  audio: AudioRuntimeState;
  rewards: ArcadeRewardGrant | null;
  summary: ArcadeRunSummary;
}

export type JungleStageId =
  | "golden-vine-swing"
  | "lucky-river-dive"
  | "temple-boulder-run"
  | "dream-oracle-cavern"
  | "jackpot-beast-boss-chase";

export type JunglePathChoice = "fire" | "water" | "gold";

export type JunglePlayerAnimationState =
  | "idle"
  | "run"
  | "jump"
  | "swing"
  | "swim"
  | "slide"
  | "hit"
  | "victory";

export type JungleGameStatus = "loading" | "ready" | "running" | "paused" | "victory" | "gameOver";

export type JungleBallGameType = "powerball" | "megaMillions" | "daily3" | "daily4" | "dream";

export type JungleBallRarity = "hot" | "cold" | "balanced" | "jackpot";

export interface Ball {
  id: string;
  number: number;
  gameType: JungleBallGameType;
  rarity: JungleBallRarity;
  points: number;
}

export interface JungleCollectible extends Ball, Rect {
  collected: boolean;
  symbol?: string;
  magnetized?: boolean;
}

export type JungleHazardKind =
  | "thornVine"
  | "fallingCoconut"
  | "crackedBranch"
  | "numberGhost"
  | "crocShadow"
  | "electricEel"
  | "spinningCoin"
  | "bubbleTrap"
  | "jackpotBoulder"
  | "templeGate"
  | "oracleFlare"
  | "beastClaw";

export interface JungleHazard extends Rect {
  id: string;
  kind: JungleHazardKind;
  speed: number;
  damage: number;
  label: string;
}

export type JunglePowerUpId =
  | "dreamShield"
  | "frequencyMagnet"
  | "hotNumberBoost"
  | "oracleSlowTime"
  | "vaultKey"
  | "goldOxygenOrb";

export interface JunglePowerUp extends Rect {
  id: string;
  type: JunglePowerUpId;
  collected: boolean;
}

export interface JunglePlatform extends Rect {
  id: string;
  kind: "landing" | "branch" | "temple" | "vault";
}

export interface JungleVine {
  id: string;
  anchorX: number;
  anchorY: number;
  length: number;
  angle: number;
  angularVelocity: number;
}

export interface JungleBossState {
  name: "Probability Beast";
  distance: number;
  hearts: number;
  requiredGoldWhiteBalls: number;
  requiredRedJackpotBalls: number;
}

export interface JunglePlayer extends Rect {
  vx: number;
  vy: number;
  state: JunglePlayerAnimationState;
  facing: "left" | "right";
  grounded: boolean;
  invulnerableUntil: number;
}

export interface JungleInventory {
  dreamShield: number;
  frequencyMagnet: number;
  hotNumberBoost: number;
  oracleSlowTime: number;
  vaultKey: number;
  goldOxygenOrb: number;
}

export interface JungleActivePowerUps {
  dreamShield: boolean;
  frequencyMagnetUntil: number;
  hotNumberBoostUntil: number;
  oracleSlowTimeUntil: number;
}

export interface JungleStageConfig {
  id: JungleStageId;
  order: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  objective: string;
  mechanic: "swing" | "swim" | "runner" | "oracle" | "boss";
  accentColor: string;
  credits: number;
  perfectCredits: number;
}

export interface JungleStagePattern {
  stageId: JungleStageId;
  seed: number;
  balls: JungleCollectible[];
  hazards: JungleHazard[];
  powerUps: JunglePowerUp[];
  platforms: JunglePlatform[];
  vines: JungleVine[];
  stageLength: number;
}

export interface JungleScorePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  ttl: number;
}

export interface JungleRunResult {
  score: number;
  creditsEarned: number;
  stageId: JungleStageId;
  perfect: boolean;
  bossWin: boolean;
  collectedBalls: Ball[];
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  stageId: JungleStageId;
  date: string;
}
