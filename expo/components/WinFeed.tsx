import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Flame } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { generateWinFeedItems, WinFeedItem } from '@/mocks/winFeed';

const ROTATION_INTERVAL = 4000;

export default React.memo(function WinFeed() {
  const [items] = useState<WinFeedItem[]>(() => generateWinFeedItems(8));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconPulse = useRef(new Animated.Value(0)).current;
  const borderGlow = useRef(new Animated.Value(0)).current;

  const currentItem = useMemo(() => items[currentIndex], [items, currentIndex]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlow, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(borderGlow, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [iconPulse, borderGlow]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -25, duration: 250, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.95, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        setCurrentIndex(prev => (prev + 1) % items.length);
        slideAnim.setValue(25);
        scaleAnim.setValue(1.05);
        Animated.parallel([
          Animated.spring(fadeAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }),
        ]).start();
      });
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim, scaleAnim, items.length]);

  const iconScale = iconPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const glowOpacity = borderGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.2],
  });

  return (
    <View style={styles.outerWrap}>
      <Animated.View style={[styles.glowBorder, { opacity: glowOpacity }]} />
      <View style={styles.container}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}>
          <Flame size={14} color="#FF6B35" />
        </Animated.View>
        <Animated.View
          style={[
            styles.textWrap,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.text} numberOfLines={1}>
            User in <Text style={styles.highlight}>{currentItem.state}</Text> {currentItem.matchType}
          </Text>
          <Text style={styles.time}>{currentItem.timeAgo}</Text>
        </Animated.View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outerWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    transform: [{ scale: 1.02 }],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.06)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.15)',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  textWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  highlight: {
    color: '#FF6B35',
    fontWeight: '700' as const,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
