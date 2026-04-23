import type { ImageSourcePropType } from "react-native";

import type {
  ArcadeCroppedSpriteAsset,
  ArcadeDirectSpriteAsset,
  ArcadeParallaxLayerAsset,
  ArcadeRenderableAsset,
  HeroAnimationState,
  HeroPoseKey,
  SpriteCrop as SharedSpriteCrop,
  SpriteSheetDefinition,
} from "@/types/arcade";
import {
  cleanHeroCrops,
  creatureSpriteCrops,
  environmentDecorCrops,
  getHeroAnimationPoseKey,
  worldPropCrops,
} from "@/utils/spriteCrop";

export type HeroPose =
  | "idle"
  | "run1"
  | "run2"
  | "jump"
  | "land"
  | "crouch"
  | "climb"
  | "hurt"
  | "celebrate"
  | "jackpotPower";

export type SpriteCrop = SharedSpriteCrop;

export type CroppedSpriteSource = {
  type: "sheet";
  image: ImageSourcePropType;
  crop: SpriteCrop;
};

export type DirectSpriteSource = {
  type: "direct";
  image: ImageSourcePropType;
};

export type SpriteSource = CroppedSpriteSource | DirectSpriteSource;

interface ArcadeAssetOptions {
  placeholder?: boolean;
  swapHint?: string;
}

const characterTransparentSheetImage = require("@/assets/arcade/character-transparent-sheet.png") as ImageSourcePropType;
const environmentSheetImage = require("@/assets/arcade/environment-sheet.png") as ImageSourcePropType;
const bossCreatureSheetImage = require("@/assets/arcade/boss-croc.png") as ImageSourcePropType;
const heroMainTransparentImage = require("@/assets/arcade/hero-main-transparent.webp") as ImageSourcePropType;
const heroMainLitImage = require("@/assets/arcade/hero-main-lit.webp") as ImageSourcePropType;
const vrunReferenceImage = require("@/assets/arcade/vrun-reference.png") as ImageSourcePropType;
const jungleVaultPanoramaImage = require("@/assets/arcade/jungle-vault-bg-panorama.png") as ImageSourcePropType;
const jungleVaultEmeraldImage = require("@/assets/arcade/jungle-vault-bg-emerald.png") as ImageSourcePropType;
const jungleVaultAmethystImage = require("@/assets/arcade/jungle-vault-bg-amethyst.png") as ImageSourcePropType;
const jungleVaultGoldImage = require("@/assets/arcade/jungle-vault-bg-gold.png") as ImageSourcePropType;
const classicJungleBannerImage = require("@/assets/arcade/classic-jungle-banner.png") as ImageSourcePropType;
const gothtechnologyBannerImage = require("@/assets/arcade/gothtechnology-banner.png") as ImageSourcePropType;

const sheet = (source: ImageSourcePropType, width: number, height: number): SpriteSheetDefinition => ({
  source,
  width,
  height,
});

const directSource = (image: ImageSourcePropType): DirectSpriteSource => ({
  type: "direct",
  image,
});

const cropSource = (image: ImageSourcePropType, crop: SpriteCrop): CroppedSpriteSource => ({
  type: "sheet",
  image,
  crop,
});

const directAsset = (
  image: SpriteSheetDefinition,
  options: ArcadeAssetOptions = {}
): ArcadeDirectSpriteAsset => ({
  renderMode: "direct",
  image,
  ...options,
});

const croppedAsset = (
  sheetDefinition: SpriteSheetDefinition,
  crop: SpriteCrop,
  options: ArcadeAssetOptions = {}
): ArcadeCroppedSpriteAsset => ({
  renderMode: "crop",
  sheet: sheetDefinition,
  crop,
  ...options,
});

const conceptSwapHint = "Replace this concept-driven crop with an exported transparent PNG when final sprite art is ready.";

export const arcadeSheets = {
  hero: sheet(characterTransparentSheetImage, 1536, 1024),
  heroClean: sheet(heroMainTransparentImage, 1280, 720),
  boss: sheet(characterTransparentSheetImage, 1536, 1024),
  creatures: sheet(bossCreatureSheetImage, 1254, 1254),
  backgroundFar: sheet(environmentSheetImage, 1448, 1086),
  backgroundMid: sheet(environmentSheetImage, 1448, 1086),
  backgroundNear: sheet(environmentSheetImage, 1448, 1086),
  jungleVaultPanorama: sheet(jungleVaultPanoramaImage, 1920, 720),
  jungleVaultEmerald: sheet(jungleVaultEmeraldImage, 1920, 720),
  jungleVaultAmethyst: sheet(jungleVaultAmethystImage, 1920, 720),
  jungleVaultGold: sheet(jungleVaultGoldImage, 1920, 720),
  environmentDecor: sheet(environmentSheetImage, 1448, 1086),
  platform: sheet(characterTransparentSheetImage, 1536, 1024),
  log: sheet(characterTransparentSheetImage, 1536, 1024),
  puddlePurple: sheet(characterTransparentSheetImage, 1536, 1024),
  puddleGold: sheet(characterTransparentSheetImage, 1536, 1024),
  scorpion: sheet(characterTransparentSheetImage, 1536, 1024),
  gemBlue: sheet(characterTransparentSheetImage, 1536, 1024),
  ringDiamond: sheet(characterTransparentSheetImage, 1536, 1024),
  vaultGoal: sheet(characterTransparentSheetImage, 1536, 1024),
  chest: sheet(characterTransparentSheetImage, 1536, 1024),
  heroPortrait: sheet(heroMainTransparentImage, 1280, 720),
  heroBanner: sheet(heroMainLitImage, 1280, 720),
  preview: sheet(vrunReferenceImage, 1672, 941),
  classicJungleBanner: sheet(classicJungleBannerImage, 896, 1200),
  gothtechnologyBanner: sheet(gothtechnologyBannerImage, 1280, 720),
} as const;

export const ARCADE_ASSETS = {
  backgrounds: {
    far: directSource(jungleVaultPanoramaImage),
    mid: directSource(jungleVaultEmeraldImage),
    near: directSource(jungleVaultAmethystImage),
  },
  hero: {
    masterSheet: heroMainTransparentImage as ImageSourcePropType,
    poses: {
      idle: cropSource(heroMainTransparentImage, cleanHeroCrops.idle),
      run1: cropSource(heroMainTransparentImage, cleanHeroCrops.run1),
      run2: cropSource(heroMainTransparentImage, cleanHeroCrops.run2),
      jump: cropSource(heroMainTransparentImage, cleanHeroCrops.jump),
      land: cropSource(heroMainTransparentImage, cleanHeroCrops.land),
      crouch: cropSource(heroMainTransparentImage, cleanHeroCrops.crouch),
      climb: cropSource(heroMainTransparentImage, cleanHeroCrops.climb),
      hurt: cropSource(heroMainTransparentImage, cleanHeroCrops.hurt),
      celebrate: cropSource(heroMainTransparentImage, cleanHeroCrops.celebrate),
      jackpotPower: cropSource(heroMainTransparentImage, cleanHeroCrops.jackpotPower),
    } satisfies Record<HeroPose, SpriteSource>,
  },
  boss: {
    crocodile: cropSource(bossCreatureSheetImage, creatureSpriteCrops.cyberCrocodile),
  },
  hazards: {
    // TODO: replace these cropped concept sources with clean standalone hazard sprites when available.
    circuitLog: cropSource(characterTransparentSheetImage, worldPropCrops.circuitLog),
    dreamPuddle: cropSource(characterTransparentSheetImage, worldPropCrops.purplePuddle),
    jackpotPuddle: cropSource(characterTransparentSheetImage, worldPropCrops.goldPuddle),
    scorpion: cropSource(bossCreatureSheetImage, creatureSpriteCrops.scorpion),
  },
  pickups: {
    // TODO: replace these cropped concept sources with exported collectible PNGs when available.
    blueGem: cropSource(characterTransparentSheetImage, worldPropCrops.blueGem),
    diamondRing: cropSource(characterTransparentSheetImage, worldPropCrops.diamondRing),
    treasureChest: cropSource(characterTransparentSheetImage, worldPropCrops.treasureChest),
  },
  goal: {
    jackpotVault: cropSource(characterTransparentSheetImage, worldPropCrops.vaultGate),
  },
  promo: {
    spriteSheetPoster: directSource(characterTransparentSheetImage),
    jackpotChasePreview: directSource(vrunReferenceImage),
  },
} as const;

export const arcadeBackgroundArt = {
  far: directAsset(arcadeSheets.jungleVaultPanorama, {
    swapHint: "Wide 2D jungle-vault panorama generated from the supplied background reference.",
  }),
  mid: directAsset(arcadeSheets.jungleVaultEmerald, {
    swapHint: "Emerald jungle-vault variation generated from the supplied background reference.",
  }),
  near: directAsset(arcadeSheets.jungleVaultAmethyst, {
    swapHint: "Amethyst jungle-vault variation generated from the supplied background reference.",
  }),
  gold: directAsset(arcadeSheets.jungleVaultGold, {
    swapHint: "Gold-lit jungle-vault variation generated from the supplied background reference.",
  }),
} as const;

const backgroundLayerSets = {
  jackpotChase: [
    { id: "chase-far", asset: arcadeBackgroundArt.far, parallax: 0.06, opacity: 0.6, verticalOffset: -18, scale: 1.08 },
    { id: "chase-amethyst", asset: arcadeBackgroundArt.near, parallax: 0.14, opacity: 0.34, verticalOffset: -4, scale: 1.08 },
    { id: "chase-gold", asset: arcadeBackgroundArt.gold, parallax: 0.22, opacity: 0.22, verticalOffset: 18, scale: 1.1 },
  ],
  gemRush: [
    { id: "rush-emerald", asset: arcadeBackgroundArt.mid, parallax: 0.08, opacity: 0.58, verticalOffset: -20, scale: 1.08 },
    { id: "rush-vault", asset: arcadeBackgroundArt.far, parallax: 0.18, opacity: 0.3, verticalOffset: 6, scale: 1.1 },
    { id: "rush-gold", asset: arcadeBackgroundArt.gold, parallax: 0.28, opacity: 0.2, verticalOffset: 24, scale: 1.1 },
  ],
} as const satisfies Record<string, readonly ArcadeParallaxLayerAsset[]>;

export const arcadeBackgroundLayerSets = backgroundLayerSets;
export type ArcadeBackgroundVariant = keyof typeof backgroundLayerSets;
export const arcadeBackgroundLayers = arcadeBackgroundLayerSets.jackpotChase;

export const arcadeHeroArt = {
  sourceSheet: arcadeSheets.heroClean,
  identityPortrait: directAsset(arcadeSheets.heroPortrait, {
    placeholder: true,
    swapHint: "Using the latest LottoMind cap-and-jacket mascot as the primary hero identity reference.",
  }),
  poses: {
    idle: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.idle, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    run1: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.run1, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    run2: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.run2, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    jump: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.jump, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    land: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.land, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    crouch: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.crouch, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    climb: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.climb, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    hurt: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.hurt, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    celebrate: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.celebrate, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
    jackpotPower: croppedAsset(arcadeSheets.heroClean, cleanHeroCrops.jackpotPower, {
      swapHint: "Using the supplied transparent mascot cutout as the clean gameplay hero.",
    }),
  } as const satisfies Record<HeroPoseKey, ArcadeRenderableAsset>,
} as const;

export const arcadeBossArt = {
  cyberCrocodile: croppedAsset(arcadeSheets.creatures, creatureSpriteCrops.cyberCrocodile, {
    swapHint: "Using the transparent creature sheet for a cleaner 2D cyber-croc boss.",
  }),
} as const;

export const arcadeObstacleArt = {
  platformTop: croppedAsset(arcadeSheets.platform, worldPropCrops.platform, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  circuitLog: croppedAsset(arcadeSheets.log, worldPropCrops.circuitLog, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  purpleDreamPuddle: croppedAsset(arcadeSheets.puddlePurple, worldPropCrops.purplePuddle, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  goldJackpotPuddle: croppedAsset(arcadeSheets.puddleGold, worldPropCrops.goldPuddle, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  scorpion: croppedAsset(arcadeSheets.creatures, creatureSpriteCrops.scorpion, {
    swapHint: "Using the transparent creature sheet for a cleaner 2D scorpion hazard.",
  }),
} as const;

export const arcadePickupArt = {
  blueGem: croppedAsset(arcadeSheets.gemBlue, worldPropCrops.blueGem, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  diamondRing: croppedAsset(arcadeSheets.ringDiamond, worldPropCrops.diamondRing, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  treasureChest: croppedAsset(arcadeSheets.chest, worldPropCrops.treasureChest, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
} as const;

export const arcadeGoalArt = {
  jackpotVault: croppedAsset(arcadeSheets.vaultGoal, worldPropCrops.vaultGate, {
    placeholder: true,
    swapHint: "Using the transparent vault-gate crop from the current LottoMind cutout sheet.",
  }),
  jackpotChest: arcadePickupArt.treasureChest,
  jackpotRing: arcadePickupArt.diamondRing,
} as const;

export const arcadeSceneArt = {
  junglePanel: croppedAsset(arcadeSheets.environmentDecor, environmentDecorCrops.junglePanel, {
    placeholder: true,
    swapHint: "Using the environment sheet jungle panel as the distant backdrop layer.",
  }),
  circuitTree: croppedAsset(arcadeSheets.environmentDecor, environmentDecorCrops.circuitTree, {
    placeholder: true,
    swapHint: "Using the circuit-tree cutout from the environment sheet as a midground depth layer.",
  }),
  vineGreen: croppedAsset(arcadeSheets.environmentDecor, environmentDecorCrops.vineGreen, {
    placeholder: true,
    swapHint: "Using the hanging vine strip from the environment sheet for 3D foreground depth.",
  }),
  vinePurple: croppedAsset(arcadeSheets.environmentDecor, environmentDecorCrops.vinePurple, {
    placeholder: true,
    swapHint: "Using the purple hanging vine strip from the environment sheet for 3D foreground depth.",
  }),
  platformWide: croppedAsset(arcadeSheets.platform, worldPropCrops.platform, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  platformTall: croppedAsset(arcadeSheets.platform, worldPropCrops.platformTall, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  platformStep: croppedAsset(arcadeSheets.platform, worldPropCrops.platformStep, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  platformLedge: croppedAsset(arcadeSheets.platform, worldPropCrops.platformLedge, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  ruinColumn: croppedAsset(arcadeSheets.platform, worldPropCrops.ruinColumn, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
  mossPatch: croppedAsset(arcadeSheets.platform, worldPropCrops.mossPatch, {
    placeholder: true,
    swapHint: conceptSwapHint,
  }),
} as const;

export const arcadeUiArt = {
  promoBackdrop: directAsset(arcadeSheets.jungleVaultPanorama),
  bossStageReference: directAsset(arcadeSheets.jungleVaultAmethyst),
  quickPlayBanner: directAsset(arcadeSheets.jungleVaultEmerald),
  classicJungleBanner: directAsset(arcadeSheets.classicJungleBanner),
  gothtechnologyBanner: directAsset(arcadeSheets.gothtechnologyBanner),
  mascotReference: arcadeHeroArt.identityPortrait,
} as const;

export const arcadeAssetRegistry = {
  backgrounds: arcadeBackgroundArt,
  hero: arcadeHeroArt,
  boss: arcadeBossArt,
  obstacles: arcadeObstacleArt,
  pickups: arcadePickupArt,
  goal: arcadeGoalArt,
  ui: arcadeUiArt,
} as const;

export function getHeroPoseAsset(animation: HeroAnimationState, elapsed: number): ArcadeRenderableAsset {
  const poseKey = getHeroAnimationPoseKey(animation, elapsed);

  return arcadeHeroArt.poses[poseKey];
}
