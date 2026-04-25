import React, { useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleProp, ViewStyle } from 'react-native';

interface SwipeableActionCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  threshold?: number;
  onPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const MAX_DRAG = 96;
const DEFAULT_THRESHOLD = 58;

function clamp(value: number) {
  return Math.max(-MAX_DRAG, Math.min(MAX_DRAG, value));
}

export default function SwipeableActionCard({
  children,
  style,
  disabled = false,
  threshold = DEFAULT_THRESHOLD,
  onPress,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableActionCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (disabled) return false;
          const horizontal = Math.abs(gestureState.dx) > 16 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.35;
          return horizontal;
        },
        onPanResponderMove: (_, gestureState) => {
          translateX.setValue(clamp(gestureState.dx));
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldActivate = Math.abs(gestureState.dx) >= threshold || Math.abs(gestureState.vx) >= 0.55;
          if (!shouldActivate) {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              friction: 7,
            }).start();
            return;
          }

          const swipedLeft = gestureState.dx < 0;
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: swipedLeft ? -MAX_DRAG : MAX_DRAG,
              duration: 110,
              useNativeDriver: true,
            }),
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              friction: 7,
            }),
          ]).start(() => {
            if (swipedLeft) {
              (onSwipeLeft ?? onPress)?.();
            } else {
              (onSwipeRight ?? onPress)?.();
            }
          });
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 7,
          }).start();
        },
      }),
    [disabled, onPress, onSwipeLeft, onSwipeRight, threshold, translateX]
  );

  return (
    <Animated.View style={[style, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
      {children}
    </Animated.View>
  );
}
