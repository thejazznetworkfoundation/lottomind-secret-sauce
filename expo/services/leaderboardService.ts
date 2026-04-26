import { arcadeStorage } from "@/services/arcadeStorage";
import type { JungleStageId, LeaderboardEntry } from "@/types/arcade";

function createEntry(score: number, stageId: JungleStageId, playerName: string): LeaderboardEntry {
  return {
    id: `${Date.now()}-${Math.round(Math.random() * 100000)}`,
    playerName,
    score,
    stageId,
    date: new Date().toISOString(),
  };
}

export async function submitScore(score: number, stageId: JungleStageId, playerName = "LottoMind Player"): Promise<LeaderboardEntry> {
  const entry = createEntry(score, stageId, playerName);
  await arcadeStorage.saveLeaderboardEntry(entry);
  return entry;
}

export async function getTopScores(limit = 10): Promise<LeaderboardEntry[]> {
  const entries = await arcadeStorage.getLocalLeaderboard();
  return entries.slice(0, limit);
}

export async function getUserRank(score: number): Promise<number> {
  const entries = await arcadeStorage.getLocalLeaderboard();
  const rank = entries.findIndex((entry) => score >= entry.score);
  return rank === -1 ? entries.length + 1 : rank + 1;
}

// Placeholder seam for a future remote leaderboard API.
export const remoteLeaderboardService = {
  submitScore,
  getTopScores,
  getUserRank,
};

