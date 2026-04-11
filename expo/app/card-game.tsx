import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, RotateCcw, Trophy, Zap, Clock, Share2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { useGamification } from '@/providers/GamificationProvider';

const CARD_SUITS = ['♠', '♥', '♦', '♣'] as const;
const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

interface Card {
  suit: string;
  value: string;
  id: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function generateDeck(): Card[] {
  const pairs: Card[] = [];
  const selected: { suit: string; value: string }[] = [];
  while (selected.length < 8) {
    const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
    const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
    const key = `${suit}${value}`;
    if (!selected.find(s => `${s.suit}${s.value}` === key)) {
      selected.push({ suit, value });
    }
  }
  selected.forEach((card, idx) => {
    pairs.push({ ...card, id: `a-${idx}`, isFlipped: false, isMatched: false });
    pairs.push({ ...card, id: `b-${idx}`, isFlipped: false, isMatched: false });
  });
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

function CardTile({ card, onPress, disabled }: { card: Card; onPress: () => void; disabled: boolean }) {
  const flipAnim = useRef(new Animated.Value(card.isFlipped || card.isMatched ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: card.isFlipped || card.isMatched ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [card.isFlipped, card.isMatched, flipAnim]);

  const handlePress = () => {
    if (disabled || card.isFlipped || card.isMatched) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
    onPress();
  };

  const isRed = card.suit === '♥' || card.suit === '♦';
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled || card.isMatched}
      style={styles.cardTileWrap}
    >
      <Animated.View style={[styles.cardTile, { transform: [{ scale: scaleAnim }] }, card.isMatched && styles.cardTileMatched]}>
        <Animated.View style={[styles.cardBack, { opacity: backOpacity }]}>
          <View style={styles.cardBackPattern}>
            <Text style={styles.cardBackText}>🃏</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.cardFront, { opacity: frontOpacity }]}>
          <Text style={[styles.cardSuit, isRed && styles.cardSuitRed]}>{card.suit}</Text>
          <Text style={[styles.cardValue, isRed && styles.cardValueRed]}>{card.value}</Text>
          <Text style={[styles.cardSuitBottom, isRed && styles.cardSuitRed]}>{card.suit}</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CardGameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addCredits } = useGamification();

  const [cards, setCards] = useState<Card[]>(() => generateDeck());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [creditsEarned, setCreditsEarned] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [elapsed, setElapsed] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!gameOver) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameOver, startTime]);

  const handleCardPress = useCallback((index: number) => {
    if (isChecking || cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const updated = [...cards];
    updated[index] = { ...updated[index], isFlipped: true };
    setCards(updated);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);
      const [first, second] = newFlipped;
      const card1 = updated[first];
      const card2 = updated[second];

      if (card1.suit === card2.suit && card1.value === card2.value) {
        if (Platform.OS !== 'web') {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, isMatched: true } : c
          ));
          const newMatches = matches + 1;
          setMatches(newMatches);
          setFlippedIndices([]);
          setIsChecking(false);

          if (newMatches === 8) {
            if (timerRef.current) clearInterval(timerRef.current);
            const bonus = moves < 16 ? 25 : moves < 24 ? 20 : 15;
            setCreditsEarned(bonus);
            setGameOver(true);
            addCredits(bonus);
            console.log(`[CardGame] Game won! +${bonus} credits for ${moves + 1} moves`);
          }
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === first || i === second ? { ...c, isFlipped: false } : c
          ));
          setFlippedIndices([]);
          setIsChecking(false);
        }, 800);
      }
    }
  }, [cards, flippedIndices, isChecking, matches, moves, addCredits]);

  const resetGame = useCallback(() => {
    setCards(generateDeck());
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsChecking(false);
    setGameOver(false);
    setCreditsEarned(0);
    setElapsed(0);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const handleShareResult = useCallback(async () => {
    const message = `\u{1F0CF} LottoMind\u2122 Memory Match\n\n` +
      `Completed in ${moves} moves \u00B7 ${formatTime(elapsed)}\n` +
      `Credits Earned: +${creditsEarned} \u{1FA99}\n\n` +
      `Think you can beat me? Try LottoMind\u2122 AI!`;
    try {
      await Share.share({ message });
    } catch (e) {
      console.log('[CardGame] Share error:', e);
    }
  }, [moves, elapsed, creditsEarned]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>🃏</Text>
          <Text style={styles.headerTitle}>Memory Match</Text>
        </View>
        <TouchableOpacity onPress={resetGame} style={styles.resetBtn} activeOpacity={0.7}>
          <RotateCcw size={18} color={Colors.gold} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statChip}>
          <Zap size={14} color="#FFD700" />
          <Text style={styles.statText}>{moves} moves</Text>
        </View>
        <View style={styles.statChip}>
          <Trophy size={14} color="#2ECC71" />
          <Text style={styles.statText}>{matches}/8 pairs</Text>
        </View>
        <View style={styles.statChip}>
          <Clock size={14} color="#3498DB" />
          <Text style={styles.statText}>{formatTime(elapsed)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {cards.map((card, idx) => (
            <CardTile
              key={card.id}
              card={card}
              onPress={() => handleCardPress(idx)}
              disabled={isChecking}
            />
          ))}
        </View>

        {gameOver && (
          <View style={styles.gameOverCard}>
            <Trophy size={36} color="#FFD700" />
            <Text style={styles.gameOverTitle}>You Win!</Text>
            <Text style={styles.gameOverSub}>
              Completed in {moves} moves · {formatTime(elapsed)}
            </Text>
            <View style={styles.creditsEarnedBadge}>
              <Text style={styles.creditsEarnedText}>+{creditsEarned} Mind Credits! 🪙</Text>
            </View>
            <View style={styles.gameOverActions}>
              <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame} activeOpacity={0.85}>
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={() => { void handleShareResult(); }} activeOpacity={0.85} testID="card-share-btn">
                <Share2 size={16} color="#FFD700" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  cardTileWrap: {
    width: '22%' as any,
    aspectRatio: 0.7,
    flexGrow: 0,
    flexBasis: '22%',
  },
  cardTile: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cardTileMatched: {
    borderColor: 'rgba(46, 204, 113, 0.4)',
    backgroundColor: 'rgba(46, 204, 113, 0.06)',
  },
  cardBack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A2332',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cardBackPattern: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackText: {
    fontSize: 28,
  },
  cardFront: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 4,
  },
  cardSuit: {
    fontSize: 14,
    color: '#1A1A1A',
    position: 'absolute' as const,
    top: 4,
    left: 6,
  },
  cardSuitBottom: {
    fontSize: 14,
    color: '#1A1A1A',
    position: 'absolute' as const,
    bottom: 4,
    right: 6,
    transform: [{ rotate: '180deg' }],
  },
  cardSuitRed: {
    color: '#E74C3C',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#1A1A1A',
  },
  cardValueRed: {
    color: '#E74C3C',
  },
  gameOverCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  gameOverTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: '#FFD700',
  },
  gameOverSub: {
    fontSize: 14,
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
    marginTop: 6,
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
});
