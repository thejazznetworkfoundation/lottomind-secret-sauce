import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery } from '@tanstack/react-query';
import { useLotto } from '@/providers/LottoProvider';
import { buildJackpotInfo, fetchLiveJackpots, shouldNotifyJackpot, getJackpotAlertMessage, type JackpotInfo, type LiveJackpotData } from '@/utils/jackpotApi';
import { GameType } from '@/types/lottery';

const NOTIFIED_KEY = 'lottomind_jackpot_notified';
const ALERTS_ENABLED_KEY = 'lottomind_jackpot_alerts';

export interface JackpotContextValue {
  jackpots: JackpotInfo[];
  alertsEnabled: boolean;
  toggleAlerts: () => void;
  dismissAlert: (game: GameType) => void;
  pendingAlerts: JackpotInfo[];
  lastChecked: string | null;
}

export const [JackpotProvider, useJackpot] = createContextHook<JackpotContextValue>(() => {
  const { liveDraws } = useLotto();
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [notifiedGames, setNotifiedGames] = useState<Set<string>>(new Set());
  const [pendingAlerts, setPendingAlerts] = useState<JackpotInfo[]>([]);
  const hasShownAlert = useRef<Set<string>>(new Set());

  const alertsQuery = useQuery({
    queryKey: ['jackpotAlertsEnabled'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ALERTS_ENABLED_KEY);
      return stored !== 'false';
    },
  });

  const notifiedQuery = useQuery({
    queryKey: ['jackpotNotified'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(NOTIFIED_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();
    },
  });

  useEffect(() => {
    if (alertsQuery.data !== undefined) {
      setAlertsEnabled(alertsQuery.data);
    }
  }, [alertsQuery.data]);

  useEffect(() => {
    if (notifiedQuery.data) {
      setNotifiedGames(notifiedQuery.data);
    }
  }, [notifiedQuery.data]);

  const liveJackpotQuery = useQuery({
    queryKey: ['liveJackpots'],
    queryFn: fetchLiveJackpots,
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 30,
    retry: 2,
  });

  const jackpots = useMemo(() => {
    const games: GameType[] = ['powerball', 'megamillions'];
    const results: JackpotInfo[] = [];
    const liveData = liveJackpotQuery.data;
    for (const game of games) {
      const draws = liveDraws.filter(d => d.game === game);
      const liveJp = liveData ? liveData[game] : null;
      const info = buildJackpotInfo(game, draws.length > 0 ? draws : liveDraws, liveJp);
      if (info) {
        results.push(info);
      }
    }
    return results;
  }, [liveDraws, liveJackpotQuery.data]);

  useEffect(() => {
    if (!alertsEnabled) return;

    const newPending: JackpotInfo[] = [];
    for (const jp of jackpots) {
      const alertKey = `${jp.game}-${jp.currentJackpot}`;
      if (shouldNotifyJackpot(jp) && !notifiedGames.has(alertKey) && !hasShownAlert.current.has(alertKey)) {
        newPending.push(jp);
        hasShownAlert.current.add(alertKey);
      }
    }

    if (newPending.length > 0) {
      setPendingAlerts(prev => [...prev, ...newPending]);

      for (const jp of newPending) {
        const msg = getJackpotAlertMessage(jp);
        console.log('[JackpotProvider] Jackpot alert:', msg);
        Alert.alert(
          `${jp.gameName} Jackpot Alert`,
          msg,
          [{ text: 'Got it', style: 'default' }]
        );
      }
    }
  }, [jackpots, alertsEnabled, notifiedGames]);

  const toggleAlerts = useCallback(() => {
    setAlertsEnabled(prev => {
      const next = !prev;
      void AsyncStorage.setItem(ALERTS_ENABLED_KEY, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const dismissAlert = useCallback((game: GameType) => {
    const jp = jackpots.find(j => j.game === game);
    if (!jp) return;

    const alertKey = `${jp.game}-${jp.currentJackpot}`;
    setNotifiedGames(prev => {
      const next = new Set(prev);
      next.add(alertKey);
      void AsyncStorage.setItem(NOTIFIED_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
    setPendingAlerts(prev => prev.filter(p => p.game !== game));
  }, [jackpots]);

  const lastChecked = useMemo(() => {
    return jackpots.length > 0 ? jackpots[0].lastUpdated : null;
  }, [jackpots]);

  return useMemo(() => ({
    jackpots,
    alertsEnabled,
    toggleAlerts,
    dismissAlert,
    pendingAlerts,
    lastChecked,
  }), [jackpots, alertsEnabled, toggleAlerts, dismissAlert, pendingAlerts, lastChecked]);
});
