import AsyncStorage from "@react-native-async-storage/async-storage";
import type { JungleStageId, LeaderboardEntry } from "@/types/arcade";
import { getDailyDateKey } from "@/utils/arcade/dailySeed";

const KEYS = {
  unlockedCharacters: "lottomind.arcade.unlockedCharacters",
  highScores: "lottomind.arcade.highScores",
  credits: "lottomind.arcade.credits",
  completedStages: "lottomind.arcade.completedStages",
  selectedCharacter: "lottomind.arcade.selectedCharacter",
  dailyRunCompletionDate: "lottomind.arcade.dailyRunCompletionDate",
  cosmeticUnlocks: "lottomind.arcade.cosmeticUnlocks",
  localLeaderboard: "lottomind.arcade.localLeaderboard",
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const arcadeStorage = {
  async getUnlockedCharacters(): Promise<string[]> {
    return readJson(KEYS.unlockedCharacters, ["lottomind-hero"]);
  },

  async unlockCharacter(characterId: string): Promise<void> {
    const characters = await arcadeStorage.getUnlockedCharacters();
    if (!characters.includes(characterId)) {
      await writeJson(KEYS.unlockedCharacters, [...characters, characterId]);
    }
  },

  async getSelectedCharacter(): Promise<string> {
    return readJson(KEYS.selectedCharacter, "lottomind-hero");
  },

  async setSelectedCharacter(characterId: string): Promise<void> {
    await writeJson(KEYS.selectedCharacter, characterId);
  },

  async getHighScores(): Promise<Record<JungleStageId, number>> {
    return readJson(KEYS.highScores, {} as Record<JungleStageId, number>);
  },

  async saveHighScore(stageId: JungleStageId, score: number): Promise<void> {
    const scores = await arcadeStorage.getHighScores();
    await writeJson(KEYS.highScores, { ...scores, [stageId]: Math.max(scores[stageId] ?? 0, score) });
  },

  async getCredits(): Promise<number> {
    return readJson(KEYS.credits, 0);
  },

  async addCredits(amount: number): Promise<number> {
    const current = await arcadeStorage.getCredits();
    const next = current + amount;
    await writeJson(KEYS.credits, next);
    return next;
  },

  async spendCredits(amount: number): Promise<boolean> {
    const current = await arcadeStorage.getCredits();
    if (current < amount) return false;
    await writeJson(KEYS.credits, current - amount);
    return true;
  },

  async getCompletedStages(): Promise<JungleStageId[]> {
    return readJson(KEYS.completedStages, [] as JungleStageId[]);
  },

  async completeStage(stageId: JungleStageId): Promise<void> {
    const completed = await arcadeStorage.getCompletedStages();
    if (!completed.includes(stageId)) {
      await writeJson(KEYS.completedStages, [...completed, stageId]);
    }
  },

  async getDailyRunCompletionDate(): Promise<string | null> {
    return readJson<string | null>(KEYS.dailyRunCompletionDate, null);
  },

  async markDailyRunComplete(dateKey = getDailyDateKey()): Promise<void> {
    await writeJson(KEYS.dailyRunCompletionDate, dateKey);
  },

  async getCosmeticUnlocks(): Promise<string[]> {
    return readJson(KEYS.cosmeticUnlocks, [] as string[]);
  },

  async unlockCosmetic(cosmeticId: string): Promise<void> {
    const cosmetics = await arcadeStorage.getCosmeticUnlocks();
    if (!cosmetics.includes(cosmeticId)) {
      await writeJson(KEYS.cosmeticUnlocks, [...cosmetics, cosmeticId]);
    }
  },

  async getLocalLeaderboard(): Promise<LeaderboardEntry[]> {
    return readJson(KEYS.localLeaderboard, [] as LeaderboardEntry[]);
  },

  async saveLeaderboardEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry[]> {
    const entries = await arcadeStorage.getLocalLeaderboard();
    const next = [entry, ...entries].sort((a, b) => b.score - a.score).slice(0, 25);
    await writeJson(KEYS.localLeaderboard, next);
    return next;
  },
};

