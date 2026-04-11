import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Hash } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { GameType } from '@/types/lottery';
import { GAME_CONFIGS } from '@/constants/games';

interface GameSwitcherProps {
  currentGame: GameType;
  onSwitch: (game: GameType) => void;
  onPickGames?: () => void;
}

export default React.memo(function GameSwitcher({ currentGame, onSwitch, onPickGames }: GameSwitcherProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = (game: GameType) => {
    if (game === currentGame) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onSwitch(game);
  };

  const handlePickGames = () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    onPickGames?.();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {(['powerball', 'megamillions'] as GameType[]).map((game) => {
        const config = GAME_CONFIGS[game];
        const isActive = currentGame === game;
        return (
          <TouchableOpacity
            key={game}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => handlePress(game)}
            activeOpacity={0.7}
            testID={`game-switch-${game}`}
          >
            <View style={[styles.dot, { backgroundColor: isActive ? config.color : Colors.textMuted }]} />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{config.name}</Text>
          </TouchableOpacity>
        );
      })}
      {onPickGames && (
        <TouchableOpacity
          style={styles.pickGamesTab}
          onPress={handlePickGames}
          activeOpacity={0.7}
          testID="game-switch-pick34"
        >
          <Hash size={14} color="#00E676" />
          <Text style={styles.pickGamesLabel}>3 & 4 Digit</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  activeLabel: {
    color: Colors.textPrimary,
  },
  pickGamesTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 11,
    gap: 5,
    backgroundColor: 'rgba(0, 230, 118, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  pickGamesLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#00E676',
  },
});
