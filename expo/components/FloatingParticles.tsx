import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
}

export default React.memo(function FloatingParticles({
  count = 12,
  color = 'rgba(212, 175, 55, 0.15)',
}: FloatingParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      size: 2 + Math.random() * 4,
      duration: 6000 + Math.random() * 8000,
      delay: Math.random() * 5000,
      opacity: 0.15 + Math.random() * 0.3,
    }));
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <FloatingParticle key={p.id} particle={p} color={color} />
      ))}
    </View>
  );
});

const FloatingParticle = React.memo(function FloatingParticle({
  particle,
  color,
}: {
  particle: Particle;
  color: string;
}) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT + 20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(SCREEN_HEIGHT + 20);
      translateX.setValue(0);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -30,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: particle.opacity,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.delay(particle.duration - 2500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 15,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -15,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start(() => {
        setTimeout(animate, particle.delay);
      });
    };

    const timeout = setTimeout(animate, particle.delay);
    return () => clearTimeout(timeout);
  }, [translateY, translateX, opacity, particle]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }, { translateX }],
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: particle.size * 2,
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute' as const,
  },
});
