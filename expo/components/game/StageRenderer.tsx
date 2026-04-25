import { Platform, StyleSheet, View } from "react-native";

import { ArcadeParallax } from "@/components/arcade/ArcadeParallax";
import { ArcadeParticles } from "@/components/arcade/ArcadeParticles";
import { ArcadeSprite } from "@/components/arcade/ArcadeSprite";
import {
  arcadeBossArt,
  arcadeGoalArt,
  arcadeObstacleArt,
  arcadePickupArt,
  arcadeSceneArt,
  getHeroPoseAsset,
} from "@/constants/arcadeAssets";
import { getVisibleEntities } from "@/systems/spawnSystem";
import type { ArcadeRenderableAsset, ArcadeSnapshot, HazardEntity, PickupEntity } from "@/types/arcade";
import type { ArcadeStageDefinition } from "@/types/stage";

interface StageRendererProps {
  stage: ArcadeStageDefinition;
  snapshot: ArcadeSnapshot;
}

interface SpriteVisualSpec {
  asset: ArcadeRenderableAsset;
  width: number;
  height: number;
  glow: string;
  groundOffset: number;
  depthOffsetX?: number;
  depthOffsetY?: number;
  depthOpacity?: number;
}

function getHazardSprite(hazard: HazardEntity): SpriteVisualSpec {
  switch (hazard.kind) {
    case "circuitLog":
      return {
        asset: arcadeObstacleArt.circuitLog,
        width: hazard.width + 44,
        height: hazard.height + 40,
        glow: "#ffc95f",
        groundOffset: 14,
        depthOffsetX: -10,
        depthOffsetY: 14,
        depthOpacity: 0.16,
      };
    case "purpleDreamPuddle":
      return {
        asset: arcadeObstacleArt.purpleDreamPuddle,
        width: hazard.width + 30,
        height: 52,
        glow: "#bf73ff",
        groundOffset: 18,
        depthOffsetX: 0,
        depthOffsetY: 8,
        depthOpacity: 0.08,
      };
    case "goldJackpotPuddle":
      return {
        asset: arcadeObstacleArt.goldJackpotPuddle,
        width: hazard.width + 32,
        height: 54,
        glow: "#ffc95f",
        groundOffset: 18,
        depthOffsetX: 0,
        depthOffsetY: 8,
        depthOpacity: 0.08,
      };
    case "scorpion":
    default:
      return {
        asset: arcadeObstacleArt.scorpion,
        width: hazard.width + 42,
        height: hazard.height + 30,
        glow: "#ff7f77",
        groundOffset: 10,
        depthOffsetX: -8,
        depthOffsetY: 12,
        depthOpacity: 0.14,
      };
  }
}

function getPickupSprite(pickup: PickupEntity): SpriteVisualSpec {
  switch (pickup.kind) {
    case "diamondRing":
      return {
        asset: arcadePickupArt.diamondRing,
        width: 62,
        height: 70,
        glow: "#ffc95f",
        groundOffset: 0,
        depthOffsetX: -4,
        depthOffsetY: 8,
        depthOpacity: 0.14,
      };
    case "treasureReward":
      return {
        asset: arcadePickupArt.treasureChest,
        width: 110,
        height: 82,
        glow: "#ffc95f",
        groundOffset: 0,
        depthOffsetX: -8,
        depthOffsetY: 10,
        depthOpacity: 0.16,
      };
    case "blueGem":
    default:
      return {
        asset: arcadePickupArt.blueGem,
        width: 58,
        height: 62,
        glow: "#68ecff",
        groundOffset: 0,
        depthOffsetX: -4,
        depthOffsetY: 8,
        depthOpacity: 0.14,
      };
  }
}

function ContactShadow({ x, y, width, opacity = 0.22 }: { x: number; y: number; width: number; opacity?: number }) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.contactShadow,
        {
          left: x,
          top: y,
          width,
          opacity,
        },
      ]}
    />
  );
}

function TileStrip({
  asset,
  x,
  y,
  width,
  height,
  tileWidth,
  overlap = 18,
  opacity = 1,
  zIndex = 1,
}: {
  asset: ArcadeRenderableAsset;
  x: number;
  y: number;
  width: number;
  height: number;
  tileWidth: number;
  overlap?: number;
  opacity?: number;
  zIndex?: number;
}) {
  const step = Math.max(40, tileWidth - overlap);
  const count = Math.max(1, Math.ceil((width + overlap) / step));

  return (
    <View
      pointerEvents="none"
      style={[
        styles.tileStrip,
        {
          left: x,
          top: y,
          width,
          height,
          zIndex,
        },
      ]}
    >
      {Array.from({ length: count }, (_, index) => (
        <ArcadeSprite
          key={`${x}-${y}-${index}`}
          asset={asset}
          x={index * step - 8}
          y={0}
          width={tileWidth}
          height={height}
          opacity={opacity}
          zIndex={zIndex}
        />
      ))}
    </View>
  );
}

function PlatformMass({
  left,
  top,
  width,
  variantIndex,
}: {
  left: number;
  top: number;
  width: number;
  variantIndex: number;
}) {
  const visualDepth = Math.max(72, Math.min(116, width * 0.28));
  const supportAsset =
    variantIndex % 3 === 0 ? arcadeSceneArt.ruinColumn : variantIndex % 2 === 0 ? arcadeSceneArt.platformTall : arcadeSceneArt.platformStep;
  const topAsset = width > 210 ? arcadeSceneArt.platformLedge : width > 176 ? arcadeSceneArt.platformWide : arcadeSceneArt.platformTall;
  const supportWidth = width > 220 ? 112 : 88;

  return (
    <>
      <View
        style={[
          styles.platformBackShadow,
          {
            left: left + 18,
            top: top + 16,
            width: width - 12,
            height: visualDepth + 26,
          },
        ]}
      />

      <ArcadeSprite
        asset={supportAsset}
        x={left + Math.max(10, width * 0.1)}
        y={top + 18}
        width={supportWidth}
        height={visualDepth + 86}
        opacity={0.24}
        zIndex={1}
        depthOffsetX={8}
        depthOffsetY={12}
        depthOpacity={0.12}
      />

      {width > 180 ? (
        <ArcadeSprite
          asset={variantIndex % 2 === 0 ? arcadeSceneArt.platformStep : arcadeSceneArt.platformTall}
          x={left + width - supportWidth - 20}
          y={top + 26}
          width={supportWidth - 8}
          height={visualDepth + 78}
          opacity={0.16}
          zIndex={1}
          depthOffsetX={8}
          depthOffsetY={12}
          depthOpacity={0.1}
        />
      ) : null}

      <View
        style={[
          styles.platformBody,
          {
            left,
            top: top + 16,
            width,
            height: visualDepth,
          },
        ]}
      >
        <View style={styles.platformFace} />
        <View style={styles.platformInnerFace} />
        <View style={styles.platformFrontHighlight} />
        <View style={styles.platformSideShade} />
        <View style={styles.platformBottomGlow} />
      </View>

      <TileStrip asset={topAsset} x={left - 4} y={top - 20} width={width + 8} height={52} tileWidth={114} opacity={1} zIndex={3} />

      <ArcadeSprite
        asset={arcadeSceneArt.mossPatch}
        x={left + Math.max(12, width * 0.12)}
        y={top + visualDepth - 10}
        width={Math.min(Math.max(82, width * 0.34), 128)}
        height={50}
        opacity={0.28}
        zIndex={3}
      />
    </>
  );
}

function GroundBlocks({ groundY, snapshot }: { groundY: number; snapshot: ArcadeSnapshot }) {
  const blockWidth = 240;
  const startIndex = Math.max(0, Math.floor(snapshot.cameraX / blockWidth) - 1);
  const endIndex = Math.ceil((snapshot.cameraX + snapshot.viewportWidth) / blockWidth) + 1;

  return (
    <>
      {Array.from({ length: endIndex - startIndex + 1 }, (_, index) => {
        const worldX = (startIndex + index) * blockWidth;
        const left = worldX - snapshot.cameraX;
        const decorVariant = (startIndex + index) % 3;

        return (
          <View
            key={`ground-${worldX}`}
            style={[
              styles.groundBlock,
              {
                left,
                top: groundY + 14,
                width: blockWidth,
                height: snapshot.viewportHeight - groundY + 108,
              },
            ]}
          >
            <View style={styles.groundFace} />
            <View style={styles.groundInnerFace} />
            <View style={styles.groundFrontGloss} />
            <View style={styles.groundSideShade} />
            <TileStrip
              asset={arcadeSceneArt.platformLedge}
              x={-6}
              y={-34}
              width={blockWidth + 12}
              height={66}
              tileWidth={134}
              opacity={1}
              zIndex={2}
            />

            <ArcadeSprite
              asset={decorVariant === 0 ? arcadeSceneArt.ruinColumn : decorVariant === 1 ? arcadeSceneArt.platformTall : arcadeSceneArt.platformStep}
              x={decorVariant === 0 ? 8 : decorVariant === 1 ? 36 : 140}
              y={42}
              width={decorVariant === 0 ? 82 : 92}
              height={decorVariant === 0 ? 118 : 104}
              opacity={0.12}
              zIndex={1}
              depthOffsetX={8}
              depthOffsetY={10}
              depthOpacity={0.1}
            />

            <ArcadeSprite
              asset={arcadeSceneArt.mossPatch}
              x={decorVariant === 2 ? 28 : 126}
              y={58}
              width={74}
              height={36}
              opacity={0.26}
              zIndex={3}
            />
          </View>
        );
      })}
    </>
  );
}

export function StageRenderer({ stage, snapshot }: StageRendererProps) {
  const visiblePlatforms = getVisibleEntities(snapshot.platforms, snapshot.cameraX, snapshot.viewportWidth, 160);
  const visibleLadders = getVisibleEntities(snapshot.ladders, snapshot.cameraX, snapshot.viewportWidth, 160);
  const visibleHazards = getVisibleEntities(snapshot.hazards, snapshot.cameraX, snapshot.viewportWidth, 180);
  const visiblePickups = getVisibleEntities(
    snapshot.pickups.filter((pickup) => !pickup.collected),
    snapshot.cameraX,
    snapshot.viewportWidth,
    200
  );
  const playerAsset = getHeroPoseAsset(snapshot.player.animation, snapshot.elapsed);
  const playerOpacity =
    snapshot.player.invulnerableTimer > 0 && Math.floor(snapshot.elapsed * 16) % 2 === 0 ? 0.56 : 1;
  const backgroundVariant = stage.id === "gem-rush-run" ? "gemRush" : "jackpotChase";

  return (
    <View style={[styles.stage, { width: snapshot.viewportWidth, height: snapshot.viewportHeight }]}>
      <ArcadeParallax
        backgroundVariant={backgroundVariant}
        cameraX={snapshot.cameraX}
        viewportWidth={snapshot.viewportWidth}
        viewportHeight={snapshot.viewportHeight}
      />

      <View pointerEvents="none" style={styles.worldOverlay}>
        <View style={styles.skyGlow} />
        <View style={styles.bossAura} />

        <ArcadeSprite
          asset={arcadeBossArt.cyberCrocodile}
          x={snapshot.boss.x - snapshot.cameraX - 116}
          y={snapshot.boss.y - 88}
          width={snapshot.boss.width * 1.84}
          height={snapshot.boss.height * 1.7}
          zIndex={2}
          opacity={0.98}
          glowColor={snapshot.boss.threat > 0.74 ? "#ffb347" : "#8f35ff"}
          depthOffsetX={-24}
          depthOffsetY={22}
          depthOpacity={0.22}
          depthScale={1.04}
        />
        <ContactShadow
          x={snapshot.boss.x - snapshot.cameraX + 26}
          y={snapshot.boss.y + snapshot.boss.height - 4}
          width={220}
          opacity={0.28}
        />

        <GroundBlocks groundY={stage.groundY} snapshot={snapshot} />

        {visiblePlatforms.map((platform, index) => (
          <PlatformMass
            key={platform.id}
            left={platform.x - snapshot.cameraX}
            top={platform.y}
            width={platform.width}
            variantIndex={index}
          />
        ))}

        {visibleLadders.map((ladder) => (
          <ArcadeSprite
            key={ladder.id}
            asset={arcadeSceneArt.ladder}
            x={ladder.x - snapshot.cameraX - 12}
            y={ladder.y - 8}
            width={ladder.width + 24}
            height={ladder.height + 16}
            zIndex={4}
            glowColor="#D4AF37"
            depthOffsetX={-5}
            depthOffsetY={8}
            depthOpacity={0.14}
          />
        ))}

        {visiblePickups.map((pickup, index) => {
          const sprite = getPickupSprite(pickup);
          const bob = Math.sin(snapshot.elapsed * 4 + index) * 5;

          return (
            <View key={pickup.id}>
              <ContactShadow
                x={pickup.x - snapshot.cameraX + 10}
                y={pickup.y + pickup.height + 10}
                width={pickup.width * 0.72}
                opacity={0.12}
              />
              <ArcadeSprite
                asset={sprite.asset}
                x={pickup.x - snapshot.cameraX - 8}
                y={pickup.y - 10 + bob}
                width={sprite.width}
                height={sprite.height}
                zIndex={7}
                glowColor={sprite.glow}
                depthOffsetX={sprite.depthOffsetX}
                depthOffsetY={sprite.depthOffsetY}
                depthOpacity={sprite.depthOpacity}
              />
            </View>
          );
        })}

        {visibleHazards.map((hazard) => {
          const sprite = getHazardSprite(hazard);
          const renderY = hazard.y - (sprite.height - hazard.height) + sprite.groundOffset;

          return (
            <View key={hazard.id}>
              <ContactShadow
                x={hazard.x - snapshot.cameraX + hazard.width * 0.1}
                y={hazard.y + hazard.height - 4}
                width={hazard.width * 0.8}
              />
              <ArcadeSprite
                asset={sprite.asset}
                x={hazard.x - snapshot.cameraX - (sprite.width - hazard.width) / 2}
                y={renderY}
                width={sprite.width}
                height={sprite.height}
                zIndex={8}
                glowColor={sprite.glow}
                depthOffsetX={sprite.depthOffsetX}
                depthOffsetY={sprite.depthOffsetY}
                depthOpacity={sprite.depthOpacity}
              />
            </View>
          );
        })}

        <View
          style={[
            styles.goalPortal,
            {
              left: snapshot.goal.x - snapshot.cameraX - 56,
              top: snapshot.goal.y - 40,
              width: snapshot.goal.width + 128,
              height: snapshot.goal.height + 118,
              opacity: snapshot.goal.reached ? 0.9 : 1,
            },
          ]}
        />
        <ArcadeSprite
          asset={arcadeGoalArt.jackpotVault}
          x={snapshot.goal.x - snapshot.cameraX - 84}
          y={snapshot.goal.y - 92}
          width={snapshot.goal.width + 242}
          height={snapshot.goal.height + 214}
          zIndex={8}
          opacity={snapshot.goal.reached ? 0.92 : 1}
          glowColor="#ffc95f"
          depthOffsetX={-16}
          depthOffsetY={20}
          depthOpacity={0.18}
          depthScale={1.04}
        />
        <ArcadeSprite
          asset={arcadeGoalArt.jackpotChest}
          x={snapshot.goal.x - snapshot.cameraX + 26}
          y={snapshot.goal.y + 54}
          width={154}
          height={112}
          zIndex={9}
          glowColor="#ffc95f"
          depthOffsetX={-8}
          depthOffsetY={12}
          depthOpacity={0.16}
        />
        <ArcadeSprite
          asset={arcadeGoalArt.jackpotRing}
          x={snapshot.goal.x - snapshot.cameraX + 94}
          y={snapshot.goal.y - 14}
          width={94}
          height={104}
          zIndex={9}
          glowColor="#68ecff"
          depthOffsetX={-4}
          depthOffsetY={8}
          depthOpacity={0.14}
        />

        {snapshot.player.jackpotPowerTimer > 0 ? (
          <View
            style={[
              styles.playerAura,
              {
                left: snapshot.player.x - snapshot.cameraX - 10,
                top: snapshot.player.y - 42,
              },
            ]}
          />
        ) : null}

        <ContactShadow
          x={snapshot.player.x - snapshot.cameraX + 16}
          y={snapshot.player.y + snapshot.player.height - 2}
          width={snapshot.player.width * 0.72}
          opacity={0.28}
        />
        <ArcadeSprite
          asset={playerAsset}
          x={snapshot.player.x - snapshot.cameraX - 16}
          y={snapshot.player.y - 34}
          width={120}
          height={148}
          flipX={snapshot.player.facing < 0}
          opacity={playerOpacity}
          zIndex={10}
          glowColor={snapshot.player.jackpotPowerTimer > 0 ? "#ffc95f" : undefined}
          depthOffsetX={snapshot.player.facing < 0 ? 8 : -8}
          depthOffsetY={12}
          depthOpacity={0.18}
          depthScale={1.03}
        />

        <ArcadeParticles particles={snapshot.particles} cameraX={snapshot.cameraX} />

        <View style={styles.frontVignette} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#02080d",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  worldOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  skyGlow: {
    position: "absolute",
    left: 110,
    top: 10,
    width: 360,
    height: 220,
    borderRadius: 180,
    backgroundColor: "#68ecff",
    opacity: 0.1,
  },
  bossAura: {
    position: "absolute",
    left: -40,
    top: 110,
    width: 340,
    height: 240,
    borderRadius: 180,
    backgroundColor: "#8f35ff",
    opacity: 0.1,
  },
  groundBlock: {
    position: "absolute",
    overflow: "hidden",
  },
  groundFace: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#172116",
  },
  groundInnerFace: {
    ...StyleSheet.absoluteFillObject,
    top: 20,
    backgroundColor: "#29351f",
    opacity: 0.88,
  },
  groundFrontGloss: {
    position: "absolute",
    left: 12,
    right: 14,
    top: 22,
    height: 24,
    borderRadius: 18,
    backgroundColor: "rgba(255, 210, 145, 0.06)",
  },
  groundSideShade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 56,
    backgroundColor: "#030604",
    opacity: 0.42,
  },
  platformBackShadow: {
    position: "absolute",
    borderRadius: 18,
    backgroundColor: "#000",
    opacity: 0.14,
  },
  platformBody: {
    position: "absolute",
    overflow: "hidden",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  platformFace: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#182116",
  },
  platformInnerFace: {
    ...StyleSheet.absoluteFillObject,
    top: 16,
    left: 8,
    right: 8,
    bottom: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "#2b3522",
    opacity: 0.76,
  },
  platformFrontHighlight: {
    position: "absolute",
    left: 14,
    right: 16,
    top: 18,
    height: 18,
    borderRadius: 14,
    backgroundColor: "rgba(203, 255, 146, 0.12)",
  },
  platformSideShade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 44,
    backgroundColor: "#140e0b",
    opacity: 0.34,
  },
  platformBottomGlow: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 4,
    height: 16,
    borderRadius: 12,
    backgroundColor: "rgba(143, 53, 255, 0.16)",
  },
  tileStrip: {
    position: "absolute",
    overflow: "hidden",
  },
  ladder: {
    position: "absolute",
  },
  ladderRail: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 999,
    backgroundColor: "#bca7ff",
  },
  ladderRung: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 3,
    borderRadius: 99,
    backgroundColor: "#69e8ff",
  },
  contactShadow: {
    position: "absolute",
    height: 14,
    borderRadius: 999,
    backgroundColor: "#000",
  },
  goalPortal: {
    position: "absolute",
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "rgba(255, 201, 95, 0.9)",
    backgroundColor: "rgba(255, 201, 95, 0.12)",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 0 26px rgba(255, 201, 95, 0.44)" }
      : {
          shadowColor: "#ffc95f",
          shadowOpacity: 0.44,
          shadowRadius: 26,
          shadowOffset: { width: 0, height: 0 },
        }),
  },
  playerAura: {
    position: "absolute",
    width: 138,
    height: 156,
    borderRadius: 72,
    backgroundColor: "#ffc95f",
    opacity: 0.18,
  },
  frontVignette: {
    position: "absolute",
    left: -20,
    right: -20,
    bottom: -10,
    height: 70,
    backgroundColor: "#020305",
    opacity: 0.22,
  },
});
