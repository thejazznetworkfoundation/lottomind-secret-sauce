import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  JUNGLE_POWERUPS,
  JACKPOT_JUNGLE_STAGES,
  JUNGLE_SCORING,
  getJungleStageConfig,
} from "@/constants/arcadeTheme";
import { arcadeStorage } from "@/services/arcadeStorage";
import { submitScore } from "@/services/leaderboardService";
import type {
  Ball,
  JungleActivePowerUps,
  JungleGameStatus,
  JungleInventory,
  JunglePathChoice,
  JunglePlayer,
  JunglePowerUpId,
  JungleScorePopup,
  JungleStageId,
  JungleStagePattern,
} from "@/types/arcade";
import { clamp, distanceBetweenRects, rectsIntersect } from "@/utils/arcade/collision";
import { getDailyDateKey, getDailySeed } from "@/utils/arcade/dailySeed";
import { calculateCreditReward, getBallPoints } from "@/utils/arcade/rewards";
import { generateStagePattern } from "@/utils/arcade/stageGenerator";

const VIEW_WIDTH = 390;
const VIEW_HEIGHT = 390;
const GROUND_Y = 298;
const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 62;

type InputState = {
  move: -1 | 0 | 1;
  swim: -1 | 0 | 1;
  swimUntil: number;
  swingStartedAt: number | null;
  slideUntil: number;
};

export interface JungleGameSnapshot {
  player: JunglePlayer;
  health: number;
  score: number;
  creditsEarned: number;
  currentStage: JungleStageId;
  pathChoice: JunglePathChoice;
  inventory: JungleInventory;
  activePowerUps: JungleActivePowerUps;
  bossDistance: number;
  oxygen: number;
  collectedBalls: Ball[];
  gameStatus: JungleGameStatus;
  pattern: JungleStagePattern;
  cameraX: number;
  progress: number;
  popups: JungleScorePopup[];
  hitsTaken: number;
  selectedCharacter: string;
  dailyRun: boolean;
}

export interface UseArcadeGameOptions {
  initialStage?: JungleStageId;
  dailyRun?: boolean;
}

const initialInventory: JungleInventory = {
  dreamShield: 1,
  frequencyMagnet: 0,
  hotNumberBoost: 0,
  oracleSlowTime: 0,
  vaultKey: 0,
  goldOxygenOrb: 0,
};

const initialActivePowerUps: JungleActivePowerUps = {
  dreamShield: false,
  frequencyMagnetUntil: 0,
  hotNumberBoostUntil: 0,
  oracleSlowTimeUntil: 0,
};

function createPlayer(): JunglePlayer {
  return {
    x: 68,
    y: GROUND_Y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    state: "idle",
    facing: "right",
    grounded: true,
    invulnerableUntil: 0,
  };
}

function createInitialState(
  stageId: JungleStageId,
  pathChoice: JunglePathChoice,
  dailyRun: boolean,
  selectedCharacter = "lottomind-hero",
): JungleGameSnapshot {
  const seed = dailyRun ? getDailySeed() : getDailySeed() + Date.now();
  const pattern = generateStagePattern(stageId, seed, pathChoice);
  return {
    player: createPlayer(),
    health: 3,
    score: 0,
    creditsEarned: 0,
    currentStage: stageId,
    pathChoice,
    inventory: { ...initialInventory },
    activePowerUps: { ...initialActivePowerUps },
    bossDistance: 72,
    oxygen: 100,
    collectedBalls: [],
    gameStatus: "ready",
    pattern,
    cameraX: 0,
    progress: 0,
    popups: [],
    hitsTaken: 0,
    selectedCharacter,
    dailyRun,
  };
}

function stripBall(ball: Ball): Ball {
  return {
    id: ball.id,
    number: ball.number,
    gameType: ball.gameType,
    rarity: ball.rarity,
    points: ball.points,
  };
}

function addPopup(state: JungleGameSnapshot, text: string, x: number, y: number): void {
  state.popups = [
    ...state.popups.slice(-5),
    { id: `${Date.now()}-${Math.random()}`, text, x, y, ttl: 0.9 },
  ];
}

function getStageSpeed(stageId: JungleStageId): number {
  const mechanic = getJungleStageConfig(stageId).mechanic;
  if (mechanic === "boss") return 138;
  if (mechanic === "runner") return 128;
  if (mechanic === "swim") return 92;
  return 82;
}

function getComboCounts(collectedBalls: Ball[]): { goldWhite: number; jackpot: number } {
  return collectedBalls.reduce(
    (counts, ball) => {
      if (ball.rarity === "jackpot") {
        counts.jackpot += 1;
      } else if (ball.rarity === "hot" || ball.rarity === "balanced") {
        counts.goldWhite += 1;
      }
      return counts;
    },
    { goldWhite: 0, jackpot: 0 },
  );
}

export function useArcadeGame(options: UseArcadeGameOptions = {}) {
  const initialStage = options.initialStage ?? JACKPOT_JUNGLE_STAGES[0].id;
  const dailyRun = options.dailyRun ?? false;
  const [state, setState] = useState(() => createInitialState(initialStage, "gold", dailyRun));
  const stateRef = useRef(state);
  const inputRef = useRef<InputState>({
    move: 0,
    swim: 0,
    swimUntil: 0,
    swingStartedAt: null,
    slideUntil: 0,
  });
  const lastTickRef = useRef(Date.now());

  const commit = useCallback((next: JungleGameSnapshot) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    arcadeStorage.getSelectedCharacter().then((selectedCharacter) => {
      if (!cancelled) {
        const current = stateRef.current;
        commit({ ...current, selectedCharacter });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [commit]);

  const resetStage = useCallback(
    (stageId: JungleStageId, pathChoice = stateRef.current.pathChoice, nextDailyRun = stateRef.current.dailyRun) => {
      const selectedCharacter = stateRef.current.selectedCharacter;
      commit(createInitialState(stageId, pathChoice, nextDailyRun, selectedCharacter));
      inputRef.current = {
        move: 0,
        swim: 0,
        swimUntil: 0,
        swingStartedAt: null,
        slideUntil: 0,
      };
      lastTickRef.current = Date.now();
    },
    [commit],
  );

  const applyHit = useCallback((next: JungleGameSnapshot, now: number, x: number, y: number) => {
    if (now < next.player.invulnerableUntil) return;
    if (next.activePowerUps.dreamShield) {
      next.activePowerUps = { ...next.activePowerUps, dreamShield: false };
      addPopup(next, "SHIELD", x, y);
      next.player.invulnerableUntil = now + 500;
      return;
    }
    if (next.inventory.dreamShield > 0) {
      next.inventory = { ...next.inventory, dreamShield: next.inventory.dreamShield - 1 };
      addPopup(next, "DREAM BLOCK", x, y);
      next.player.invulnerableUntil = now + 500;
      return;
    }
    next.health = Math.max(0, next.health - 1);
    next.hitsTaken += 1;
    next.player = {
      ...next.player,
      state: "hit",
      invulnerableUntil: now + 1100,
      vx: -50,
    };
    next.bossDistance = Math.max(16, next.bossDistance - 12);
    addPopup(next, "-1 HEART", x, y);
    if (next.health <= 0) {
      next.gameStatus = "gameOver";
    }
  }, []);

  const tick = useCallback(() => {
    const current = stateRef.current;
    if (current.gameStatus !== "running") return;

    const now = Date.now();
    const dt = clamp((now - lastTickRef.current) / 1000, 0, 0.033);
    lastTickRef.current = now;

    const input = inputRef.current;
    if (input.swimUntil < now) input.swim = 0;

    const stageConfig = getJungleStageConfig(current.currentStage);
    const slowFactor = current.activePowerUps.oracleSlowTimeUntil > now ? 0.55 : 1;
    const next: JungleGameSnapshot = {
      ...current,
      player: { ...current.player },
      inventory: { ...current.inventory },
      activePowerUps: { ...current.activePowerUps },
      pattern: {
        ...current.pattern,
        balls: current.pattern.balls.map((ball) => ({ ...ball })),
        hazards: current.pattern.hazards.map((hazard) => ({ ...hazard })),
        powerUps: current.pattern.powerUps.map((powerUp) => ({ ...powerUp })),
      },
      popups: current.popups
        .map((popup) => ({ ...popup, ttl: popup.ttl - dt, y: popup.y - dt * 22 }))
        .filter((popup) => popup.ttl > 0),
      collectedBalls: [...current.collectedBalls],
    };

    const baseSpeed = getStageSpeed(current.currentStage) * slowFactor;
    next.cameraX = clamp(
      next.cameraX + (baseSpeed + Math.max(0, next.player.vx * 0.12)) * dt,
      0,
      next.pattern.stageLength,
    );
    next.progress = clamp(next.cameraX / Math.max(1, next.pattern.stageLength - VIEW_WIDTH), 0, 1);

    const horizontalSpeed = stageConfig.mechanic === "runner" || stageConfig.mechanic === "boss" ? 82 : 152;
    next.player.vx = input.move * horizontalSpeed;
    next.player.x = clamp(next.player.x + next.player.vx * dt, 20, VIEW_WIDTH - next.player.width - 18);
    if (input.move !== 0) {
      next.player.facing = input.move > 0 ? "right" : "left";
    }

    if (stageConfig.mechanic === "swim") {
      next.player.y = clamp(next.player.y + input.swim * 142 * dt, 70, GROUND_Y - 20);
      next.player.vy *= 0.82;
      next.player.grounded = false;
      next.player.state = input.swim === 0 ? "swim" : "swim";
      next.oxygen = clamp(next.oxygen - dt * 4.8, 0, 100);
      if (next.oxygen <= 0) {
        applyHit(next, now, next.player.x, next.player.y);
        next.oxygen = 32;
      }
    } else {
      next.player.vy += 920 * dt;
      next.player.y += next.player.vy * dt;
      const groundY = GROUND_Y - (now < input.slideUntil ? PLAYER_HEIGHT * 0.58 : PLAYER_HEIGHT);
      if (next.player.y >= groundY) {
        next.player.y = groundY;
        next.player.vy = 0;
        next.player.grounded = true;
      } else {
        next.player.grounded = false;
      }
      if (now < input.slideUntil) {
        next.player.state = "slide";
        next.player.height = PLAYER_HEIGHT * 0.58;
      } else {
        next.player.height = PLAYER_HEIGHT;
        next.player.state = next.player.grounded ? (input.move === 0 ? "run" : "run") : "jump";
      }
    }

    if (stageConfig.mechanic === "swing" && input.swingStartedAt) {
      next.player.state = "swing";
    }

    const magnetActive = next.activePowerUps.frequencyMagnetUntil > now;
    const hotBoostActive = next.activePowerUps.hotNumberBoostUntil > now;
    next.pattern.balls = next.pattern.balls.map((ball) => {
      if (ball.collected) return ball;
      const screenBall = { ...ball, x: ball.x - next.cameraX };
      const closeEnough = magnetActive && distanceBetweenRects(next.player, screenBall) < 110;
      if (!rectsIntersect(next.player, screenBall, 5) && !closeEnough) return ball;

      const points = getBallPoints(ball, hotBoostActive);
      const collectedBall = stripBall(ball);
      next.score += points;
      next.collectedBalls = [...next.collectedBalls, collectedBall];
      if (current.currentStage === "lucky-river-dive" && ball.rarity === "cold") {
        next.oxygen = clamp(next.oxygen + 12, 0, 100);
      }
      if (current.currentStage === "jackpot-beast-boss-chase" && (ball.rarity === "hot" || ball.rarity === "jackpot")) {
        next.bossDistance = clamp(next.bossDistance + 7, 0, 100);
      }
      const combo = getComboCounts(next.collectedBalls);
      const comboText = ball.gameType === "daily3" || ball.gameType === "daily4"
        ? `x${Math.max(1, combo.goldWhite)} +${points}`
        : `+${points}`;
      addPopup(next, comboText, screenBall.x, screenBall.y);
      return { ...ball, collected: true };
    });

    next.pattern.powerUps = next.pattern.powerUps.map((powerUp) => {
      if (powerUp.collected) return powerUp;
      const screenPower = { ...powerUp, x: powerUp.x - next.cameraX };
      if (!rectsIntersect(next.player, screenPower, 4)) return powerUp;
      if (powerUp.type === "goldOxygenOrb") {
        next.oxygen = 100;
      } else {
        next.inventory = {
          ...next.inventory,
          [powerUp.type]: next.inventory[powerUp.type] + 1,
        };
      }
      addPopup(next, JUNGLE_POWERUPS[powerUp.type].label.toUpperCase(), screenPower.x, screenPower.y);
      return { ...powerUp, collected: true };
    });

    next.pattern.hazards.forEach((hazard) => {
      const screenHazard = { ...hazard, x: hazard.x - next.cameraX };
      const mobileHazard = { ...screenHazard, x: screenHazard.x - hazard.speed * dt * 0.2 };
      if (mobileHazard.x < -80 || mobileHazard.x > VIEW_WIDTH + 80) return;
      if (rectsIntersect(next.player, mobileHazard, 8)) {
        applyHit(next, now, mobileHazard.x, mobileHazard.y);
      }
    });

    if (stageConfig.mechanic === "boss") {
      next.bossDistance = clamp(next.bossDistance - dt * (next.player.vx < 0 ? 18 : 7), 0, 100);
      if (next.bossDistance <= 0 && next.health > 0) {
        applyHit(next, now, next.player.x - 20, next.player.y);
        next.bossDistance = 44;
      }
    }

    const reachedEnd = next.cameraX >= next.pattern.stageLength - VIEW_WIDTH - 16;
    if (reachedEnd && next.gameStatus === "running") {
      const combo = getComboCounts(next.collectedBalls);
      const bossWin = stageConfig.mechanic === "boss" && combo.goldWhite >= 5 && combo.jackpot >= 1;
      if (stageConfig.mechanic === "boss" && !bossWin) {
        next.gameStatus = "gameOver";
        addPopup(next, "NEED 5+1 COMBO", 112, 118);
      } else {
        const perfect = next.hitsTaken === 0;
        next.score += (perfect ? JUNGLE_SCORING.perfectStageBonus : 0) + (bossWin ? JUNGLE_SCORING.bossDefeatBonus : 0);
        next.creditsEarned = calculateCreditReward({
          completed: true,
          dailyRun: next.dailyRun,
          perfect,
          bossWin,
        });
        next.player = { ...next.player, state: "victory" };
        next.gameStatus = "victory";
      }
    }

    commit(next);
  }, [applyHit, commit]);

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      tick();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [tick]);

  const startGame = useCallback(() => {
    const current = stateRef.current;
    if (current.gameStatus === "gameOver" || current.gameStatus === "victory") {
      resetStage(current.currentStage, current.pathChoice, current.dailyRun);
      setTimeout(() => {
        const reset = stateRef.current;
        commit({ ...reset, gameStatus: "running", player: { ...reset.player, state: "run" } });
      }, 0);
      return;
    }
    lastTickRef.current = Date.now();
    commit({ ...current, gameStatus: "running", player: { ...current.player, state: "run" } });
  }, [commit, resetStage]);

  const pause = useCallback(() => {
    const current = stateRef.current;
    if (current.gameStatus === "running") commit({ ...current, gameStatus: "paused" });
  }, [commit]);

  const resume = useCallback(() => {
    const current = stateRef.current;
    if (current.gameStatus === "paused") {
      lastTickRef.current = Date.now();
      commit({ ...current, gameStatus: "running" });
    }
  }, [commit]);

  const move = useCallback((direction: -1 | 0 | 1) => {
    inputRef.current.move = direction;
  }, []);

  const jump = useCallback(() => {
    const current = stateRef.current;
    if (current.gameStatus !== "running") startGame();
    const latest = stateRef.current;
    if (!latest.player.grounded && getJungleStageConfig(latest.currentStage).mechanic !== "swing") return;
    const vy = getJungleStageConfig(latest.currentStage).mechanic === "swing" ? -310 : -430;
    commit({
      ...latest,
      player: {
        ...latest.player,
        vy,
        grounded: false,
        state: getJungleStageConfig(latest.currentStage).mechanic === "swing" ? "swing" : "jump",
      },
      gameStatus: "running",
    });
  }, [commit, startGame]);

  const slide = useCallback(() => {
    inputRef.current.slideUntil = Date.now() + 620;
    const current = stateRef.current;
    if (current.gameStatus !== "running") startGame();
    commit({ ...stateRef.current, player: { ...stateRef.current.player, state: "slide" }, gameStatus: "running" });
  }, [commit, startGame]);

  const swim = useCallback((direction: -1 | 0 | 1) => {
    inputRef.current.swim = direction;
    inputRef.current.swimUntil = Date.now() + 360;
    if (stateRef.current.gameStatus !== "running") startGame();
  }, [startGame]);

  const startSwingCharge = useCallback(() => {
    inputRef.current.swingStartedAt = Date.now();
    if (stateRef.current.gameStatus !== "running") startGame();
  }, [startGame]);

  const releaseSwing = useCallback(() => {
    const startedAt = inputRef.current.swingStartedAt;
    inputRef.current.swingStartedAt = null;
    const charge = startedAt ? clamp((Date.now() - startedAt) / 900, 0.25, 1.35) : 0.65;
    const current = stateRef.current;
    commit({
      ...current,
      player: {
        ...current.player,
        vx: 150 * charge,
        vy: -320 * charge,
        grounded: false,
        state: "jump",
      },
      gameStatus: "running",
    });
  }, [commit]);

  const activatePowerUp = useCallback((type: JunglePowerUpId) => {
    const current = stateRef.current;
    if (type === "goldOxygenOrb") {
      commit({ ...current, oxygen: 100 });
      return true;
    }
    if (current.inventory[type] <= 0 && type !== "dreamShield") return false;
    const now = Date.now();
    const duration = JUNGLE_POWERUPS[type].durationMs ?? 0;
    const inventory = type === "dreamShield"
      ? { ...current.inventory, dreamShield: Math.max(0, current.inventory.dreamShield - 1) }
      : { ...current.inventory, [type]: Math.max(0, current.inventory[type] - 1) };
    const activePowerUps = { ...current.activePowerUps };
    if (type === "dreamShield") activePowerUps.dreamShield = true;
    if (type === "frequencyMagnet") activePowerUps.frequencyMagnetUntil = now + duration;
    if (type === "hotNumberBoost") activePowerUps.hotNumberBoostUntil = now + duration;
    if (type === "oracleSlowTime") activePowerUps.oracleSlowTimeUntil = now + duration;
    commit({ ...current, inventory, activePowerUps, gameStatus: current.gameStatus === "ready" ? "running" : current.gameStatus });
    return true;
  }, [commit]);

  const selectStage = useCallback((stageId: JungleStageId) => {
    resetStage(stageId, stateRef.current.pathChoice, stateRef.current.dailyRun);
  }, [resetStage]);

  const setPathChoice = useCallback((pathChoice: JunglePathChoice) => {
    resetStage(stateRef.current.currentStage, pathChoice, stateRef.current.dailyRun);
  }, [resetStage]);

  const claimRewards = useCallback(async () => {
    const current = stateRef.current;
    if (current.gameStatus !== "victory") return current.creditsEarned;
    await arcadeStorage.addCredits(current.creditsEarned);
    await arcadeStorage.completeStage(current.currentStage);
    await arcadeStorage.saveHighScore(current.currentStage, current.score);
    if (current.dailyRun) {
      await arcadeStorage.markDailyRunComplete(getDailyDateKey());
    }
    await submitScore(current.score, current.currentStage);
    return current.creditsEarned;
  }, []);

  const spendCredits = useCallback(async (_featureId: string, amount: number) => {
    // Apple IAP, Google Billing, or Stripe could replace this prototype credit spend hook later.
    return arcadeStorage.spendCredits(amount);
  }, []);

  const unlockCosmetic = useCallback(async (cosmeticId: string) => {
    await arcadeStorage.unlockCosmetic(cosmeticId);
  }, []);

  const unlockExtraRun = useCallback(async () => spendCredits("extra-run", 10), [spendCredits]);
  const unlockDreamRun = useCallback(async () => spendCredits("dream-run", 15), [spendCredits]);

  const combo = useMemo(() => getComboCounts(state.collectedBalls), [state.collectedBalls]);
  const stageConfig = useMemo(() => getJungleStageConfig(state.currentStage), [state.currentStage]);

  return {
    ...state,
    stageConfig,
    combo,
    viewWidth: VIEW_WIDTH,
    viewHeight: VIEW_HEIGHT,
    startGame,
    pause,
    resume,
    restart: () => resetStage(stateRef.current.currentStage, stateRef.current.pathChoice, stateRef.current.dailyRun),
    selectStage,
    setPathChoice,
    move,
    jump,
    slide,
    swim,
    startSwingCharge,
    releaseSwing,
    activatePowerUp,
    claimRewards,
    spendCredits,
    unlockCosmetic,
    unlockExtraRun,
    unlockDreamRun,
  };
}

