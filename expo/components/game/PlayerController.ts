import { ARCADE_CONFIG } from "@/constants/arcadeConfig";
import type { ArcadeInputState, HeroAnimationState, PlayerEntity } from "@/types/arcade";
import type { JackpotChaseStageDefinition } from "@/types/stage";

import { findLadderZone, resolveTerrain } from "@/components/game/Collision";
import { approach, clamp } from "@/utils/math";

function getAnimationState(player: PlayerEntity, input: ArcadeInputState): HeroAnimationState {
  if (player.hurtTimer > 0) {
    return "hurt";
  }

  if (player.climbing) {
    return "climb";
  }

  if (player.jackpotPowerTimer > 0) {
    return "jackpotPower";
  }

  if (!player.onGround) {
    return "jump";
  }

  if (player.landTimer > 0) {
    return "land";
  }

  if (player.crouching) {
    return "crouch";
  }

  if (Math.abs(player.velocity.x) > 30) {
    return "run";
  }

  return "idle";
}

export function createInitialPlayer(stage: JackpotChaseStageDefinition): PlayerEntity {
  return {
    id: "player",
    x: stage.playerStartX,
    y: stage.groundY - ARCADE_CONFIG.player.height,
    width: ARCADE_CONFIG.player.width,
    height: ARCADE_CONFIG.player.height,
    velocity: { x: 0, y: 0 },
    facing: 1,
    animation: "idle",
    onGround: true,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    landTimer: 0,
    hurtTimer: 0,
    invulnerableTimer: 0,
    jackpotPowerTimer: 0,
    slowTimer: 0,
    crouching: false,
    climbing: false,
    activeLadderId: null,
    lives: stage.startingLives,
    score: 0,
    gems: 0,
    rings: 0,
    treasureTriggers: 0,
  };
}

export function updatePlayer(
  currentPlayer: PlayerEntity,
  input: ArcadeInputState,
  stage: JackpotChaseStageDefinition,
  dt: number
): PlayerEntity {
  const player = {
    ...currentPlayer,
    velocity: { ...currentPlayer.velocity },
  };

  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  player.hurtTimer = Math.max(0, player.hurtTimer - dt);
  player.landTimer = Math.max(0, player.landTimer - dt);
  player.jackpotPowerTimer = Math.max(0, player.jackpotPowerTimer - dt);
  player.slowTimer = Math.max(0, player.slowTimer - dt);
  player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dt);
  player.coyoteTimer = player.onGround
    ? ARCADE_CONFIG.player.coyoteSeconds
    : Math.max(0, player.coyoteTimer - dt);

  if (input.jumpPressed) {
    player.jumpBufferTimer = ARCADE_CONFIG.player.jumpBufferSeconds;
  }

  const ladderZone = findLadderZone(player, stage.ladders);
  const activeLadder =
    (player.activeLadderId ? stage.ladders.find((ladder) => ladder.id === player.activeLadderId) : null) ?? ladderZone;
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const climbDirection = (input.down ? 1 : 0) - (input.up ? 1 : 0);

  player.crouching = input.down && player.onGround && direction === 0 && player.hurtTimer <= 0;
  const speedMultiplier =
    (player.slowTimer > 0 ? ARCADE_CONFIG.player.slowMultiplier : 1) *
    (player.jackpotPowerTimer > 0 ? ARCADE_CONFIG.player.jackpotSpeedMultiplier : 1);
  const baseRunSpeed = player.crouching ? ARCADE_CONFIG.player.crouchSpeed : ARCADE_CONFIG.player.maxRunSpeed;
  const targetSpeed = direction * baseRunSpeed * speedMultiplier;
  const acceleration = player.onGround ? ARCADE_CONFIG.player.acceleration : ARCADE_CONFIG.player.airAcceleration;

  const wantsClimb = activeLadder && (input.up || (input.down && player.onGround)) && player.hurtTimer <= 0;

  if ((player.climbing || wantsClimb) && activeLadder) {
    player.climbing = true;
    player.activeLadderId = activeLadder.id;
    player.crouching = false;
    player.onGround = false;
    player.coyoteTimer = 0;
    player.jumpBufferTimer = 0;
    player.x = clamp(activeLadder.x + activeLadder.width / 2 - player.width / 2, 0, stage.worldWidth - player.width);
    player.velocity.x = approach(player.velocity.x, 0, ARCADE_CONFIG.player.friction * dt);
    player.velocity.y = climbDirection * ARCADE_CONFIG.player.climbSpeed;
    player.y = clamp(
      player.y + player.velocity.y * dt,
      activeLadder.y - player.height + 12,
      activeLadder.y + activeLadder.height - player.height + 4
    );

    if (input.jumpPressed) {
      player.climbing = false;
      player.activeLadderId = null;
      player.velocity.y = -ARCADE_CONFIG.player.jumpVelocity * 0.88;
      player.velocity.x = player.facing * ARCADE_CONFIG.player.maxRunSpeed * 0.55;
    } else {
      const reachedTop = player.y <= activeLadder.y - player.height + 14 && input.up;
      const reachedBottom = player.y >= activeLadder.y + activeLadder.height - player.height && input.down;

      if (reachedTop) {
        player.climbing = false;
        player.activeLadderId = null;
        player.onGround = true;
        player.velocity.y = 0;
        player.y = activeLadder.y - player.height;
      } else if (reachedBottom) {
        player.climbing = false;
        player.activeLadderId = null;
        player.onGround = true;
        player.velocity.y = 0;
        player.y = stage.groundY - player.height;
      }
    }

    player.animation = getAnimationState(player, input);
    return player;
  }

  player.climbing = false;
  player.activeLadderId = null;

  if (direction !== 0) {
    player.velocity.x = approach(player.velocity.x, targetSpeed, acceleration * dt);
    player.facing = direction > 0 ? 1 : -1;
  } else {
    const friction = player.onGround ? ARCADE_CONFIG.player.friction : ARCADE_CONFIG.player.friction * 0.35;
    player.velocity.x = approach(player.velocity.x, 0, friction * dt);
  }

  if (player.crouching) {
    player.velocity.x = approach(player.velocity.x, 0, ARCADE_CONFIG.player.friction * dt);
  }

  if (player.jumpBufferTimer > 0 && (player.onGround || player.coyoteTimer > 0)) {
    player.velocity.y = -ARCADE_CONFIG.player.jumpVelocity;
    player.onGround = false;
    player.jumpBufferTimer = 0;
    player.coyoteTimer = 0;
    player.landTimer = 0;
  }

  if (!input.jumpHeld && player.velocity.y < -ARCADE_CONFIG.player.variableJumpCutoff) {
    player.velocity.y = -ARCADE_CONFIG.player.variableJumpCutoff;
  }

  player.velocity.y += ARCADE_CONFIG.player.gravity * dt;
  player.velocity.y = clamp(player.velocity.y, -ARCADE_CONFIG.player.jumpVelocity, ARCADE_CONFIG.player.gravity);

  player.x = clamp(player.x + player.velocity.x * dt, 0, stage.worldWidth - player.width);
  const previousY = player.y;
  player.y += player.velocity.y * dt;

  const terrain = resolveTerrain(player, previousY, stage);
  const hadGround = player.onGround;
  player.y = terrain.y;
  player.velocity.y = terrain.velocityY;
  player.onGround = terrain.onGround;

  if (!hadGround && player.onGround) {
    player.landTimer = 0.12;
  }

  player.animation = getAnimationState(player, input);

  return player;
}

export function damagePlayer(player: PlayerEntity, knockDirection: 1 | -1) {
  const nextLives = Math.max(0, player.lives - 1);

  return {
    ...player,
    lives: nextLives,
    velocity: {
      x: ARCADE_CONFIG.player.hurtKickX * -knockDirection,
      y: -ARCADE_CONFIG.player.hurtKickY,
    },
    onGround: false,
    hurtTimer: 0.38,
    invulnerableTimer: ARCADE_CONFIG.player.invulnerableSeconds,
    crouching: false,
    climbing: false,
    activeLadderId: null,
    animation: "hurt" as HeroAnimationState,
  };
}
