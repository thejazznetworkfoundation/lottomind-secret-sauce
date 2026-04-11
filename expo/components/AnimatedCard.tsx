import React, { useRef, useCallback, useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  delay?: number;
  pressable?: boolean;
  onPress?: () => void;
  glowColor?: string;
  depth?: 'shallow' | 'medium' | 'deep';
  testID?: string;
}

const DEPTH_CONFIG = {
  shallow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    translateY: -1,
  },
  medium: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    translateY: -2,
  },
  deep: {
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
    translateY: -3,
  },
};

const AnimatedCard = React.memo(function AnimatedCard({
  children,
  style,
  delay = 0,
  pressable = false,
  onPress,
  glowColor = 'rgba(212, 175, 55, 0.15)',
  depth = 'medium',
  testID,
}: AnimatedCardProps) {
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const pressDepth = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const depthConfig = DEPTH_CONFIG[depth];

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.spring(entranceAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, delay);

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearTimeout(timeout);
  }, [delay, entranceAnim, shimmerAnim]);

  const handlePressIn = useCallback(() => {
    if (!pressable) return;
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 0.97,
        friction: 8,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pressDepth, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pressable, pressScale, pressDepth]);

  const handlePressOut = useCallback(() => {
    if (!pressable) return;
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 4,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pressDepth, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pressable, pressScale, pressDepth]);

  const translateY = entranceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, depthConfig.translateY],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.0, 0.06, 0.0],
  });

  const pressTranslateY = pressDepth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.card,
        {
          shadowColor: glowColor,
          shadowOffset: depthConfig.shadowOffset,
          shadowOpacity: depthConfig.shadowOpacity,
          shadowRadius: depthConfig.shadowRadius,
          elevation: depthConfig.elevation,
          opacity: entranceAnim,
          transform: [
            { translateY: Animated.add(translateY, pressTranslateY) },
            { scale: pressScale },
          ],
        },
        style,
      ]}
      onStartShouldSetResponder={pressable ? () => true : undefined}
      onResponderGrant={handlePressIn}
      onResponderRelease={() => {
        handlePressOut();
        onPress?.();
      }}
      onResponderTerminate={handlePressOut}
    >
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            opacity: shimmerOpacity,
            backgroundColor: glowColor,
          },
        ]}
      />
      {children}
    </Animated.View>
  );
});

export default AnimatedCard;

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    position: 'relative' as const,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
});
