import { Image } from "react-native";
import type { ImageSourcePropType, ImageStyle, ViewStyle } from "react-native";

import type { HeroAnimationState, HeroPoseKey, SpriteCrop, SpriteSheetDefinition } from "@/types/arcade";

interface CropFrame {
  width: number;
  height: number;
}

// The transparent character sheet is now the first-pass source of truth for the
// hero. Some pose slots intentionally reuse the nearest matching cutout until a
// dedicated climb / land export is available.
export const heroPoseCrops = {
  portrait: { x: 18, y: 20, width: 126, height: 214 },
  idle: { x: 540, y: 18, width: 136, height: 214 },
  run1: { x: 815, y: 26, width: 174, height: 180 },
  run2: { x: 1220, y: 36, width: 168, height: 176 },
  jump: { x: 975, y: 24, width: 188, height: 184 },
  fall: { x: 678, y: 28, width: 136, height: 182 },
  land: { x: 678, y: 28, width: 136, height: 182 },
  crouch: { x: 889, y: 208, width: 130, height: 176 },
  climb: { x: 145, y: 12, width: 122, height: 230 },
  swing: { x: 975, y: 24, width: 188, height: 184 },
  hurt: { x: 780, y: 203, width: 130, height: 170 },
  celebrate: { x: 920, y: 206, width: 128, height: 172 },
  jackpotPower: { x: 1038, y: 179, width: 176, height: 196 },
} as const satisfies Record<HeroPoseKey | "portrait", SpriteCrop>;

const cleanMascotCrop = { x: 500, y: 132, width: 286, height: 502 } as const;

// The supplied mascot art is a single clean transparent cutout, so all gameplay
// animation states currently share it until a full exported motion sheet exists.
export const cleanHeroCrops = {
  portrait: cleanMascotCrop,
  idle: cleanMascotCrop,
  run1: cleanMascotCrop,
  run2: cleanMascotCrop,
  jump: cleanMascotCrop,
  fall: cleanMascotCrop,
  land: cleanMascotCrop,
  crouch: cleanMascotCrop,
  climb: cleanMascotCrop,
  swing: cleanMascotCrop,
  hurt: cleanMascotCrop,
  celebrate: cleanMascotCrop,
  jackpotPower: cleanMascotCrop,
} as const satisfies Record<HeroPoseKey | "portrait", SpriteCrop>;

// These props now come from the transparent cutout sheet so the run can build
// its environment from isolated vault-run pieces instead of flat placeholder art.
export const worldPropCrops = {
  platform: { x: 12, y: 357, width: 176, height: 109 },
  platformTall: { x: 192, y: 357, width: 118, height: 110 },
  platformStep: { x: 318, y: 359, width: 126, height: 109 },
  platformLedge: { x: 0, y: 469, width: 291, height: 87 },
  ruinColumn: { x: 1180, y: 542, width: 136, height: 174 },
  goldPuddle: { x: 888, y: 790, width: 178, height: 92 },
  purplePuddle: { x: 520, y: 790, width: 144, height: 90 },
  circuitLog: { x: 428, y: 356, width: 286, height: 150 },
  treasureChest: { x: 792, y: 344, width: 286, height: 184 },
  diamondRing: { x: 1268, y: 822, width: 90, height: 98 },
  blueGem: { x: 654, y: 832, width: 92, height: 78 },
  mossPatch: { x: 404, y: 836, width: 150, height: 88 },
  vaultGate: { x: 1362, y: 776, width: 174, height: 170 },
} as const satisfies Record<string, SpriteCrop>;

// These enemy crops also come from the transparent character sheet so the chase
// silhouettes stay clean against the jungle background.
export const bossStageCrops = {
  chase: { x: 1176, y: 174, width: 350, height: 222 },
  scorpion: { x: 1412, y: 103, width: 120, height: 136 },
} as const satisfies Record<string, SpriteCrop>;

export const creatureSpriteCrops = {
  cyberCrocodile: { x: 540, y: 176, width: 590, height: 360 },
  scorpion: { x: 620, y: 666, width: 585, height: 430 },
} as const satisfies Record<string, SpriteCrop>;

export const environmentSceneCrops = {
  far: { x: 25, y: 535, width: 455, height: 246 },
  mid: { x: 494, y: 91, width: 364, height: 420 },
  near: { x: 284, y: 534, width: 196, height: 247 },
  vaultGate: { x: 959, y: 112, width: 212, height: 180 },
} as const satisfies Record<string, SpriteCrop>;

export const environmentDecorCrops = {
  junglePanel: { x: 26, y: 534, width: 454, height: 246 },
  vineGreen: { x: 434, y: 82, width: 68, height: 422 },
  vinePurple: { x: 492, y: 82, width: 62, height: 420 },
  circuitTree: { x: 548, y: 84, width: 308, height: 428 },
} as const satisfies Record<string, SpriteCrop>;

export function getHeroAnimationPoseKey(animation: HeroAnimationState, elapsed: number): HeroPoseKey {
  if (animation === "run") {
    return Math.floor(elapsed * 9) % 2 === 0 ? "run1" : "run2";
  }

  switch (animation) {
    case "jump":
      return "jump";
    case "fall":
      return "fall";
    case "land":
      return "land";
    case "crouch":
      return "crouch";
    case "climb":
      return "climb";
    case "swing":
      return "swing";
    case "hurt":
      return "hurt";
    case "celebrate":
      return "celebrate";
    case "jackpotPower":
      return "jackpotPower";
    case "idle":
    default:
      return "idle";
  }
}

export function getHeroAnimationCrop(animation: HeroAnimationState, elapsed: number) {
  return heroPoseCrops[getHeroAnimationPoseKey(animation, elapsed)];
}

export function getSpriteCropStyles(
  sheet: SpriteSheetDefinition,
  crop: SpriteCrop,
  frame: CropFrame
): { containerStyle: ViewStyle; imageStyle: ImageStyle } {
  const scaleX = frame.width / crop.width;
  const scaleY = frame.height / crop.height;

  return {
    containerStyle: {
      width: frame.width,
      height: frame.height,
      overflow: "hidden",
    },
    imageStyle: {
      position: "absolute",
      width: sheet.width * scaleX,
      height: sheet.height * scaleY,
      left: -crop.x * scaleX,
      top: -crop.y * scaleY,
    },
  };
}

export function resolveLocalSheet(image: ImageSourcePropType): SpriteSheetDefinition {
  const resolved = Image.resolveAssetSource(image);

  return {
    source: image,
    width: resolved?.width ?? 1,
    height: resolved?.height ?? 1,
  };
}

export function getSpriteSourceCropStyles(
  image: ImageSourcePropType,
  crop: SpriteCrop,
  frame: CropFrame
): { containerStyle: ViewStyle; imageStyle: ImageStyle } {
  return getSpriteCropStyles(resolveLocalSheet(image), crop, frame);
}
