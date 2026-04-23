import { ARCADE_CONFIG } from "@/constants/arcadeConfig";
import { clamp, lerp } from "@/utils/math";

export function updateCameraX(currentCameraX: number, playerX: number, worldWidth: number, viewportWidth: number, dt: number) {
  const target = clamp(
    playerX - viewportWidth * ARCADE_CONFIG.camera.leadFactor,
    0,
    Math.max(0, worldWidth - viewportWidth)
  );

  return lerp(currentCameraX, target, Math.min(1, dt * ARCADE_CONFIG.camera.smoothing));
}
