import { StyleSheet, View } from "react-native";

import { arcadeBackgroundLayerSets, arcadeSceneArt, type ArcadeBackgroundVariant } from "@/constants/arcadeAssets";
import type { ArcadeRenderableAsset } from "@/types/arcade";

import { ArcadeSprite } from "./ArcadeSprite";

interface ArcadeParallaxProps {
  backgroundVariant?: ArcadeBackgroundVariant;
  cameraX: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface LayerProps {
  id: string;
  asset: ArcadeRenderableAsset;
  cameraX: number;
  parallax: number;
  opacity: number;
  viewportWidth: number;
  viewportHeight: number;
  verticalOffset?: number;
  scale?: number;
}

interface DecorSprite {
  id: string;
  asset: ArcadeRenderableAsset;
  worldX: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  parallax: number;
  depthOffsetX?: number;
  depthOffsetY?: number;
  depthOpacity?: number;
}

const circuitTreeDecor: readonly DecorSprite[] = [
  { id: "tree-0", asset: arcadeSceneArt.circuitTree, worldX: -120, y: 54, width: 286, height: 374, opacity: 0.18, parallax: 0.14, depthOffsetX: 8, depthOffsetY: 16, depthOpacity: 0.14 },
  { id: "tree-1", asset: arcadeSceneArt.circuitTree, worldX: 430, y: 40, width: 312, height: 402, opacity: 0.2, parallax: 0.15, depthOffsetX: 8, depthOffsetY: 16, depthOpacity: 0.14 },
  { id: "tree-2", asset: arcadeSceneArt.circuitTree, worldX: 1040, y: 48, width: 294, height: 388, opacity: 0.18, parallax: 0.16, depthOffsetX: 8, depthOffsetY: 16, depthOpacity: 0.14 },
  { id: "tree-3", asset: arcadeSceneArt.circuitTree, worldX: 1680, y: 32, width: 330, height: 416, opacity: 0.22, parallax: 0.17, depthOffsetX: 10, depthOffsetY: 18, depthOpacity: 0.16 },
  { id: "tree-4", asset: arcadeSceneArt.circuitTree, worldX: 2360, y: 44, width: 300, height: 394, opacity: 0.18, parallax: 0.15, depthOffsetX: 8, depthOffsetY: 16, depthOpacity: 0.14 },
  { id: "tree-5", asset: arcadeSceneArt.circuitTree, worldX: 2960, y: 28, width: 334, height: 424, opacity: 0.24, parallax: 0.18, depthOffsetX: 10, depthOffsetY: 18, depthOpacity: 0.18 },
  { id: "tree-6", asset: arcadeSceneArt.circuitTree, worldX: 3620, y: 44, width: 296, height: 396, opacity: 0.2, parallax: 0.16, depthOffsetX: 8, depthOffsetY: 16, depthOpacity: 0.16 },
  { id: "tree-7", asset: arcadeSceneArt.circuitTree, worldX: 4300, y: 34, width: 322, height: 412, opacity: 0.22, parallax: 0.17, depthOffsetX: 10, depthOffsetY: 18, depthOpacity: 0.18 },
  { id: "tree-8", asset: arcadeSceneArt.circuitTree, worldX: 5020, y: 52, width: 286, height: 380, opacity: 0.18, parallax: 0.14, depthOffsetX: 8, depthOffsetY: 16, depthOpacity: 0.14 },
  { id: "tree-9", asset: arcadeSceneArt.circuitTree, worldX: 5710, y: 28, width: 334, height: 424, opacity: 0.22, parallax: 0.18, depthOffsetX: 10, depthOffsetY: 18, depthOpacity: 0.18 },
];

const hangingVines: readonly DecorSprite[] = [
  { id: "vine-0", asset: arcadeSceneArt.vineGreen, worldX: 60, y: -18, width: 74, height: 286, opacity: 0.56, parallax: 0.32 },
  { id: "vine-1", asset: arcadeSceneArt.vinePurple, worldX: 244, y: -8, width: 68, height: 252, opacity: 0.5, parallax: 0.36 },
  { id: "vine-2", asset: arcadeSceneArt.vineGold, worldX: 620, y: -26, width: 72, height: 306, opacity: 0.5, parallax: 0.34 },
  { id: "vine-3", asset: arcadeSceneArt.vinePurple, worldX: 980, y: -16, width: 68, height: 258, opacity: 0.48, parallax: 0.38 },
  { id: "vine-4", asset: arcadeSceneArt.vineGreen, worldX: 1320, y: -8, width: 82, height: 274, opacity: 0.52, parallax: 0.34 },
  { id: "vine-5", asset: arcadeSceneArt.vinePurple, worldX: 1750, y: -34, width: 68, height: 300, opacity: 0.52, parallax: 0.4 },
  { id: "vine-6", asset: arcadeSceneArt.vineGold, worldX: 2150, y: -18, width: 70, height: 298, opacity: 0.52, parallax: 0.33 },
  { id: "vine-7", asset: arcadeSceneArt.vinePurple, worldX: 2580, y: -12, width: 72, height: 278, opacity: 0.5, parallax: 0.38 },
  { id: "vine-8", asset: arcadeSceneArt.vineGreen, worldX: 3020, y: -24, width: 84, height: 304, opacity: 0.56, parallax: 0.35 },
  { id: "vine-9", asset: arcadeSceneArt.vinePurple, worldX: 3470, y: -18, width: 70, height: 270, opacity: 0.48, parallax: 0.39 },
  { id: "vine-10", asset: arcadeSceneArt.vineGold, worldX: 3900, y: -20, width: 70, height: 300, opacity: 0.52, parallax: 0.34 },
  { id: "vine-11", asset: arcadeSceneArt.vinePurple, worldX: 4315, y: -10, width: 68, height: 256, opacity: 0.48, parallax: 0.4 },
  { id: "vine-12", asset: arcadeSceneArt.vineGreen, worldX: 4800, y: -16, width: 86, height: 290, opacity: 0.54, parallax: 0.35 },
  { id: "vine-13", asset: arcadeSceneArt.vinePurple, worldX: 5300, y: -30, width: 70, height: 302, opacity: 0.52, parallax: 0.4 },
  { id: "vine-14", asset: arcadeSceneArt.vineGreen, worldX: 5870, y: -12, width: 82, height: 274, opacity: 0.54, parallax: 0.34 },
];

const foregroundRuins: readonly DecorSprite[] = [
  { id: "ruin-0", asset: arcadeSceneArt.ruinColumn, worldX: -40, y: 330, width: 128, height: 166, opacity: 0.18, parallax: 0.74, depthOffsetX: 10, depthOffsetY: 16, depthOpacity: 0.16 },
  { id: "ruin-1", asset: arcadeSceneArt.mossPatch, worldX: 300, y: 420, width: 130, height: 72, opacity: 0.3, parallax: 0.88 },
  { id: "ruin-2", asset: arcadeSceneArt.ruinColumn, worldX: 880, y: 324, width: 136, height: 176, opacity: 0.2, parallax: 0.78, depthOffsetX: 10, depthOffsetY: 16, depthOpacity: 0.16 },
  { id: "ruin-3", asset: arcadeSceneArt.mossPatch, worldX: 1380, y: 418, width: 140, height: 76, opacity: 0.3, parallax: 0.9 },
  { id: "ruin-4", asset: arcadeSceneArt.ruinColumn, worldX: 2020, y: 332, width: 124, height: 162, opacity: 0.18, parallax: 0.74, depthOffsetX: 10, depthOffsetY: 16, depthOpacity: 0.16 },
  { id: "ruin-5", asset: arcadeSceneArt.mossPatch, worldX: 2550, y: 418, width: 148, height: 78, opacity: 0.32, parallax: 0.92 },
  { id: "ruin-6", asset: arcadeSceneArt.ruinColumn, worldX: 3210, y: 326, width: 132, height: 170, opacity: 0.18, parallax: 0.76, depthOffsetX: 10, depthOffsetY: 16, depthOpacity: 0.16 },
  { id: "ruin-7", asset: arcadeSceneArt.mossPatch, worldX: 3820, y: 420, width: 138, height: 76, opacity: 0.3, parallax: 0.9 },
  { id: "ruin-8", asset: arcadeSceneArt.ruinColumn, worldX: 4460, y: 330, width: 128, height: 166, opacity: 0.18, parallax: 0.76, depthOffsetX: 10, depthOffsetY: 16, depthOpacity: 0.16 },
  { id: "ruin-9", asset: arcadeSceneArt.mossPatch, worldX: 5070, y: 418, width: 146, height: 80, opacity: 0.32, parallax: 0.92 },
  { id: "ruin-10", asset: arcadeSceneArt.ruinColumn, worldX: 5720, y: 326, width: 130, height: 170, opacity: 0.18, parallax: 0.76, depthOffsetX: 10, depthOffsetY: 16, depthOpacity: 0.16 },
];

function Layer({
  id,
  asset,
  cameraX,
  parallax,
  opacity,
  viewportWidth,
  viewportHeight,
  verticalOffset = 0,
  scale = 1,
}: LayerProps) {
  const layerWidth = viewportWidth * 1.45;
  const layerHeight = viewportHeight * scale;
  const offset = -((cameraX * parallax) % layerWidth);

  return (
    <View pointerEvents="none" style={styles.fill}>
      {[0, 1, 2].map((index) => (
        <ArcadeSprite
          key={`${id}-${index}`}
          asset={asset}
          x={offset + layerWidth * index - layerWidth * 0.5}
          y={verticalOffset}
          width={layerWidth}
          height={layerHeight}
          opacity={opacity}
          zIndex={0}
        />
      ))}
    </View>
  );
}

function DecorLayer({
  cameraX,
  viewportWidth,
  viewportHeight,
  decor,
}: {
  cameraX: number;
  viewportWidth: number;
  viewportHeight: number;
  decor: readonly DecorSprite[];
}) {
  return (
    <View pointerEvents="none" style={styles.fill}>
      {decor.map((item) => {
        const left = item.worldX - cameraX * item.parallax;

        if (left + item.width < -220 || left > viewportWidth + 220 || item.y > viewportHeight + 180) {
          return null;
        }

        return (
          <ArcadeSprite
            key={item.id}
            asset={item.asset}
            x={left}
            y={item.y}
            width={item.width}
            height={item.height}
            opacity={item.opacity}
            zIndex={0}
            depthOffsetX={item.depthOffsetX}
            depthOffsetY={item.depthOffsetY}
            depthOpacity={item.depthOpacity}
          />
        );
      })}
    </View>
  );
}

export function ArcadeParallax({
  backgroundVariant = "jackpotChase",
  cameraX,
  viewportWidth,
  viewportHeight,
}: ArcadeParallaxProps) {
  const backgroundLayers = arcadeBackgroundLayerSets[backgroundVariant];
  const isGemRush = backgroundVariant === "gemRush";

  return (
    <View pointerEvents="none" style={styles.root}>
      {backgroundLayers.map((layer) => (
        <Layer
          key={layer.id}
          id={layer.id}
          asset={layer.asset}
          cameraX={cameraX}
          parallax={layer.parallax}
          opacity={layer.opacity}
          viewportWidth={viewportWidth}
          viewportHeight={viewportHeight}
          verticalOffset={layer.verticalOffset}
          scale={layer.scale}
        />
      ))}

      <DecorLayer cameraX={cameraX} viewportWidth={viewportWidth} viewportHeight={viewportHeight} decor={circuitTreeDecor} />
      <DecorLayer cameraX={cameraX} viewportWidth={viewportWidth} viewportHeight={viewportHeight} decor={hangingVines} />
      <DecorLayer cameraX={cameraX} viewportWidth={viewportWidth} viewportHeight={viewportHeight} decor={foregroundRuins} />

      <View style={[styles.topGlow, isGemRush ? styles.topGlowRush : styles.topGlowChase]} />
      <View style={[styles.secondaryGlow, isGemRush ? styles.secondaryGlowRush : styles.secondaryGlowChase]} />
      <View style={[styles.floorBloom, isGemRush ? styles.floorBloomRush : styles.floorBloomChase]} />
      <View style={styles.bottomShade} />
      <View style={styles.sideVignetteLeft} />
      <View style={styles.sideVignetteRight} />
      <View style={styles.gridTint} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020611",
  },
  topGlow: {
    position: "absolute",
    left: -140,
    right: -120,
    top: -110,
    height: 250,
    backgroundColor: "#7d2cff",
    opacity: 0.14,
    borderRadius: 220,
  },
  topGlowChase: {
    backgroundColor: "#7d2cff",
    opacity: 0.1,
  },
  topGlowRush: {
    backgroundColor: "#18f0b0",
    opacity: 0.12,
  },
  secondaryGlow: {
    position: "absolute",
    left: 120,
    right: 120,
    top: 40,
    height: 180,
    borderRadius: 180,
    backgroundColor: "#39d7ff",
    opacity: 0.08,
  },
  secondaryGlowChase: {
    backgroundColor: "#39d7ff",
    opacity: 0.07,
  },
  secondaryGlowRush: {
    backgroundColor: "#ffcf6a",
    opacity: 0.08,
  },
  floorBloom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 42,
    height: 210,
    backgroundColor: "#0c322c",
    opacity: 0.18,
  },
  floorBloomChase: {
    backgroundColor: "#241648",
    opacity: 0.16,
  },
  floorBloomRush: {
    backgroundColor: "#0d3c2a",
    opacity: 0.2,
  },
  bottomShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 250,
    backgroundColor: "#010307",
    opacity: 0.56,
  },
  sideVignetteLeft: {
    position: "absolute",
    left: -40,
    top: 0,
    bottom: 0,
    width: 140,
    backgroundColor: "#000",
    opacity: 0.18,
  },
  sideVignetteRight: {
    position: "absolute",
    right: -40,
    top: 0,
    bottom: 0,
    width: 140,
    backgroundColor: "#000",
    opacity: 0.18,
  },
  gridTint: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255, 201, 95, 0.06)",
    borderWidth: 1,
  },
});
