import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  TRIVIA_QUESTIONS,
  POINTS_BY_DIFFICULTY,
  QUESTIONS_PER_ROUND,
  DAILY_STREAK_BONUS_THRESHOLD,
  DAILY_STREAK_BONUS_CREDITS,
  WEEKLY_STREAK_BONUS_THRESHOLD,
  WEEKLY_STREAK_BONUS_CREDITS,
  UNLOCKABLE_FEATURES,
  type TriviaQuestion,
  type Difficulty,
} from '@/mocks/triviaQuestions';
import { useGamification } from '@/providers/GamificationProvider';

const TRIVIA_KEY = 'lottomind_trivia';

interface TriviaHistory {
  date: string;
  questionsAttempted: number;
  correctAnswers: number;
  pointsEarned: number;
}

interface TriviaData {
  dailyStreak: number;
  weeklyStreak: number;
  lastPlayedDate: string | null;
  totalCorrect: number;
  totalAttempted: number;
  totalPointsEarned: number;
  unlockedFeatures: string[];
  triviaHistory: TriviaHistory[];
  weekStartDate: string | null;
}

const DEFAULT_TRIVIA: TriviaData = {
  dailyStreak: 0,
  weeklyStreak: 0,
  lastPlayedDate: null,
  totalCorrect: 0,
  totalAttempted: 0,
  totalPointsEarned: 0,
  unlockedFeatures: [],
  triviaHistory: [],
  weekStartDate: null,
};

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface TriviaRoundState {
  questions: TriviaQuestion[];
  currentIndex: number;
  answers: (number | null)[];
  correctCount: number;
  pointsEarned: number;
  isComplete: boolean;
  difficulty: Difficulty;
}

export interface TriviaContextValue {
  data: TriviaData;
  isLoading: boolean;
  hasPlayedToday: boolean;
  startRound: (difficulty: Difficulty) => TriviaRoundState;
  answerQuestion: (round: TriviaRoundState, answerIndex: number) => TriviaRoundState;
  completeRound: (round: TriviaRoundState) => void;
  unlockFeature: (featureId: string) => boolean;
  isFeatureUnlocked: (featureId: string) => boolean;
  getStreakBonusInfo: () => { dailyBonusEarned: boolean; weeklyBonusEarned: boolean; dailyProgress: number; weeklyProgress: number };
}

export const [TriviaProvider, useTrivia] = createContextHook<TriviaContextValue>(() => {
  const queryClient = useQueryClient();
  const { addCredits, spendCredits } = useGamification();
  const [data, setData] = useState<TriviaData>(DEFAULT_TRIVIA);

  const dataQuery = useQuery({
    queryKey: ['trivia'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(TRIVIA_KEY);
      if (stored) {
        return JSON.parse(stored) as TriviaData;
      }
      await AsyncStorage.setItem(TRIVIA_KEY, JSON.stringify(DEFAULT_TRIVIA));
      return DEFAULT_TRIVIA;
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setData(dataQuery.data);
    }
  }, [dataQuery.data]);

  const syncData = useMutation({
    mutationFn: async (newData: TriviaData) => {
      await AsyncStorage.setItem(TRIVIA_KEY, JSON.stringify(newData));
      return newData;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trivia'] });
    },
  });

  const hasPlayedToday = useMemo(() => {
    return data.lastPlayedDate === getTodayStr();
  }, [data.lastPlayedDate]);

  const startRound = useCallback((difficulty: Difficulty): TriviaRoundState => {
    const filtered = TRIVIA_QUESTIONS.filter(q => q.difficulty === difficulty);
    const pool = filtered.length >= QUESTIONS_PER_ROUND ? filtered : TRIVIA_QUESTIONS;
    const questions = shuffleArray(pool).slice(0, QUESTIONS_PER_ROUND);
    console.log('[Trivia] Starting round with difficulty:', difficulty, 'questions:', questions.length);
    return {
      questions,
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
      correctCount: 0,
      pointsEarned: 0,
      isComplete: false,
      difficulty,
    };
  }, []);

  const answerQuestion = useCallback((round: TriviaRoundState, answerIndex: number): TriviaRoundState => {
    const question = round.questions[round.currentIndex];
    const isCorrect = answerIndex === question.correctIndex;
    const points = isCorrect ? POINTS_BY_DIFFICULTY[question.difficulty] : 0;
    const newAnswers = [...round.answers];
    newAnswers[round.currentIndex] = answerIndex;
    const nextIndex = round.currentIndex + 1;
    const isComplete = nextIndex >= round.questions.length;

    console.log('[Trivia] Answer:', isCorrect ? 'CORRECT' : 'WRONG', 'points:', points);

    return {
      ...round,
      answers: newAnswers,
      correctCount: round.correctCount + (isCorrect ? 1 : 0),
      pointsEarned: round.pointsEarned + points,
      currentIndex: isComplete ? round.currentIndex : nextIndex,
      isComplete,
    };
  }, []);

  const completeRound = useCallback((round: TriviaRoundState) => {
    const today = getTodayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newDailyStreak = data.dailyStreak;
    if (data.lastPlayedDate === yesterdayStr) {
      newDailyStreak = data.dailyStreak + 1;
    } else if (data.lastPlayedDate !== today) {
      newDailyStreak = 1;
    }

    let newWeeklyStreak = data.weeklyStreak;
    if (data.lastPlayedDate === yesterdayStr || data.lastPlayedDate === today) {
      newWeeklyStreak = Math.min(7, data.weeklyStreak + (data.lastPlayedDate === today ? 0 : 1));
    } else {
      newWeeklyStreak = 1;
    }

    let bonusCredits = 0;
    if (newDailyStreak >= DAILY_STREAK_BONUS_THRESHOLD && data.dailyStreak < DAILY_STREAK_BONUS_THRESHOLD) {
      bonusCredits += DAILY_STREAK_BONUS_CREDITS;
      console.log('[Trivia] Daily streak bonus earned:', DAILY_STREAK_BONUS_CREDITS);
    }
    if (newWeeklyStreak >= WEEKLY_STREAK_BONUS_THRESHOLD && data.weeklyStreak < WEEKLY_STREAK_BONUS_THRESHOLD) {
      bonusCredits += WEEKLY_STREAK_BONUS_CREDITS;
      console.log('[Trivia] Weekly streak bonus earned:', WEEKLY_STREAK_BONUS_CREDITS);
    }

    const totalEarned = round.pointsEarned + bonusCredits;
    if (totalEarned > 0) {
      addCredits(totalEarned);
    }

    const historyEntry: TriviaHistory = {
      date: today,
      questionsAttempted: round.questions.length,
      correctAnswers: round.correctCount,
      pointsEarned: round.pointsEarned,
    };

    const updated: TriviaData = {
      ...data,
      dailyStreak: newDailyStreak,
      weeklyStreak: newWeeklyStreak,
      lastPlayedDate: today,
      totalCorrect: data.totalCorrect + round.correctCount,
      totalAttempted: data.totalAttempted + round.questions.length,
      totalPointsEarned: data.totalPointsEarned + round.pointsEarned,
      triviaHistory: [historyEntry, ...data.triviaHistory].slice(0, 30),
    };

    setData(updated);
    syncData.mutate(updated);
    console.log('[Trivia] Round complete. Points:', round.pointsEarned, 'Bonus:', bonusCredits, 'Streak:', newDailyStreak);
  }, [data, addCredits, syncData]);

  const unlockFeature = useCallback((featureId: string): boolean => {
    const feature = UNLOCKABLE_FEATURES.find(f => f.id === featureId);
    if (!feature) return false;
    if (data.unlockedFeatures.includes(featureId)) return false;
    const success = spendCredits(feature.cost);
    if (!success) return false;

    const updated = {
      ...data,
      unlockedFeatures: [...data.unlockedFeatures, featureId],
    };
    setData(updated);
    syncData.mutate(updated);
    console.log('[Trivia] Feature unlocked:', featureId);
    return true;
  }, [data, spendCredits, syncData]);

  const isFeatureUnlocked = useCallback((featureId: string): boolean => {
    return data.unlockedFeatures.includes(featureId);
  }, [data.unlockedFeatures]);

  const getStreakBonusInfo = useCallback(() => {
    return {
      dailyBonusEarned: data.dailyStreak >= DAILY_STREAK_BONUS_THRESHOLD,
      weeklyBonusEarned: data.weeklyStreak >= WEEKLY_STREAK_BONUS_THRESHOLD,
      dailyProgress: Math.min(data.dailyStreak, DAILY_STREAK_BONUS_THRESHOLD),
      weeklyProgress: Math.min(data.weeklyStreak, WEEKLY_STREAK_BONUS_THRESHOLD),
    };
  }, [data.dailyStreak, data.weeklyStreak]);

  return useMemo(() => ({
    data,
    isLoading: dataQuery.isLoading,
    hasPlayedToday,
    startRound,
    answerQuestion,
    completeRound,
    unlockFeature,
    isFeatureUnlocked,
    getStreakBonusInfo,
  }), [data, dataQuery.isLoading, hasPlayedToday, startRound, answerQuestion, completeRound, unlockFeature, isFeatureUnlocked, getStreakBonusInfo]);
});
