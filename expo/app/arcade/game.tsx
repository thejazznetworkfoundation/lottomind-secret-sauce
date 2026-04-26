import { router, useLocalSearchParams } from "expo-router";
import { Pause, Play, RotateCcw, X } from "lucide-react-native";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import BossSprite from "@/components/arcade/BossSprite";
import LegalDisclaimerBar from "@/components/arcade/LegalDisclaimerBar";
import LottoBall from "@/components/arcade/LottoBall";
import ParallaxJungleBackground from "@/components/arcade/ParallaxJungleBackground";
import PlayerSprite from "@/components/arcade/PlayerSprite";
import PowerUpButton from "@/components/arcade/PowerUpButton";
import RewardModal from "@/components/arcade/RewardModal";
import ScoreHud from "@/components/arcade/ScoreHud";
import TouchControls from "@/components/arcade/TouchControls";
import { ARCADE_THEME, DREAM_PATHS, JACKPOT_JUNGLE_STAGES, JACKPOT_JUNGLE_TITLE } from "@/constants/arcadeTheme";
import { useArcadeGame } from "@/hooks/useArcadeGame";
import type { JunglePathChoice, JungleStageId } from "@/types/arcade";

function isStageId(value: string | undefined): value is JungleStageId {
  return JACKPOT_JUNGLE_STAGES.some((stage) => stage.id === value);
}

export default function GameScreen() {
  const params = useLocalSearchParams<{ stage?: string; daily?: string }>();
  const stageId = isStageId(params.stage) ? params.stage : "golden-vine-swing";
  const game = useArcadeGame({ initialStage: stageId, dailyRun: params.daily === "1" });
  const { width } = useWindowDimensions();
  const scale = Math.min(1, (width - 24) / game.viewWidth);
  const canvasWidth = game.viewWidth * scale;
  const canvasHeight = game.viewHeight * scale;

  const visibleEntities = useMemo(() => {
    const isVisible = (x: number, extra = 100) => x > -extra && x < game.viewWidth + extra;
    return {
      balls: game.pattern.balls
        .filter((ball) => !ball.collected)
        .map((ball) => ({ ...ball, screenX: ball.x - game.cameraX }))
        .filter((ball) => isVisible(ball.screenX)),
      hazards: game.pattern.hazards
        .map((hazard) => ({ ...hazard, screenX: hazard.x - game.cameraX }))
        .filter((hazard) => isVisible(hazard.screenX, 130)),
      powerUps: game.pattern.powerUps
        .filter((powerUp) => !powerUp.collected)
        .map((powerUp) => ({ ...powerUp, screenX: powerUp.x - game.cameraX }))
        .filter((powerUp) => isVisible(powerUp.screenX)),
      platforms: game.pattern.platforms
        .map((platform) => ({ ...platform, screenX: platform.x - game.cameraX }))
        .filter((platform) => isVisible(platform.screenX, 260)),
      vines: game.pattern.vines
        .map((vine) => ({ ...vine, screenX: vine.anchorX - game.cameraX }))
        .filter((vine) => isVisible(vine.screenX, 180)),
    };
  }, [game.cameraX, game.pattern, game.viewWidth]);

  const claimAndLeave = async () => {
    await game.claimRewards();
    router.replace("/arcade/stage-map" as never);
  };

  const px = (value: number) => value * scale;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()} accessibilityLabel="Close game">
            <X size={20} color={ARCADE_THEME.gold} />
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.kicker}>LottoMind Arcade</Text>
            <Text style={styles.title}>{JACKPOT_JUNGLE_TITLE}</Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={game.gameStatus === "paused" ? game.resume : game.pause}
            accessibilityLabel={game.gameStatus === "paused" ? "Resume" : "Pause"}
          >
            {game.gameStatus === "paused" ? <Play size={20} color={ARCADE_THEME.gold} /> : <Pause size={20} color={ARCADE_THEME.gold} />}
          </Pressable>
        </View>

        <ScoreHud
          score={game.score}
          creditsEarned={game.creditsEarned}
          health={game.health}
          oxygen={game.oxygen}
          bossDistance={game.bossDistance}
          comboGoldWhite={game.combo.goldWhite}
          comboJackpot={game.combo.jackpot}
          stage={game.stageConfig}
        />

        {game.stageConfig.mechanic === "oracle" && game.gameStatus === "ready" ? (
          <View style={styles.pathRow}>
            {(Object.keys(DREAM_PATHS) as JunglePathChoice[]).map((path) => (
              <Pressable
                key={path}
                style={[styles.pathButton, game.pathChoice === path && { borderColor: DREAM_PATHS[path].color }]}
                onPress={() => game.setPathChoice(path)}
              >
                <Text style={[styles.pathText, { color: DREAM_PATHS[path].color }]}>{DREAM_PATHS[path].label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={[styles.stageFrame, { width: canvasWidth, height: canvasHeight }]}>
          <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
            <ParallaxJungleBackground cameraX={game.cameraX} progress={game.progress} />

            {game.stageConfig.mechanic === "boss" ? (
              <BossSprite
                distance={game.bossDistance}
                width={px(100)}
                height={px(100)}
                style={[styles.boss, { left: px(-34 + (76 - game.bossDistance) * 0.5), top: px(148) }]}
              />
            ) : null}

            {visibleEntities.vines.map((vine) => (
              <View
                key={vine.id}
                style={[
                  styles.vine,
                  {
                    left: px(vine.screenX),
                    top: px(vine.anchorY),
                    height: px(vine.length),
                    transform: [{ rotate: `${vine.angle}rad` }],
                  },
                ]}
              />
            ))}

            {visibleEntities.platforms.map((platform) => (
              <View
                key={platform.id}
                style={[
                  styles.platform,
                  platform.kind === "vault" && styles.vaultPlatform,
                  {
                    left: px(platform.screenX),
                    top: px(platform.y),
                    width: px(platform.width),
                    height: px(platform.height),
                  },
                ]}
              />
            ))}

            {visibleEntities.balls.map((ball) => (
              <LottoBall
                key={ball.id}
                number={ball.number}
                rarity={ball.rarity}
                symbol={ball.symbol}
                size={px(ball.width)}
                style={{ position: "absolute", left: px(ball.screenX), top: px(ball.y) }}
              />
            ))}

            {visibleEntities.powerUps.map((powerUp) => (
              <View
                key={powerUp.id}
                style={[
                  styles.pickup,
                  {
                    left: px(powerUp.screenX),
                    top: px(powerUp.y),
                    width: px(powerUp.width),
                    height: px(powerUp.height),
                    borderRadius: px(powerUp.width / 2),
                  },
                ]}
              >
                <Text style={[styles.pickupText, { fontSize: px(10) }]}>{powerUp.type === "vaultKey" ? "KEY" : "UP"}</Text>
              </View>
            ))}

            {visibleEntities.hazards.map((hazard) => (
              <View
                key={hazard.id}
                style={[
                  styles.hazard,
                  {
                    left: px(hazard.screenX),
                    top: px(hazard.y),
                    width: px(hazard.width),
                    height: px(hazard.height),
                    borderRadius: px(hazard.kind === "jackpotBoulder" ? hazard.width / 2 : 8),
                  },
                ]}
              />
            ))}

            <View style={[styles.vault, { left: px(game.pattern.stageLength - game.cameraX - 150), top: px(218), width: px(120), height: px(94) }]}>
              <Text style={[styles.vaultText, { fontSize: px(14) }]}>VAULT</Text>
            </View>

            <PlayerSprite
              state={game.player.state}
              facing={game.player.facing}
              width={px(58)}
              height={px(78)}
              style={{ position: "absolute", left: px(game.player.x - 8), top: px(game.player.y - 14) }}
            />

            {game.popups.map((popup) => (
              <Text
                key={popup.id}
                style={[
                  styles.popup,
                  {
                    left: px(popup.x),
                    top: px(popup.y),
                    opacity: Math.max(0, popup.ttl),
                    fontSize: px(13),
                  },
                ]}
              >
                {popup.text}
              </Text>
            ))}

            {game.gameStatus === "ready" ? (
              <Pressable style={styles.startOverlay} onPress={game.startGame}>
                <Text style={styles.startTitle}>Start Chase</Text>
                <Text style={styles.startBody}>{game.stageConfig.objective}</Text>
              </Pressable>
            ) : null}

            {game.gameStatus === "paused" ? (
              <View style={styles.pauseOverlay}>
                <Text style={styles.startTitle}>Paused</Text>
                <View style={styles.pauseButtons}>
                  <Pressable style={styles.goldButton} onPress={game.resume}>
                    <Text style={styles.goldButtonText}>Resume</Text>
                  </Pressable>
                  <Pressable style={styles.darkButton} onPress={game.restart}>
                    <RotateCcw size={16} color={ARCADE_THEME.gold} />
                    <Text style={styles.darkButtonText}>Restart</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.powerRow}>
          <PowerUpButton
            type="dreamShield"
            count={game.inventory.dreamShield}
            active={game.activePowerUps.dreamShield}
            onPress={() => game.activatePowerUp("dreamShield")}
          />
          <PowerUpButton
            type="frequencyMagnet"
            count={game.inventory.frequencyMagnet}
            active={game.activePowerUps.frequencyMagnetUntil > Date.now()}
            onPress={() => game.activatePowerUp("frequencyMagnet")}
          />
          <PowerUpButton
            type="hotNumberBoost"
            count={game.inventory.hotNumberBoost}
            active={game.activePowerUps.hotNumberBoostUntil > Date.now()}
            onPress={() => game.activatePowerUp("hotNumberBoost")}
          />
          <PowerUpButton
            type="oracleSlowTime"
            count={game.inventory.oracleSlowTime}
            active={game.activePowerUps.oracleSlowTimeUntil > Date.now()}
            onPress={() => game.activatePowerUp("oracleSlowTime")}
          />
        </View>

        <TouchControls
          stage={game.stageConfig}
          onMove={game.move}
          onJump={game.jump}
          onSlide={game.slide}
          onSwim={game.swim}
          onSpecial={() => game.activatePowerUp("dreamShield")}
          onSwingPressIn={game.startSwingCharge}
          onSwingPressOut={game.releaseSwing}
        />

        <LegalDisclaimerBar />
      </ScrollView>

      <RewardModal
        visible={game.gameStatus === "victory"}
        title="Victory Vault Opened"
        score={game.score}
        credits={game.creditsEarned}
        onContinue={claimAndLeave}
        onRestart={game.restart}
      />
      <RewardModal
        visible={game.gameStatus === "gameOver"}
        title="Chase Ended"
        score={game.score}
        credits={0}
        onContinue={() => router.replace("/arcade/stage-map" as never)}
        onRestart={game.restart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ARCADE_THEME.black,
  },
  scroll: {
    gap: 14,
    padding: 14,
    paddingTop: 54,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.34)",
    backgroundColor: "rgba(5, 5, 5, 0.72)",
  },
  titleBlock: {
    flex: 1,
  },
  kicker: {
    color: ARCADE_THEME.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: ARCADE_THEME.ivory,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0,
  },
  pathRow: {
    flexDirection: "row",
    gap: 8,
  },
  pathButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(5,5,5,0.7)",
    paddingVertical: 10,
  },
  pathText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  stageFrame: {
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.42)",
    backgroundColor: ARCADE_THEME.blackPanel,
  },
  canvas: {
    overflow: "hidden",
  },
  boss: {
    position: "absolute",
    zIndex: 6,
  },
  vine: {
    position: "absolute",
    width: 5,
    borderRadius: 999,
    backgroundColor: ARCADE_THEME.gold,
    shadowColor: ARCADE_THEME.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  platform: {
    position: "absolute",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.48)",
    backgroundColor: "rgba(11, 61, 46, 0.92)",
  },
  vaultPlatform: {
    backgroundColor: "rgba(212, 175, 55, 0.28)",
  },
  hazard: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255, 176, 0, 0.52)",
    backgroundColor: ARCADE_THEME.dangerRed,
  },
  pickup: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: ARCADE_THEME.gold,
    backgroundColor: ARCADE_THEME.purple,
  },
  pickupText: {
    color: ARCADE_THEME.ivory,
    fontWeight: "900",
    letterSpacing: 0,
  },
  vault: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: ARCADE_THEME.gold,
    backgroundColor: "rgba(5, 5, 5, 0.82)",
  },
  vaultText: {
    color: ARCADE_THEME.gold,
    fontWeight: "900",
    letterSpacing: 0,
  },
  popup: {
    position: "absolute",
    color: ARCADE_THEME.gold,
    fontWeight: "900",
    letterSpacing: 0,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  startOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 28,
    backgroundColor: "rgba(0,0,0,0.54)",
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 28,
    backgroundColor: "rgba(0,0,0,0.66)",
  },
  startTitle: {
    color: ARCADE_THEME.gold,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0,
  },
  startBody: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
    textAlign: "center",
    letterSpacing: 0,
  },
  pauseButtons: {
    flexDirection: "row",
    gap: 10,
  },
  goldButton: {
    minWidth: 116,
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: ARCADE_THEME.gold,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  goldButtonText: {
    color: ARCADE_THEME.black,
    fontWeight: "900",
    letterSpacing: 0,
  },
  darkButton: {
    minWidth: 116,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.44)",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  darkButtonText: {
    color: ARCADE_THEME.gold,
    fontWeight: "900",
    letterSpacing: 0,
  },
  powerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
});
