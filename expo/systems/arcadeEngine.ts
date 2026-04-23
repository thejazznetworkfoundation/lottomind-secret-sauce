import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { bossReachedPlayer, findHazardCollision, findPickupCollisions } from "@/components/game/Collision";
import { updateCameraX } from "@/components/game/CameraController";
import { createInitialPlayer, damagePlayer, updatePlayer } from "@/components/game/PlayerController";
import { ARCADE_CONFIG } from "@/constants/arcadeConfig";
import { createInitialBoss, updateBoss } from "@/systems/bossAI";
import { buildVictoryReward, calculateStageClearBonus } from "@/systems/rewardSystem";
import {
  cloneStageHazards,
  cloneStageLadders,
  cloneStagePickups,
  cloneStagePlatforms,
  createStageGoal,
} from "@/systems/spawnSystem";
import type {
  AudioRuntimeState,
  ArcadeInputState,
  ArcadeRunSummary,
  ArcadeSignal,
  ArcadeSignalType,
  ArcadeSnapshot,
  GameStatus,
  HazardEntity,
  ParticleEntity,
  PickupEntity,
  PlayerEntity,
} from "@/types/arcade";
import type { ArcadeStageDefinition } from "@/types/stage";
import { clamp } from "@/utils/math";

function createParticles(x: number, y: number, color: string, total: number): ParticleEntity[] {
  return Array.from({ length: total }, (_, index) => {
    const life = 0.45 + Math.random() * 0.35;

    return {
      id: `particle-${Date.now()}-${index}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 220,
      vy: -80 - Math.random() * 180,
      life,
      maxLife: life,
      size: 4 + Math.random() * 6,
      color,
    };
  });
}

function updateParticles(particles: ParticleEntity[], dt: number) {
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * dt,
      y: particle.y + particle.vy * dt,
      vy: particle.vy + 420 * dt,
      life: particle.life - dt,
    }))
    .filter((particle) => particle.life > 0);
}

function getUpcomingCheckpointLabel(stage: ArcadeStageDefinition, playerX: number) {
  return stage.checkpoints.find((checkpoint) => checkpoint.x > playerX)?.label ?? stage.goal.label;
}

function createInitialSummary(stage: ArcadeStageDefinition): ArcadeRunSummary {
  return {
    score: 0,
    timeRemaining: stage.timerSeconds,
    gems: 0,
    rings: 0,
    treasureTriggers: 0,
    livesRemaining: stage.startingLives,
    stageClearBonus: 0,
    victory: false,
  };
}

function createEmptyInputState(): ArcadeInputState {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    jumpPressed: false,
    jumpHeld: false,
  };
}

function createInitialSnapshot(stage: ArcadeStageDefinition): ArcadeSnapshot {
  const player = createInitialPlayer(stage);
  const introStep = stage.sequence.introSteps[0];

  return {
    status: "ready",
    phase: stage.sequence.introEnabled ? "intro" : "active",
    elapsed: 0,
    remainingTime: stage.timerSeconds,
    distanceRemaining: stage.goal.x - player.x,
    checkpointLabel: getUpcomingCheckpointLabel(stage, player.x),
    cameraX: 0,
    viewportWidth: ARCADE_CONFIG.world.viewportWidth,
    viewportHeight: ARCADE_CONFIG.world.viewportHeight,
    player,
    boss: createInitialBoss(player, stage),
    platforms: cloneStagePlatforms(stage),
    ladders: cloneStageLadders(stage),
    hazards: cloneStageHazards(stage),
    pickups: cloneStagePickups(stage),
    goal: createStageGoal(stage),
    particles: [],
    signal: null,
    bossWarning: stage.sequence.introEnabled
      ? {
          text: "BOSS IN PURSUIT",
          timerMs: 1400,
          severity: "warning",
        }
      : null,
    cinematic: stage.sequence.introEnabled
      ? {
          active: true,
          variant: "intro",
          title: stage.title,
          subtitle: stage.subtitle,
          detail: "Race the cyber-croc to the LM vault.",
          currentStepType: introStep?.type,
          stepIndex: 0,
          timeRemainingMs: introStep?.durationMs ?? 0,
          skippable: true,
        }
      : null,
    cameraEffects: {
      activeEffect: null,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      timeRemaining: 0,
    },
    audio: {
      musicCue: stage.sequence.introEnabled ? "intro" : "run",
      sfxEvents: [],
    },
    rewards: null,
    summary: createInitialSummary(stage),
  };
}

function applyPickup(pickup: PickupEntity, player: PlayerEntity) {
  if (pickup.kind === "blueGem") {
    return {
      player: {
        ...player,
        score: player.score + pickup.scoreValue,
        gems: player.gems + 1,
      },
      particleColor: "#68ecff",
      signal: "pickup" as ArcadeSignalType,
    };
  }

  if (pickup.kind === "diamondRing") {
    const rings = player.rings + 1;
    const highValueCount = rings + player.treasureTriggers;

    return {
      player: {
        ...player,
        score: player.score + pickup.scoreValue,
        rings,
        jackpotPowerTimer:
          highValueCount >= 2
            ? ARCADE_CONFIG.player.jackpotPowerSeconds
            : Math.max(player.jackpotPowerTimer, ARCADE_CONFIG.player.jackpotPowerSeconds * 0.45),
      },
      particleColor: "#ffc95f",
      signal: highValueCount >= 2 ? ("power" as ArcadeSignalType) : ("pickup" as ArcadeSignalType),
    };
  }

  return {
    player: {
      ...player,
      score: player.score + pickup.scoreValue,
      treasureTriggers: player.treasureTriggers + 1,
      jackpotPowerTimer: Math.max(player.jackpotPowerTimer, ARCADE_CONFIG.player.jackpotPowerSeconds),
    },
    particleColor: "#f28cff",
    signal: "power" as ArcadeSignalType,
  };
}

function updateHazards(hazards: HazardEntity[], elapsed: number) {
  return hazards.map((hazard) => {
    if (hazard.kind !== "scorpion") {
      return hazard;
    }

    const originX = hazard.originX ?? hazard.x;
    const travelDistance = hazard.travelDistance ?? ARCADE_CONFIG.hazards.scorpionTravelDistance;
    const moveSpeed = hazard.moveSpeed ?? ARCADE_CONFIG.hazards.scorpionMoveSpeed;
    const phase = hazard.phase ?? 0;

    return {
      ...hazard,
      originX,
      x: originX + Math.sin(elapsed * moveSpeed + phase) * travelDistance,
    };
  });
}

function applyHazardEffect(hazard: HazardEntity, player: PlayerEntity) {
  if (hazard.kind === "goldJackpotPuddle" && ARCADE_CONFIG.hazards.goldPuddleMode === "boost") {
    return {
      player: {
        ...player,
        velocity: {
          x: Math.max(player.velocity.x, ARCADE_CONFIG.hazards.goldPuddleBoostX),
          y: -ARCADE_CONFIG.hazards.goldPuddleBoostY,
        },
        onGround: false,
        jackpotPowerTimer: Math.max(player.jackpotPowerTimer, ARCADE_CONFIG.player.jackpotPowerSeconds * 0.55),
        invulnerableTimer: Math.max(player.invulnerableTimer, ARCADE_CONFIG.hazards.goldPuddleProtectionSeconds),
        facing: 1 as const,
      },
      signal: "power" as ArcadeSignalType,
      particleColor: "#ffc95f",
      burst: ARCADE_CONFIG.particles.powerBurst,
    };
  }

  const knockDirection = hazard.x > player.x ? -1 : 1;
  let nextPlayer = damagePlayer(player, knockDirection);

  if (hazard.kind === "purpleDreamPuddle") {
    nextPlayer = {
      ...nextPlayer,
      slowTimer: ARCADE_CONFIG.player.slowSeconds,
    };
  }

  return {
    player: nextPlayer,
    signal: "hurt" as ArcadeSignalType,
    particleColor: "#ff7f77",
    burst: ARCADE_CONFIG.particles.hurtBurst,
  };
}

export function useArcadeEngine(stage: ArcadeStageDefinition) {
  const [snapshot, setSnapshot] = useState<ArcadeSnapshot>(() => createInitialSnapshot(stage));
  const inputRef = useRef<ArcadeInputState>(createEmptyInputState());
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const signalIdRef = useRef(0);
  const pressureTierRef = useRef(0);

  const emitSignal = useCallback((type: ArcadeSignalType): ArcadeSignal => {
    signalIdRef.current += 1;

    return {
      id: signalIdRef.current,
      type,
    };
  }, []);

  const resetRun = useCallback(() => {
    pressureTierRef.current = 0;
    setSnapshot(createInitialSnapshot(stage));
  }, [stage]);

  const startRun = useCallback(() => {
    pressureTierRef.current = 0;
    const initial = createInitialSnapshot(stage);
    setSnapshot({
      ...initial,
      status: "running",
      phase: "active",
      signal: null,
      bossWarning: null,
      cinematic: null,
      audio: {
        ...initial.audio,
        musicCue: "run",
        sfxEvents: [],
      },
    });
    lastTimeRef.current = 0;
  }, [stage]);

  const pauseRun = useCallback(() => {
    setSnapshot((current) => ({
      ...current,
      status: current.status === "running" ? "paused" : current.status,
    }));
  }, []);

  const resumeRun = useCallback(() => {
    setSnapshot((current) => ({
      ...current,
      status: current.status === "paused" ? "running" : current.status,
    }));
    lastTimeRef.current = 0;
  }, []);

  const setInput = useCallback((patch: Partial<ArcadeInputState>) => {
    inputRef.current = {
      ...inputRef.current,
      ...patch,
    };
  }, []);

  const step = useCallback(
    (current: ArcadeSnapshot, dt: number): ArcadeSnapshot => {
      if (current.status !== "running") {
        return current;
      }

      const input = inputRef.current;
      const nextHazards = updateHazards(current.hazards, current.elapsed + dt);
      let nextPlayer = updatePlayer(current.player, input, stage, dt);
      let nextPickups = current.pickups;
      let nextParticles = updateParticles(current.particles, dt);
      let nextSignal: ArcadeSignal | null = null;
      let nextStatus: GameStatus = current.status;
      let nextRewards = current.rewards;
      let stageClearBonus = 0;
      let nextPhase = current.phase;
      let nextBossWarning = current.bossWarning;
      let nextCinematic = current.cinematic;
      let nextAudio: AudioRuntimeState = {
        ...current.audio,
        sfxEvents: [],
      };

      const playerJumped =
        input.jumpPressed &&
        current.player.hurtTimer <= 0 &&
        (current.player.onGround || current.player.coyoteTimer > 0 || current.player.climbing) &&
        nextPlayer.velocity.y < 0;

      if (playerJumped) {
        nextSignal = emitSignal("jump");
        nextAudio.sfxEvents = [{ id: Date.now(), type: "jump" }];
      }

      const collected = findPickupCollisions(nextPlayer, nextPickups);
      if (collected.length > 0) {
        const collectedIds = new Set(collected.map((pickup) => pickup.id));
        nextPickups = nextPickups.map((pickup) => (collectedIds.has(pickup.id) ? { ...pickup, collected: true } : pickup));

        collected.forEach((pickup) => {
          const result = applyPickup(pickup, nextPlayer);
          nextPlayer = result.player;
          nextSignal = emitSignal(result.signal);
          nextAudio.sfxEvents = [
            ...nextAudio.sfxEvents,
            {
              id: Date.now() + nextAudio.sfxEvents.length,
              type: pickup.kind === "diamondRing" ? "pickupRing" : "pickupGem",
            },
          ];
          nextParticles = nextParticles.concat(
            createParticles(
              pickup.x + pickup.width / 2,
              pickup.y + pickup.height / 2,
              result.particleColor,
              ARCADE_CONFIG.particles.pickupBurst
            )
          );
        });
      }

      const collidedHazard = nextPlayer.invulnerableTimer <= 0 ? findHazardCollision(nextPlayer, nextHazards) : null;
      if (collidedHazard) {
        const result = applyHazardEffect(collidedHazard, nextPlayer);
        nextPlayer = result.player;
        nextSignal = emitSignal(result.signal);
        nextAudio.sfxEvents = [...nextAudio.sfxEvents, { id: Date.now() + nextAudio.sfxEvents.length, type: "hurt" }];
        nextParticles = nextParticles.concat(
          createParticles(
            collidedHazard.x + collidedHazard.width / 2,
            collidedHazard.y + collidedHazard.height / 2,
            result.particleColor,
            result.burst
          )
        );
      }

      const elapsed = current.elapsed + dt;
      const remainingTime = Math.max(0, current.remainingTime - dt);
      const nextBoss = updateBoss(current.boss, nextPlayer, stage.boss, elapsed, dt);
      const nextCameraX = updateCameraX(current.cameraX, nextPlayer.x, stage.worldWidth, current.viewportWidth, dt);

      const thresholds = stage.boss.pressurePulseThresholds;
      const threatTier = nextBoss.threat >= thresholds[1] ? 2 : nextBoss.threat >= thresholds[0] ? 1 : 0;

      if (threatTier > pressureTierRef.current && nextSignal === null) {
        nextSignal = emitSignal("pressure");
        nextBossWarning = {
          text: threatTier > 1 ? "FINAL CHASE" : "THREAT RISING",
          timerMs: threatTier > 1 ? 1100 : 900,
          severity: threatTier > 1 ? "danger" : "warning",
        };
      }

      pressureTierRef.current = threatTier;

      if (bossReachedPlayer(nextPlayer, nextBoss, stage.boss.catchThreshold) || nextPlayer.lives <= 0 || remainingTime <= 0) {
        nextStatus = "gameOver";
        nextPhase = "defeatEnding";
        nextSignal = emitSignal("lose");
        nextBossWarning = {
          text: remainingTime <= 0 ? "TIME EXPIRED" : "RUN FAILED",
          timerMs: 1600,
          severity: "danger",
        };
        nextCinematic = {
          active: true,
          variant: "defeat",
          title: remainingTime <= 0 ? "Time Expired" : "Boss Caught You",
          subtitle: "The vault run slipped away.",
          timeRemainingMs: 1200,
          skippable: false,
        };
        nextAudio.musicCue = "defeat";
        nextAudio.sfxEvents = [...nextAudio.sfxEvents, { id: Date.now() + nextAudio.sfxEvents.length, type: "defeat" }];
      }

      const goalReached = nextPlayer.x + nextPlayer.width >= current.goal.x && nextPlayer.y + nextPlayer.height >= current.goal.y;
      const nextGoal = {
        ...current.goal,
        reached: goalReached,
      };

      if (goalReached) {
        nextStatus = "victory";
        nextPhase = "victoryEnding";
        stageClearBonus = calculateStageClearBonus(remainingTime, nextPlayer.lives);
        nextPlayer = {
          ...nextPlayer,
          score: nextPlayer.score + stageClearBonus,
          animation: "celebrate",
          velocity: { x: 0, y: 0 },
        };

        const summary: ArcadeRunSummary = {
          score: nextPlayer.score,
          timeRemaining: remainingTime,
          gems: nextPlayer.gems,
          rings: nextPlayer.rings,
          treasureTriggers: nextPlayer.treasureTriggers,
          livesRemaining: nextPlayer.lives,
          stageClearBonus,
          victory: true,
        };

        nextRewards = buildVictoryReward(summary);
        nextSignal = emitSignal("win");
        nextBossWarning = {
          text: "VAULT REACHED",
          timerMs: 1600,
          severity: "warning",
        };
        nextCinematic = {
          active: true,
          variant: "victory",
          title: "Jackpot Secured",
          subtitle: "The LM vault is yours.",
          timeRemainingMs: 1400,
          skippable: false,
        };
        nextAudio.musicCue = "victory";
        nextAudio.sfxEvents = [...nextAudio.sfxEvents, { id: Date.now() + nextAudio.sfxEvents.length, type: "victory" }];
        nextParticles = nextParticles.concat(
          createParticles(nextGoal.x + nextGoal.width / 2, nextGoal.y + 24, "#ffc95f", ARCADE_CONFIG.particles.powerBurst)
        );
      }

      const summary: ArcadeRunSummary = {
        score: nextPlayer.score,
        timeRemaining: remainingTime,
        gems: nextPlayer.gems,
        rings: nextPlayer.rings,
        treasureTriggers: nextPlayer.treasureTriggers,
        livesRemaining: nextPlayer.lives,
        stageClearBonus,
        victory: nextStatus === "victory",
      };

      inputRef.current = {
        ...inputRef.current,
        jumpPressed: false,
      };

      return {
        ...current,
        status: nextStatus,
        phase: nextPhase,
        elapsed,
        remainingTime,
        distanceRemaining: Math.max(0, stage.goal.x - nextPlayer.x),
        checkpointLabel: getUpcomingCheckpointLabel(stage, nextPlayer.x),
        cameraX: nextCameraX,
        player: nextPlayer,
        boss: nextBoss,
        hazards: nextHazards,
        pickups: nextPickups,
        goal: nextGoal,
        particles: nextParticles,
        signal: nextSignal,
        bossWarning:
          nextBossWarning && nextBossWarning.timerMs > 0
            ? {
                ...nextBossWarning,
                timerMs: Math.max(0, nextBossWarning.timerMs - dt * 1000),
              }
            : null,
        cinematic:
          nextCinematic && nextCinematic.timeRemainingMs > 0
            ? {
                ...nextCinematic,
                timeRemainingMs: Math.max(0, nextCinematic.timeRemainingMs - dt * 1000),
              }
            : null,
        cameraEffects: current.cameraEffects.timeRemaining > 0
          ? {
              ...current.cameraEffects,
              timeRemaining: Math.max(0, current.cameraEffects.timeRemaining - dt),
            }
          : current.cameraEffects,
        audio: nextAudio,
        rewards: nextRewards,
        summary,
      };
    },
    [emitSignal, stage]
  );

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const delta = clamp((time - lastTimeRef.current) / 1000, 0, 0.033);
      lastTimeRef.current = time;

      setSnapshot((current) => step(current, delta));
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [step]);

  useEffect(() => {
    pressureTierRef.current = 0;
    inputRef.current = createEmptyInputState();
    setSnapshot(createInitialSnapshot(stage));
    lastTimeRef.current = 0;
  }, [stage]);

  const controls = useMemo(
    () => ({
      setInput,
      startRun,
      pauseRun,
      resumeRun,
      resetRun,
    }),
    [pauseRun, resetRun, resumeRun, setInput, startRun]
  );

  return {
    snapshot,
    controls,
  };
}
