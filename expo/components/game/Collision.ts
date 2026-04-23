import type { BossEntity, HazardEntity, LadderEntity, PickupEntity, PlayerEntity, Rect } from "@/types/arcade";
import type { JackpotChaseStageDefinition } from "@/types/stage";

import { overlaps1D } from "@/utils/math";

export function intersects(a: Rect, b: Rect) {
  return overlaps1D(a.x, a.x + a.width, b.x, b.x + b.width) && overlaps1D(a.y, a.y + a.height, b.y, b.y + b.height);
}

export function resolveTerrain(player: PlayerEntity, previousY: number, stage: JackpotChaseStageDefinition) {
  let nextY = player.y;
  let nextVelocityY = player.velocity.y;
  let onGround = false;

  const previousBottom = previousY + player.height;
  const nextBottom = player.y + player.height;

  if (nextBottom >= stage.groundY && previousBottom <= stage.groundY + 24) {
    nextY = stage.groundY - player.height;
    nextVelocityY = 0;
    onGround = true;
  }

  for (const platform of stage.platforms) {
    const overlapsPlatform = overlaps1D(player.x, player.x + player.width, platform.x, platform.x + platform.width);
    if (!overlapsPlatform) {
      continue;
    }

    if (player.velocity.y >= 0 && previousBottom <= platform.y && nextBottom >= platform.y) {
      if (platform.y - player.height < nextY) {
        nextY = platform.y - player.height;
        nextVelocityY = 0;
        onGround = true;
      }
    }

    const platformBottom = platform.y + platform.height;
    if (player.velocity.y < 0 && previousY >= platformBottom && player.y <= platformBottom) {
      nextY = platformBottom;
      nextVelocityY = 0;
    }
  }

  return {
    y: nextY,
    velocityY: nextVelocityY,
    onGround,
  };
}

export function findHazardCollision(player: PlayerEntity, hazards: HazardEntity[]) {
  return hazards.find((hazard) => hazard.active && intersects(player, hazard)) ?? null;
}

export function findPickupCollisions(player: PlayerEntity, pickups: PickupEntity[]) {
  return pickups.filter((pickup) => !pickup.collected && intersects(player, pickup));
}

export function findLadderZone(player: PlayerEntity, ladders: LadderEntity[]) {
  const playerCenterX = player.x + player.width / 2;

  return (
    ladders.find((ladder) => {
      const withinX = playerCenterX >= ladder.x - 14 && playerCenterX <= ladder.x + ladder.width + 14;
      const verticallyNear = player.y + player.height >= ladder.y - 24 && player.y <= ladder.y + ladder.height + 24;

      return withinX && verticallyNear;
    }) ?? null
  );
}

export function bossReachedPlayer(player: PlayerEntity, boss: BossEntity, catchThreshold: number) {
  return boss.x + boss.width >= player.x - catchThreshold;
}
