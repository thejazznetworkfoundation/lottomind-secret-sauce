import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameType, StrategyType, GeneratedSet, LottoContextValue } from '@/types/lottery';
import { generateId } from '@/utils/generator';
import { fetchRecentDraws, getStateResults } from '@/services/lotteryEngine';
import { buildPredictionContext, createPredictedSet } from '@/utils/predictions';
import { fetchPick3Draws, fetchPick4Draws } from '@/utils/pick3pick4Api';
import { getStateConfig } from '@/config/states';
import { fetchStateGameList, buildGameDrawResults, type NosyGameDrawResult } from '@/utils/nosyApi';

const HISTORY_KEY = 'lottomind_history';
const GAME_KEY = 'lottomind_game';
const PICK_STATE_KEY = 'lottomind_pick_state';

export const [LottoProvider, useLotto] = createContextHook<LottoContextValue>(() => {
  const queryClient = useQueryClient();
  const [currentGame, setCurrentGame] = useState<GameType>('powerball');
  const [history, setHistory] = useState<GeneratedSet[]>([]);
  const [pickState, setPickStateLocal] = useState<string>('NY');

  const historyQuery = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      return stored ? (JSON.parse(stored) as GeneratedSet[]) : [];
    },
  });

  const gameQuery = useQuery({
    queryKey: ['currentGame'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GAME_KEY);
      return (stored as GameType) || 'powerball';
    },
  });

  const pickStateQuery = useQuery({
    queryKey: ['pickState'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PICK_STATE_KEY);
      return stored || 'NY';
    },
  });

  const liveDrawsQuery = useQuery({
    queryKey: ['liveDraws', currentGame],
    queryFn: async () => fetchRecentDraws(currentGame),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  useQuery({
    queryKey: ['stateResults', pickState],
    queryFn: () => getStateResults(pickState),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const pick3Query = useQuery({
    queryKey: ['pick3draws', pickState],
    queryFn: () => fetchPick3Draws(pickState),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 2,
  });

  const pick4Query = useQuery({
    queryKey: ['pick4draws', pickState],
    queryFn: () => fetchPick4Draws(pickState),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 2,
  });

  const nosyGamesQuery = useQuery({
    queryKey: ['nosyGames', pickState],
    queryFn: () => fetchStateGameList(pickState),
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  useEffect(() => {
    if (historyQuery.data) {
      setHistory(historyQuery.data);
    }
  }, [historyQuery.data]);

  useEffect(() => {
    if (gameQuery.data) {
      setCurrentGame(gameQuery.data);
    }
  }, [gameQuery.data]);

  useEffect(() => {
    if (pickStateQuery.data) {
      setPickStateLocal(pickStateQuery.data);
    }
  }, [pickStateQuery.data]);

  const syncHistory = useMutation({
    mutationFn: async (items: GeneratedSet[]) => {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
      return items;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const switchGame = useCallback((game: GameType) => {
    setCurrentGame(game);
    void AsyncStorage.setItem(GAME_KEY, game).catch(() => {});
  }, []);

  const setPickState = useCallback((state: string) => {
    setPickStateLocal(state);
    void AsyncStorage.setItem(PICK_STATE_KEY, state).catch(() => {});
    void queryClient.invalidateQueries({ queryKey: ['pick3draws'] });
    void queryClient.invalidateQueries({ queryKey: ['pick4draws'] });
    void queryClient.invalidateQueries({ queryKey: ['stateResults'] });
    void queryClient.invalidateQueries({ queryKey: ['nosyGames'] });
    console.log('[LottoProvider] State changed to', state, getStateConfig(state)?.name);
  }, [queryClient]);

  const predictionContext = useMemo(() => {
    return buildPredictionContext(currentGame, liveDrawsQuery.data ?? []);
  }, [currentGame, liveDrawsQuery.data]);

  const generate = useCallback(
    (strategy: StrategyType): GeneratedSet => {
      const prediction = createPredictedSet(currentGame, strategy, predictionContext);
      const newSet: GeneratedSet = {
        id: generateId(),
        numbers: prediction.numbers,
        bonusNumber: prediction.bonusNumber,
        game: currentGame,
        strategy,
        createdAt: new Date().toISOString(),
        prediction,
      };
      const updated = [newSet, ...history].slice(0, 100);
      setHistory(updated);
      syncHistory.mutate(updated);
      return newSet;
    },
    [currentGame, history, predictionContext, syncHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    syncHistory.mutate([]);
  }, [syncHistory]);

  const liveDataError = liveDrawsQuery.error instanceof Error ? liveDrawsQuery.error.message : null;
  const latestDraw = liveDrawsQuery.data?.[0] ?? null;

  const stateGames = useMemo(() => {
    const config = getStateConfig(pickState);
    return config?.games ?? [];
  }, [pickState]);

  const stateName = useMemo(() => {
    const config = getStateConfig(pickState);
    return config?.name ?? pickState;
  }, [pickState]);

  const pick3Summary = useMemo(() => {
    const latest = pick3Query.data?.[0];
    if (!latest) return 'Pick 3: No data yet';
    return `Pick 3 latest: ${latest.numbers.join('-')} (${latest.drawTime} ${latest.drawDate})`;
  }, [pick3Query.data]);

  const pick4Summary = useMemo(() => {
    const latest = pick4Query.data?.[0];
    if (!latest) return 'Pick 4: No data yet';
    return `Pick 4 latest: ${latest.numbers.join('-')} (${latest.drawTime} ${latest.drawDate})`;
  }, [pick4Query.data]);

  const gameDrawResults = useMemo<NosyGameDrawResult[]>(() => {
    const games = nosyGamesQuery.data ?? [];
    if (games.length === 0) return [];
    const liveFormatted = (liveDrawsQuery.data ?? []).map(d => ({
      game: d.game,
      numbers: d.numbers,
      bonusNumber: d.bonusNumber,
      drawDate: d.drawDate,
    }));
    return buildGameDrawResults(games, liveFormatted);
  }, [nosyGamesQuery.data, liveDrawsQuery.data]);

  return useMemo(
    () => ({
      currentGame,
      switchGame,
      history,
      generate,
      clearHistory,
      isLoading: historyQuery.isLoading,
      liveDraws: liveDrawsQuery.data ?? [],
      liveDataError,
      isLiveDataLoading: liveDrawsQuery.isLoading,
      hotNumbers: predictionContext.hotNumbers,
      coldNumbers: predictionContext.coldNumbers,
      frequencies: predictionContext.frequencies,
      latestDraw,
      pickState,
      setPickState,
      pick3Summary,
      pick4Summary,
      stateGames,
      stateName,
      nosyGames: nosyGamesQuery.data ?? [],
      isNosyGamesLoading: nosyGamesQuery.isLoading,
      gameDrawResults,
      pick3Draws: pick3Query.data ?? [],
      pick4Draws: pick4Query.data ?? [],
      isPick3Loading: pick3Query.isLoading,
      isPick4Loading: pick4Query.isLoading,
    }),
    [
      currentGame,
      switchGame,
      history,
      generate,
      clearHistory,
      historyQuery.isLoading,
      liveDrawsQuery.data,
      liveDataError,
      liveDrawsQuery.isLoading,
      predictionContext.hotNumbers,
      predictionContext.coldNumbers,
      predictionContext.frequencies,
      latestDraw,
      pickState,
      setPickState,
      pick3Summary,
      pick4Summary,
      stateGames,
      stateName,
      nosyGamesQuery.data,
      nosyGamesQuery.isLoading,
      gameDrawResults,
      pick3Query.data,
      pick3Query.isLoading,
      pick4Query.data,
      pick4Query.isLoading,
    ]
  );
});
