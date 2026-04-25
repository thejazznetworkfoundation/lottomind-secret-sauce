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
  environmentDecorCrops,
  getHeroAnimationPoseKey,
} from "@/utils/spriteCrop";

export type HeroPose =
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
const brandedJungleBackgroundImage = require("@/assets/arcade/branded/jungle-biome-background.jpg") as ImageSourcePropType;
const brandedHeroIdleImage = require("@/assets/arcade/branded/hero-idle.png") as ImageSourcePropType;
const brandedHeroRun1Image = require("@/assets/arcade/branded/hero-run1.png") as ImageSourcePropType;
const brandedHeroRun2Image = require("@/assets/arcade/branded/hero-run2.png") as ImageSourcePropType;
const brandedHeroJumpImage = require("@/assets/arcade/branded/hero-jump.png") as ImageSourcePropType;
const brandedHeroLandImage = require("@/assets/arcade/branded/hero-land.png") as ImageSourcePropType;
const brandedHeroCrouchImage = require("@/assets/arcade/branded/hero-crouch.png") as ImageSourcePropType;
const brandedHeroClimbImage = require("@/assets/arcade/branded/hero-climb.png") as ImageSourcePropType;
const brandedHeroHurtImage = require("@/assets/arcade/branded/hero-hurt.png") as ImageSourcePropType;
const brandedHeroCelebrateImage = require("@/assets/arcade/branded/hero-celebrate.png") as ImageSourcePropType;
const brandedHeroJackpotPowerImage = require("@/assets/arcade/branded/hero-jackpot-power.png") as ImageSourcePropType;
const brandedVillainMaskKeeperImage = require("@/assets/arcade/branded/villain-mask-keeper.png") as ImageSourcePropType;
const brandedPlatformImage = require("@/assets/arcade/branded/platform.png") as ImageSourcePropType;
const brandedPlatformTallImage = require("@/assets/arcade/branded/platform-tall.png") as ImageSourcePropType;
const brandedPlatformStepImage = require("@/assets/arcade/branded/platform-step.png") as ImageSourcePropType;
const brandedPlatformLedgeImage = require("@/assets/arcade/branded/platform-ledge.png") as ImageSourcePropType;
const brandedRuinColumnImage = require("@/assets/arcade/branded/ruin-column.png") as ImageSourcePropType;
const brandedMossPatchImage = require("@/assets/arcade/branded/moss-patch.png") as ImageSourcePropType;
const brandedCircuitLogImage = require("@/assets/arcade/branded/circuit-log.png") as ImageSourcePropType;
const brandedPurplePuddleImage = require("@/assets/arcade/branded/purple-dream-puddle.png") as ImageSourcePropType;
const brandedGoldPuddleImage = require("@/assets/arcade/branded/gold-jackpot-puddle.png") as ImageSourcePropType;
const brandedScorpionImage = require("@/assets/arcade/branded/scorpion.png") as ImageSourcePropType;
const brandedBlueGemImage = require("@/assets/arcade/branded/blue-gem.png") as ImageSourcePropType;
const brandedDiamondRingImage = require("@/assets/arcade/branded/diamond-ring.png") as ImageSourcePropType;
const brandedTreasureChestImage = require("@/assets/arcade/branded/treasure-chest.png") as ImageSourcePropType;
const brandedVaultGoalImage = require("@/assets/arcade/branded/vault-goal.png") as ImageSourcePropType;
const brandedLadderImage = require("@/assets/arcade/branded/ladder.png") as ImageSourcePropType;
const brandedVinePurpleImage = require("@/assets/arcade/branded/vine-purple.png") as ImageSourcePropType;
const brandedVineGoldImage = require("@/assets/arcade/branded/vine-gold.png") as ImageSourcePropType;
const brandedVineGreenImage = require("@/assets/arcade/branded/vine-green.png") as ImageSourcePropType;

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
  brandedJungleBackground: sheet(brandedJungleBackgroundImage, 798, 390),
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
  brandedHeroIdle: sheet(brandedHeroIdleImage, 82, 162),
  brandedHeroRun1: sheet(brandedHeroRun1Image, 181, 164),
  brandedHeroRun2: sheet(brandedHeroRun2Image, 199, 174),
  brandedHeroJump: sheet(brandedHeroJumpImage, 212, 188),
  brandedHeroFall: sheet(brandedHeroLandImage, 93, 161),
  brandedHeroLand: sheet(brandedHeroLandImage, 93, 161),
  brandedHeroCrouch: sheet(brandedHeroCrouchImage, 135, 127),
  brandedHeroClimb: sheet(brandedHeroClimbImage, 150, 182),
  brandedHeroSwing: sheet(brandedHeroJumpImage, 212, 188),
  brandedHeroHurt: sheet(brandedHeroHurtImage, 163, 147),
  brandedHeroCelebrate: sheet(brandedHeroCelebrateImage, 166, 150),
  brandedHeroJackpotPower: sheet(brandedHeroJackpotPowerImage, 205, 163),
  brandedVillainMaskKeeper: sheet(brandedVillainMaskKeeperImage, 496, 532),
  brandedPlatform: sheet(brandedPlatformImage, 217, 133),
  brandedPlatformTall: sheet(brandedPlatformTallImage, 130, 148),
  brandedPlatformStep: sheet(brandedPlatformStepImage, 169, 147),
  brandedPlatformLedge: sheet(brandedPlatformLedgeImage, 298, 157),
  brandedRuinColumn: sheet(brandedRuinColumnImage, 136, 282),
  brandedMossPatch: sheet(brandedMossPatchImage, 107, 93),
  brandedCircuitLog: sheet(brandedCircuitLogImage, 222, 186),
  brandedPurplePuddle: sheet(brandedPurplePuddleImage, 219, 212),
  brandedGoldPuddle: sheet(brandedGoldPuddleImage, 200, 188),
  brandedScorpion: sheet(brandedScorpionImage, 209, 205),
  brandedBlueGem: sheet(brandedBlueGemImage, 125, 124),
  brandedDiamondRing: sheet(brandedDiamondRingImage, 105, 138),
  brandedTreasureChest: sheet(brandedTreasureChestImage, 167, 159),
  brandedVaultGoal: sheet(brandedVaultGoalImage, 146, 221),
  brandedLadder: sheet(brandedLadderImage, 112, 167),
  brandedVinePurple: sheet(brandedVinePurpleImage, 49, 484),
  brandedVineGold: sheet(brandedVineGoldImage, 45, 732),
  brandedVineGreen: sheet(brandedVineGreenImage, 65, 728),
} as const;

export const ARCADE_ASSETS = {
  backgrounds: {
    far: directSource(jungleVaultPanoramaImage),
    mid: directSource(jungleVaultEmeraldImage),
    near: directSource(jungleVaultAmethystImage),
  },
  hero: {
    masterSheet: brandedHeroIdleImage as ImageSourcePropType,
    poses: {
      idle: directSource(brandedHeroIdleImage),
      run1: directSource(brandedHeroRun1Image),
      run2: directSource(brandedHeroRun2Image),
      jump: directSource(brandedHeroJumpImage),
      fall: directSource(brandedHeroLandImage),
      land: directSource(brandedHeroLandImage),
      crouch: directSource(brandedHeroCrouchImage),
      climb: directSource(brandedHeroClimbImage),
      swing: directSource(brandedHeroJumpImage),
      hurt: directSource(brandedHeroHurtImage),
      celebrate: directSource(brandedHeroCelebrateImage),
      jackpotPower: directSource(brandedHeroJackpotPowerImage),
    } satisfies Record<HeroPose, SpriteSource>,
  },
  boss: {
    crocodile: directSource(brandedVillainMaskKeeperImage),
  },
  hazards: {
    circuitLog: directSource(brandedCircuitLogImage),
    dreamPuddle: directSource(brandedPurplePuddleImage),
    jackpotPuddle: directSource(brandedGoldPuddleImage),
    scorpion: directSource(brandedScorpionImage),
  },
  pickups: {
    blueGem: directSource(brandedBlueGemImage),
    diamondRing: directSource(brandedDiamondRingImage),
    treasureChest: directSource(brandedTreasureChestImage),
  },
  goal: {
    jackpotVault: directSource(brandedVaultGoalImage),
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
  assetPackJungle: directAsset(arcadeSheets.brandedJungleBackground, {
    swapHint: "Jungle biome background supplied in the new arcade environment asset pack.",
  }),
} as const;

const backgroundLayerSets = {
  jackpotChase: [
    { id: "chase-asset-pack-jungle", asset: arcadeBackgroundArt.assetPackJungle, parallax: 0.04, opacity: 0.62, verticalOffset: -26, scale: 1.2 },
    { id: "chase-amethyst", asset: arcadeBackgroundArt.near, parallax: 0.14, opacity: 0.34, verticalOffset: -4, scale: 1.08 },
    { id: "chase-gold", asset: arcadeBackgroundArt.gold, parallax: 0.22, opacity: 0.22, verticalOffset: 18, scale: 1.1 },
  ],
  gemRush: [
    { id: "rush-asset-pack-jungle", asset: arcadeBackgroundArt.assetPackJungle, parallax: 0.05, opacity: 0.7, verticalOffset: -28, scale: 1.22 },
    { id: "rush-emerald", asset: arcadeBackgroundArt.mid, parallax: 0.14, opacity: 0.28, verticalOffset: 4, scale: 1.08 },
    { id: "rush-gold", asset: arcadeBackgroundArt.gold, parallax: 0.28, opacity: 0.2, verticalOffset: 24, scale: 1.1 },
  ],
} as const satisfies Record<string, readonly ArcadeParallaxLayerAsset[]>;

export const arcadeBackgroundLayerSets = backgroundLayerSets;
export type ArcadeBackgroundVariant = keyof typeof backgroundLayerSets;
export const arcadeBackgroundLayers = arcadeBackgroundLayerSets.jackpotChase;

export const arcadeHeroArt = {
  sourceSheet: arcadeSheets.brandedHeroIdle,
  identityPortrait: directAsset(arcadeSheets.brandedHeroIdle, {
    swapHint: "Standalone transparent LottoMind hero sprite exported from the supplied movement set.",
  }),
  poses: {
    idle: directAsset(arcadeSheets.brandedHeroIdle, {
      swapHint: "Standalone transparent LottoMind hero idle sprite.",
    }),
    run1: directAsset(arcadeSheets.brandedHeroRun1, {
      swapHint: "Standalone transparent LottoMind hero run frame.",
    }),
    run2: directAsset(arcadeSheets.brandedHeroRun2, {
      swapHint: "Standalone transparent LottoMind hero speed frame.",
    }),
    jump: directAsset(arcadeSheets.brandedHeroJump, {
      swapHint: "Standalone transparent LottoMind hero jump sprite.",
    }),
    fall: directAsset(arcadeSheets.brandedHeroFall, {
      swapHint: "Standalone transparent LottoMind hero fall sprite.",
    }),
    land: directAsset(arcadeSheets.brandedHeroLand, {
      swapHint: "Standalone transparent LottoMind hero landing sprite.",
    }),
    crouch: directAsset(arcadeSheets.brandedHeroCrouch, {
      swapHint: "Standalone transparent LottoMind hero crouch sprite.",
    }),
    climb: directAsset(arcadeSheets.brandedHeroClimb, {
      swapHint: "Standalone transparent LottoMind hero climb/turnaround sprite.",
    }),
    swing: directAsset(arcadeSheets.brandedHeroSwing, {
      swapHint: "Standalone transparent LottoMind hero swing sprite.",
    }),
    hurt: directAsset(arcadeSheets.brandedHeroHurt, {
      swapHint: "Standalone transparent LottoMind hero hurt sprite.",
    }),
    celebrate: directAsset(arcadeSheets.brandedHeroCelebrate, {
      swapHint: "Standalone transparent LottoMind hero celebrate sprite.",
    }),
    jackpotPower: directAsset(arcadeSheets.brandedHeroJackpotPower, {
      swapHint: "Standalone transparent LottoMind hero power-mode sprite.",
    }),
  } as const satisfies Record<HeroPoseKey, ArcadeRenderableAsset>,
} as const;

export const arcadeBossArt = {
  cyberCrocodile: directAsset(arcadeSheets.brandedVillainMaskKeeper, {
    swapHint: "Standalone transparent villain sprite supplied for Gem Rush and Jackpot Chase pressure stages.",
  }),
} as const;

export const arcadeObstacleArt = {
  platformTop: directAsset(arcadeSheets.brandedPlatform, {
    swapHint: "Standalone transparent platform sprite exported for the LottoMind arcade stages.",
  }),
  circuitLog: directAsset(arcadeSheets.brandedCircuitLog, {
    swapHint: "Standalone transparent circuit-log hazard sprite.",
  }),
  purpleDreamPuddle: directAsset(arcadeSheets.brandedPurplePuddle, {
    swapHint: "Standalone transparent purple dream puddle hazard sprite.",
  }),
  goldJackpotPuddle: directAsset(arcadeSheets.brandedGoldPuddle, {
    swapHint: "Standalone transparent gold jackpot puddle hazard sprite.",
  }),
  scorpion: directAsset(arcadeSheets.brandedScorpion, {
    swapHint: "Standalone transparent scorpion hazard sprite.",
  }),
} as const;

export const arcadePickupArt = {
  blueGem: directAsset(arcadeSheets.brandedBlueGem, {
    swapHint: "Standalone transparent blue gem pickup sprite.",
  }),
  diamondRing: directAsset(arcadeSheets.brandedDiamondRing, {
    swapHint: "Standalone transparent diamond ring pickup sprite.",
  }),
  treasureChest: directAsset(arcadeSheets.brandedTreasureChest, {
    swapHint: "Standalone transparent treasure chest reward sprite.",
  }),
} as const;

export const arcadeGoalArt = {
  jackpotVault: directAsset(arcadeSheets.brandedVaultGoal, {
    swapHint: "Standalone transparent jackpot vault goal sprite.",
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
  vineGreen: directAsset(arcadeSheets.brandedVineGreen, {
    swapHint: "Standalone transparent green vine sprite from the environment asset pack.",
  }),
  vinePurple: directAsset(arcadeSheets.brandedVinePurple, {
    swapHint: "Standalone transparent purple vine sprite from the environment asset pack.",
  }),
  vineGold: directAsset(arcadeSheets.brandedVineGold, {
    swapHint: "Standalone transparent gold vine sprite from the environment asset pack.",
  }),
  ladder: directAsset(arcadeSheets.brandedLadder, {
    swapHint: "Standalone transparent rope ladder sprite from the environment asset pack.",
  }),
  platformWide: directAsset(arcadeSheets.brandedPlatform, {
    swapHint: "Standalone transparent platform sprite exported for the LottoMind arcade stages.",
  }),
  platformTall: directAsset(arcadeSheets.brandedPlatformTall, {
    swapHint: "Standalone transparent tall platform sprite.",
  }),
  platformStep: directAsset(arcadeSheets.brandedPlatformStep, {
    swapHint: "Standalone transparent step platform sprite.",
  }),
  platformLedge: directAsset(arcadeSheets.brandedPlatformLedge, {
    swapHint: "Standalone transparent ledge platform sprite.",
  }),
  ruinColumn: directAsset(arcadeSheets.brandedRuinColumn, {
    swapHint: "Standalone transparent ruin-column sprite.",
  }),
  mossPatch: directAsset(arcadeSheets.brandedMossPatch, {
    swapHint: "Standalone transparent moss patch sprite.",
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
