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
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  X,
  Check,
  RotateCcw,
  Star,
  Search,
  ChevronRight,
  Share2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import { WORD_SEARCH_PUZZLES, buildWordSearchGrid, type WordSearchPuzzle } from '@/mocks/wordSearchData';
import { useGamification } from '@/providers/GamificationProvider';

const COMPLETED_KEY = '@lottomind_wordsearch_completed';

type SelectedCell = { row: number; col: number };

export default function WordSearchScreen() {
  console.log('[WordSearchScreen] rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { credits, addCredits } = useGamification();

  const [selectedPuzzle, setSelectedPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const successScale = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(COMPLETED_KEY).then((val) => {
      if (val) setCompletedPuzzles(JSON.parse(val));
    }).catch(() => {});
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [headerAnim]);

  const gridData = useMemo(() => {
    if (!selectedPuzzle) return null;
    return buildWordSearchGrid(selectedPuzzle);
  }, [selectedPuzzle]);

  const handleCellPress = useCallback((row: number, col: number) => {
    if (!gridData || !selectedPuzzle) return;

    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }

    setSelectedCells(prev => {
      const exists = prev.find(c => c.row === row && c.col === col);
      if (exists) {
        return prev.filter(c => !(c.row === row && c.col === col));
      }

      const newCells = [...prev, { row, col }];

      const selectedWord = newCells.map(c => gridData.grid[c.row][c.col]).join('');

      for (const word of selectedPuzzle.words) {
        if (selectedWord === word && !foundWords.includes(word)) {
          const positions = newCells.map(c => `${c.row}-${c.col}`);
          setHighlightedCells(prevH => {
            const next = new Set(prevH);
            positions.forEach(p => next.add(p));
            return next;
          });
          setFoundWords(prevF => {
            const updated = [...prevF, word];
            if (Platform.OS !== 'web') {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            if (updated.length === selectedPuzzle.words.length) {
              setTimeout(() => {
                void handlePuzzleComplete();
              }, 300);
            }
            return updated;
          });
          return [];
        }

        const reversed = newCells.map(c => gridData.grid[c.row][c.col]).reverse().join('');
        if (reversed === word && !foundWords.includes(word)) {
          const positions = newCells.map(c => `${c.row}-${c.col}`);
          setHighlightedCells(prevH => {
            const next = new Set(prevH);
            positions.forEach(p => next.add(p));
            return next;
          });
          setFoundWords(prevF => {
            const updated = [...prevF, word];
            if (Platform.OS !== 'web') {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            if (updated.length === selectedPuzzle.words.length) {
              setTimeout(() => {
                void handlePuzzleComplete();
              }, 300);
            }
            return updated;
          });
          return [];
        }
      }

      if (newCells.length > 15) {
        return [{ row, col }];
      }

      return newCells;
    });
  }, [gridData, selectedPuzzle, foundWords]);

  const handleShareResult = useCallback(async (puzzle: WordSearchPuzzle) => {
    const message = `\u{1F50D} LottoMind Word Search\n\n` +
      `Solved: "${puzzle.title}"\n` +
      `Difficulty: ${puzzle.difficulty}\n` +
      `Words Found: ${puzzle.words.length}/${puzzle.words.length}\n` +
      `Credits Earned: +${puzzle.rewardCredits} \u{1FA99}\n\n` +
      `Think you can beat me? Try LottoMind AI!`;
    try {
      await Share.share({ message });
    } catch (e) {
      console.log('[WordSearch] Share error:', e);
    }
  }, []);

  const handlePuzzleComplete = useCallback(async () => {
    if (!selectedPuzzle) return;
    setShowSuccess(true);
    Animated.spring(successScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();

    if (!completedPuzzles.includes(selectedPuzzle.id)) {
      const updated = [...completedPuzzles, selectedPuzzle.id];
      setCompletedPuzzles(updated);
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(updated));
      addCredits(selectedPuzzle.rewardCredits);
      console.log('[WordSearch] Puzzle completed! +', selectedPuzzle.rewardCredits, 'credits');
    }
  }, [selectedPuzzle, completedPuzzles, successScale, addCredits]);

  const resetPuzzle = useCallback(() => {
    setFoundWords([]);
    setSelectedCells([]);
    setHighlightedCells(new Set());
    setShowSuccess(false);
    successScale.setValue(0);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, [successScale]);

  const clearSelection = useCallback(() => {
    setSelectedCells([]);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  if (!selectedPuzzle || !gridData) {
    return (
      <AppBackground style={{ paddingTop: insets.top }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} testID="wordsearch-close">
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Word Search</Text>
          <View style={styles.creditsBadge}>
            <Text style={styles.creditsText}>{credits} 🪙</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.puzzleListHeader, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <View style={styles.puzzleListIconWrap}>
              <Search size={28} color="#3498DB" />
            </View>
            <Text style={styles.puzzleListTitle}>Word Search</Text>
            <Text style={styles.puzzleListDesc}>Find hidden lottery words and earn Mind Credits!</Text>
          </Animated.View>

          {WORD_SEARCH_PUZZLES.map((puzzle, idx) => {
            const isCompleted = completedPuzzles.includes(puzzle.id);
            const diffColors: Record<string, string> = { Easy: '#2ECC71', Medium: '#F5A623', Hard: '#E74C3C' };
            const diffColor = diffColors[puzzle.difficulty];
            return (
              <TouchableOpacity
                key={puzzle.id}
                style={[styles.puzzleCard, isCompleted && styles.puzzleCardCompleted]}
                onPress={() => {
                  setSelectedPuzzle(puzzle);
                  setFoundWords([]);
                  setSelectedCells([]);
                  setHighlightedCells(new Set());
                  setShowSuccess(false);
                  successScale.setValue(0);
                }}
                activeOpacity={0.85}
                testID={`ws-puzzle-${puzzle.id}`}
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
                      <Text style={styles.puzzleCardClues}>{puzzle.words.length} words</Text>
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

  const cellSize = Math.min(Math.floor((340) / selectedPuzzle.gridSize), 34);

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { setSelectedPuzzle(null); resetPuzzle(); }} style={styles.closeBtn} testID="wordsearch-back">
          <X size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>{selectedPuzzle.title}</Text>
          <View style={[styles.diffBadgeSmall, { backgroundColor: selectedPuzzle.difficulty === 'Easy' ? 'rgba(46,204,113,0.15)' : selectedPuzzle.difficulty === 'Medium' ? 'rgba(245,166,35,0.15)' : 'rgba(231,76,60,0.15)' }]}>
            <Text style={[styles.diffBadgeSmallText, { color: selectedPuzzle.difficulty === 'Easy' ? '#2ECC71' : selectedPuzzle.difficulty === 'Medium' ? '#F5A623' : '#E74C3C' }]}>{selectedPuzzle.difficulty}</Text>
          </View>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity onPress={resetPuzzle} style={styles.resetBtn} testID="wordsearch-reset">
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
            <Text style={styles.successTitle}>All Words Found!</Text>
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
                testID="ws-share-btn"
              >
                <Share2 size={16} color="#3498DB" />
                <Text style={styles.shareBtnText}>Share Result</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.gameContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{foundWords.length} / {selectedPuzzle.words.length} words found</Text>
          <View style={styles.progressBarWrap}>
            <View style={[styles.progressBarFill, { width: `${Math.round((foundWords.length / selectedPuzzle.words.length) * 100)}%` as unknown as number }]} />
          </View>
        </View>

        <View style={styles.wordListWrap}>
          {selectedPuzzle.words.map(word => {
            const isFound = foundWords.includes(word);
            return (
              <View key={word} style={[styles.wordChip, isFound && styles.wordChipFound]}>
                <Text style={[styles.wordChipText, isFound && styles.wordChipTextFound]}>{word}</Text>
                {isFound && <Check size={12} color="#2ECC71" />}
              </View>
            );
          })}
        </View>

        <View style={styles.gridContainer}>
          {gridData.grid.map((row, r) => (
            <View key={`row-${r}`} style={styles.gridRow}>
              {row.map((letter, c) => {
                const cellKey = `${r}-${c}`;
                const isHighlighted = highlightedCells.has(cellKey);
                const isSelected = selectedCells.some(sc => sc.row === r && sc.col === c);
                return (
                  <TouchableOpacity
                    key={cellKey}
                    style={[
                      styles.cell,
                      { width: cellSize, height: cellSize },
                      isHighlighted && styles.cellFound,
                      isSelected && styles.cellSelected,
                    ]}
                    onPress={() => handleCellPress(r, c)}
                    activeOpacity={0.6}
                    testID={`ws-cell-${r}-${c}`}
                  >
                    <Text style={[
                      styles.cellLetter,
                      { fontSize: cellSize > 28 ? 15 : 12 },
                      isHighlighted && styles.cellLetterFound,
                      isSelected && styles.cellLetterSelected,
                    ]}>{letter}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {selectedCells.length > 0 && (
          <View style={styles.selectionRow}>
            <View style={styles.selectionPreview}>
              <Text style={styles.selectionText}>
                {selectedCells.map(c => gridData.grid[c.row][c.col]).join('')}
              </Text>
            </View>
            <TouchableOpacity style={styles.clearBtn} onPress={clearSelection} activeOpacity={0.7}>
              <X size={16} color="#E74C3C" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </AppBackground>
  );
}

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
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(52, 152, 219, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzleListTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#3498DB',
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
  progressRow: {
    gap: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressBarWrap: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2ECC71',
    borderRadius: 4,
  },
  wordListWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  wordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wordChipFound: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  wordChipText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  wordChipTextFound: {
    color: '#2ECC71',
    textDecorationLine: 'line-through' as const,
  },
  gridContainer: {
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 152, 219, 0.25)',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: Colors.surfaceLight,
  },
  cellFound: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  cellSelected: {
    backgroundColor: 'rgba(52, 152, 219, 0.3)',
    borderColor: 'rgba(52, 152, 219, 0.5)',
    borderWidth: 1.5,
  },
  cellLetter: {
    fontWeight: '800' as const,
    color: Colors.textPrimary,
  },
  cellLetterFound: {
    color: '#2ECC71',
  },
  cellLetterSelected: {
    color: '#3498DB',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  selectionPreview: {
    backgroundColor: 'rgba(52, 152, 219, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.25)',
  },
  selectionText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#3498DB',
    letterSpacing: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.25)',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#E74C3C',
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
    borderColor: 'rgba(52, 152, 219, 0.4)',
    shadowColor: '#3498DB',
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
    color: '#3498DB',
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
    backgroundColor: '#3498DB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  successBtnText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 152, 219, 0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#3498DB',
  },
});
