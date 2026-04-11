import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import type { LottoSetItem } from '@/utils/lottoSetGenerator';

interface LottoSetCardProps {
  data: LottoSetItem[];
  bonusNumber?: LottoSetItem;
  dateEnergy?: string;
}

function AnimatedItem({ item, index, isBonus }: { item: LottoSetItem; index: number; isBonus?: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.itemCard,
        isBonus && styles.bonusCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={[styles.numberCircle, isBonus && styles.bonusCircle]}>
        <Text style={[styles.numberText, isBonus && styles.bonusNumberText]}>
          {item.number}
        </Text>
      </View>
      <View style={styles.insightWrap}>
        {isBonus && (
          <Text style={styles.bonusLabel}>BONUS</Text>
        )}
        <Text style={styles.insightText} numberOfLines={3}>
          {item.insight}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function LottoSetCard({ data, bonusNumber, dateEnergy }: LottoSetCardProps) {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <AnimatedItem key={`main-${item.number}-${index}`} item={item} index={index} />
      ))}
      {bonusNumber && (
        <AnimatedItem item={bonusNumber} index={data.length} isBonus />
      )}
      {dateEnergy ? (
        <View style={styles.dateEnergyCard}>
          <Text style={styles.dateEnergyLabel}>TODAY'S DATE ENERGY</Text>
          <Text style={styles.dateEnergyText}>{dateEnergy}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bonusCard: {
    borderColor: 'rgba(231, 76, 60, 0.3)',
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },
  numberCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldMuted,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
  },
  bonusCircle: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: 'rgba(231, 76, 60, 0.4)',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.gold,
  },
  bonusNumberText: {
    color: Colors.red,
  },
  insightWrap: {
    flex: 1,
    gap: 4,
  },
  bonusLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.red,
    letterSpacing: 1,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  dateEnergyCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginTop: 4,
  },
  dateEnergyLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.gold,
    letterSpacing: 1.2,
  },
  dateEnergyText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },
});
