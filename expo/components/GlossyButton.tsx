import React, { useRef, useCallback, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface GlossyButtonProps {
  onPress: () => void;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'green' | 'gold' | 'emerald';
  blink?: boolean;
}

const VARIANTS = {
  green: {
    bg: '#22C55E',
    bgDark: '#15803D',
    border: '#A0A0A0',
    borderOuter: '#6B7280',
    highlight: 'rgba(255, 255, 255, 0.35)',
    highlightBottom: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(34, 197, 94, 0.6)',
    glowOuter: 'rgba(34, 197, 94, 0.25)',
    text: '#FFFFFF',
    shadow: '#22C55E',
  },
  gold: {
    bg: '#D4AF37',
    bgDark: '#8B7425',
    border: '#C0B080',
    borderOuter: '#8B7425',
    highlight: 'rgba(255, 255, 255, 0.4)',
    highlightBottom: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(212, 175, 55, 0.5)',
    glowOuter: 'rgba(212, 175, 55, 0.2)',
    text: '#1A1200',
    shadow: '#D4AF37',
  },
  emerald: {
    bg: '#10B981',
    bgDark: '#065F46',
    border: '#9CA3AF',
    borderOuter: '#4B5563',
    highlight: 'rgba(255, 255, 255, 0.3)',
    highlightBottom: 'rgba(255, 255, 255, 0.06)',
    glow: 'rgba(16, 185, 129, 0.5)',
    glowOuter: 'rgba(16, 185, 129, 0.2)',
    text: '#FFFFFF',
    shadow: '#10B981',
  },
};

const GlossyButton = React.memo(function GlossyButton({
  onPress,
  label,
  icon,
  disabled = false,
  testID,
  style,
  textStyle,
  size = 'large',
  variant = 'green',
  blink = false,
}: GlossyButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const colors = VARIANTS[variant];

  useEffect(() => {
    if (blink && !disabled) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.45, duration: 500, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      blinkAnim.setValue(1);
    }
  }, [blink, disabled, blinkAnim]);

  const paddingVertical = size === 'small' ? 12 : size === 'medium' ? 16 : 20;
  const paddingHorizontal = size === 'small' ? 20 : size === 'medium' ? 24 : 28;
  const fontSize = size === 'small' ? 14 : size === 'medium' ? 16 : 18;
  const borderRadius = size === 'small' ? 12 : size === 'medium' ? 14 : 16;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 150,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  }, [disabled, onPress]);

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: blink ? blinkAnim : 1 },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
        testID={testID}
        style={[
          styles.outerWrap,
          {
            borderRadius: borderRadius + 4,
            opacity: disabled ? 0.5 : 1,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 12,
          },
          style,
        ]}
      >
        <View
          style={[
            styles.glowLayer,
            {
              borderRadius: borderRadius + 4,
              backgroundColor: colors.glowOuter,
            },
          ]}
        />

        <View
          style={[
            styles.metalBorder,
            {
              borderRadius: borderRadius + 3,
              borderColor: colors.border,
              backgroundColor: colors.borderOuter,
            },
          ]}
        >
          <View
            style={[
              styles.innerGlow,
              {
                borderRadius: borderRadius + 1,
                backgroundColor: colors.glow,
              },
            ]}
          >
            <View
              style={[
                styles.buttonBody,
                {
                  borderRadius: borderRadius,
                  backgroundColor: colors.bg,
                  paddingVertical,
                  paddingHorizontal,
                },
              ]}
            >
              <View
                style={[
                  styles.glossHighlight,
                  {
                    borderTopLeftRadius: borderRadius,
                    borderTopRightRadius: borderRadius,
                    backgroundColor: colors.highlight,
                  },
                ]}
              />

              <View
                style={[
                  styles.glossHighlightBottom,
                  {
                    borderBottomLeftRadius: borderRadius,
                    borderBottomRightRadius: borderRadius,
                    backgroundColor: colors.highlightBottom,
                  },
                ]}
              />

              <View style={styles.contentRow}>
                {icon}
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize,
                      color: colors.text,
                    },
                    textStyle,
                  ]}
                >
                  {label}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default GlossyButton;

const styles = StyleSheet.create({
  outerWrap: {
    overflow: 'visible',
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  metalBorder: {
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  innerGlow: {
    padding: 2,
  },
  buttonBody: {
    overflow: 'hidden',
    position: 'relative' as const,
  },
  glossHighlight: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    opacity: 0.7,
  },
  glossHighlightBottom: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 1,
  },
  label: {
    fontWeight: '800' as const,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
