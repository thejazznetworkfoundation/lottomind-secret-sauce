import { useCallback, useEffect, useState } from "react";
import {
  buildLottoMindFeatureBundle,
  GeneratorMode,
  LottoMindFeatureBundle,
} from "@/lib/lottoMindApi";

interface Params {
  stateName: string;
  gameId: string | number;
  earnedCredits: number;
  includeHistory: boolean;
  historyDepth: number;
  scannerTicketNumbers?: string[];
  generatorLength: number;
  generatorMode: GeneratorMode;
}

export function useLottoMindData(params: Params) {
  const [data, setData] = useState<LottoMindFeatureBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null);
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        console.log("[useLottoMindData] Loading data...", {
          state: params.stateName,
          gameId: params.gameId,
        });

        const result = await buildLottoMindFeatureBundle({
          state: params.stateName,
          gameId: params.gameId,
          earnedCredits: params.earnedCredits,
          includeHistory: params.includeHistory,
          historyDepth: params.historyDepth,
          scannerTicketNumbers: params.scannerTicketNumbers,
          generatorLength: params.generatorLength,
          generatorMode: params.generatorMode,
          powerToolUnlockCredits: 150,
        });

        console.log("[useLottoMindData] Data loaded successfully");
        setData(result);
      } catch (err: any) {
        console.log("[useLottoMindData] Error:", err?.message);
        setError(err?.message || "Failed to load LottoMind data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      params.stateName,
      params.gameId,
      params.earnedCredits,
      params.includeHistory,
      params.historyDepth,
      params.scannerTicketNumbers?.join("-"),
      params.generatorLength,
      params.generatorMode,
    ]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    reload: () => load(false),
    refresh: () => load(true),
  };
}
