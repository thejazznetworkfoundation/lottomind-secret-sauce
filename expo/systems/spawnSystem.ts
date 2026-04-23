import { ARCADE_CONFIG } from "@/constants/arcadeConfig";
import type { BaseEntity, GoalEntity, HazardEntity, LadderEntity, PickupEntity, PlatformEntity } from "@/types/arcade";
import type { JackpotChaseStageDefinition, StageHazard, StagePickup } from "@/types/stage";

function mapHazard(hazard: StageHazard): HazardEntity {
  const config = hazard.config ?? {};
  const damage = Number(config.damage ?? 1);

  switch (hazard.type) {
    case "dreamPuddle":
      return {
        id: hazard.id,
        kind: "purpleDreamPuddle",
        x: hazard.x,
        y: hazard.y,
        width: hazard.width,
        height: hazard.height,
        damage,
        active: true,
      };
    case "jackpotPuddle":
      return {
        id: hazard.id,
        kind: "goldJackpotPuddle",
        x: hazard.x,
        y: hazard.y,
        width: hazard.width,
        height: hazard.height,
        damage,
        active: true,
      };
    case "scorpion":
      return {
        id: hazard.id,
        kind: "scorpion",
        x: hazard.x,
        y: hazard.y,
        width: hazard.width,
        height: hazard.height,
        damage,
        active: true,
        originX: Number(config.originX ?? hazard.x),
        travelDistance: Number(config.travelDistance ?? ARCADE_CONFIG.hazards.scorpionTravelDistance),
        moveSpeed: Number(config.moveSpeed ?? ARCADE_CONFIG.hazards.scorpionMoveSpeed),
        phase: Number(config.phase ?? 0),
      };
    case "circuitLog":
    default:
      return {
        id: hazard.id,
        kind: "circuitLog",
        x: hazard.x,
        y: hazard.y,
        width: hazard.width,
        height: hazard.height,
        damage,
        active: true,
      };
  }
}

function mapPickup(pickup: StagePickup): PickupEntity {
  switch (pickup.type) {
    case "diamondRing":
      return {
        id: pickup.id,
        kind: "diamondRing",
        x: pickup.x,
        y: pickup.y,
        width: pickup.width,
        height: pickup.height,
        scoreValue: pickup.value ?? ARCADE_CONFIG.pickups.ringScore,
        collected: false,
      };
    case "treasureChest":
    case "jackpotTrigger":
      return {
        id: pickup.id,
        kind: "treasureReward",
        x: pickup.x,
        y: pickup.y,
        width: pickup.width,
        height: pickup.height,
        scoreValue: pickup.value ?? ARCADE_CONFIG.pickups.treasureScore,
        collected: false,
      };
    case "blueGem":
    default:
      return {
        id: pickup.id,
        kind: "blueGem",
        x: pickup.x,
        y: pickup.y,
        width: pickup.width,
        height: pickup.height,
        scoreValue: pickup.value ?? ARCADE_CONFIG.pickups.gemScore,
        collected: false,
      };
  }
}

export function cloneStagePlatforms(stage: JackpotChaseStageDefinition): PlatformEntity[] {
  return stage.platforms.map((platform) => ({
    id: platform.id,
    x: platform.x,
    y: platform.y,
    width: platform.width,
    height: platform.height,
    kind: platform.kind,
    sprite: platform.sprite ?? "platform",
    depth: platform.depth ?? 1,
  }));
}

export function cloneStageHazards(stage: JackpotChaseStageDefinition): HazardEntity[] {
  return stage.hazards.map(mapHazard);
}

export function cloneStagePickups(stage: JackpotChaseStageDefinition): PickupEntity[] {
  return stage.pickups.map(mapPickup);
}

export function cloneStageLadders(stage: JackpotChaseStageDefinition): LadderEntity[] {
  return stage.ladders.map((ladder) => ({ ...ladder }));
}

export function createStageGoal(stage: JackpotChaseStageDefinition): GoalEntity {
  return {
    id: stage.goal.id,
    x: stage.goal.x,
    y: stage.goal.y,
    width: stage.goal.width,
    height: stage.goal.height,
    label: stage.goal.label,
    reached: false,
  };
}

export function getVisibleEntities<T extends BaseEntity>(items: T[], cameraX: number, viewportWidth: number, margin = 220) {
  const leftBound = cameraX - margin;
  const rightBound = cameraX + viewportWidth + margin;

  return items.filter((item) => item.x + item.width > leftBound && item.x < rightBound);
}
