import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, ChevronRight, Zap, Check, XCircle, Trophy, Star, Share2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import AppBackground from '@/components/AppBackground';
import GlossyButton from '@/components/GlossyButton';
import { useTrivia, type TriviaRoundState } from '@/providers/TriviaProvider';
import { useGamification } from '@/providers/GamificationProvider';
import { type Difficulty, POINTS_BY_DIFFICULTY } from '@/mocks/triviaQuestions';

const EMERALD_DARK = '#0D3B12';
const EMERALD_BG = '#0A2E0F';
const GOLD_BRIGHT = '#FFD700';
const CARD_BG = 'rgba(13, 59, 18, 0.85)';
const CARD_BORDER = 'rgba(212, 175, 55, 0.35)';

type Phase = 'select' | 'playing' | 'feedback' | 'results';

export default function TriviaPlayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { startRound, answerQuestion, completeRound } = useTrivia();
  const { credits } = useGamification();

  const [phase, setPhase] = useState<Phase>('select');
  const [round, setRound] = useState<TriviaRoundState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [pointsThisQuestion, setPointsThisQuestion] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback((cb: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      cb();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleSelectDifficulty = useCallback((difficulty: Difficulty) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const newRound = startRound(difficulty);
    setRound(newRound);
    animateTransition(() => setPhase('playing'));
  }, [startRound, animateTransition]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (!round || selectedAnswer !== null) return;

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSelectedAnswer(answerIndex);
    const question = round.questions[round.currentIndex];
    const correct = answerIndex === question.correctIndex;
    setIsCorrect(correct);
    setPointsThisQuestion(correct ? POINTS_BY_DIFFICULTY[question.difficulty] : 0);

    if (Platform.OS !== 'web') {
      if (correct) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    const updated = answerQuestion(round, answerIndex);
    setRound(updated);

    setTimeout(() => {
      setPhase('feedback');
    }, 600);
  }, [round, selectedAnswer, answerQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (!round) return;
    setSelectedAnswer(null);

    if (round.isComplete) {
      completeRound(round);
      resultScale.setValue(0);
      animateTransition(() => setPhase('results'));
      Animated.spring(resultScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      animateTransition(() => setPhase('playing'));
    }
  }, [round, completeRound, animateTransition, resultScale]);

  const handlePlayAgain = useCallback(() => {
    setRound(null);
    setSelectedAnswer(null);
    animateTransition(() => setPhase('select'));
  }, [animateTransition]);

  const handleShareResult = useCallback(async () => {
    if (!round) return;
    const accuracy = round.questions.length > 0 ? Math.round((round.correctCount / round.questions.length) * 100) : 0;
    const message = `\u{1F9E0} LottoMind Trivia Results\n\n` +
      `Difficulty: ${round.difficulty.charAt(0).toUpperCase() + round.difficulty.slice(1)}\n` +
      `Score: ${round.correctCount}/${round.questions.length} correct (${accuracy}%)\n` +
      `Credits Earned: +${round.pointsEarned} \u{1FA99}\n\n` +
      `Think you can beat me? Try LottoMind AI!`;
    try {
      await Share.share({ message });
    } catch (e) {
      console.log('[TriviaPlay] Share error:', e);
    }
  }, [round]);

  const currentQuestion = round?.questions[round.currentIndex];
  const progress = round ? (round.currentIndex + (phase === 'feedback' || round.isComplete ? 1 : 0)) / round.questions.length : 0;

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          testID="trivia-play-close"
        >
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        {round && (
          <View style={styles.progressBarWrap}>
            <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` as unknown as number }]} />
          </View>
        )}
        <View style={styles.creditsChip}>
          <Text style={styles.creditsChipText}>{credits} 🪙</Text>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {phase === 'select' && (
          <View style={styles.selectContainer}>
            <Text style={styles.selectEmoji}>🧠</Text>
            <Text style={styles.selectTitle}>Choose Difficulty</Text>
            <Text style={styles.selectSub}>Harder questions earn more credits</Text>

            <TouchableOpacity
              style={[styles.difficultyCard, styles.difficultyEasy]}
              onPress={() => handleSelectDifficulty('easy')}
              activeOpacity={0.8}
              testID="difficulty-easy"
            >
              <View style={styles.difficultyLeft}>
                <View style={[styles.difficultyDot, { backgroundColor: '#2ECC71' }]} />
                <View>
                  <Text style={styles.difficultyName}>Easy</Text>
                  <Text style={styles.difficultyDesc}>Lottery basics & fundamentals</Text>
                </View>
              </View>
              <View style={styles.difficultyPoints}>
                <Text style={styles.difficultyPointsText}>+{POINTS_BY_DIFFICULTY.easy}</Text>
                <Text style={styles.difficultyPointsLabel}>pts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.difficultyCard, styles.difficultyMedium]}
              onPress={() => handleSelectDifficulty('medium')}
              activeOpacity={0.8}
              testID="difficulty-medium"
            >
              <View style={styles.difficultyLeft}>
                <View style={[styles.difficultyDot, { backgroundColor: GOLD_BRIGHT }]} />
                <View>
                  <Text style={styles.difficultyName}>Medium</Text>
                  <Text style={styles.difficultyDesc}>Probability & strategy concepts</Text>
                </View>
              </View>
              <View style={styles.difficultyPoints}>
                <Text style={[styles.difficultyPointsText, { color: GOLD_BRIGHT }]}>+{POINTS_BY_DIFFICULTY.medium}</Text>
                <Text style={styles.difficultyPointsLabel}>pts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.difficultyCard, styles.difficultyHard]}
              onPress={() => handleSelectDifficulty('hard')}
              activeOpacity={0.8}
              testID="difficulty-hard"
            >
              <View style={styles.difficultyLeft}>
                <View style={[styles.difficultyDot, { backgroundColor: '#FF6B35' }]} />
                <View>
                  <Text style={styles.difficultyName}>Hard</Text>
                  <Text style={styles.difficultyDesc}>History, odds & deep knowledge</Text>
                </View>
              </View>
              <View style={styles.difficultyPoints}>
                <Text style={[styles.difficultyPointsText, { color: '#FF6B35' }]}>+{POINTS_BY_DIFFICULTY.hard}</Text>
                <Text style={styles.difficultyPointsLabel}>pts</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'playing' && currentQuestion && (
          <View style={styles.questionContainer}>
            <View style={styles.questionMeta}>
              <View style={[
                styles.difficultyBadge,
                currentQuestion.difficulty === 'easy' && styles.badgeEasy,
                currentQuestion.difficulty === 'medium' && styles.badgeMedium,
                currentQuestion.difficulty === 'hard' && styles.badgeHard,
              ]}>
                <Text style={[
                  styles.difficultyBadgeText,
                  currentQuestion.difficulty === 'easy' && { color: '#2ECC71' },
                  currentQuestion.difficulty === 'medium' && { color: GOLD_BRIGHT },
                  currentQuestion.difficulty === 'hard' && { color: '#FF6B35' },
                ]}>
                  {currentQuestion.difficulty.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.categoryText}>{currentQuestion.category}</Text>
              <Text style={styles.questionNumber}>Q{(round?.currentIndex ?? 0) + 1}/{round?.questions.length ?? 5}</Text>
            </View>

            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = index === currentQuestion.correctIndex;
                const showResult = selectedAnswer !== null;
                return (
                  <TouchableOpacity
                    key={`opt-${index}`}
                    style={[
                      styles.optionButton,
                      isSelected && showResult && isCorrectOption && styles.optionCorrect,
                      isSelected && showResult && !isCorrectOption && styles.optionWrong,
                      !isSelected && showResult && isCorrectOption && styles.optionCorrectHint,
                    ]}
                    onPress={() => handleAnswer(index)}
                    activeOpacity={0.8}
                    disabled={selectedAnswer !== null}
                    testID={`option-${index}`}
                  >
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                    {showResult && isCorrectOption && (
                      <Check size={18} color="#2ECC71" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <XCircle size={18} color="#E74C3C" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {phase === 'feedback' && (
          <View style={styles.feedbackContainer}>
            <View style={[styles.feedbackIcon, isCorrect ? styles.feedbackIconCorrect : styles.feedbackIconWrong]}>
              {isCorrect ? (
                <Check size={40} color="#2ECC71" />
              ) : (
                <XCircle size={40} color="#E74C3C" />
              )}
            </View>
            <Text style={[styles.feedbackTitle, { color: isCorrect ? '#2ECC71' : '#E74C3C' }]}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
            {isCorrect && (
              <View style={styles.pointsEarnedBadge}>
                <Zap size={16} color={GOLD_BRIGHT} />
                <Text style={styles.pointsEarnedText}>+{pointsThisQuestion} Credits</Text>
              </View>
            )}
            <Text style={styles.feedbackSub}>
              {round?.isComplete
                ? `Round complete! ${round.correctCount}/${round.questions.length} correct`
                : `Question ${(round?.currentIndex ?? 0) + 1} of ${round?.questions.length ?? 5} remaining`}
            </Text>

            <GlossyButton
              onPress={handleNextQuestion}
              label={round?.isComplete ? 'See Results' : 'Next Question'}
              icon={<ChevronRight size={18} color="#FFFFFF" />}
              testID="next-question-btn"
              variant="green"
              size="medium"
            />
          </View>
        )}

        {phase === 'results' && round && (
          <Animated.View style={[styles.resultsContainer, { transform: [{ scale: resultScale }] }]}>
            <Text style={styles.resultsEmoji}>🏆</Text>
            <Text style={styles.resultsTitle}>Round Complete!</Text>

            <View style={styles.resultsCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Correct Answers</Text>
                <Text style={styles.resultValue}>{round.correctCount} / {round.questions.length}</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Credits Earned</Text>
                <View style={styles.resultCreditsRow}>
                  <Text style={styles.resultCreditsValue}>+{round.pointsEarned}</Text>
                  <Text style={styles.resultCreditsEmoji}>🪙</Text>
                </View>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Accuracy</Text>
                <Text style={styles.resultValue}>
                  {round.questions.length > 0 ? Math.round((round.correctCount / round.questions.length) * 100) : 0}%
                </Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Difficulty</Text>
                <Text style={[
                  styles.resultValue,
                  round.difficulty === 'easy' && { color: '#2ECC71' },
                  round.difficulty === 'medium' && { color: GOLD_BRIGHT },
                  round.difficulty === 'hard' && { color: '#FF6B35' },
                ]}>
                  {round.difficulty.charAt(0).toUpperCase() + round.difficulty.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.resultsActions}>
              <View style={{ flex: 1 }}>
                <GlossyButton
                  onPress={handlePlayAgain}
                  label="Play Again"
                  icon={<Star size={18} color="#FFFFFF" />}
                  testID="play-again-btn"
                  variant="green"
                  size="medium"
                />
              </View>

              <View style={{ flex: 1 }}>
                <GlossyButton
                  onPress={() => { void handleShareResult(); }}
                  label="Share"
                  icon={<Share2 size={18} color="#FFFFFF" />}
                  testID="share-result-btn"
                  variant="gold"
                  size="medium"
                />
              </View>
            </View>
          </Animated.View>
        )}

      </Animated.View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: GOLD_BRIGHT,
    borderRadius: 4,
  },
  creditsChip: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  creditsChipText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GOLD_BRIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  selectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 40,
  },
  selectEmoji: {
    fontSize: 56,
  },
  selectTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  selectSub: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 10,
  },
  difficultyCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
  },
  difficultyEasy: {
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  difficultyMedium: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  difficultyHard: {
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  difficultyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  difficultyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  difficultyName: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  difficultyDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  difficultyPoints: {
    alignItems: 'center',
  },
  difficultyPointsText: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#2ECC71',
  },
  difficultyPointsLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase' as const,
  },
  questionContainer: {
    flex: 1,
    paddingTop: 20,
    gap: 20,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeEasy: {
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  badgeMedium: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  badgeHard: {
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  difficultyBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    flex: 1,
  },
  questionNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GOLD_BRIGHT,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionCorrect: {
    borderColor: '#2ECC71',
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  optionWrong: {
    borderColor: '#E74C3C',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
  },
  optionCorrectHint: {
    borderColor: 'rgba(46, 204, 113, 0.4)',
    backgroundColor: 'rgba(46, 204, 113, 0.08)',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 60,
  },
  feedbackIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  feedbackIconCorrect: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderColor: 'rgba(46, 204, 113, 0.4)',
  },
  feedbackIconWrong: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: 'rgba(231, 76, 60, 0.4)',
  },
  feedbackTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
  },
  pointsEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  pointsEarnedText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: GOLD_BRIGHT,
  },
  feedbackSub: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD_BRIGHT,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 10,
    shadowColor: GOLD_BRIGHT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: EMERALD_DARK,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 40,
  },
  resultsEmoji: {
    fontSize: 64,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: GOLD_BRIGHT,
  },
  resultsCard: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  resultDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  resultCreditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultCreditsValue: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: GOLD_BRIGHT,
  },
  resultCreditsEmoji: {
    fontSize: 18,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  playAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD_BRIGHT,
    borderRadius: 14,
    paddingVertical: 16,
  },
  playAgainText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: EMERALD_DARK,
  },
  rewardsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  rewardsBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: GOLD_BRIGHT,
  },
});
