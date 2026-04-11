import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Flame, Snowflake, Scale } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { StrategyType } from '@/types/lottery';

interface StrategyPickerProps {
  selected: StrategyType;
  onSelect: (strategy: StrategyType) => void;
}

const strategies: { type: StrategyType; label: string; desc: string; icon: typeof Flame }[] = [
  { type: 'hot', label: 'Hot', desc: 'Frequently drawn', icon: Flame },
  { type: 'cold', label: 'Cold', desc: 'Overdue numbers', icon: Snowflake },
  { type: 'balanced', label: 'Balanced', desc: 'Best of both', icon: Scale },
];

export default React.memo(function StrategyPicker({ selected, onSelect }: StrategyPickerProps) {
  return (
    <View style={styles.container}>
      {strategies.map((s) => {
        const isActive = selected === s.type;
        const Icon = s.icon;
        return (
          <TouchableOpacity
            key={s.type}
            style={[styles.card, isActive && styles.activeCard]}
            onPress={() => onSelect(s.type)}
            activeOpacity={0.7}
            testID={`strategy-${s.type}`}
          >
            <Icon
              size={20}
              color={isActive ? Colors.gold : Colors.textMuted}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{s.label}</Text>
            <Text style={[styles.desc, isActive && styles.activeDesc]}>{s.desc}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCard: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldMuted,
  },
  label: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  activeLabel: {
    color: Colors.gold,
  },
  desc: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  activeDesc: {
    color: Colors.textSecondary,
  },
});
