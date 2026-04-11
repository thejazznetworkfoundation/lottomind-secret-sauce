import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Clock, Share2, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { GAME_CONFIGS } from '@/constants/games';
import { GameType } from '@/types/lottery';
import { shareDailyPick } from '@/utils/share';

interface DailyPickProps {
  game: GameType;
  onShare?: () => void;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

export default React.memo(function DailyPick({ game, onShare }: DailyPickProps) {
  const pulseAnim = useRef(new Animated.Value(0.85)).current;
  const [hoursLeft, setHoursLeft] = useState<number>(0);

  const config = GAME_CONFIGS[game];
  const seed = getDailySeed();

  const dailyNumbers = useMemo(() => {
    const r = seededRandom(seed + game.charCodeAt(0));
    const nums = new Set<number>();
    while (nums.size < config.mainCount) {
      nums.add(Math.floor(r() * config.mainRange) + 1);
    }
    return Array.from(nums).sort((a, b) => a - b);
  }, [seed, game, config.mainCount, config.mainRange]);

  const dailyBonus = useMemo(() => {
    const r = seededRandom(seed + game.charCodeAt(0) + 999);
    return Math.floor(r() * config.bonusRange) + 1;
  }, [seed, game, config.bonusRange]);

  const confidence = useMemo(() => {
    const r = seededRandom(seed + game.charCodeAt(0) + 777);
    return Math.floor(r() * 15) + 78;
  }, [seed, game]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      setHoursLeft(Math.ceil(diff / 3600000));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const handleShare = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    const shared = await shareDailyPick(dailyNumbers, dailyBonus, confidence, config.name);
    if (shared && onShare) {
      onShare();
    }
  }, [dailyNumbers, dailyBonus, confidence, config.name, onShare]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.urgencyBadge, { opacity: pulseAnim }]}>
          <Clock size={12} color="#FF4757" />
          <Text style={styles.urgencyText}>{hoursLeft}h left</Text>
        </Animated.View>
        <Text style={styles.title}>Daily AI Pick</Text>
        <View style={styles.confBadge}>
          <Zap size={12} color={Colors.gold} />
          <Text style={styles.confText}>{confidence}%</Text>
        </View>
      </View>

      <View style={styles.numbersRow}>
        {dailyNumbers.map((num) => (
          <View key={`daily-${num}`} style={styles.ball}>
            <Text style={styles.ballText}>{num}</Text>
          </View>
        ))}
        <Text style={styles.plus}>+</Text>
        <View style={[styles.ball, styles.bonusBall]}>
          <Text style={[styles.ballText, styles.bonusText]}>{dailyBonus}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.gameName}>{config.name}</Text>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => { void handleShare(); }}
          activeOpacity={0.7}
          testID="daily-share-btn"
        >
          <Share2 size={14} color="#1A1200" />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.2)',
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FF4757',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  confBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldMuted,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  confText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ball: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
  },
  bonusBall: {
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
    borderColor: 'rgba(231, 76, 60, 0.25)',
  },
  ballText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  bonusText: {
    color: Colors.red,
  },
  plus: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameName: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#1A1200',
  },
});
