import { ARCADE_CONFIG } from "@/constants/arcadeConfig";
import type { BossEntity, PlayerEntity } from "@/types/arcade";
import type { BossStageConfig, JackpotChaseStageDefinition } from "@/types/stage";

import { approach, clamp, lerp } from "@/utils/math";

function getPhaseId(pressure: number) {
  if (pressure >= 0.78) {
    return "finalChase" as const;
  }

  if (pressure >= 0.38) {
    return "aggression" as const;
  }

  return "pursuit" as const;
}

export function createInitialBoss(player: PlayerEntity, stage: JackpotChaseStageDefinition): BossEntity {
  return {
    id: "boss",
    x: player.x - stage.boss.startDistance,
    y: stage.groundY - ARCADE_CONFIG.boss.height + 12,
    width: ARCADE_CONFIG.boss.width,
    height: ARCADE_CONFIG.boss.height,
    speed: stage.boss.baseSpeed,
    pressure: 0,
    threat: 0,
    phaseId: "pursuit",
    currentAttack: null,
    attackCooldown: 0,
    warningTimer: 0,
    warningText: null,
    lungeTimer: 0,
    roarPulseTimer: 0,
    panicTimer: 0,
    eyeGlow: 0.28,
  };
}

export function updateBoss(
  boss: BossEntity,
  player: PlayerEntity,
  bossConfig: BossStageConfig,
  elapsed: number,
  dt: number
): BossEntity {
  if (elapsed < bossConfig.activationDelaySeconds) {
    return {
      ...boss,
      x: player.x - bossConfig.startDistance,
      speed: 0,
      pressure: 0,
      threat: 0,
      phaseId: "pursuit",
      currentAttack: null,
      attackCooldown: Math.max(0, boss.attackCooldown - dt),
      warningTimer: Math.max(0, boss.warningTimer - dt),
      warningText: null,
      lungeTimer: Math.max(0, boss.lungeTimer - dt),
      roarPulseTimer: Math.max(0, boss.roarPulseTimer - dt),
      panicTimer: Math.max(0, boss.panicTimer - dt),
      eyeGlow: 0.28,
    };
  }

  const activeElapsed = elapsed - bossConfig.activationDelaySeconds;
  const playerPenalty = player.hurtTimer > 0 ? 0.18 : player.slowTimer > 0 ? 0.08 : 0;
  const pressure = clamp(activeElapsed * bossConfig.pressureRampPerSecond + playerPenalty, 0, 1);
  const desiredGapBase = lerp(bossConfig.maxGap, bossConfig.minGap, pressure);
  const desiredGap = player.jackpotPowerTimer > 0 ? desiredGapBase + bossConfig.recoveryGapBonus : desiredGapBase;
  const speed =
    lerp(bossConfig.baseSpeed, bossConfig.maxSpeed, pressure) +
    (player.velocity.x < 120 ? bossConfig.slowSpeedBonus : 0) +
    (player.hurtTimer > 0 ? bossConfig.hitSpeedBonus : 0);
  const targetX = player.x - desiredGap;

  const nextX = approach(boss.x, targetX, speed * dt);
  const distance = player.x - nextX;
  const threat = clamp(1 - distance / bossConfig.maxGap, 0, 1);
  const phaseId = getPhaseId(pressure);

  return {
    ...boss,
    x: nextX,
    speed,
    pressure,
    threat,
    phaseId,
    currentAttack: null,
    attackCooldown: Math.max(0, boss.attackCooldown - dt),
    warningTimer: Math.max(0, boss.warningTimer - dt),
    warningText: null,
    lungeTimer: Math.max(0, boss.lungeTimer - dt),
    roarPulseTimer: Math.max(0, boss.roarPulseTimer - dt),
    panicTimer: Math.max(0, boss.panicTimer - dt),
    eyeGlow: clamp(0.28 + threat * 0.72, 0.28, 1),
  };
}
