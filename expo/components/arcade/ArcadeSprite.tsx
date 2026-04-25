import { memo } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Platform, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import type { SpriteSource } from "@/constants/arcadeAssets";
import type { ArcadeRenderableAsset } from "@/types/arcade";
import { getSpriteCropStyles, getSpriteSourceCropStyles } from "@/utils/spriteCrop";

const pixelArtImageStyle =
  Platform.OS === "web"
    ? ({
        imageRendering: "pixelated",
      } as never)
    : null;

interface ArcadeSpriteProps {
  asset?: ArcadeRenderableAsset;
  source?: SpriteSource;
  x: number;
  y: number;
  width: number;
  height: number;
  flipX?: boolean;
  opacity?: number;
  zIndex?: number;
  glowColor?: string;
  depthOffsetX?: number;
  depthOffsetY?: number;
  depthOpacity?: number;
  depthScale?: number;
  style?: StyleProp<ViewStyle>;
}

function ArcadeSpriteComponent({
  asset,
  source,
  x,
  y,
  width,
  height,
  flipX = false,
  opacity = 1,
  zIndex = 1,
  glowColor,
  depthOffsetX = 0,
  depthOffsetY = 0,
  depthOpacity = 0,
  depthScale = 1.02,
  style,
}: ArcadeSpriteProps) {
  const cropStyles = source
    ? source.type === "sheet"
      ? getSpriteSourceCropStyles(source.image, source.crop, {
        width,
        height,
      })
      : null
    : asset?.renderMode === "crop"
      ? getSpriteCropStyles(asset.sheet, asset.crop, {
          width,
          height,
        })
      : null;

  const imageSource = source
    ? source.image
    : asset?.renderMode === "crop"
      ? asset.sheet.source
      : asset?.image.source;

  if (!imageSource) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.frame,
        {
          left: x,
          top: y,
          width,
          height,
          zIndex,
          opacity,
          transform: [{ scaleX: flipX ? -1 : 1 }],
        },
        style,
      ]}
    >
      {depthOpacity > 0 ? (
        <View
          style={[
            styles.depthEcho,
            {
              left: depthOffsetX,
              top: depthOffsetY,
              opacity: depthOpacity,
              transform: [{ scale: depthScale }],
            },
          ]}
        >
          {cropStyles ? (
            <View style={cropStyles.containerStyle}>
              <Image source={imageSource} contentFit="fill" style={[cropStyles.imageStyle, pixelArtImageStyle]} />
            </View>
          ) : (
            <Image source={imageSource} contentFit="fill" style={[StyleSheet.absoluteFillObject, pixelArtImageStyle]} />
          )}
        </View>
      ) : null}
      {glowColor ? <View style={[styles.glow, { backgroundColor: glowColor }]} /> : null}
      {cropStyles ? (
        <View style={cropStyles.containerStyle}>
          <Image source={imageSource} contentFit="fill" style={[cropStyles.imageStyle, pixelArtImageStyle]} />
        </View>
      ) : (
        <Image source={imageSource} contentFit="fill" style={[StyleSheet.absoluteFillObject, pixelArtImageStyle]} />
      )}
    </View>
  );
}

export const ArcadeSprite = memo(ArcadeSpriteComponent);

const styles = StyleSheet.create({
  frame: {
    position: "absolute",
    overflow: "visible",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    opacity: 0.16,
    transform: [{ scale: 1.12 }],
  },
  depthEcho: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
