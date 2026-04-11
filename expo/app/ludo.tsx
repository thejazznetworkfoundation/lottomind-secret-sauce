import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Trophy, Share2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { useGamification } from '@/providers/GamificationProvider';

const BOARD_COLORS = ['#E74C3C', '#2ECC71', '#3498DB', '#F1C40F'];
const PLAYER_NAMES = ['Red', 'Green', 'Blue', 'Yellow'];

interface PlayerState {
  color: string;
  name: string;
  position: number;
  finished: boolean;
  tokens: number[];
}

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

function getDiceIcon(value: number) {
  const Icon = DICE_ICONS[value - 1] ?? Dice1;
  return Icon;
}

export default function LudoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addCredits } = useGamification();

  const [players] = useState<PlayerState[]>(
    BOARD_COLORS.map((color, i) => ({
      color,
      name: PLAYER_NAMES[i],
      position: -1,
      finished: false,
      tokens: [-1, -1, -1, -1],
    }))
  );

  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0]);
  const [round, setRound] = useState<number>(1);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [creditsEarned, setCreditsEarned] = useState<number>(0);

  const diceScale = useRef(new Animated.Value(1)).current;
  const diceRotate = useRef(new Animated.Value(0)).current;
  const boardPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(boardPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(boardPulse, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [boardPulse]);

  const rollDice = useCallback(() => {
    if (isRolling || gameOver) return;

    setIsRolling(true);
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    Animated.sequence([
      Animated.parallel([
        Animated.timing(diceScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.timing(diceRotate, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(diceScale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
        Animated.timing(diceRotate, { toValue: 2, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(diceScale, { toValue: 1.2, duration: 80, useNativeDriver: true }),
        Animated.timing(diceRotate, { toValue: 3, duration: 80, useNativeDriver: true }),
      ]),
      Animated.spring(diceScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 6 }),
    ]).start();

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 8) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);

        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setScores(prev => {
          const updated = [...prev];
          updated[currentPlayer] += finalValue;
          return updated;
        });

        diceRotate.setValue(0);

        const isLastRound = round >= 10 && currentPlayer === 3;
        if (isLastRound) {
          setGameOver(true);
          const earned = 15;
          setCreditsEarned(earned);
          addCredits(earned);
          console.log('[Ludo] Game over! +15 credits earned');
        } else {
          const nextPlayer = (currentPlayer + 1) % 4;
          if (nextPlayer === 0) {
            setRound(prev => prev + 1);
          }
          setTimeout(() => {
            setCurrentPlayer(nextPlayer);
          }, 600);
        }

        setIsRolling(false);
      }
    }, 80);
  }, [isRolling, gameOver, currentPlayer, round, diceScale, diceRotate, addCredits]);

  const handleShareResult = useCallback(async () => {
    const winnerName = PLAYER_NAMES[winner] ?? 'Unknown';
    const message = `\u{1F3B2} LottoMind\u2122 Ludo Dice\n\n` +
      `Winner: ${winnerName} with ${scores[winner]} points!\n` +
      `Scores: ${PLAYER_NAMES.map((n, i) => `${n}: ${scores[i]}`).join(' | ')}\n` +
      `Credits Earned: +${creditsEarned} \u{1FA99}\n\n` +
      `Think you can beat me? Try LottoMind\u2122 AI!`;
    try {
      await Share.share({ message });
    } catch (e) {
      console.log('[Ludo] Share error:', e);
    }
  }, [winner, scores, creditsEarned]);

  const resetGame = useCallback(() => {
    setScores([0, 0, 0, 0]);
    setCurrentPlayer(0);
    setDiceValue(null);
    setRound(1);
    setGameOver(false);
    setCreditsEarned(0);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const winner = gameOver
    ? scores.indexOf(Math.max(...scores))
    : -1;

  const DiceIcon = diceValue ? getDiceIcon(diceValue) : Dice1;

  const diceRotation = diceRotate.interpolate({
    inputRange: [0, 3],
    outputRange: ['0deg', '1080deg'],
  });

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>🎲</Text>
          <Text style={styles.headerTitle}>Ludo Dice</Text>
        </View>
        <TouchableOpacity onPress={resetGame} style={styles.resetBtn} activeOpacity={0.7}>
          <RotateCcw size={18} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <View style={styles.roundBadge}>
        <Text style={styles.roundText}>Round {Math.min(round, 10)} / 10</Text>
      </View>

      <View style={styles.boardContainer}>
        <View style={styles.boardGrid}>
          {players.map((player, idx) => (
            <View
              key={player.name}
              style={[
                styles.playerQuadrant,
                { backgroundColor: `${player.color}15`, borderColor: `${player.color}40` },
                currentPlayer === idx && styles.playerQuadrantActive,
                currentPlayer === idx && { borderColor: player.color },
              ]}
            >
              <View style={[styles.playerDot, { backgroundColor: player.color }]} />
              <Text style={[styles.playerName, currentPlayer === idx && { color: player.color }]}>
                {player.name}
              </Text>
              <Text style={[styles.playerScore, { color: player.color }]}>{scores[idx]}</Text>
              {currentPlayer === idx && (
                <View style={[styles.turnIndicator, { backgroundColor: player.color }]}>
                  <Text style={styles.turnText}>TURN</Text>
                </View>
              )}
              {gameOver && winner === idx && (
                <View style={styles.winnerBadge}>
                  <Trophy size={12} color="#FFD700" />
                  <Text style={styles.winnerText}>WIN</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.diceCenter}>
          <TouchableOpacity
            onPress={rollDice}
            activeOpacity={0.8}
            disabled={isRolling || gameOver}
            style={[
              styles.diceBtn,
              { borderColor: BOARD_COLORS[currentPlayer] },
              (isRolling || gameOver) && styles.diceBtnDisabled,
            ]}
            testID="roll-dice-btn"
          >
            <Animated.View
              style={{
                transform: [{ scale: diceScale }, { rotate: diceRotation }],
              }}
            >
              <DiceIcon size={48} color={diceValue ? BOARD_COLORS[currentPlayer] : Colors.textMuted} />
            </Animated.View>
            {!diceValue && !isRolling && (
              <Text style={styles.diceTapText}>Tap to Roll</Text>
            )}
            {diceValue && !isRolling && (
              <Text style={[styles.diceValueText, { color: BOARD_COLORS[currentPlayer] }]}>{diceValue}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {gameOver && (
        <View style={styles.gameOverCard}>
          <Trophy size={32} color="#FFD700" />
          <Text style={styles.gameOverTitle}>
            {PLAYER_NAMES[winner]} Wins!
          </Text>
          <Text style={styles.gameOverScore}>
            Score: {scores[winner]} points
          </Text>
          <View style={styles.creditsEarnedBadge}>
            <Text style={styles.creditsEarnedText}>+{creditsEarned} Mind Credits Earned! 🪙</Text>
          </View>
          <View style={styles.gameOverActions}>
            <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame} activeOpacity={0.85}>
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={() => { void handleShareResult(); }} activeOpacity={0.85} testID="ludo-share-btn">
              <Share2 size={16} color="#FFD700" />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.scoreboard}>
        <Text style={styles.scoreboardTitle}>Scoreboard</Text>
        <View style={styles.scoreRow}>
          {players.map((player, idx) => (
            <View key={player.name} style={styles.scoreItem}>
              <View style={[styles.scoreColorDot, { backgroundColor: player.color }]} />
              <Text style={styles.scorePlayerName}>{player.name}</Text>
              <Text style={[styles.scoreValue, { color: player.color }]}>{scores[idx]}</Text>
            </View>
          ))}
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  roundBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    marginBottom: 12,
  },
  roundText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  boardContainer: {
    paddingHorizontal: 20,
    position: 'relative' as const,
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  playerQuadrant: {
    width: '47%' as any,
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    minHeight: 110,
  },
  playerQuadrantActive: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  playerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
  },
  playerScore: {
    fontSize: 28,
    fontWeight: '900' as const,
  },
  turnIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  turnText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    marginTop: 2,
  },
  winnerText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FFD700',
  },
  diceCenter: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    marginLeft: -44,
    marginTop: -44,
    zIndex: 10,
  },
  diceBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  diceBtnDisabled: {
    opacity: 0.5,
  },
  diceTapText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    position: 'absolute' as const,
    bottom: 8,
  },
  diceValueText: {
    fontSize: 12,
    fontWeight: '900' as const,
    position: 'absolute' as const,
    bottom: 6,
  },
  gameOverCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: '#FFD700',
  },
  gameOverScore: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  creditsEarnedBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  creditsEarnedText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#2ECC71',
  },
  gameOverActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  playAgainBtn: {
    flex: 1,
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  playAgainText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#1A1200',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  scoreboard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreboardTitle: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    textAlign: 'center' as const,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scorePlayerName: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '900' as const,
  },
});
