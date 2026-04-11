import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Alert,
  TextInput,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  X,
  Trophy,
  ChevronRight,
  Check,
  RotateCcw,
  Zap,
  Lock,
  Star,
  Grid3x3,
  Share2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { CROSSWORD_PUZZLES, type CrosswordPuzzle, type CrosswordClue } from '@/mocks/crosswordData';
import { useGamification } from '@/providers/GamificationProvider';

const COMPLETED_KEY = '@lottomind_crossword_completed';

type CellValue = string;
type GridState = Record<string, CellValue>;
type SelectedCell = { row: number; col: number } | null;

function buildGrid(puzzle: CrosswordPuzzle) {
  const grid: boolean[][] = Array.from({ length: puzzle.gridSize }, () =>
    Array.from({ length: puzzle.gridSize }, () => false)
  );

  const cellNumbers: Record<string, number> = {};
  const answerMap: Record<string, string> = {};

  for (const clue of puzzle.clues) {
    const letters = clue.answer.split('');
    for (let i = 0; i < letters.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      if (r < puzzle.gridSize && c < puzzle.gridSize) {
        grid[r][c] = true;
        answerMap[`${r}-${c}`] = letters[i];
      }
    }
    cellNumbers[`${clue.row}-${clue.col}`] = clue.number;
  }

  return { grid, cellNumbers, answerMap };
}

export default function CrosswordScreen() {
  console.log('[CrosswordScreen] rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { credits, addCredits } = useGamification();

  const [selectedPuzzle, setSelectedPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [gridState, setGridState] = useState<GridState>({});
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [activeDirection, setActiveDirection] = useState<'across' | 'down'>('across');
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);

  const successScale = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(COMPLETED_KEY).then((val) => {
      if (val) setCompletedPuzzles(JSON.parse(val));
    }).catch(() => {});

    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [headerAnim]);

  const puzzleData = useMemo(() => {
    if (!selectedPuzzle) return null;
    return buildGrid(selectedPuzzle);
  }, [selectedPuzzle]);

  const acrossClues = useMemo(() =>
    selectedPuzzle?.clues.filter(c => c.direction === 'across').sort((a, b) => a.number - b.number) ?? [],
    [selectedPuzzle]
  );

  const downClues = useMemo(() =>
    selectedPuzzle?.clues.filter(c => c.direction === 'down').sort((a, b) => a.number - b.number) ?? [],
    [selectedPuzzle]
  );

  const handleCellPress = useCallback((row: number, col: number) => {
    if (!puzzleData?.grid[row][col]) return;

    if (selectedCell?.row === row && selectedCell?.col === col) {
      setActiveDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }

    const matchingClue = selectedPuzzle?.clues.find(c => {
      if (activeDirection === 'across' && c.direction === 'across' && c.row === row && col >= c.col && col < c.col + c.answer.length) return true;
      if (activeDirection === 'down' && c.direction === 'down' && c.col === col && row >= c.row && row < c.row + c.answer.length) return true;
      return false;
    });
    setSelectedClue(matchingClue ?? null);

    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, [selectedCell, activeDirection, puzzleData, selectedPuzzle]);

  const handleLetterInput = useCallback((letter: string) => {
    if (!selectedCell || !puzzleData || !selectedPuzzle) return;

    const key = `${selectedCell.row}-${selectedCell.col}`;
    const upper = letter.toUpperCase().slice(-1);

    if (upper && /^[A-Z]$/.test(upper)) {
      setGridState(prev => ({ ...prev, [key]: upper }));

      const nextRow = activeDirection === 'down' ? selectedCell.row + 1 : selectedCell.row;
      const nextCol = activeDirection === 'across' ? selectedCell.col + 1 : selectedCell.col;
      if (nextRow < selectedPuzzle.gridSize && nextCol < selectedPuzzle.gridSize && puzzleData.grid[nextRow]?.[nextCol]) {
        setSelectedCell({ row: nextRow, col: nextCol });
      }
    }
  }, [selectedCell, activeDirection, puzzleData, selectedPuzzle]);

  const handleBackspace = useCallback(() => {
    if (!selectedCell || !selectedPuzzle || !puzzleData) return;
    const key = `${selectedCell.row}-${selectedCell.col}`;

    if (gridState[key]) {
      setGridState(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      const prevRow = activeDirection === 'down' ? selectedCell.row - 1 : selectedCell.row;
      const prevCol = activeDirection === 'across' ? selectedCell.col - 1 : selectedCell.col;
      if (prevRow >= 0 && prevCol >= 0 && puzzleData.grid[prevRow]?.[prevCol]) {
        const prevKey = `${prevRow}-${prevCol}`;
        setSelectedCell({ row: prevRow, col: prevCol });
        setGridState(prev => {
          const next = { ...prev };
          delete next[prevKey];
          return next;
        });
      }
    }
  }, [selectedCell, gridState, activeDirection, selectedPuzzle, puzzleData]);

  const checkPuzzle = useCallback(async () => {
    if (!puzzleData || !selectedPuzzle) return;

    let correct = true;
    for (const [key, answer] of Object.entries(puzzleData.answerMap)) {
      if (gridState[key] !== answer) {
        correct = false;
        break;
      }
    }

    if (correct) {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowSuccess(true);
      Animated.spring(successScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();

      if (!completedPuzzles.includes(selectedPuzzle.id)) {
        const updated = [...completedPuzzles, selectedPuzzle.id];
        setCompletedPuzzles(updated);
        await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(updated));
        addCredits(selectedPuzzle.rewardCredits);
        console.log('[Crossword] Puzzle completed! +', selectedPuzzle.rewardCredits, 'credits');
      }
    } else {
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Not Quite!', 'Some letters are incorrect. Keep trying!');
    }
  }, [puzzleData, gridState, selectedPuzzle, completedPuzzles, successScale, addCredits]);

  const handleShareResult = useCallback(async (puzzle: CrosswordPuzzle) => {
    const message = `\u{1F9E9} LottoMind\u2122 Crossword\n\n` +
      `Solved: "${puzzle.title}"\n` +
      `Difficulty: ${puzzle.difficulty}\n` +
      `Clues: ${puzzle.clues.length}\n` +
      `Credits Earned: +${puzzle.rewardCredits} \u{1FA99}\n\n` +
      `Think you can beat me? Try LottoMind\u2122 AI!`;
    try {
      await Share.share({ message });
    } catch (e) {
      console.log('[Crossword] Share error:', e);
    }
  }, []);

  const resetPuzzle = useCallback(() => {
    setGridState({});
    setSelectedCell(null);
    setShowSuccess(false);
    successScale.setValue(0);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, [successScale]);

  const isCellHighlighted = useCallback((row: number, col: number): boolean => {
    if (!selectedCell || !selectedPuzzle) return false;
    if (activeDirection === 'across' && row === selectedCell.row) {
      const clue = selectedPuzzle.clues.find(c => c.direction === 'across' && c.row === row && selectedCell.col >= c.col && selectedCell.col < c.col + c.answer.length);
      if (clue && col >= clue.col && col < clue.col + clue.answer.length) return true;
    }
    if (activeDirection === 'down' && col === selectedCell.col) {
      const clue = selectedPuzzle.clues.find(c => c.direction === 'down' && c.col === col && selectedCell.row >= c.row && selectedCell.row < c.row + c.answer.length);
      if (clue && row >= clue.row && row < clue.row + clue.answer.length) return true;
    }
    return false;
  }, [selectedCell, activeDirection, selectedPuzzle]);

  const handleCluePress = useCallback((clue: CrosswordClue) => {
    setActiveDirection(clue.direction);
    setSelectedCell({ row: clue.row, col: clue.col });
    setSelectedClue(clue);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
  ];

  if (!selectedPuzzle || !puzzleData) {
    return (
      <AppBackground style={{ paddingTop: insets.top }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} testID="crossword-close">
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Crossword Puzzles</Text>
          <View style={styles.creditsBadge}>
            <Text style={styles.creditsText}>{credits} 🪙</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.puzzleListHeader, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <View style={styles.puzzleListIconWrap}>
              <Grid3x3 size={28} color="#FFD700" />
            </View>
            <Text style={styles.puzzleListTitle}>Lottery Crosswords</Text>
            <Text style={styles.puzzleListDesc}>Solve lottery-themed puzzles to earn Mind Credits!</Text>
          </Animated.View>

          {CROSSWORD_PUZZLES.map((puzzle, idx) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            const diffColors = { Easy: '#2ECC71', Medium: '#F5A623', Hard: '#E74C3C' };
            const diffColor = diffColors[puzzle.difficulty];
            return (
              <TouchableOpacity
                key={puzzle.id}
                style={[styles.puzzleCard, isCompleted && styles.puzzleCardCompleted]}
                onPress={() => {
                  setSelectedPuzzle(puzzle);
                  setGridState({});
                  setSelectedCell(null);
                  setShowSuccess(false);
                  successScale.setValue(0);
                }}
                activeOpacity={0.85}
                testID={`puzzle-${puzzle.id}`}
              >
                <View style={styles.puzzleCardLeft}>
                  <View style={[styles.puzzleNumberWrap, { backgroundColor: `${diffColor}15`, borderColor: `${diffColor}30` }]}>
                    <Text style={[styles.puzzleNumber, { color: diffColor }]}>#{idx + 1}</Text>
                  </View>
                  <View style={styles.puzzleCardInfo}>
                    <Text style={styles.puzzleCardTitle}>{puzzle.title}</Text>
                    <View style={styles.puzzleCardMeta}>
                      <View style={[styles.diffBadge, { backgroundColor: `${diffColor}15`, borderColor: `${diffColor}30` }]}>
                        <Text style={[styles.diffBadgeText, { color: diffColor }]}>{puzzle.difficulty}</Text>
                      </View>
                      <Text style={styles.puzzleCardClues}>{puzzle.clues.length} clues</Text>
                      <Text style={styles.puzzleCardReward}>+{puzzle.rewardCredits} 🪙</Text>
                    </View>
                  </View>
                </View>
                {isCompleted ? (
                  <View style={styles.completedBadge}>
                    <Check size={14} color="#2ECC71" />
                  </View>
                ) : (
                  <ChevronRight size={18} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      </AppBackground>
    );
  }

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setSelectedPuzzle(null)} style={styles.closeBtn} testID="crossword-back">
          <X size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>{selectedPuzzle.title}</Text>
          <View style={[styles.diffBadgeSmall, { backgroundColor: selectedPuzzle.difficulty === 'Easy' ? 'rgba(46,204,113,0.15)' : selectedPuzzle.difficulty === 'Medium' ? 'rgba(245,166,35,0.15)' : 'rgba(231,76,60,0.15)' }]}>
            <Text style={[styles.diffBadgeSmallText, { color: selectedPuzzle.difficulty === 'Easy' ? '#2ECC71' : selectedPuzzle.difficulty === 'Medium' ? '#F5A623' : '#E74C3C' }]}>{selectedPuzzle.difficulty}</Text>
          </View>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity onPress={resetPuzzle} style={styles.resetBtn} testID="crossword-reset">
            <RotateCcw size={18} color={Colors.gold} />
          </TouchableOpacity>
        </View>
      </View>

      {showSuccess && (
        <Animated.View style={[styles.successOverlay, { transform: [{ scale: successScale }] }]}>
          <View style={styles.successCard}>
            <View style={styles.successStarWrap}>
              <Star size={36} color="#FFD700" fill="#FFD700" />
            </View>
            <Text style={styles.successTitle}>Puzzle Solved!</Text>
            <Text style={styles.successReward}>+{selectedPuzzle.rewardCredits} Mind Credits</Text>
            <Text style={styles.successDesc}>Great job solving "{selectedPuzzle.title}"!</Text>
            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.successBtn}
                onPress={() => { setSelectedPuzzle(null); setShowSuccess(false); }}
                activeOpacity={0.85}
              >
                <Text style={styles.successBtnText}>Back to Puzzles</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => { void handleShareResult(selectedPuzzle); }}
                activeOpacity={0.85}
                testID="crossword-share-btn"
              >
                <Share2 size={16} color="#FFD700" />
                <Text style={styles.shareBtnText}>Share Result</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.gameContent} showsVerticalScrollIndicator={false}>
        {selectedClue && (
          <View style={styles.activeClueBar}>
            <View style={[styles.activeClueDirection, { backgroundColor: activeDirection === 'across' ? 'rgba(52,152,219,0.15)' : 'rgba(155,89,182,0.15)' }]}>
              <Text style={[styles.activeClueDirectionText, { color: activeDirection === 'across' ? '#3498DB' : '#9B59B6' }]}>
                {selectedClue.number}{activeDirection === 'across' ? 'A' : 'D'}
              </Text>
            </View>
            <Text style={styles.activeClueText} numberOfLines={2}>{selectedClue.clue}</Text>
          </View>
        )}

        <View style={styles.gridContainer}>
          {Array.from({ length: selectedPuzzle.gridSize }).map((_, row) => (
            <View key={`row-${row}`} style={styles.gridRow}>
              {Array.from({ length: selectedPuzzle.gridSize }).map((_, col) => {
                const isActive = puzzleData.grid[row][col];
                const cellKey = `${row}-${col}`;
                const cellNumber = puzzleData.cellNumbers[cellKey];
                const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                const isHighlighted = isCellHighlighted(row, col);
                const value = gridState[cellKey] ?? '';

                if (!isActive) {
                  return <View key={cellKey} style={styles.cellBlack} />;
                }

                return (
                  <TouchableOpacity
                    key={cellKey}
                    style={[
                      styles.cell,
                      isHighlighted && styles.cellHighlighted,
                      isSelected && styles.cellSelected,
                    ]}
                    onPress={() => handleCellPress(row, col)}
                    activeOpacity={0.7}
                    testID={`cell-${row}-${col}`}
                  >
                    {cellNumber != null && (
                      <Text style={styles.cellNumber}>{cellNumber}</Text>
                    )}
                    <Text style={[styles.cellLetter, isSelected && styles.cellLetterSelected]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.checkBtn}
          onPress={() => { void checkPuzzle(); }}
          activeOpacity={0.85}
          testID="check-puzzle-btn"
        >
          <Check size={18} color="#0A0A0A" />
          <Text style={styles.checkBtnText}>Check Puzzle</Text>
        </TouchableOpacity>

        <View style={styles.cluesSection}>
          <Text style={styles.cluesSectionTitle}>Across</Text>
          {acrossClues.map(clue => (
            <TouchableOpacity
              key={clue.id}
              style={[styles.clueRow, selectedClue?.id === clue.id && styles.clueRowActive]}
              onPress={() => handleCluePress(clue)}
              activeOpacity={0.7}
            >
              <View style={[styles.clueNumWrap, { backgroundColor: 'rgba(52,152,219,0.12)' }]}>
                <Text style={[styles.clueNum, { color: '#3498DB' }]}>{clue.number}</Text>
              </View>
              <Text style={[styles.clueText, selectedClue?.id === clue.id && styles.clueTextActive]}>{clue.clue}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.cluesSectionTitle, { marginTop: 16 }]}>Down</Text>
          {downClues.map(clue => (
            <TouchableOpacity
              key={clue.id}
              style={[styles.clueRow, selectedClue?.id === clue.id && styles.clueRowActive]}
              onPress={() => handleCluePress(clue)}
              activeOpacity={0.7}
            >
              <View style={[styles.clueNumWrap, { backgroundColor: 'rgba(155,89,182,0.12)' }]}>
                <Text style={[styles.clueNum, { color: '#9B59B6' }]}>{clue.number}</Text>
              </View>
              <Text style={[styles.clueText, selectedClue?.id === clue.id && styles.clueTextActive]}>{clue.clue}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {selectedCell && (
        <View style={[styles.keyboard, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          {KEYBOARD_ROWS.map((row, ri) => (
            <View key={`kr-${ri}`} style={styles.keyboardRow}>
              {row.map(key => (
                <TouchableOpacity
                  key={key}
                  style={[styles.keyBtn, key === '⌫' && styles.keyBtnSpecial]}
                  onPress={() => {
                    if (key === '⌫') {
                      handleBackspace();
                    } else {
                      handleLetterInput(key);
                    }
                    if (Platform.OS !== 'web') {
                      void Haptics.selectionAsync();
                    }
                  }}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.keyText, key === '⌫' && styles.keyTextSpecial]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}
    </AppBackground>
  );
}

const CELL_SIZE = 36;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topBarCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    flex: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  resetBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  creditsBadge: {
    backgroundColor: Colors.goldMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  creditsText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFD700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
  },
  gameContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 14,
  },
  puzzleListHeader: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  puzzleListIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzleListTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: -0.5,
  },
  puzzleListDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  puzzleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  puzzleCardCompleted: {
    borderColor: 'rgba(46, 204, 113, 0.3)',
    backgroundColor: 'rgba(46, 204, 113, 0.04)',
  },
  puzzleCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  puzzleNumberWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  puzzleNumber: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  puzzleCardInfo: {
    flex: 1,
    gap: 6,
  },
  puzzleCardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  puzzleCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  diffBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffBadgeSmallText: {
    fontSize: 10,
    fontWeight: '800' as const,
  },
  puzzleCardClues: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  puzzleCardReward: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '700' as const,
  },
  completedBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeClueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  activeClueDirection: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  activeClueDirectionText: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  activeClueText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  gridContainer: {
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    position: 'relative' as const,
  },
  cellBlack: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#050505',
    borderWidth: 0.5,
    borderColor: 'rgba(30,30,30,0.3)',
  },
  cellHighlighted: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  cellSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderColor: Colors.gold,
    borderWidth: 1.5,
  },
  cellNumber: {
    position: 'absolute' as const,
    top: 1,
    left: 2,
    fontSize: 8,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  cellLetter: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  cellLetterSelected: {
    color: '#FFD700',
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  checkBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  cluesSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cluesSectionTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.gold,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  clueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  clueRowActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  clueNumWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clueNum: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  clueText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingTop: 3,
  },
  clueTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600' as const,
  },
  keyboard: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  keyBtn: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyBtnSpecial: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: 'rgba(231, 76, 60, 0.25)',
    paddingHorizontal: 16,
  },
  keyText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  keyTextSpecial: {
    color: '#E74C3C',
    fontSize: 16,
  },
  successOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 15,
    width: '100%',
  },
  successStarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#FFD700',
    letterSpacing: -0.3,
  },
  successReward: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2ECC71',
  },
  successDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  successActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  successBtn: {
    flex: 1,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  successBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#0A0A0A',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
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
