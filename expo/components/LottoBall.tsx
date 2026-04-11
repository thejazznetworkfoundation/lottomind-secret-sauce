import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';

interface LottoBallProps {
  number: number;
  isBonus?: boolean;
  delay?: number;
  size?: number;
}

export default React.memo(function LottoBall({ number, isBonus = false, delay = 0, size = 56 }: LottoBallProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(0);
    rotateAnim.setValue(0);
    bounceAnim.setValue(0);

    const timeout = setTimeout(() => {
      Animated.stagger(50, [
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -8,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            friction: 3,
            tension: 180,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, [number, delay, scaleAnim, rotateAnim, bounceAnim, glowPulse]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const ballSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const baseColor = isBonus ? Colors.red : Colors.gold;
  const shadowColor = isBonus ? '#E74C3C' : '#D4AF37';

  return (
    <Animated.View
      style={[
        styles.outerGlow,
        {
          width: size + 8,
          height: size + 8,
          borderRadius: (size + 8) / 2,
          opacity: glowOpacity,
          backgroundColor: isBonus ? 'rgba(231, 76, 60, 0.2)' : 'rgba(212, 175, 55, 0.2)',
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.ball,
          ballSize,
          {
            backgroundColor: baseColor,
            shadowColor,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.6,
            shadowRadius: 16,
            elevation: 12,
            transform: [
              { scale: scaleAnim },
              { rotateY: rotate },
              { translateY: bounceAnim },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.innerRing,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
              borderColor: isBonus ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.25)',
            },
          ]}
        />
        <View
          style={[
            styles.topShine,
            {
              width: size * 0.6,
              height: size * 0.3,
              borderRadius: size * 0.2,
              top: size * 0.08,
              left: size * 0.2,
            },
          ]}
        />
        <View
          style={[
            styles.bottomReflect,
            {
              width: size * 0.4,
              height: size * 0.15,
              borderRadius: size * 0.1,
              bottom: size * 0.12,
              left: size * 0.3,
            },
          ]}
        />
        <View
          style={[
            styles.depthShadow,
            {
              width: size - 4,
              height: size - 4,
              borderRadius: (size - 4) / 2,
            },
          ]}
        />
        <Text style={[styles.number, isBonus && styles.bonusNumber, { fontSize: size * 0.36 }]}>
          {number}
        </Text>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  outerGlow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerRing: {
    position: 'absolute' as const,
    borderWidth: 1.5,
  },
  topShine: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  bottomReflect: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  depthShadow: {
    position: 'absolute' as const,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
    borderRightColor: 'rgba(0, 0, 0, 0.15)',
    borderBottomColor: 'rgba(0, 0, 0, 0.25)',
  },
  number: {
    fontWeight: '900' as const,
    color: '#1A1200',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    zIndex: 2,
  },
  bonusNumber: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
  },
});
